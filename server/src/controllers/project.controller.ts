
import mongoose from "mongoose";
import type { Request, Response } from "express";

import Project from "../models/Project.js"
import {
  createProjectSchema,
  updateProjectSchema,
} from "../validators/project.validator.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { sendApiResponse } from "../utils/apiResponse.js";
import Sprint from "../models/Sprint.js";
import Task from "../models/Task.js";

// CREATE PROJECT
export const createProject = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = res.locals.userId;

    const validation = createProjectSchema.safeParse(req.body);

    if (!validation.success) {
      return sendApiResponse(res, 400, {
        message: "Invalid project data",
        error: true,
        error_code: "PROJECT_VALIDATION_ERROR",
        data: validation.error.flatten(),
      });
    }

    const project = await Project.create({
      ...validation.data,
      owner: userId,
    });

    return sendApiResponse(res, 201, {
      message: "Project created successfully",
      data: project,
    });
  }
);

// GET ALL PROJECTS
export const getProjects = asyncHandler(
  async (_req: Request, res: Response) => {
    const userId = res.locals.userId;

    const projects = await Project.find({
      owner: userId,
    }).sort({ createdAt: -1 });

    return sendApiResponse(res, 200, {
      message: "Projects retrieved successfully",
      data: projects,
    });
  }
);

// GET SINGLE PROJECT
export const getProjectById = asyncHandler(
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

    return sendApiResponse(res, 200, {
      message: "Project retrieved successfully",
      data: project,
    });
  }
);

// UPDATE PROJECT
export const updateProject = asyncHandler(
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

    const validation = updateProjectSchema.safeParse(req.body);

    if (!validation.success) {
      return sendApiResponse(res, 400, {
        message: "Invalid project update data",
        error: true,
        error_code: "PROJECT_VALIDATION_ERROR",
        data: validation.error.flatten(),
      });
    }

    const project = await Project.findOneAndUpdate(
      {
        _id: projectId,
        owner: userId,
      },
      {
        $set: validation.data,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!project) {
      return sendApiResponse(res, 404, {
        message: "Project not found",
        error: true,
        error_code: "PROJECT_NOT_FOUND",
        data: null,
      });
    }

    return sendApiResponse(res, 200, {
      message: "Project updated successfully",
      data: project,
    });
  }
);

// DELETE PROJECT
export const deleteProject = asyncHandler(
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

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const project = await Project.findOne({
          _id: projectId,
          owner: userId,
        }).session(session);

        if (!project) {
          throw new Error("PROJECT_NOT_FOUND");
        }

        await Task.deleteMany(
          {
            project: project._id,
            owner: userId,
          },
          { session }
        );

        await Sprint.deleteMany(
          {
            project: project._id,
            owner: userId,
          },
          { session }
        );

        await Project.deleteOne(
          {
            _id: project._id,
            owner: userId,
          },
          { session }
        );
      });

      return sendApiResponse(res, 200, {
        message: "Project and its associated sprints and tasks deleted successfully",
        data: null,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "PROJECT_NOT_FOUND"
      ) {
        return sendApiResponse(res, 404, {
          message: "Project not found",
          error: true,
          error_code: "PROJECT_NOT_FOUND",
          data: null,
        });
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }
);

