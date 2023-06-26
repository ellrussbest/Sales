// add a new sales person

// delete an existing sales person

// update an existing sales person

// view the sales persons

const { validationResult } = require("express-validator");
const { HttpError, SalesPerson } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");