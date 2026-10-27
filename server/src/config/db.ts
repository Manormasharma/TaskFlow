
import mongoose from "mongoose";
import process from "node:process";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(uri);

  console.log("MongoDB connected successfully");
}
