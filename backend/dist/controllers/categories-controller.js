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
import { HttpError, Category, Product } from "../models/index.js";
import { default as mongoose } from "mongoose";
/** Get all Categories **/
export const getCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let categories;
    try {
        categories = yield Category.find();
    }
    catch (error) {
        return next(new HttpError("Fetching categories failed, please try again later", 500));
    }
    res.json({
        categories: categories.map((category) => category.toObject({ getters: true })),
    });
});
/**  Get Category with specific ID **/
export const getCategoryById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let category;
    try {
        category = yield Category.findById(req.params.id);
    }
    catch (error) {
        return next(new HttpError("Internal Server Error", 500));
    }
    if (!category) {
        const error = new HttpError("Could not find a category for the provided id.", 404);
        return next(error);
    }
    res.json({
        category: category.toObject({ getters: true }),
    });
});
/** Create a new Category **/
export const createCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError("Invalid inputs passed, please check your data", 422);
        return next(error);
    }
    if (!!((_a = req.userData) === null || _a === void 0 ? void 0 : _a.isAdmin) === false) {
        const error = new HttpError("Could not create Category, unauthorized access.", 401);
        return next(error);
    }
    let existingCategory;
    try {
        existingCategory = yield Category.findOne({ name });
    }
    catch (err) {
        const error = new HttpError("Creating new category failed, please try again later", 500);
        return next(error);
    }
    if (existingCategory) {
        const error = new HttpError("Could not create Category, category name already exists.", 422);
        return next(error);
    }
    const createdCategory = new Category({
        name,
        products: [],
    });
    try {
        yield createdCategory.save();
    }
    catch (err) {
        const error = new HttpError("Creating category unsuccessful, please try again", 500);
        return next(error);
    }
    res.status(201).json({ categoryName: createCategory.name });
});
/** Update an existing Category **/
export const updateCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { name } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return new HttpError("Invalid inputs passed, please check your data", 422);
    }
    if (!!((_b = req.userData) === null || _b === void 0 ? void 0 : _b.isAdmin) === false) {
        const error = new HttpError("Could not create Category, unauthorized access.", 401);
        return next(error);
    }
    let category;
    try {
        category = yield Category.findById(req.params.id);
    }
    catch (err) {
        return next(new HttpError("Internal Server Error", 500));
    }
    if (!category) {
        const error = new HttpError("Could not find a category for the provided id.", 404);
        return next(error);
    }
    category.name = name;
    try {
        yield category.save();
    }
    catch (err) {
        const error = new HttpError("Something went wrong, could not update Category.", 500);
        return next(error);
    }
    res.status(200).json({ category: category.toObject({ getters: true }) });
});
/** Delete an existing Category **/
export const deleteCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let category;
    try {
        category = yield Category.findById(req.params.id);
    }
    catch (err) {
        const error = new HttpError("Something went wrong here, could not delete Category", 500);
        return next(error);
    }
    if (!category) {
        return next(new HttpError("Could not find Category for this id", 500));
    }
    try {
        const session = yield mongoose.startSession();
        session.startTransaction();
        yield Product.updateMany({ categoryId: req.params.id }, { $set: { categoryId: undefined } }, { session });
        yield category.deleteOne({ session: session });
        yield session.commitTransaction();
    }
    catch (error) { }
});
