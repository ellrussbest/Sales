import express from "express";
import { check } from "express-validator";
import { checkAuth } from "../middleware/index.js";
import {
  getSalesPeople,
  getSalesPersonById,
  createSalesPerson,
  updateSalesPerson,
  deleteSalesPerson,
  login,
} from "../controllers/index.js";

export const salesPersonRouter = express.Router();

/** Get sales people */
salesPersonRouter.get("/", getSalesPeople);
salesPersonRouter.get("/:id", getSalesPersonById);

/** Authenticate user */
salesPersonRouter.use(checkAuth);

/** Create a new sales person */
salesPersonRouter.post(
  "/",
  [
    check("password").isLength({ min: 6 }),
    check("email").normalizeEmail().isEmail(),
  ],
  createSalesPerson
);

/** Update sales person */
salesPersonRouter.patch(
  "/",
  [
    check("password").isLength({ min: 6 }),
    check("email").normalizeEmail().isEmail(),
    check("isAdmin").isBoolean(),
    check("status").not().isEmpty(),
  ],
  updateSalesPerson
);

/** Delete a sales person */
salesPersonRouter.delete(
  "/",
  [check("email").normalizeEmail().isEmail()],
  deleteSalesPerson
);

/** Login */
salesPersonRouter.post(
  "/login",
  [
    check("password").isLength({ min: 6 }),
    check("email").normalizeEmail().isEmail(),
  ],
  login
);
