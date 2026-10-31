
import { z } from "zod";

// CREATE TASK
export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Task title must contain at least 2 characters")
    .max(120, "Task title cannot exceed 120 characters"),

  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters")
    .default(""),

  status: z
    .enum(["todo", "in-progress", "done"])
    .default("todo"),

  priority: z
    .enum(["low", "medium", "high"])
    .default("medium"),

  dueDate: z
    .union([
      z.iso.datetime().transform((value) => new Date(value)),
      z.null(),
    ])
    .optional(),

  sprintId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid sprint ID")
    .nullable()
    .optional(),
});

// UPDATE TASK
export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Task title must contain at least 2 characters")
      .max(120, "Task title cannot exceed 120 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional(),

    status: z
      .enum(["todo", "in-progress", "done"])
      .optional(),

    priority: z
      .enum(["low", "medium", "high"])
      .optional(),

    dueDate: z
      .union([
        z.iso.datetime().transform((value) => new Date(value)),
        z.null(),
      ])
      .optional(),

    sprintId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid sprint ID")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for an update",
    }
  );

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
