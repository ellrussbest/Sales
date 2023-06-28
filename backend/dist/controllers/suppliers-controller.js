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
import { HttpError, Supplier } from "../models/index.js";
/** Get all suppliers */
export const getSuppliers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let suppliers;
    try {
        suppliers = yield Supplier.find();
    }
    catch (error) {
        return next(new HttpError("Fetching Suppliers failed, please try again later", 500));
    }
    res.json({
        suppliers: suppliers.map((supplier) => supplier.toObject({ getters: true })),
    });
});
/**  Get supplier with specific ID **/
export const getSupplierById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let supplier;
    try {
        supplier = yield Supplier.findById(req.params.id);
    }
    catch (error) {
        return next(new HttpError("Internal Server Error", 500));
    }
    if (!supplier) {
        const error = new HttpError("Could not find a Supplier for the provided id.", 404);
        return next(error);
    }
    res.json({
        supplier: supplier.toObject({ getters: true }),
    });
});
/** Create a new Supplier */
export const createSupplier = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, phone, status } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError("Invalid inputs passed, please check your data", 422);
        return next(error);
    }
    if (!!((_a = req.userData) === null || _a === void 0 ? void 0 : _a.isAdmin) === false) {
        const error = new HttpError("Could not create a new Supplier, unauthorized access.", 401);
        return next(error);
    }
    const createdSupplier = new Supplier({
        name,
        phone,
        status,
    });
    try {
        yield createdSupplier.save();
    }
    catch (err) {
        const error = new HttpError("Creating supplier unsuccessful, please try again", 500);
        return next(error);
    }
    res.json({
        createdSupplier: createdSupplier.toObject({ getters: true }),
    });
});
/** Update an existing supplier */
export const updateSupplier = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { name, phone, status } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return new HttpError("Invalid inputs passed, please check your data", 422);
    }
    if (!!((_b = req.userData) === null || _b === void 0 ? void 0 : _b.isAdmin) === false) {
        const error = new HttpError("Could not update Sales person, unauthorized access.", 401);
        return next(error);
    }
    let supplier;
    try {
        supplier = yield Supplier.findById(req.params.id);
    }
    catch (err) {
        return next(new HttpError("Internal Server Error", 500));
    }
    if (!supplier) {
        const error = new HttpError("Could not find a supplier for the provided id.", 404);
        return next(error);
    }
    supplier.name = name;
    supplier.phone = phone;
    supplier.status = status;
    try {
        yield supplier.save();
    }
    catch (err) {
        const error = new HttpError("Something went wrong, could not update supplier.", 500);
        return next(error);
    }
    res.status(200).json({
        supplier: supplier.toObject({ getters: true }),
    });
});
/** Delete an existing a supplier */
export const deleteSupplier = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    let supplier;
    if (!!((_c = req.userData) === null || _c === void 0 ? void 0 : _c.isAdmin) === false) {
        return next(new HttpError("Unauthorized access", 401));
    }
    try {
        supplier = yield Supplier.findById(req.params.id);
    }
    catch (err) {
        const error = new HttpError("Something went wrong here, could not delete Supplier", 500);
        return next(error);
    }
    if (!supplier) {
        return next(new HttpError("Could not find salesPerson for this id", 500));
    }
    try {
        yield supplier.deleteOne();
    }
    catch (error) {
        return next(new HttpError("Delete Unsuccessful!", 500));
    }
    res.status(201).json("Delete was successful");
});
