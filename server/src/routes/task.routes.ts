
import { Router } from "express";

import {
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/:taskId", getTaskById);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;
