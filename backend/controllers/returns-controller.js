// add a new return

// delete an existing return

// update an existing return

// view the returns

const { validationResult } = require("express-validator");
const { HttpError, Transaction, Product } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
