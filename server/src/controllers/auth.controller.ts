
import type { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendApiResponse } from "../utils/apiResponse.js";

function publicUser(user: {
  _id: unknown;
  name: string;
  email: string;
}) {
  return {
    user_id: String(user._id),
    full_name: user.name,
    email: user.email,
  };
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters");
  }

  return secret;
}

function setAuthCookie(res: Response, userId: string): void {
  const token = jwt.sign(
    { sub: userId },
    getJwtSecret(),
    {
      algorithm: "HS256",
      expiresIn: "1d",
    }
  );

  res.cookie("taskflow_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });
}

export const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendApiResponse(res, 400, {
      message: "Invalid registration details",
      error: true,
      error_code: "VALIDATION_ERROR",
      data: null,
      formatting_args: {
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      },
    });
  }

  const { name, email, password } = parsed.data;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return sendApiResponse(res, 409, {
      message: "An account with this email already exists",
      error: true,
      error_code: "USER_EXISTS",
      data: null,
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    setAuthCookie(res, String(user._id));

    return sendApiResponse(res, 201, {
      message: "Account created successfully",
      data: publicUser(user),
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return sendApiResponse(res, 409, {
        message: "An account with this email already exists",
        error: true,
        error_code: "USER_EXISTS",
        data: null,
      });
    }

    throw error;
  }
});

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendApiResponse(res, 400, {
      message: "Invalid email or password format",
      error: true,
      error_code: "VALIDATION_ERROR",
      data: null,
    });
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    return sendApiResponse(res, 401, {
      message: "Invalid email or password",
      error: true,
      error_code: "INVALID_CREDENTIALS",
      data: null,
    });
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    return sendApiResponse(res, 401, {
      message: "Invalid email or password",
      error: true,
      error_code: "INVALID_CREDENTIALS",
      data: null,
    });
  }

  setAuthCookie(res, String(user._id));

  return sendApiResponse(res, 200, {
    message: "Login successful",
    data: publicUser(user),
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("taskflow_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return sendApiResponse(res, 200, {
    message: "Logged out successfully",
    data: null,
  });
});

export const getMe = asyncHandler(async (_req, res) => {
  const userId = res.locals.userId as string;

  const user = await User.findById(userId).select("_id name email");

  if (!user) {
    return sendApiResponse(res, 401, {
      message: "User account no longer exists",
      error: true,
      error_code: "USER_NOT_FOUND",
      data: null,
    });
  }

  return sendApiResponse(res, 200, {
    message: "Profile details fetched successfully",
    data: publicUser(user),
  });
});
