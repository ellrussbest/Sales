import express from "express";
import { check } from "express-validator";
import { checkAuth } from "../middleware/index.js";
import { getTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction, } from "../controllers/index.js";
export const transactionsRouter = express.Router();
/** get transactions */
transactionsRouter.get("/", getTransactions);
transactionsRouter.get("/:id", getTransactionById);
/** Authenticate user */
transactionsRouter.use(checkAuth);
/** Create a new transaction */
transactionsRouter.post("/", createTransaction);
/** Update existing transaction */
transactionsRouter.patch("/:id", [check("salesPersonId").not().isEmpty()], updateTransaction);
/** Delete existing transaction */
transactionsRouter.delete("/:id", deleteTransaction);
