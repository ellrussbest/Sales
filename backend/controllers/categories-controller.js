// add a new category

// delete an existing category

// update an existing category

// view the categories

const { validationResult } = require("express-validator");
const { HttpError, Category } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
