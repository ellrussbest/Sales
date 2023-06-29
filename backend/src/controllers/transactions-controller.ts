import { validationResult } from "express-validator";
import { HttpError, Transaction } from "../models/index.js";
import { Response, NextFunction } from "express";
import { IRequest } from "../middleware/index.js";

/** Get all Transactions */
export const getTransactions = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let transactions;

  try {
    transactions = await Transaction.find();
  } catch (error) {
    return next(
      new HttpError("Fetching transactions failed, please try again later", 500)
    );
  }

  res.json({
    transactions: transactions.map((transaction) =>
      transaction.toObject({ getters: true })
    ),
  });
};

/**  Get Transaction with specific ID */
export const getTransactionById = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let transaction;

  try {
    transaction = await Transaction.findById(req.params.id);
  } catch (error) {
    return next(new HttpError("Internal Server Error", 500));
  }

  if (!transaction) {
    const error = new HttpError(
      "Could not find a transaction for the provided id.",
      404
    );
    return next(error);
  }

  res.json({
    transaction: transaction.toObject({ getters: true }),
  });
};

/** Create a new Transaction */
export const createTransaction = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.userData?.status !== "ACTIVE") {
    const error = new HttpError(
      "Could not create Transaction, unauthorized access.",
      401
    );
    return next(error);
  }

  const createdTransaction = new Transaction({
    salesPersonId: req.userData.userId,
    returns: [],
    products: [],
  });

  try {
    await createdTransaction.save();
  } catch (err) {
    const error = new HttpError(
      "Creating Transaction unsuccessful, please try again",
      500
    );
    return next(error);
  }

  res.status(201).json({
    createdTransaction: createdTransaction.toObject({ getters: true }),
  });
};

/** Update an existing Transaction **/
export const updateTransaction = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { salesPersonId } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return new HttpError("Invalid inputs passed, please check your data", 422);
  }

  if (req.userData?.status !== "ACTIVE") {
    const error = new HttpError(
      "Could not update Transaction, unauthorized access.",
      401
    );
    return next(error);
  }

  let transaction;

  try {
    transaction = await Transaction.findById(req.params.id);
  } catch (err) {
    return next(new HttpError("Internal Server Error", 500));
  }

  if (!transaction) {
    const error = new HttpError(
      "Could not find a transaction for the provided id.",
      404
    );
    return next(error);
  }

  transaction.salesPersonId = salesPersonId;

  try {
    await transaction.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update transaction.",
      500
    );

    return next(error);
  }

  res
    .status(200)
    .json({ transaction: transaction.toObject({ getters: true }) });
};

/** Delete an existing Transaction */
export const deleteTransaction = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let transaction;

  if (req.userData?.status !== "ACTIVE") {
    return next(
      new HttpError("Unauthorized access, cannot perform operation", 401)
    );
  }

  try {
    transaction = await Transaction.findById(req.params.id);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong here, could not delete transaction",
      500
    );

    return next(error);
  }

  if (!transaction) {
    return next(new HttpError("Could not find transaction for this id", 500));
  }

  if (transaction.returns.length !== 0) {
    return next(
      new HttpError(
        "Cannot delete this transaction, it has associated returns records",
        403
      )
    );
  }

  try {
    await transaction.deleteOne();
  } catch (err) {
    new HttpError("Could not complete transaction delete operation", 500);
  }

  res.status(200).json({ message: "Deleted Transaction" });
};
