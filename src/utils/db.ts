import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import fs from "fs";

// Load environment variables with support for .env.test when NODE_ENV=test
(() => {
  const isTest = process.env.NODE_ENV === "test";
  const envPath = isTest && fs.existsSync(".env.test") ? ".env.test" : ".env";
  configDotenv({ path: envPath });
})();

const uri = process.env.MONGO_URI!;

if (!uri) {
  console.error("MONGO_URI is not defined in environment variables");
  process.exit(1);
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB Connected Successfully");
    // In test environment, drop unique phone index to avoid E11000 during parallel tests
    if (
      process.env.NODE_ENV === "test" &&
      mongoose.connection &&
      mongoose.connection.db
    ) {
      try {
        await mongoose.connection.db
          .collection("users")
          .dropIndex("phone_number_1");
      } catch (err) {
        // Ignore if index does not exist
      }
    }
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB");
});

process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("Mongoose connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("Error closing mongoose connection:", err);
    process.exit(1);
  }
});

export { connectDB };
export default mongoose;
