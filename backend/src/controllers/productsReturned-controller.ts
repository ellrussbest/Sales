import { validationResult } from "express-validator";
import { HttpError, ProductReturned, Return, Product } from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
