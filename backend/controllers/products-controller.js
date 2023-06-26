// add a new product

// delete an existing product

// update an existing product

// view the products

// product should populate categories, transaction

// when you add a new product, you must include

const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../utils/location");
const { Product, Category, Transaction, HttpError } = require("../models");
const { default: mongoose } = require("mongoose");
const fs = require("fs");
