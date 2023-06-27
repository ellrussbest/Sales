import jwt from "jsonwebtoken";
import { HttpError } from "../models/index.js";
export default function checkAuth(req, res, next) {
    var _a;
    if (req.method == "OPTIONS")
        return next();
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token)
            throw new Error("Authentication failed");
        const decodedToken = jwt.verify(token, process.env.SECRET);
        req.userData = {
            userId: typeof decodedToken !== "string" && decodedToken.userId,
            isAdmin: typeof decodedToken !== "string" && decodedToken.isAdmin,
        };
    }
    catch (error) {
        return new HttpError("Authentication failed", 403);
    }
}
