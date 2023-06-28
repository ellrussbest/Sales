import { validationResult } from "express-validator";
import { HttpError, Supplier } from "../models/index.js";
import { Response, NextFunction } from "express";
import { IRequest } from "../middleware/index.js";

/** Get all suppliers */
export const getSuppliers = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let suppliers;

  try {
    suppliers = await Supplier.find();
  } catch (error) {
    return next(
      new HttpError("Fetching Suppliers failed, please try again later", 500)
    );
  }

  res.json({
    suppliers: suppliers.map((supplier) =>
      supplier.toObject({ getters: true })
    ),
  });
};

/**  Get supplier with specific ID **/
export const getSupplierById = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let supplier;

  try {
    supplier = await Supplier.findById(req.params.id);
  } catch (error) {
    return next(new HttpError("Internal Server Error", 500));
  }

  if (!supplier) {
    const error = new HttpError(
      "Could not find a Supplier for the provided id.",
      404
    );
    return next(error);
  }

  res.json({
    supplier: supplier.toObject({ getters: true }),
  });
};

/** Create a new Supplier */
export const createSupplier = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { name, phone, status } = req.body;

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
      "Could not create a new Supplier, unauthorized access.",
      401
    );
    return next(error);
  }

  const createdSupplier = new Supplier({
    name,
    phone,
    status,
  });

  try {
    await createdSupplier.save();
  } catch (err) {
    const error = new HttpError(
      "Creating supplier unsuccessful, please try again",
      500
    );
    return next(error);
  }

  res.json({
    createdSupplier: createdSupplier.toObject({ getters: true }),
  });
};

/** Update an existing supplier */
export const updateSupplier = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { name, phone, status } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return new HttpError("Invalid inputs passed, please check your data", 422);
  }

  if (!!req.userData?.isAdmin === false) {
    const error = new HttpError(
      "Could not update Sales person, unauthorized access.",
      401
    );
    return next(error);
  }

  let supplier;

  try {
    supplier = await Supplier.findById(req.params.id);
  } catch (err) {
    return next(new HttpError("Internal Server Error", 500));
  }

  if (!supplier) {
    const error = new HttpError(
      "Could not find a supplier for the provided id.",
      404
    );
    return next(error);
  }

  supplier.name = name;
  supplier.phone = phone;
  supplier.status = status;

  try {
    await supplier.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update supplier.",
      500
    );

    return next(error);
  }

  res.status(200).json({
    supplier: supplier.toObject({ getters: true }),
  });
};

/** Delete an existing a supplier */
export const deleteSupplier = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let supplier;

  if (!!req.userData?.isAdmin === false) {
    return next(new HttpError("Unauthorized access", 401));
  }

  try {
    supplier = await Supplier.findById(req.params.id);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong here, could not delete Supplier",
      500
    );

    return next(error);
  }

  if (!supplier) {
    return next(new HttpError("Could not find salesPerson for this id", 500));
  }

  try {
    await supplier.deleteOne();
  } catch (error) {
    return next(new HttpError("Delete Unsuccessful!", 500));
  }

  res.status(201).json("Delete was successful");
};
