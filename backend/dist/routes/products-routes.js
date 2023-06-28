import express from "express";
import { check } from "express-validator";
import { checkAuth, fileUpload } from "../middleware/index.js";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, } from "../controllers/index.js";
export const productsRouter = express.Router();
/** get categories */ productsRouter;
productsRouter.get("/", getProducts);
productsRouter.get("/:id", getProductById);
/** Authenticate user */
productsRouter.use(checkAuth);
/** Create a new category */
productsRouter.post("/", fileUpload.single("image"), [
    check("name").not().isEmpty(),
    check("price").not().isEmpty(),
    check("quantity").not().isEmpty(),
    check("company").not().isEmpty(),
    check("categoryId").not().isEmpty(),
], createProduct);
/** Update existing category */
productsRouter.patch("/:id", fileUpload.single("image"), [
    check("name").not().isEmpty(),
    check("price").not().isEmpty(),
    check("quantity").not().isEmpty(),
    check("company").not().isEmpty(),
    check("categoryId").not().isEmpty(),
], updateProduct);
/** Delete existing category */
productsRouter.delete("/:id", deleteProduct);
