var _a;
import fs from "fs";
import path from "path";
import { config } from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
/** Route imports */
import { categoriesRouter } from "./routes/index.js";
config();
const app = express();
// parsing bodyParser.json() as a middleware
app.use(bodyParser.json());
app.use("uploads/images", express.static(path.join("uploads", "images")));
app.use(cors());
/** custom middlewares goes here */
/** import routes here */
app.use("/api/categories", categoriesRouter);
app.use((error, req, res, next) => {
    var _a;
    if (req.file) {
        fs.unlink(req.file.path, (error) => console.log(error));
    }
    if (res.headersSent) {
        return next(error);
    }
    res.status((_a = error.code) !== null && _a !== void 0 ? _a : 500);
    res.json({
        message: error.message || "An unknown error occured!",
    });
});
mongoose
    .connect((_a = process.env.CONNECTION_STRING) !== null && _a !== void 0 ? _a : "")
    .then(() => {
    console.log("The connection was successful");
    app.listen(process.env.PORT || 5000);
})
    .catch((error) => console.log(error));
