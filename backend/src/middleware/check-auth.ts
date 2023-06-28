import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../models/index.js";

export interface IRequest extends Request {
  userData?: {
    userId: string;
    isAdmin: boolean;
    status: "ACTIVE" | "INACTIVE"
  };
}

export function checkAuth(req: IRequest, res: Response, next: NextFunction) {
  if (req.method == "OPTIONS") return next();

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(new Error("Authentication failed"));

    const decodedToken = jwt.verify(token, process.env.SECRET);
    req.userData = {
      userId: typeof decodedToken !== "string" && decodedToken.userId,
      isAdmin: typeof decodedToken !== "string" && decodedToken.isAdmin,
      status: typeof decodedToken !== "string" && decodedToken.status,
    };
  } catch (error) {
    return new HttpError("Authentication failed", 403);
  }
}
