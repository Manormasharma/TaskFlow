
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import User from "../models/User.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters");
  }

  return secret;
}

function setAuthCookie(res: Response, userId: string): void {
  const token = jwt.sign({ sub: userId }, getJwtSecret(), {
    expiresIn: "1d",
  });

  res.cookie("taskflow_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });
}

function publicUser(user: {
  _id: unknown;
  name: string;
  email: string;
}) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
  };
}

export const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid registration details",
      errors: z.treeifyError(parsed.error),
    });
    return;
  }

  const { name, email, password } = parsed.data;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(409).json({ message: "An account with this email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    setAuthCookie(res, String(user._id));

    res.status(201).json({
      message: "Account created successfully",
      user: publicUser(user),
    });
  } catch (error: unknown) {
    // Handles concurrent registration attempts for the same email.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        message: "An account with this email already exists",
      });
      return;
    }

    throw error;
  }
});

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid email or password format" });
    return;
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  setAuthCookie(res, String(user._id));

  res.status(200).json({
    message: "Login successful",
    user: publicUser(user),
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("taskflow_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

export const getMe = asyncHandler(async (_req, res) => {
  const userId = res.locals.userId as string;

  const user = await User.findById(userId).select("_id name email");

  if (!user) {
    res.status(401).json({ message: "User account no longer exists" });
    return;
  }

  res.status(200).json({
    user: publicUser(user),
  });
});