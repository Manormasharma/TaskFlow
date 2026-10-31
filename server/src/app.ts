
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import sprintRoutes from "./routes/sprint.routes.js";
import taskRoutes from "./routes/task.routes.js";
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
app.use("/api/projects", projectRoutes);
app.use("/api/sprints", sprintRoutes);
app.use("/api/tasks", taskRoutes);

export default app;
