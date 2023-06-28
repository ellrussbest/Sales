import { validationResult } from "express-validator";
import { HttpError, SalesPerson } from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { IRequest } from "../middleware/index.js";

/** Get all SalesPeople */
export const getSalesPeople = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let salesPeople;

  try {
    salesPeople = await SalesPerson.find().select("-password");
  } catch (error) {
    return next(
      new HttpError("Fetching Sales People failed, please try again later", 500)
    );
  }

  res.json({
    salesPeople: salesPeople.map((salesPerson) =>
      salesPerson.toObject({ getters: true })
    ),
  });
};

/**  Get SalesPerson with specific ID **/
export const getSalesPersonById = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let salesPerson;

  try {
    salesPerson = await SalesPerson.findById(req.params.id).select("-password");
  } catch (error) {
    return next(new HttpError("Internal Server Error", 500));
  }

  if (!salesPerson) {
    const error = new HttpError(
      "Could not find a sales person for the provided id.",
      404
    );
    return next(error);
  }

  res.json({
    salesPerson: salesPerson.toObject({ getters: true }),
  });
};

/** Create a new SalesPerson */
export const createSalesPerson = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

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
      "Could not create a new Sales Person, unauthorized access.",
      401
    );
    return next(error);
  }

  let existingEmail;

  try {
    existingEmail = await SalesPerson.find({ email });
  } catch (error) {
    return next(new HttpError("Internal Server Error", 500));
  }

  if (existingEmail.length !== 0) {
    return next(
      new HttpError(
        "This email already exists in the database, use a unique email",
        422
      )
    );
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash("ChangeThisPassword", 12);
  } catch (error) {
    return next(
      new HttpError(
        "Could not create a new Sales person, please try again later",
        500
      )
    );
  }

  const createdSalesPerson = new SalesPerson({
    email,
    isAdmin: false,
    transactions: [],
    status: "ACTIVE",
    password: hashedPassword,
  });

  try {
    await createdSalesPerson.save();
  } catch (err) {
    const error = new HttpError(
      "Creating salesPerson unsuccessful, please try again",
      500
    );
    return next(error);
  }

  res.json({
    createSalesPerson: createdSalesPerson.email,
    isAdmin: createdSalesPerson.isAdmin,
    status: createdSalesPerson.status,
  });
};

/** Update an existing Sales Person */
export const updateSalesPerson = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { email, isAdmin, status, password } = req.body;

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

  let salesPerson;

  try {
    salesPerson = await SalesPerson.findById(req.params.id).select("-password");
  } catch (err) {
    return next(new HttpError("Internal Server Error", 500));
  }

  if (!salesPerson) {
    const error = new HttpError(
      "Could not find a salesPerson for the provided id.",
      404
    );
    return next(error);
  }

  let existingEmail;

  try {
    existingEmail = await SalesPerson.find({
      _id: { $ne: req.params.id },
      email,
    });
  } catch (error) {
    return next(new HttpError("Internal Server Error", 500));
  }

  if (existingEmail.length !== 0) {
    return next(
      new HttpError(
        "This email already exists in the database, use a unique email",
        422
      )
    );
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(
      new HttpError(
        "Could not create a new Sales person, please try again later",
        500
      )
    );
  }

  salesPerson.email = email;
  salesPerson.isAdmin = isAdmin;
  salesPerson.status = status;
  salesPerson.password = hashedPassword;

  try {
    await salesPerson.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update Sales person.",
      500
    );

    return next(error);
  }

  res.status(200).json({
    salesPersonEmail: salesPerson.email,
    isAdmin: salesPerson.isAdmin,
    transactions: salesPerson.transactions,
    status: salesPerson.status,
    id: salesPerson.id,
  });
};

/** Delete an existing a SalesPerson */
export const deleteSalesPerson = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  let salesPerson;

  if (!!req.userData?.isAdmin === false) {
    return next(new HttpError("Unauthorized access", 401));
  }

  try {
    salesPerson = await SalesPerson.findOne({ email });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong here, could not delete SalesPerson",
      500
    );

    return next(error);
  }

  if (!salesPerson) {
    return next(new HttpError("Could not find salesPerson for this id", 500));
  }

  if (salesPerson.transactions.length > 0) {
    return next(
      new HttpError(
        "Cannot delete this sales person, it has associated transactions",
        400
      )
    );
  }

  try {
    await salesPerson.deleteOne();
  } catch (error) {
    return next(new HttpError("Delete Unsuccessful!", 500));
  }

  res.status(201).json("Delete was successful");
};

/** Login */
export const login = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await SalesPerson.findOne({ email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later",
      500
    );

    return next(error);
  }

  // check if the user exists
  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in",
      401
    );
    return next(error);
  }

  // if the user exists, check if the password is correct
  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    return next(
      new HttpError(
        "Could not log you in please check your credentials and try again",
        500
      )
    );
  }

  if (!isValidPassword) {
    return next(
      new HttpError("Invalid credentials, could not log you in", 403)
    );
  }

  let token;

  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        status: existingUser.status,
        isAdmin: existingUser.isAdmin,
      },
      process.env.SECRET,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
    status: existingUser.status,
    transactions: existingUser.transactions,
  });
};
