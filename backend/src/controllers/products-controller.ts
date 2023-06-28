import { validationResult } from "express-validator";
import { HttpError, Category, Product } from "../models/index.js";
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

  try {
    await createdProduct.save();
  } catch (err) {
    const error = new HttpError(
      "Creating category unsuccessful, please try again",
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ createProduct: createdProduct.toObject({ getters: true }) });
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

  product.name = name;
  product.price = price;
  product.image = req.file ? req.file.path : currentImagePath;
  product.quantity = quantity;
  product.company = company;
  product.categoryId = categoryId;

  try {
    await product.save();
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
