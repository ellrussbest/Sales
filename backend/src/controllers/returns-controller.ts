import { validationResult } from "express-validator";
import { HttpError, Transaction, Return } from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
