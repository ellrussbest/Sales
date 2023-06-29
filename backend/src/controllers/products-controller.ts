import { validationResult } from "express-validator";
import { HttpError, Category, Product, Transaction } from "../models/index.js";
import fs from "fs";
import { default as mongoose } from "mongoose";
import { Response, NextFunction } from "express";
import { IRequest } from "../middleware/index.js";

/** Get all products */
export const getProducts = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let products;

  try {
    products = await Product.find();
  } catch (error) {
    return next(
      new HttpError("Error fetching products, please try again later", 500)
    );
  }

  res.json({
    products: products.map((product) => product.toObject({ getters: true })),
  });
};

/** Get product by id */
export const getProductById = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let product;

  try {
    product = await Product.findById(req.params.id);
  } catch (error) {
    return next(new HttpError("Internal Server Error", 500));
  }

  if (!product) {
    const error = new HttpError(
      "Could not find a sales person for the provided id.",
      404
    );
    return next(error);
  }

  res.json({
    product: product.toObject({ getters: true }),
  });
};

/** Create a new product */
export const createProduct = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { name, price, quantity, company, categoryId } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data",
      422
    );

    return next(error);
  }

  if (!!req.userData?.isAdmin === false) {
    const error = new HttpError(
      "Could not create Product, unauthorized access.",
      401
    );
    return next(error);
  }

  const createdProduct = new Product({
    name,
    price,
    quantity,
    company,
    categoryId,
    image: req.file?.path,
  });

  let category;

  try {
    category = await Category.findById(categoryId);
  } catch (err) {
    return next(new HttpError("Creating new product failed", 500));
  }

  if (!category) {
    return next(
      new HttpError("Could not find the category for the provided id", 404)
    );
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await createdProduct.save({ session });

    category.products.push(createdProduct.id);
    await category.save({ session });

    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating product unsuccessful, please try again later",
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ createdProduct: createdProduct.toObject({ getters: true }) });
};

/** Update an existing product */
export const updateProduct = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { name, price, quantity, company, categoryId } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return new HttpError("Invalid inputs passed, please check your data", 422);
  }

  if (!!req.userData?.isAdmin === false) {
    const error = new HttpError(
      "Could not update Category, unauthorized access.",
      401
    );
    return next(error);
  }

  let product;

  try {
    product = await Product.findById(req.params.id);
  } catch (err) {
    return next(new HttpError("Internal Server Error", 500));
  }

  if (!product) {
    const error = new HttpError(
      "Could not find a product for the provided id.",
      404
    );
    return next(error);
  }

  const currentImagePath = product.image;
  const previousCategoryId = product.categoryId;

  product.name = name;
  product.price = price;
  product.image = req.file ? req.file.path : currentImagePath;
  product.quantity = quantity;
  product.company = company;
  product.categoryId = categoryId;

  // the current category
  let currentCategory;

  try {
    currentCategory = await Category.findById(categoryId);
  } catch (err) {
    return next(new HttpError("Creating new product failed", 500));
  }

  if (!currentCategory) {
    return next(
      new HttpError("Could not find the category for the provided id", 404)
    );
  }

  // the previous category
  let previousCategory;

  try {
    previousCategory = await Category.findById(previousCategoryId);
  } catch (err) {
    return next(new HttpError("Creating new product failed", 500));
  }

  if (!previousCategory) {
    return next(
      new HttpError("Could not find the category for the provided id", 404)
    );
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await product.save({ session });

    // @ts-ignore
    previousCategory.products.pull(previousCategoryId);
    await previousCategory.save({ session });

    currentCategory.products.push(categoryId);
    await currentCategory.save({ session });

    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update Product.",
      500
    );

    return next(error);
  }

  res.status(200).json({ product: product.toObject({ getters: true }) });
};

/** Delete an existing product */
export const deleteProduct = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let product;

  if (!!req.userData?.isAdmin === false) {
    return next(
      new HttpError("Unauthorized access, cannot perform operation", 401)
    );
  }

  try {
    product = await Product.findById(req.params.id);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong here, could not delete product",
      500
    );

    return next(error);
  }

  if (!product) {
    return next(new HttpError("Could not find product for this id", 500));
  }

  const imagePath = product.image;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const category = await Category.findById(product.categoryId).session(
      session
    );
    if (category) {
      // @ts-ignore
      category.products.pull(product.id);
      await category.save({ session });
    }

    await product.deleteOne({ session: session });

    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete product",
      500
    );

    return next(error);
  }

  fs.unlink(imagePath, (err) => console.log(err));

  res.status(200).json({ message: "Deleted product" });
};

/** Buy one product function */
const buy = async (
  productId: string,
  transactionId: string,
  discount: number = 0
): Promise<number | HttpError> => {
  let product, transaction;
  try {
    product = await Product.findById(productId);
  } catch (error) {
    return new HttpError("internal server error", 500);
  }

  if (!product) {
    return new HttpError("Product not found", 404);
  }

  const price = product.price;
  let quantity = product.quantity;

  try {
    product.quantity = quantity - 1;
    await product.save();
  } catch (error) {
    return new HttpError("problem updating quantity", 500);
  }

  try {
    transaction = await Transaction.findById(transactionId);
  } catch (error) {
    return new HttpError("Error finding the associated transaction", 500);
  }

  if (!transaction) {
    return new HttpError("There is no associated transaction", 404);
  }

  transaction.products.push(product.id);

  try {
    await transaction.save();
  } catch (error) {
    return new HttpError("Problem updating transaction", 500);
  }

  const finalPrice = price * ((100 - discount) / 100);
  return finalPrice;
};

interface productObject {
  productId: string;
  discount: number;
}

type productArray = productObject[];

/** Buy product */
export const buyProduct = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.userData?.status !== "ACTIVE") {
    return next(
      new HttpError("Unauthorized access, cannot complete operation", 401)
    );
  }

  const { products: productArrayVariable, transactionId } = req.body;
  const products: productArray = productArrayVariable;

  const finalPrices = [];

  for (let i = 0; i < products.length; i++) {
    let productId = products[i].productId;
    let discount = products[i].discount;

    if ((await buy(productId, transactionId, discount)) instanceof HttpError) {
      return next(await buy(productId, transactionId, discount));
    }

    finalPrices.push(await buy(productId, transactionId, discount));
  }

  // @ts-ignore
  const total: number = finalPrices.reduce((prev, curr) => prev + curr, 0);

  res.status(201).json({
    transactionId,
    totalPrice: total,
  });
};
