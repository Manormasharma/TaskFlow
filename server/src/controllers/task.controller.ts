
import mongoose from "mongoose";
import type { Request, Response } from "express";

import Project from "../models/Project.js";
import Sprint from "../models/Sprint.js";
// import Task from "../models/Task.js";


import { asyncHandler } from "../utils/asyncHandler.js";
import { sendApiResponse } from "../utils/apiResponse.js";
import Task from "../models/Task.js";
import { createTaskSchema, updateTaskSchema } from "../validators/task.validator.js";

// Helper: validate that a sprint belongs to this project and user.
async function isValidSprint(
  sprintId: string,
  projectId: string,
  userId: string
): Promise<boolean> {
  if (!mongoose.isValidObjectId(sprintId)) {
    return false;
  }

  const sprint = await Sprint.exists({
    _id: sprintId,
    project: projectId,
    owner: userId,
  });

  return Boolean(sprint);
}

// CREATE TASK
export const createTask = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const projectIdParam = req.params.projectId;

    if (typeof projectIdParam !== "string") {
      return sendApiResponse(res, 400, {
        message: "Invalid project ID",
        error: true,
        error_code: "INVALID_PROJECT_ID",
        data: null,
      });
    }

    const projectId: string = projectIdParam;

    const project = await Project.findOne({
      _id: projectId,
      owner: userId,
    });

    if (!project) {
      return sendApiResponse(res, 404, {
        message: "Project not found",
        error: true,
        error_code: "PROJECT_NOT_FOUND",
        data: null,
      });
    }

    const validation = createTaskSchema.safeParse(req.body);

    if (!validation.success) {
      return sendApiResponse(res, 400, {
        message: "Invalid task data",
        error: true,
        error_code: "TASK_VALIDATION_ERROR",
        data: validation.error.flatten(),
      });
    }

    const { sprintId, ...taskData } = validation.data;

    // If a sprint is provided, verify project and user ownership.
    if (sprintId) {
      const validSprint = await isValidSprint(
        sprintId,
        projectId,
        userId
      );

      if (!validSprint) {
        return sendApiResponse(res, 400, {
          message: "Sprint does not belong to this project",
          error: true,
          error_code: "INVALID_SPRINT_ASSIGNMENT",
          data: null,
        });
      }
    }

    const task = await Task.create({
      ...taskData,
      project: project._id,
      owner: userId,
      sprint: sprintId ?? null,
    });

    return sendApiResponse(res, 201, {
      message: "Task created successfully",
      data: task,
    });
  }
);

// GET ALL TASKS FOR A PROJECT
export const getProjectTasks = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const projectId = req.params.projectId;

    if (typeof projectId !== "string") {
      return sendApiResponse(res, 400, {
        message: "Invalid project ID",
        error: true,
        error_code: "INVALID_PROJECT_ID",
        data: null,
      });
    }

    if (!mongoose.isValidObjectId(projectId)) {
      return sendApiResponse(res, 400, {
        message: "Invalid project ID",
        error: true,
        error_code: "INVALID_PROJECT_ID",
        data: null,
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      owner: userId,
    });

    if (!project) {
      return sendApiResponse(res, 404, {
        message: "Project not found",
        error: true,
        error_code: "PROJECT_NOT_FOUND",
        data: null,
      });
    }

    const { status, priority, sprintId } = req.query;

    const filter: Record<string, unknown> = {
      project: project._id,
      owner: userId,
    };

    if (status !== undefined) {
      if (
        typeof status !== "string" ||
        !["todo", "in-progress", "done"].includes(status)
      ) {
        return sendApiResponse(res, 400, {
          message: "Invalid task status filter",
          error: true,
          error_code: "INVALID_STATUS_FILTER",
          data: null,
        });
      }

      filter.status = status;
    }

    if (priority !== undefined) {
      if (
        typeof priority !== "string" ||
        !["low", "medium", "high"].includes(priority)
      ) {
        return sendApiResponse(res, 400, {
          message: "Invalid task priority filter",
          error: true,
          error_code: "INVALID_PRIORITY_FILTER",
          data: null,
        });
      }

      filter.priority = priority;
    }

    if (sprintId !== undefined) {
      if (typeof sprintId !== "string") {
        return sendApiResponse(res, 400, {
          message: "Invalid sprint filter",
          error: true,
          error_code: "INVALID_SPRINT_FILTER",
          data: null,
        });
      }

      if (sprintId === "backlog") {
        filter.sprint = null;
      } else {
        if (
          !mongoose.isValidObjectId(sprintId) ||
          !(await isValidSprint(sprintId, projectId, userId))
        ) {
          return sendApiResponse(res, 400, {
            message: "Invalid sprint filter",
            error: true,
            error_code: "INVALID_SPRINT_FILTER",
            data: null,
          });
        }

        filter.sprint = sprintId;
      }
    }

    const tasks = await Task.find(filter).sort({
      createdAt: -1,
    });

    return sendApiResponse(res, 200, {
      message: "Tasks retrieved successfully",
      data: tasks,
    });
  }
);

// GET SINGLE TASK
export const getTaskById = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const { taskId } = req.params;

    if (!mongoose.isValidObjectId(taskId)) {
      return sendApiResponse(res, 400, {
        message: "Invalid task ID",
        error: true,
        error_code: "INVALID_TASK_ID",
        data: null,
      });
    }

    const task = await Task.findOne({
      _id: taskId,
      owner: userId,
    });

    if (!task) {
      return sendApiResponse(res, 404, {
        message: "Task not found",
        error: true,
        error_code: "TASK_NOT_FOUND",
        data: null,
      });
    }

    // Verify that the parent project still belongs to this user.
    const project = await Project.exists({
      _id: task.project,
      owner: userId,
    });

    if (!project) {
      return sendApiResponse(res, 404, {
        message: "Task project not found",
        error: true,
        error_code: "PROJECT_NOT_FOUND",
        data: null,
      });
    }

    return sendApiResponse(res, 200, {
      message: "Task retrieved successfully",
      data: task,
    });
  }
);

// UPDATE TASK
export const updateTask = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const { taskId } = req.params;

    if (!mongoose.isValidObjectId(taskId)) {
      return sendApiResponse(res, 400, {
        message: "Invalid task ID",
        error: true,
        error_code: "INVALID_TASK_ID",
        data: null,
      });
    }

    const validation = updateTaskSchema.safeParse(req.body);

    if (!validation.success) {
      return sendApiResponse(res, 400, {
        message: "Invalid task update data",
        error: true,
        error_code: "TASK_VALIDATION_ERROR",
        data: validation.error.flatten(),
      });
    }

    const task = await Task.findOne({
      _id: taskId,
      owner: userId,
    });

    if (!task) {
      return sendApiResponse(res, 404, {
        message: "Task not found",
        error: true,
        error_code: "TASK_NOT_FOUND",
        data: null,
      });
    }

    const project = await Project.exists({
      _id: task.project,
      owner: userId,
    });

    if (!project) {
      return sendApiResponse(res, 404, {
        message: "Task project not found",
        error: true,
        error_code: "PROJECT_NOT_FOUND",
        data: null,
      });
    }

    const { sprintId, ...taskUpdates } = validation.data;

    // Assign or move the task to another sprint.
    if (sprintId !== undefined) {
      if (sprintId !== null) {
        const validSprint = await isValidSprint(
          sprintId,
          String(task.project),
          userId
        );

        if (!validSprint) {
          return sendApiResponse(res, 400, {
            message: "Sprint does not belong to this project",
            error: true,
            error_code: "INVALID_SPRINT_ASSIGNMENT",
            data: null,
          });
        }

        task.sprint = new mongoose.Types.ObjectId(sprintId);
      } else {
        // null means move task into the project backlog.
        task.sprint = null;
      }
    }

    Object.assign(task, taskUpdates);

    await task.save();

    return sendApiResponse(res, 200, {
      message: "Task updated successfully",
      data: task,
    });
  }
);

// DELETE TASK
export const deleteTask = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const { taskId } = req.params;

    if (!mongoose.isValidObjectId(taskId)) {
      return sendApiResponse(res, 400, {
        message: "Invalid task ID",
        error: true,
        error_code: "INVALID_TASK_ID",
        data: null,
      });
    }

    const task = await Task.findOneAndDelete({
      _id: taskId,
      owner: userId,
    });

    if (!task) {
      return sendApiResponse(res, 404, {
        message: "Task not found",
        error: true,
        error_code: "TASK_NOT_FOUND",
        data: null,
      });
    }

    return sendApiResponse(res, 200, {
      message: "Task deleted successfully",
      data: null,
    });
  }
);
