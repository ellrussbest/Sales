import express from "express";
import { getCategories, getCategoryById, } from "../controllers/index.js";
const router = express.Router();
router.get("/", getCategories);
router.get("/:id", getCategoryById);
// router.use()
