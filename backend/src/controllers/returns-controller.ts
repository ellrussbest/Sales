import { validationResult } from "express-validator";
import { HttpError, Transaction, Return, Product } from "../models/index.js";
import { Response, NextFunction } from "express";
import { IRequest } from "../middleware/index.js";
import { default as mongoose } from "mongoose";

/** Get a list of products returned */
export const getReturns = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let returns;

  try {
    returns = await Return.find();
  } catch (error) {
    return next(
      new HttpError("Fetching returns failed, please try again later", 500)
    );
  }

  res.json({
    returns: returns.map((_return) => _return.toObject({ getters: true })),
  });
};

/** Get return with specific ID */
export const getReturnById = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let _return;

  try {
    _return = await Return.findById(req.params.id);
  } catch (error) {
    return next(new HttpError("Internal Server Error", 500));
  }

  if (!_return) {
    const error = new HttpError(
      "Could not find a return for the provided id.",
      404
    );
    return next(error);
  }

  res.json({
    return: _return.toObject({ getters: true }),
  });
};

/** create a new return */
export const createReturn = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { productId, reasonForReturn, transactionId } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data",
      422
    );

    return next(error);
  }

  if (req.userData?.status !== "ACTIVE") {
    const error = new HttpError(
      "Could not create Return, unauthorized access.",
      401
    );
    return next(error);
  }

  const createdReturn = new Return({
    productId,
    reasonForReturn,
    transactionId,
  });

  let transaction;

  try {
    transaction = await Transaction.findById(transactionId);
  } catch (err) {
    return next(new HttpError("Creating new return failed", 500));
  }

  if (!transaction) {
    return next(
      new HttpError("Could not find the transaction for the provided id", 404)
    );
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await createdReturn.save({ session });

    transaction.products.push(createdReturn.id);
    await transaction.save({ session });

    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating return unsuccessful, please try again later",
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ createdReturn: createdReturn.toObject({ getters: true }) });
};

/** update a return */
export const updateReturn = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { productId, reasonForReturn, transactionId } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return new HttpError("Invalid inputs passed, please check your data", 422);
  }

  if (req.userData?.status !== "ACTIVE") {
    const error = new HttpError(
      "Could not update Return, unauthorized access.",
      401
    );
    return next(error);
  }

  let _return;

  try {
    _return = await Return.findById(req.params.id);
  } catch (err) {
    return next(new HttpError("Internal Server Error", 500));
  }

  if (!_return) {
    const error = new HttpError(
      "Could not find a return for the provided id.",
      404
    );
    return next(error);
  }

  const previousTransactionId = _return.transactionId;

  _return.productId = productId;
  _return.reasonForReturn = reasonForReturn;
  _return.transactionId = transactionId;

  // the current transaction
  let currentTransaction;

  try {
    currentTransaction = await Transaction.findById(transactionId);
  } catch (err) {
    return next(new HttpError("Creating new return failed", 500));
  }

  if (!currentTransaction) {
    return next(
      new HttpError("Could not find the transaction for the provided id", 404)
    );
  }

  // the previous transaction
  let previousTransaction;

  try {
    previousTransaction = await Transaction.findById(previousTransactionId);
  } catch (err) {
    return next(new HttpError("Creating new return failed", 500));
  }

  if (!previousTransaction) {
    return next(
      new HttpError("Could not find the transaction for the provided id", 404)
    );
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await _return.save({ session });

    // @ts-ignore
    previousTransaction.returns.pull(previousTransactionId);
    await previousTransaction.save({ session });

    currentTransaction.returns.push(transactionId);
    await currentTransaction.save({ session });

    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update Return.",
      500
    );

    return next(error);
  }

  res.status(200).json({ return: _return.toObject({ getters: true }) });
};

/** delete a return */
export const deleteReturn = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let _return;

  if (req.userData?.status !== "ACTIVE") {
    return next(
      new HttpError("Unauthorized access, cannot perform operation", 401)
    );
  }

  try {
    _return = await Return.findById(req.params.id);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong here, could not delete return",
      500
    );

    return next(error);
  }

  if (!_return) {
    return next(new HttpError("Could not find return for this id", 500));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = await Transaction.findById(
      _return.transactionId
    ).session(session);
    if (transaction) {
      // @ts-ignore
      transaction.returns.pull(_return.id);
      await transaction.save({ session });
    }

    await _return.deleteOne({ session: session });

    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete return",
      500
    );

    return next(error);
  }

  res.status(200).json({ message: "Deleted return" });
};
