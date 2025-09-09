import express from "express";
import { connectDB } from "./utils/db";
import { configDotenv } from "dotenv";
import fs from "fs";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.router";
import constituencyRoutes from "./routes/constituency.router";
import panchayatRoutes from "./routes/panchayat.router";
import issueRoutes from "./routes/issue.router";
import upvoteRoutes from "./routes/upvote.router";
import mlaDashboardRoutes from "./routes/mlaDashboard.router";
import { specs } from "./config/swagger";
import multer from "multer";

// Load environment variables with support for .env.test when NODE_ENV=test
(() => {
  const isTest = process.env.NODE_ENV === "test";
  const envPath = isTest && fs.existsSync(".env.test") ? ".env.test" : ".env";
  configDotenv({ path: envPath });
})();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
app.use(upload.any());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "CitiZen API Documentation",
    customfavIcon: "/favicon.ico",
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/constituencies", constituencyRoutes);
app.use("/api/panchayats", panchayatRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/upvotes", upvoteRoutes);
app.use("/api/mla-dashboard", mlaDashboardRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "CitiZen API is running" });
});

const port = process.env.PORT || 3000;

// Start server and connect to database
const startServer = async () => {
  try {
    await connectDB();
    // Start the server
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log(`API Documentation: http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
