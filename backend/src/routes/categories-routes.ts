import express from "express";
import { check } from "express-validator";
import { checkAuth } from "../middleware/index.js";
import {
  getCategories,
  getCategoryById,
  createCategory,
  deleteCategory,
  updateCategory,
} from "../controllers/index.js";

export const categoriesRouter = express.Router();

/** get categories */
categoriesRouter.get("/", getCategories);
categoriesRouter.get("/:id", getCategoryById);

/** Authenticate user */
categoriesRouter.use(checkAuth);

/** Create a new category */
categoriesRouter.post("/", [check("name").not().isEmpty()], createCategory);

/** Update existing category */
categoriesRouter.patch("/:id", [check("name").not().isEmpty()], updateCategory);

/** Delete existing category */
categoriesRouter.delete("/:id", deleteCategory);
