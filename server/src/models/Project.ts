
import mongoose, { Schema, type InferSchemaType } from "mongoose";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
      required: true,
    },

    // The user who owns this project.
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

// Efficiently retrieve projects belonging to a user.
projectSchema.index({ owner: 1, createdAt: -1 });

export type ProjectDocument = InferSchemaType<typeof projectSchema>;

const Project = mongoose.model("Project", projectSchema);

export default Project;
