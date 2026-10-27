
import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  login,
  logout,
  getMe,
} from "../controllers/auth.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

export default router;
