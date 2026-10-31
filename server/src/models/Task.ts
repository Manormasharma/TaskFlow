
import mongoose, { Schema, type InferSchemaType } from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
      required: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      required: true,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    // Every task must belong to a project.
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // A task can remain in the backlog without a sprint.
    sprint: {
      type: Schema.Types.ObjectId,
      ref: "Sprint",
      default: null,
    },

    // The user who owns this task.
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

// Efficient project task filtering.
taskSchema.index({
  project: 1,
  status: 1,
  createdAt: -1,
});

// Efficient sprint task retrieval.
taskSchema.index({
  sprint: 1,
  createdAt: -1,
});

// Efficient retrieval of a user's tasks.
taskSchema.index({
  owner: 1,
  createdAt: -1,
});

export type TaskDocument = InferSchemaType<typeof taskSchema>;

const Task = mongoose.model("Task", taskSchema);

export default Task;
