// MongoDB connection via Mongoose. Called once at startup (server.ts).
import mongoose from "mongoose";
import { config } from "./index.js";

export async function connectDb(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.mongoUri);
  console.log("✅ MongoDB bağlandı");
}
