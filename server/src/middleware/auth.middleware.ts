
import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = req.cookies?.taskflow_token;

  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    res.status(500).json({ message: "Authentication is not configured" });
    return;
  }

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    }) as JwtPayload;

    if (
      typeof payload.sub !== "string" ||
      !mongoose.isValidObjectId(payload.sub)
    ) {
      res.status(401).json({ message: "Invalid authentication token" });
      return;
    }

    res.locals.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired session" });
  }
};
