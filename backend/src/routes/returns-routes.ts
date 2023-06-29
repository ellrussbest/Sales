import express from "express";
import { check } from "express-validator";
import { checkAuth } from "../middleware/index.js";
import {
  getReturns,
  getReturnById,
  createReturn,
  updateReturn,
  deleteReturn,
} from "../controllers/index.js";

export const returnsRouter = express.Router();

/** get returns */
returnsRouter.get("/", getReturns);
returnsRouter.get("/:id", getReturnById);

/** Authenticate user */
returnsRouter.use(checkAuth);

/** Create a new return */
returnsRouter.post(
  "/",
  [
    check("productId").not().isEmpty(),
    check("reasonForReturn").not().isEmpty(),
    check("transactionId").not().isEmpty(),
  ],
  createReturn
);

/** Update existing return */
returnsRouter.patch(
  "/:id",
  [
    check("productId").not().isEmpty(),
    check("reasonForReturn").not().isEmpty(),
    check("transactionId").not().isEmpty(),
  ],
  updateReturn
);

/** Delete existing return */
returnsRouter.delete("/:id", deleteReturn);
