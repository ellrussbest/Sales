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
import { HttpError, SalesPerson } from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
/** Get all SalesPeople */
export const getSalesPeople = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let salesPeople;
    try {
        salesPeople = yield SalesPerson.find().select("-password");
    }
    catch (error) {
        return next(new HttpError("Fetching Sales People failed, please try again later", 500));
    }
    res.json({
        salesPeople: salesPeople.map((salesPerson) => salesPerson.toObject({ getters: true })),
    });
});
/**  Get SalesPerson with specific ID **/
export const getSalesPersonById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let salesPerson;
    try {
        salesPerson = yield SalesPerson.findById(req.params.id).select("-password");
    }
    catch (error) {
        return next(new HttpError("Internal Server Error", 500));
    }
    if (!salesPerson) {
        const error = new HttpError("Could not find a sales person for the provided id.", 404);
        return next(error);
    }
    res.json({
        salesPerson: salesPerson.toObject({ getters: true }),
    });
});
/** Create a new SalesPerson */
export const createSalesPerson = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError("Invalid inputs passed, please check your data", 422);
        return next(error);
    }
    if (!!((_a = req.userData) === null || _a === void 0 ? void 0 : _a.isAdmin) === false) {
        const error = new HttpError("Could not create a new Sales Person, unauthorized access.", 401);
        return next(error);
    }
    let existingEmail;
    try {
        existingEmail = yield SalesPerson.find({ email });
    }
    catch (error) {
        return next(new HttpError("Internal Server Error", 500));
    }
    if (existingEmail.length !== 0) {
        return next(new HttpError("This email already exists in the database, use a unique email", 422));
    }
    let hashedPassword;
    try {
        hashedPassword = yield bcrypt.hash("ChangeThisPassword", 12);
    }
    catch (error) {
        return next(new HttpError("Could not create a new Sales person, please try again later", 500));
    }
    const createdSalesPerson = new SalesPerson({
        email,
        isAdmin: false,
        transactions: [],
        status: "ACTIVE",
        password: hashedPassword,
    });
    try {
        yield createdSalesPerson.save();
    }
    catch (err) {
        const error = new HttpError("Creating salesPerson unsuccessful, please try again", 500);
        return next(error);
    }
    res.json({
        createSalesPerson: createdSalesPerson.email,
        isAdmin: createdSalesPerson.isAdmin,
        status: createdSalesPerson.status,
    });
});
/** Update an existing Sales Person */
export const updateSalesPerson = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { email, isAdmin, status, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return new HttpError("Invalid inputs passed, please check your data", 422);
    }
    if (!!((_b = req.userData) === null || _b === void 0 ? void 0 : _b.isAdmin) === false) {
        const error = new HttpError("Could not update Sales person, unauthorized access.", 401);
        return next(error);
    }
    let salesPerson;
    try {
        salesPerson = yield SalesPerson.findById(req.params.id).select("-password");
    }
    catch (err) {
        return next(new HttpError("Internal Server Error", 500));
    }
    if (!salesPerson) {
        const error = new HttpError("Could not find a salesPerson for the provided id.", 404);
        return next(error);
    }
    let existingEmail;
    try {
        existingEmail = yield SalesPerson.find({
            _id: { $ne: req.params.id },
            email,
        });
    }
    catch (error) {
        return next(new HttpError("Internal Server Error", 500));
    }
    if (existingEmail.length !== 0) {
        return next(new HttpError("This email already exists in the database, use a unique email", 422));
    }
    let hashedPassword;
    try {
        hashedPassword = yield bcrypt.hash(password, 12);
    }
    catch (error) {
        return next(new HttpError("Could not create a new Sales person, please try again later", 500));
    }
    salesPerson.email = email;
    salesPerson.isAdmin = isAdmin;
    salesPerson.status = status;
    salesPerson.password = hashedPassword;
    try {
        yield salesPerson.save();
    }
    catch (err) {
        const error = new HttpError("Something went wrong, could not update Sales person.", 500);
        return next(error);
    }
    res.status(200).json({
        salesPersonEmail: salesPerson.email,
        isAdmin: salesPerson.isAdmin,
        transactions: salesPerson.transactions,
        status: salesPerson.status,
        id: salesPerson.id,
    });
});
/** Delete an existing a SalesPerson */
export const deleteSalesPerson = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { email } = req.body;
    let salesPerson;
    if (!!((_c = req.userData) === null || _c === void 0 ? void 0 : _c.isAdmin) === false) {
        return next(new HttpError("Unauthorized access", 401));
    }
    try {
        salesPerson = yield SalesPerson.findOne({ email });
    }
    catch (err) {
        const error = new HttpError("Something went wrong here, could not delete SalesPerson", 500);
        return next(error);
    }
    if (!salesPerson) {
        return next(new HttpError("Could not find salesPerson for this id", 500));
    }
    if (salesPerson.transactions.length > 0) {
        return next(new HttpError("Cannot delete this sales person, it has associated transactions", 400));
    }
    try {
        yield salesPerson.deleteOne();
    }
    catch (error) {
        return next(new HttpError("Delete Unsuccessful!", 500));
    }
    res.status(201).json("Delete was successful");
});
/** Login */
export const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = yield SalesPerson.findOne({ email });
    }
    catch (err) {
        const error = new HttpError("Logging in failed, please try again later", 500);
        return next(error);
    }
    // check if the user exists
    if (!existingUser) {
        const error = new HttpError("Invalid credentials, could not log you in", 401);
        return next(error);
    }
    // if the user exists, check if the password is correct
    let isValidPassword = false;
    try {
        isValidPassword = yield bcrypt.compare(password, existingUser.password);
    }
    catch (error) {
        return next(new HttpError("Could not log you in please check your credentials and try again", 500));
    }
    if (!isValidPassword) {
        return next(new HttpError("Invalid credentials, could not log you in", 403));
    }
    let token;
    try {
        token = jwt.sign({
            userId: existingUser.id,
            email: existingUser.email,
            status: existingUser.status,
            isAdmin: existingUser.isAdmin,
        }, process.env.SECRET, { expiresIn: "1h" });
    }
    catch (err) {
        const error = new HttpError("Logging in failed, please try again", 500);
        return next(error);
    }
    res.json({
        userId: existingUser.id,
        email: existingUser.email,
        token: token,
        status: existingUser.status,
        transactions: existingUser.transactions,
    });
});
