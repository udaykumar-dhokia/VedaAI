import mongoose from "mongoose";
import "dotenv/config";
import { log } from "node:console";

const DATABASE_URL = process.env.DATABASE_URL;

const connectDB = async () => {
  if (!DATABASE_URL) {
    log("DATABASE_URL not found.");
    return;
  }

  try {
    await mongoose.connect(DATABASE_URL);
    log("Database connected successfully.");
  } catch (e) {
    log("Error connecting to database: ", e);
  }
};

export default connectDB;
