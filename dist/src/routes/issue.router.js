"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const adminAuth_1 = require("../middleware/adminAuth");
const issue_controller_1 = require("../controllers/issue.controller");
const issue_validator_1 = require("../validators/issue.validator");
const router = (0, express_1.Router)();
// Validation middleware
const validateCreateIssue = (req, res, next) => {
    const { error } = issue_validator_1.createIssueSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validateUpdateIssue = (req, res, next) => {
    const { error } = issue_validator_1.updateIssueSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validateUpdateIssueStatus = (req, res, next) => {
    const { error } = issue_validator_1.updateIssueStatusSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validateUpdateHandledBy = (req, res, next) => {
    const { error } = issue_validator_1.updateHandledBySchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validateAddFeedback = (req, res, next) => {
    const { error } = issue_validator_1.addFeedbackSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validateBulkCreateIssue = (req, res, next) => {
    const { error } = issue_validator_1.bulkCreateIssueSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validateIssueFilter = (req, res, next) => {
    const { error } = issue_validator_1.issueFilterSchema.validate(req.query);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
// Routes
// Create single issue (requires authentication)
router.post("/", auth_1.auth, validateCreateIssue, issue_controller_1.createIssue);
// Create bulk issues (requires authentication)
router.post("/bulk", auth_1.auth, validateBulkCreateIssue, issue_controller_1.createBulkIssues);
// Get all issues with filtering (public)
router.get("/", validateIssueFilter, issue_controller_1.getAllIssues);
// Get issue by ID (public)
router.get("/:id", issue_controller_1.getIssueById);
// Get issues by user ID (public)
router.get("/user/:user_id", issue_controller_1.getIssuesByUserId);
// Get issues by constituency (public)
router.get("/constituency/:constituency_id", issue_controller_1.getIssuesByConstituency);
// Update issue (requires authentication - user can update their own, admin can update any)
router.put("/:id", auth_1.auth, validateUpdateIssue, issue_controller_1.updateIssue);
// Update issue status (requires authentication - user can update their own, admin can update any)
router.patch("/:id/status", auth_1.auth, validateUpdateIssueStatus, issue_controller_1.updateIssueStatus);
// Update handled_by (requires department head authentication)
router.patch("/:id/assign", adminAuth_1.adminAuth, validateUpdateHandledBy, issue_controller_1.updateHandledBy);
// Add feedback (requires authentication - when status is resolved)
router.post("/:id/feedback", auth_1.auth, validateAddFeedback, issue_controller_1.addFeedback);
// Delete issue (requires authentication - user can delete their own, admin can delete any)
router.delete("/:id", auth_1.auth, issue_controller_1.deleteIssue);
// Get issue statistics (public)
router.get("/statistics", issue_controller_1.getIssueStatistics);
exports.default = router;
