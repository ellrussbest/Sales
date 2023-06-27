import { validationResult } from "express-validator";
import { HttpError, Category } from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
