
import { z } from "zod";

const sprintFields = {
  name: z
    .string()
    .trim()
    .min(2, "Sprint name must contain at least 2 characters")
    .max(100, "Sprint name cannot exceed 100 characters"),

  goal: z
    .string()
    .trim()
    .max(1000, "Sprint goal cannot exceed 1000 characters")
    .default(""),

  startDate: z.coerce.date({
    error: "A valid start date is required",
  }),

  endDate: z.coerce.date({
    error: "A valid end date is required",
  }),
};

// CREATE SPRINT
export const createSprintSchema = z
  .object({
    ...sprintFields,
  })
  .refine(
    (data) => data.endDate >= data.startDate,
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

// UPDATE SPRINT
export const updateSprintSchema = z
  .object({
    name: sprintFields.name.optional(),

    goal: z
      .string()
      .trim()
      .max(1000, "Sprint goal cannot exceed 1000 characters")
      .optional(),

    startDate: z.coerce.date().optional(),

    endDate: z.coerce.date().optional(),

    status: z
      .enum(["planned", "active", "completed"])
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for an update",
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }

      return true;
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

export type CreateSprintInput = z.infer<
  typeof createSprintSchema
>;

export type UpdateSprintInput = z.infer<
  typeof updateSprintSchema
>;
