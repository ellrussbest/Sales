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
import { HttpError, Transaction } from "../models/index.js";
/** Get all Transactions */
export const getTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let transactions;
    try {
        transactions = yield Transaction.find();
    }
    catch (error) {
        return next(new HttpError("Fetching transactions failed, please try again later", 500));
    }
    res.json({
        transactions: transactions.map((transaction) => transaction.toObject({ getters: true })),
    });
});
/**  Get Transaction with specific ID */
export const getTransactionById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let transaction;
    try {
        transaction = yield Transaction.findById(req.params.id);
    }
    catch (error) {
        return next(new HttpError("Internal Server Error", 500));
    }
    if (!transaction) {
        const error = new HttpError("Could not find a transaction for the provided id.", 404);
        return next(error);
    }
    res.json({
        transaction: transaction.toObject({ getters: true }),
    });
});
/** Create a new Transaction */
export const createTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (((_a = req.userData) === null || _a === void 0 ? void 0 : _a.status) !== "ACTIVE") {
        const error = new HttpError("Could not create Transaction, unauthorized access.", 401);
        return next(error);
    }
    const createdTransaction = new Transaction({
        salesPersonId: req.userData.userId,
        returns: [],
        products: [],
    });
    try {
        yield createdTransaction.save();
    }
    catch (err) {
        const error = new HttpError("Creating Transaction unsuccessful, please try again", 500);
        return next(error);
    }
    res.status(201).json({
        createdTransaction: createdTransaction.toObject({ getters: true }),
    });
});
/** Update an existing Transaction **/
export const updateTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { salesPersonId } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return new HttpError("Invalid inputs passed, please check your data", 422);
    }
    if (((_b = req.userData) === null || _b === void 0 ? void 0 : _b.status) !== "ACTIVE") {
        const error = new HttpError("Could not update Transaction, unauthorized access.", 401);
        return next(error);
    }
    let transaction;
    try {
        transaction = yield Transaction.findById(req.params.id);
    }
    catch (err) {
        return next(new HttpError("Internal Server Error", 500));
    }
    if (!transaction) {
        const error = new HttpError("Could not find a transaction for the provided id.", 404);
        return next(error);
    }
    transaction.salesPersonId = salesPersonId;
    try {
        yield transaction.save();
    }
    catch (err) {
        const error = new HttpError("Something went wrong, could not update transaction.", 500);
        return next(error);
    }
    res
        .status(200)
        .json({ transaction: transaction.toObject({ getters: true }) });
});
/** Delete an existing Transaction */
export const deleteTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    let transaction;
    if (((_c = req.userData) === null || _c === void 0 ? void 0 : _c.status) !== "ACTIVE") {
        return next(new HttpError("Unauthorized access, cannot perform operation", 401));
    }
    try {
        transaction = yield Transaction.findById(req.params.id);
    }
    catch (err) {
        const error = new HttpError("Something went wrong here, could not delete transaction", 500);
        return next(error);
    }
    if (!transaction) {
        return next(new HttpError("Could not find transaction for this id", 500));
    }
    if (transaction.returns.length !== 0) {
        return next(new HttpError("Cannot delete this transaction, it has associated returns records", 403));
    }
    try {
        yield transaction.deleteOne();
    }
    catch (err) {
        new HttpError("Could not complete transaction delete operation", 500);
    }
    res.status(200).json({ message: "Deleted Transaction" });
});
