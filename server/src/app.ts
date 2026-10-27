
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
const app = express();

// Security headers
app.use(helmet());

// Allow requests from your Next.js frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5000",
    credentials: true,
  })
);

// Parse incoming JSON and cookies
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Welcome to TaskFlow API",
  });
});

// Health-check endpoint
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

export default app;
