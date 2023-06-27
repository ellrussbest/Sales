import fs from "fs";
import path from "path";
import { config } from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { IHttpError } from "./models/index.js";
import mongoose from "mongoose";

// import routes here

config();
const app = express();

// parsing bodyParser.json() as a middleware
app.use(bodyParser.json());

app.use("uploads/images", express.static(path.join("uploads", "images")));

app.use(cors());

// custom middlewares goes here
app.use(
  (error: IHttpError, req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
      fs.unlink(req.file.path, (error) => console.log(error));
    }

    if (res.headersSent) {
      return next(error);
    }

    res.status(error.code ?? 500);
    res.json({
      message: error.message || "An unknown error occured!",
    });
  }
);

mongoose
  .connect(process.env.CONNECTION_STRING ?? "")
  .then(() => {
    console.log("The connection was successful");
    app.listen(process.env.PORT || 5000);
  })
  .catch((error) => console.log(error));