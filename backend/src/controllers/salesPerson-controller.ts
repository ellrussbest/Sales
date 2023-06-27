import { validationResult } from "express-validator";
import { HttpError, SalesPerson } from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
