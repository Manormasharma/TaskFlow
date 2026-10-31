
import mongoose, { Schema, type InferSchemaType } from "mongoose";

const sprintSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    goal: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["planned", "active", "completed"],
      default: "planned",
      required: true,
    },

    // The project this sprint belongs to.
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // The user who owns this sprint.
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Efficiently retrieve sprints belonging to a project.
sprintSchema.index({ project: 1, startDate: -1 });

// Efficiently retrieve a user's sprints.
sprintSchema.index({ owner: 1, createdAt: -1 });

export type SprintDocument = InferSchemaType<typeof sprintSchema>;

const Sprint = mongoose.model("Sprint", sprintSchema);

export default Sprint;
