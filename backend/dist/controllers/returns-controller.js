var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { validationResult } from "express-validator";
import { HttpError, Transaction, Return } from "../models/index.js";
import { default as mongoose } from "mongoose";
/** Get a list of products returned */
export const getReturns = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let returns;
    try {
        returns = yield Return.find();
    }
    catch (error) {
        return next(new HttpError("Fetching returns failed, please try again later", 500));
    }
    res.json({
        returns: returns.map((_return) => _return.toObject({ getters: true })),
    });
});
/** Get return with specific ID */
export const getReturnById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let _return;
    try {
        _return = yield Return.findById(req.params.id);
    }
    catch (error) {
        return next(new HttpError("Internal Server Error", 500));
    }
    if (!_return) {
        const error = new HttpError("Could not find a return for the provided id.", 404);
        return next(error);
    }
    res.json({
        return: _return.toObject({ getters: true }),
    });
});
/** create a new return */
export const createReturn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { productId, reasonForReturn, transactionId } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError("Invalid inputs passed, please check your data", 422);
        return next(error);
    }
    if (((_a = req.userData) === null || _a === void 0 ? void 0 : _a.status) !== "ACTIVE") {
        const error = new HttpError("Could not create Return, unauthorized access.", 401);
        return next(error);
    }
    const createdReturn = new Return({
        productId,
        reasonForReturn,
        transactionId,
    });
    let transaction;
    try {
        transaction = yield Transaction.findById(transactionId);
    }
    catch (err) {
        return next(new HttpError("Creating new return failed", 500));
    }
    if (!transaction) {
        return next(new HttpError("Could not find the transaction for the provided id", 404));
    }
    try {
        const session = yield mongoose.startSession();
        session.startTransaction();
        yield createdReturn.save({ session });
        transaction.products.push(createdReturn.id);
        yield transaction.save({ session });
        yield session.commitTransaction();
    }
    catch (err) {
        const error = new HttpError("Creating return unsuccessful, please try again later", 500);
        return next(error);
    }
    res
        .status(201)
        .json({ createdReturn: createdReturn.toObject({ getters: true }) });
});
/** update a return */
export const updateReturn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { productId, reasonForReturn, transactionId } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return new HttpError("Invalid inputs passed, please check your data", 422);
    }
    if (((_b = req.userData) === null || _b === void 0 ? void 0 : _b.status) !== "ACTIVE") {
        const error = new HttpError("Could not update Return, unauthorized access.", 401);
        return next(error);
    }
    let _return;
    try {
        _return = yield Return.findById(req.params.id);
    }
    catch (err) {
        return next(new HttpError("Internal Server Error", 500));
    }
    if (!_return) {
        const error = new HttpError("Could not find a return for the provided id.", 404);
        return next(error);
    }
    const previousTransactionId = _return.transactionId;
    _return.productId = productId;
    _return.reasonForReturn = reasonForReturn;
    _return.transactionId = transactionId;
    // the current transaction
    let currentTransaction;
    try {
        currentTransaction = yield Transaction.findById(transactionId);
    }
    catch (err) {
        return next(new HttpError("Creating new return failed", 500));
    }
    if (!currentTransaction) {
        return next(new HttpError("Could not find the transaction for the provided id", 404));
    }
    // the previous transaction
    let previousTransaction;
    try {
        previousTransaction = yield Transaction.findById(previousTransactionId);
    }
    catch (err) {
        return next(new HttpError("Creating new return failed", 500));
    }
    if (!previousTransaction) {
        return next(new HttpError("Could not find the transaction for the provided id", 404));
    }
    try {
        const session = yield mongoose.startSession();
        session.startTransaction();
        yield _return.save({ session });
        // @ts-ignore
        previousTransaction.returns.pull(previousTransactionId);
        yield previousTransaction.save({ session });
        currentTransaction.returns.push(transactionId);
        yield currentTransaction.save({ session });
        yield session.commitTransaction();
    }
    catch (err) {
        const error = new HttpError("Something went wrong, could not update Return.", 500);
        return next(error);
    }
    res.status(200).json({ return: _return.toObject({ getters: true }) });
});
/** delete a return */
export const deleteReturn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    let _return;
    if (((_c = req.userData) === null || _c === void 0 ? void 0 : _c.status) !== "ACTIVE") {
        return next(new HttpError("Unauthorized access, cannot perform operation", 401));
    }
    try {
        _return = yield Return.findById(req.params.id);
    }
    catch (err) {
        const error = new HttpError("Something went wrong here, could not delete return", 500);
        return next(error);
    }
    if (!_return) {
        return next(new HttpError("Could not find return for this id", 500));
    }
    try {
        const session = yield mongoose.startSession();
        session.startTransaction();
        const transaction = yield Transaction.findById(_return.transactionId).session(session);
        if (transaction) {
            // @ts-ignore
            transaction.returns.pull(_return.id);
            yield transaction.save({ session });
        }
        yield _return.deleteOne({ session: session });
        yield session.commitTransaction();
    }
    catch (err) {
        const error = new HttpError("Something went wrong, could not delete return", 500);
        return next(error);
    }
    res.status(200).json({ message: "Deleted return" });
});
