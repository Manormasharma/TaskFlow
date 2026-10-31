
import { Router } from "express";

import {
  getSprintById,
  updateSprint,
  deleteSprint,
} from "../controllers/sprint.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/:sprintId", getSprintById);
router.patch("/:sprintId", updateSprint);
router.delete("/:sprintId", deleteSprint);

export default router;
