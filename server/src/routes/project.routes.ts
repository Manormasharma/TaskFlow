
import { Router } from "express";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  
} from "../controllers/project.controller.js";

import {
  createSprint,
  getProjectSprints,
} from "../controllers/sprint.controller.js";
import {
  createTask,
  getProjectTasks,
} from "../controllers/task.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// All project routes require authentication.
router.use(requireAuth);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:projectId", getProjectById);
router.patch("/:projectId", updateProject);
router.delete("/:projectId", deleteProject);
router.post("/:projectId/sprints", createSprint);
router.get("/:projectId/sprints", getProjectSprints);
router.post("/:projectId/tasks", createTask);
router.get("/:projectId/tasks", getProjectTasks);

export default router;
