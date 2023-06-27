import { validationResult } from "express-validator";
import { HttpError, Category, Product } from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import { default as mongoose } from "mongoose";
