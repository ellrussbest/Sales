import { validationResult } from "express-validator";
import { HttpError, Category, Product } from "../models/index.js";
import { Response, NextFunction } from "express";
import { IRequest } from "../middleware/index.js";
import { default as mongoose } from "mongoose";

/** Get all Categories */
export const getCategories = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let categories;

  try {
    categories = await Category.find();
  } catch (error) {
    return next(
      new HttpError("Fetching categories failed, please try again later", 500)
    );
  }

  res.json({
    categories: categories.map((category) =>
      category.toObject({ getters: true })
    ),
  });
};

/**  Get Category with specific ID */
export const getCategoryById = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let category;

  try {
    category = await Category.findById(req.params.id);
  } catch (error) {
    return next(new HttpError("Internal Server Error", 500));
  }

  if (!category) {
    const error = new HttpError(
      "Could not find a category for the provided id.",
      404
    );
    return next(error);
  }

  res.json({
    category: category.toObject({ getters: true }),
  });
};

/** Create a new Category */
export const createCategory = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;

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
      "Could not create Category, unauthorized access.",
      401
    );
    return next(error);
  }

  let existingCategory;

  try {
    existingCategory = await Category.findOne({ name });
  } catch (err) {
    const error = new HttpError(
      "Creating new category failed, please try again later",
      500
    );

    return next(error);
  }

  if (existingCategory) {
    const error = new HttpError(
      "Could not create Category, category name already exists.",
      422
    );
    return next(error);
  }

  const createdCategory = new Category({
    name,
    products: [],
  });

  try {
    await createdCategory.save();
  } catch (err) {
    const error = new HttpError(
      "Creating category unsuccessful, please try again",
      500
    );
    return next(error);
  }

  res.status(201).json({ categoryName: createdCategory.name });
};

/** Update an existing Category **/
export const updateCategory = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;

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

  let category;

  try {
    category = await Category.findById(req.params.id);
  } catch (err) {
    return next(new HttpError("Internal Server Error", 500));
  }

  if (!category) {
    const error = new HttpError(
      "Could not find a category for the provided id.",
      404
    );
    return next(error);
  }

  category.name = name;

  try {
    await category.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update Category.",
      500
    );

    return next(error);
  }

  res.status(200).json({ category: category.toObject({ getters: true }) });
};

/** Delete an existing Category */
export const deleteCategory = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let category;

  if (!!req.userData?.isAdmin === false) {
    return next(
      new HttpError("Unauthorized access, cannot perform operation", 401)
    );
  }

  try {
    category = await Category.findById(req.params.id);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong here, could not delete Category",
      500
    );

    return next(error);
  }

  if (!category) {
    return next(new HttpError("Could not find Category for this id", 500));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await Product.updateMany(
      { categoryId: req.params.id },
      { $set: { categoryId: undefined } },
      { session }
    );

    await category.deleteOne({ session: session });

    await session.commitTransaction();
  } catch (error) {
    return next(new HttpError("Delete unsuccessful", 500));
  }

  res.status(200).json({ message: "Deleted Category" });
};
