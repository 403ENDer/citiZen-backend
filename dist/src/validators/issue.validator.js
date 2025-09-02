"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentFilterSchema = exports.updateCommentSchema = exports.createCommentSchema = exports.bulkUpvoteSchema = exports.removeUpvoteSchema = exports.createUpvoteSchema = exports.issueFilterSchema = exports.bulkCreateIssueSchema = exports.addFeedbackSchema = exports.updateHandledBySchema = exports.updateIssueStatusSchema = exports.updateIssueSchema = exports.createIssueSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Issue validation schemas
exports.createIssueSchema = joi_1.default.object({
    title: joi_1.default.string().required().min(5).max(200),
    detail: joi_1.default.string().required().min(10).max(2000),
    locality: joi_1.default.string().required().min(3).max(200),
    department_id: joi_1.default.string().optional(), // Optional - will be auto-found if not provided
    attachments: joi_1.default.string().optional(), // Optional attachments
    is_anonymous: joi_1.default.boolean().default(false),
});
exports.updateIssueSchema = joi_1.default.object({
    title: joi_1.default.string().min(5).max(200),
    detail: joi_1.default.string().min(10).max(2000),
    locality: joi_1.default.string().min(3).max(200),
    department_id: joi_1.default.string(),
    attachments: joi_1.default.string(),
    is_anonymous: joi_1.default.boolean(),
});
// Schema for updating issue status (user-driven)
exports.updateIssueStatusSchema = joi_1.default.object({
    status: joi_1.default.string()
        .valid("pending", "in_progress", "resolved", "rejected")
        .required(),
});
// Schema for updating handled_by (department head only)
exports.updateHandledBySchema = joi_1.default.object({
    handled_by: joi_1.default.string().required(),
});
// Schema for adding feedback (when status is completed)
exports.addFeedbackSchema = joi_1.default.object({
    feedback: joi_1.default.string().required().min(1).max(1000),
    satisfaction_score: joi_1.default.string().valid("good", "average", "poor").required(),
});
exports.bulkCreateIssueSchema = joi_1.default.object({
    issues: joi_1.default.array().items(exports.createIssueSchema).min(1).required(),
});
exports.issueFilterSchema = joi_1.default.object({
    status: joi_1.default.string().valid("pending", "in_progress", "resolved", "rejected"),
    priority_level: joi_1.default.string().valid("high", "normal", "low"),
    constituency_id: joi_1.default.string(),
    panchayat_id: joi_1.default.string(),
    ward_no: joi_1.default.string(),
    user_id: joi_1.default.string(),
    department_id: joi_1.default.string(),
    startDate: joi_1.default.date().iso(),
    endDate: joi_1.default.date().iso().min(joi_1.default.ref("startDate")),
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    sortBy: joi_1.default.string()
        .valid("createdAt", "updatedAt", "priority_level", "upvotes", "title")
        .default("createdAt"),
    sortOrder: joi_1.default.string().valid("asc", "desc").default("desc"),
});
// Upvote validation schemas
exports.createUpvoteSchema = joi_1.default.object({
    issueId: joi_1.default.string().required(),
    userId: joi_1.default.string().required(),
});
exports.removeUpvoteSchema = joi_1.default.object({
    issueId: joi_1.default.string().required(),
    userId: joi_1.default.string().required(),
});
exports.bulkUpvoteSchema = joi_1.default.object({
    upvotes: joi_1.default.array().items(exports.createUpvoteSchema).min(1).required(),
});
// Comment validation schemas
exports.createCommentSchema = joi_1.default.object({
    issueId: joi_1.default.string().required(),
    content: joi_1.default.string().required().min(1).max(1000),
    userId: joi_1.default.string().required(),
    isPublic: joi_1.default.boolean().default(true),
});
exports.updateCommentSchema = joi_1.default.object({
    content: joi_1.default.string().required().min(1).max(1000),
    isPublic: joi_1.default.boolean(),
});
exports.commentFilterSchema = joi_1.default.object({
    issueId: joi_1.default.string(),
    userId: joi_1.default.string(),
    isPublic: joi_1.default.boolean(),
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(50).default(10),
    sortBy: joi_1.default.string().valid("createdAt", "updatedAt").default("createdAt"),
    sortOrder: joi_1.default.string().valid("asc", "desc").default("desc"),
});
