import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "../types/auth.types";

// Extend Request interface untuk menambahkan user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Ambil token dari Authorization header format: "Bearer <token>"
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      res.status(401).json({
        status: 401,
        message: "Access denied. No token provided.",
      });
      return;
    }

    // Validasi JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      res.status(500).json({
        status: 500,
        message: "Server configuration error.",
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    // Simpan payload ke dalam req.user
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: 401,
        message: "Token has expired.",
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        status: 403,
        message: "Invalid token.",
      });
    } else {
      console.error("JWT verification error:", error);
      res.status(500).json({
        status: 500,
        message: "Token verification failed.",
      });
    }
  }
};
