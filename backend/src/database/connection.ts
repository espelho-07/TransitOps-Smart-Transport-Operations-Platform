import mongoose from "mongoose";
import { env } from "../config/env";

export async function connectDatabase() {
  try {
    console.log(`Connecting to MongoDB: ${env.MONGO_URI}...`);
    await mongoose.connect(env.MONGO_URI);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failure:", error);
    process.exit(1);
  }
}
