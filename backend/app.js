const fs = require("fs");
const path = require("path");

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const cors = require("cors");

// require routes here

const app = express();
app.use(bodyParser.json());

app.use("uploads/images", express.static(path.join("uploads", "images")));

app.use(cors());

// middlewares goes here

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => console.log(err));
  }

  if (res.headerSent) {
    next(error);
    return;
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unkown error occured!" });
});

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("The connection was successful");
    app.listen(process.env.PORT || 5000);
  })
  .catch((error) => console.log(error));
