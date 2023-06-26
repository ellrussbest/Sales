// add a new transaction

// delete an existing transaction

// update an existing transaction

// view the transactions

const { validationResult } = require("express-validator");
const { HttpError, Transaction, SalesPerson } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");