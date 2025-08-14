import { Router } from "express";
import { auth } from "../middleware/auth";
import { adminAuth } from "../middleware/adminAuth";
import {
  createIssue,
  createBulkIssues,
  getAllIssues,
  getIssueById,
  getIssuesByUserId,
  getIssuesByConstituency,
  updateIssue,
  updateIssueStatus,
  updateHandledBy,
  addFeedback,
  deleteIssue,
  getIssueStatistics,
} from "../controllers/issue.controller";
import {
  createIssueSchema,
  updateIssueSchema,
  updateIssueStatusSchema,
  updateHandledBySchema,
  addFeedbackSchema,
  bulkCreateIssueSchema,
  issueFilterSchema,
} from "../validators/issue.validator";

const router = Router();

// Validation middleware
const validateCreateIssue = (req: any, res: any, next: any) => {
  const { error } = createIssueSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.details[0].message,
    });
  }
  next();
};

const validateUpdateIssue = (req: any, res: any, next: any) => {
  const { error } = updateIssueSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.details[0].message,
    });
  }
  next();
};

const validateUpdateIssueStatus = (req: any, res: any, next: any) => {
  const { error } = updateIssueStatusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.details[0].message,
    });
  }
  next();
};

const validateUpdateHandledBy = (req: any, res: any, next: any) => {
  const { error } = updateHandledBySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.details[0].message,
    });
  }
  next();
};

const validateAddFeedback = (req: any, res: any, next: any) => {
  const { error } = addFeedbackSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.details[0].message,
    });
  }
  next();
};

const validateBulkCreateIssue = (req: any, res: any, next: any) => {
  const { error } = bulkCreateIssueSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.details[0].message,
    });
  }
  next();
};

const validateIssueFilter = (req: any, res: any, next: any) => {
  const { error } = issueFilterSchema.validate(req.query);
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
router.post("/", auth, validateCreateIssue, createIssue);

// Create bulk issues (requires authentication)
router.post("/bulk", auth, validateBulkCreateIssue, createBulkIssues);

// Get all issues with filtering (public)
router.get("/", validateIssueFilter, getAllIssues);

// Get issue by ID (public)
router.get("/:id", getIssueById);

// Get issues by user ID (public)
router.get("/user/:user_id", getIssuesByUserId);

// Get issues by constituency (public)
router.get("/constituency/:constituency_id", getIssuesByConstituency);

// Update issue (requires authentication - user can update their own, admin can update any)
router.put("/:id", auth, validateUpdateIssue, updateIssue);

// Update issue status (requires authentication - user can update their own, admin can update any)
router.patch("/:id/status", auth, validateUpdateIssueStatus, updateIssueStatus);

// Update handled_by (requires department head authentication)
router.patch(
  "/:id/assign",
  adminAuth,
  validateUpdateHandledBy,
  updateHandledBy
);

// Add feedback (requires authentication - when status is resolved)
router.post("/:id/feedback", auth, validateAddFeedback, addFeedback);

// Delete issue (requires authentication - user can delete their own, admin can delete any)
router.delete("/:id", auth, deleteIssue);

// Get issue statistics (public)
router.get("/statistics", getIssueStatistics);

export default router;
