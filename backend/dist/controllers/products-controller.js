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
import { HttpError, Category, Product, Transaction } from "../models/index.js";
import fs from "fs";
import { default as mongoose } from "mongoose";
/** Get all products */
export const getProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let products;
    try {
        products = yield Product.find();
    }
    catch (error) {
        return next(new HttpError("Error fetching products, please try again later", 500));
    }
    res.json({
        products: products.map((product) => product.toObject({ getters: true })),
    });
});
/** Get product by id */
export const getProductById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let product;
    try {
        product = yield Product.findById(req.params.id);
    }
    catch (error) {
        return next(new HttpError("Internal Server Error", 500));
    }
    if (!product) {
        const error = new HttpError("Could not find a sales person for the provided id.", 404);
        return next(error);
    }
    res.json({
        product: product.toObject({ getters: true }),
    });
});
/** Create a new product */
export const createProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { name, price, quantity, company, categoryId } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError("Invalid inputs passed, please check your data", 422);
        return next(error);
    }
    if (!!((_a = req.userData) === null || _a === void 0 ? void 0 : _a.isAdmin) === false) {
        const error = new HttpError("Could not create Product, unauthorized access.", 401);
        return next(error);
    }
    const createdProduct = new Product({
        name,
        price,
        quantity,
        company,
        categoryId,
        image: (_b = req.file) === null || _b === void 0 ? void 0 : _b.path,
    });
    let category;
    try {
        category = yield Category.findById(categoryId);
    }
    catch (err) {
        return next(new HttpError("Creating new product failed", 500));
    }
    if (!category) {
        return next(new HttpError("Could not find the category for the provided id", 404));
    }
    try {
        const session = yield mongoose.startSession();
        session.startTransaction();
        yield createdProduct.save({ session });
        category.products.push(createdProduct.id);
        yield category.save({ session });
        yield session.commitTransaction();
    }
    catch (err) {
        const error = new HttpError("Creating product unsuccessful, please try again later", 500);
        return next(error);
    }
    res
        .status(201)
        .json({ createdProduct: createdProduct.toObject({ getters: true }) });
});
/** Update an existing product */
export const updateProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { name, price, quantity, company, categoryId } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return new HttpError("Invalid inputs passed, please check your data", 422);
    }
    if (!!((_c = req.userData) === null || _c === void 0 ? void 0 : _c.isAdmin) === false) {
        const error = new HttpError("Could not update Category, unauthorized access.", 401);
        return next(error);
    }
    let product;
    try {
        product = yield Product.findById(req.params.id);
    }
    catch (err) {
        return next(new HttpError("Internal Server Error", 500));
    }
    if (!product) {
        const error = new HttpError("Could not find a product for the provided id.", 404);
        return next(error);
    }
    const currentImagePath = product.image;
    const previousCategoryId = product.categoryId;
    product.name = name;
    product.price = price;
    product.image = req.file ? req.file.path : currentImagePath;
    product.quantity = quantity;
    product.company = company;
    product.categoryId = categoryId;
    // the current category
    let currentCategory;
    try {
        currentCategory = yield Category.findById(categoryId);
    }
    catch (err) {
        return next(new HttpError("Creating new product failed", 500));
    }
    if (!currentCategory) {
        return next(new HttpError("Could not find the category for the provided id", 404));
    }
    // the previous category
    let previousCategory;
    try {
        previousCategory = yield Category.findById(previousCategoryId);
    }
    catch (err) {
        return next(new HttpError("Creating new product failed", 500));
    }
    if (!previousCategory) {
        return next(new HttpError("Could not find the category for the provided id", 404));
    }
    try {
        const session = yield mongoose.startSession();
        session.startTransaction();
        yield product.save({ session });
        // @ts-ignore
        previousCategory.products.pull(previousCategoryId);
        yield previousCategory.save({ session });
        currentCategory.products.push(categoryId);
        yield currentCategory.save({ session });
        yield session.commitTransaction();
    }
    catch (err) {
        const error = new HttpError("Something went wrong, could not update Product.", 500);
        return next(error);
    }
    res.status(200).json({ product: product.toObject({ getters: true }) });
});
/** Delete an existing product */
export const deleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    let product;
    if (!!((_d = req.userData) === null || _d === void 0 ? void 0 : _d.isAdmin) === false) {
        return next(new HttpError("Unauthorized access, cannot perform operation", 401));
    }
    try {
        product = yield Product.findById(req.params.id);
    }
    catch (err) {
        const error = new HttpError("Something went wrong here, could not delete product", 500);
        return next(error);
    }
    if (!product) {
        return next(new HttpError("Could not find product for this id", 500));
    }
    const imagePath = product.image;
    try {
        const session = yield mongoose.startSession();
        session.startTransaction();
        const category = yield Category.findById(product.categoryId).session(session);
        if (category) {
            // @ts-ignore
            category.products.pull(product.id);
            yield category.save({ session });
        }
        yield product.deleteOne({ session: session });
        yield session.commitTransaction();
    }
    catch (err) {
        const error = new HttpError("Something went wrong, could not delete product", 500);
        return next(error);
    }
    fs.unlink(imagePath, (err) => console.log(err));
    res.status(200).json({ message: "Deleted product" });
});
/** Buy one product function */
const buy = (productId, transactionId, discount = 0) => __awaiter(void 0, void 0, void 0, function* () {
    let product, transaction;
    try {
        product = yield Product.findById(productId);
    }
    catch (error) {
        return new HttpError("internal server error", 500);
    }
    if (!product) {
        return new HttpError("Product not found", 404);
    }
    const price = product.price;
    let quantity = product.quantity;
    try {
        product.quantity = quantity - 1;
        yield product.save();
    }
    catch (error) {
        return new HttpError("problem updating quantity", 500);
    }
    try {
        transaction = yield Transaction.findById(transactionId);
    }
    catch (error) {
        return new HttpError("Error finding the associated transaction", 500);
    }
    if (!transaction) {
        return new HttpError("There is no associated transaction", 404);
    }
    transaction.products.push(product.id);
    try {
        yield transaction.save();
    }
    catch (error) {
        return new HttpError("Problem updating transaction", 500);
    }
    const finalPrice = price * ((100 - discount) / 100);
    return finalPrice;
});
/** Buy product */
export const buyProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    if (((_e = req.userData) === null || _e === void 0 ? void 0 : _e.status) !== "ACTIVE") {
        return next(new HttpError("Unauthorized access, cannot complete operation", 401));
    }
    const { products: productArrayVariable, transactionId } = req.body;
    const products = productArrayVariable;
    const finalPrices = [];
    for (let i = 0; i < products.length; i++) {
        let productId = products[i].productId;
        let discount = products[i].discount;
        if ((yield buy(productId, transactionId, discount)) instanceof HttpError) {
            return next(yield buy(productId, transactionId, discount));
        }
        finalPrices.push(yield buy(productId, transactionId, discount));
    }
    // @ts-ignore
    const total = finalPrices.reduce((prev, curr) => prev + curr, 0);
    res.status(201).json({
        transactionId,
        totalPrice: total,
    });
});
