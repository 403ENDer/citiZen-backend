"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./utils/db");
const dotenv_1 = require("dotenv");
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const auth_router_1 = __importDefault(require("./routes/auth.router"));
const constituency_router_1 = __importDefault(require("./routes/constituency.router"));
const panchayat_router_1 = __importDefault(require("./routes/panchayat.router"));
const issue_router_1 = __importDefault(require("./routes/issue.router"));
const upvote_router_1 = __importDefault(require("./routes/upvote.router"));
const aiSuggestion_router_1 = __importDefault(require("./routes/aiSuggestion.router"));
const swagger_1 = require("./config/swagger");
const multer_1 = __importDefault(require("multer"));
const scheduler_1 = require("./utils/scheduler");
(0, dotenv_1.configDotenv)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});
app.use(upload.any());
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.specs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "CitiZen API Documentation",
    customfavIcon: "/favicon.ico",
}));
app.use("/api/auth", auth_router_1.default);
app.use("/api/constituencies", constituency_router_1.default);
app.use("/api/panchayats", panchayat_router_1.default);
app.use("/api/issues", issue_router_1.default);
app.use("/api/upvotes", upvote_router_1.default);
app.use("/api/ai-suggestions", aiSuggestion_router_1.default);
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "CitiZen API is running" });
});
const port = process.env.PORT || 3000;
// Start server and connect to database
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        // Initialize schedulers
        scheduler_1.Scheduler.scheduleMonthlySuggestions();
        scheduler_1.Scheduler.scheduleCleanup();
        // Start the server
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
            console.log(`API Documentation: http://localhost:${port}/api-docs`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
