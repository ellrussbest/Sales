import { validationResult } from "express-validator";
import { HttpError, Transaction, SalesPerson } from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
