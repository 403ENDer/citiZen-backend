"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const adminAuth_1 = require("../middleware/adminAuth");
const aiSuggestion_controller_1 = require("../controllers/aiSuggestion.controller");
const router = (0, express_1.Router)();
const aiSuggestionController = new aiSuggestion_controller_1.AISuggestionController();
// Get current month suggestions for an MLA
router.get("/:mlaId", auth_1.auth, aiSuggestionController.getSuggestions.bind(aiSuggestionController));
// Get historical suggestions for an MLA
router.get("/:mlaId/history", auth_1.auth, aiSuggestionController.getHistoricalSuggestions.bind(aiSuggestionController));
// Manually generate suggestions for an MLA (admin only)
router.post("/:mlaId/generate", adminAuth_1.adminAuth, aiSuggestionController.generateSuggestions.bind(aiSuggestionController));
// Get all suggestions for a specific month (admin only)
router.get("/all/:month", adminAuth_1.adminAuth, aiSuggestionController.getAllSuggestions.bind(aiSuggestionController));
exports.default = router;
