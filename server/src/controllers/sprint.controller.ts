
import mongoose from "mongoose";
import type { Request, Response } from "express";

import Project from "../models/Project.js";
import Sprint from "../models/Sprint.js";

import {
  createSprintSchema,
  updateSprintSchema,
} from "../validators/sprint.validator.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { sendApiResponse } from "../utils/apiResponse.js";
import Task from "../models/Task.js";
// CREATE SPRINT
export const createSprint = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
      return sendApiResponse(res, 400, {
        message: "Invalid project ID",
        error: true,
        error_code: "INVALID_PROJECT_ID",
        data: null,
      });
    }

    // Verify that the project belongs to the logged-in user.
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

    const validation = createSprintSchema.safeParse(req.body);

    if (!validation.success) {
      return sendApiResponse(res, 400, {
        message: "Invalid sprint data",
        error: true,
        error_code: "SPRINT_VALIDATION_ERROR",
        data: validation.error.flatten(),
      });
    }

    const sprint = await Sprint.create({
      ...validation.data,
      project: project._id,
      owner: userId,
    });

    return sendApiResponse(res, 201, {
      message: "Sprint created successfully",
      data: sprint,
    });
  }
);

// GET ALL SPRINTS FOR A PROJECT
export const getProjectSprints = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const { projectId } = req.params;

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

    const sprints = await Sprint.find({
      project: project._id,
      owner: userId,
    }).sort({ startDate: -1 });

    return sendApiResponse(res, 200, {
      message: "Sprints retrieved successfully",
      data: sprints,
    });
  }
);

// GET SINGLE SPRINT
export const getSprintById = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const { sprintId } = req.params;

    if (!mongoose.isValidObjectId(sprintId)) {
      return sendApiResponse(res, 400, {
        message: "Invalid sprint ID",
        error: true,
        error_code: "INVALID_SPRINT_ID",
        data: null,
      });
    }

    const sprint = await Sprint.findOne({
      _id: sprintId,
      owner: userId,
    });

    if (!sprint) {
      return sendApiResponse(res, 404, {
        message: "Sprint not found",
        error: true,
        error_code: "SPRINT_NOT_FOUND",
        data: null,
      });
    }

    // Also verify that its parent project still belongs to this user.
    const project = await Project.exists({
      _id: sprint.project,
      owner: userId,
    });

    if (!project) {
      return sendApiResponse(res, 404, {
        message: "Sprint project not found",
        error: true,
        error_code: "PROJECT_NOT_FOUND",
        data: null,
      });
    }

    return sendApiResponse(res, 200, {
      message: "Sprint retrieved successfully",
      data: sprint,
    });
  }
);

// UPDATE SPRINT
export const updateSprint = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const { sprintId } = req.params;

    if (!mongoose.isValidObjectId(sprintId)) {
      return sendApiResponse(res, 400, {
        message: "Invalid sprint ID",
        error: true,
        error_code: "INVALID_SPRINT_ID",
        data: null,
      });
    }

    const validation = updateSprintSchema.safeParse(req.body);

    if (!validation.success) {
      return sendApiResponse(res, 400, {
        message: "Invalid sprint update data",
        error: true,
        error_code: "SPRINT_VALIDATION_ERROR",
        data: validation.error.flatten(),
      });
    }

    const sprint = await Sprint.findOne({
      _id: sprintId,
      owner: userId,
    });

    if (!sprint) {
      return sendApiResponse(res, 404, {
        message: "Sprint not found",
        error: true,
        error_code: "SPRINT_NOT_FOUND",
        data: null,
      });
    }

    const project = await Project.exists({
      _id: sprint.project,
      owner: userId,
    });

    if (!project) {
      return sendApiResponse(res, 404, {
        message: "Sprint project not found",
        error: true,
        error_code: "PROJECT_NOT_FOUND",
        data: null,
      });
    }

    // Validate the final date range, including unchanged dates.
    const newStartDate =
      validation.data.startDate ?? sprint.startDate;

    const newEndDate =
      validation.data.endDate ?? sprint.endDate;

    if (newEndDate < newStartDate) {
      return sendApiResponse(res, 400, {
        message: "End date must be on or after start date",
        error: true,
        error_code: "INVALID_SPRINT_DATE_RANGE",
        data: null,
      });
    }

    Object.assign(sprint, validation.data);

    await sprint.save();

    return sendApiResponse(res, 200, {
      message: "Sprint updated successfully",
      data: sprint,
    });
  }
);

// DELETE SPRINT
export const deleteSprint = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const { sprintId } = req.params;

    if (!mongoose.isValidObjectId(sprintId)) {
      return sendApiResponse(res, 400, {
        message: "Invalid sprint ID",
        error: true,
        error_code: "INVALID_SPRINT_ID",
        data: null,
      });
    }

    const sprint = await Sprint.findOne({
      _id: sprintId,
      owner: userId,
    });

    if (!sprint) {
      return sendApiResponse(res, 404, {
        message: "Sprint not found",
        error: true,
        error_code: "SPRINT_NOT_FOUND",
        data: null,
      });
    }

    const project = await Project.exists({
      _id: sprint.project,
      owner: userId,
    });

    if (!project) {
      return sendApiResponse(res, 404, {
        message: "Sprint project not found",
        error: true,
        error_code: "PROJECT_NOT_FOUND",
        data: null,
      });
    }
    // Move all sprint tasks to the project backlog.
    await Task.updateMany(
      {
        sprint: sprint._id,
        project: sprint.project,
        owner: userId,
      },
      {
        $set: {
          sprint: null,
        },
      }
    );

    // Task relationship cleanup will be added when the Task model
    // is implemented. For now, this deletes only the sprint.
    await sprint.deleteOne();

    return sendApiResponse(res, 200, {
      message: "Sprint deleted successfully",
      data: null,
    });
  }
);
