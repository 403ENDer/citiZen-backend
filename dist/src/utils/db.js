"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const uri = process.env.MONGO_URI;
if (!uri) {
    console.error("MONGO_URI is not defined in environment variables");
    process.exit(1);
}
// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(uri);
        console.log("MongoDB Connected Successfully");
    }
    catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
mongoose_1.default.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err);
});
mongoose_1.default.connection.on("disconnected", () => {
    console.log("Mongoose disconnected from MongoDB");
});
process.on("SIGINT", async () => {
    try {
        await mongoose_1.default.connection.close();
        console.log("Mongoose connection closed through app termination");
        process.exit(0);
    }
    catch (err) {
        console.error("Error closing mongoose connection:", err);
        process.exit(1);
    }
});
exports.default = mongoose_1.default;
