import express from "express";
import { check } from "express-validator";
import { checkAuth } from "../middleware/index.js";
import { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier, } from "../controllers/index.js";
export const supplierRouter = express.Router();
/** Get suppliers */
supplierRouter.get("/", getSuppliers);
supplierRouter.get("/:id", getSupplierById);
/** Authenticate user */
supplierRouter.use(checkAuth);
/** Create a new sales person */
supplierRouter.post("/", [
    check("name").not().isEmpty(),
    check("phone").not().isEmpty(),
    check("status").not().isEmpty(),
], createSupplier);
/** Update sales person */
supplierRouter.patch("/:id", [
    check("name").not().isEmpty(),
    check("phone").not().isEmpty(),
    check("status").not().isEmpty(),
], updateSupplier);
/** Delete a sales person */
supplierRouter.delete("/:id", deleteSupplier);
