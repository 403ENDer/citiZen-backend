import Joi from "joi";

// Issue validation schemas
export const createIssueSchema = Joi.object({
  title: Joi.string().required().min(5).max(200),
  detail: Joi.string().required().min(10).max(2000),
  locality: Joi.string().required().min(3).max(200),
  department_id: Joi.string().optional(), // Optional - will be auto-found if not provided
  attachments: Joi.string().optional(), // Optional attachments
  is_anonymous: Joi.boolean().default(false),
});

export const updateIssueSchema = Joi.object({
  title: Joi.string().min(5).max(200),
  detail: Joi.string().min(10).max(2000),
  locality: Joi.string().min(3).max(200),
  department_id: Joi.string(),
  attachments: Joi.string(),
  is_anonymous: Joi.boolean(),
});

// Schema for updating issue status (user-driven)
export const updateIssueStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "in_progress", "resolved", "rejected")
    .required(),
});

// Schema for updating handled_by (department head only)
export const updateHandledBySchema = Joi.object({
  handled_by: Joi.string().required(),
});

// Schema for adding feedback (when status is completed)
export const addFeedbackSchema = Joi.object({
  feedback: Joi.string().required().min(1).max(1000),
  satisfaction_score: Joi.string().valid("good", "average", "poor").required(),
});

export const bulkCreateIssueSchema = Joi.object({
  issues: Joi.array().items(createIssueSchema).min(1).required(),
});

export const issueFilterSchema = Joi.object({
  status: Joi.string().valid("pending", "in_progress", "resolved", "rejected"),
  priority_level: Joi.string().valid("high", "normal", "low"),
  constituency_id: Joi.string(),
  panchayat_id: Joi.string(),
  ward_no: Joi.string(),
  user_id: Joi.string(),
  department_id: Joi.string(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid("createdAt", "updatedAt", "priority_level", "upvotes", "title")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

// Upvote validation schemas
export const createUpvoteSchema = Joi.object({
  issueId: Joi.string().required(),
  userId: Joi.string().required(),
});

export const removeUpvoteSchema = Joi.object({
  issueId: Joi.string().required(),
  userId: Joi.string().required(),
});

export const bulkUpvoteSchema = Joi.object({
  upvotes: Joi.array().items(createUpvoteSchema).min(1).required(),
});

// Comment validation schemas
export const createCommentSchema = Joi.object({
  issueId: Joi.string().required(),
  content: Joi.string().required().min(1).max(1000),
  userId: Joi.string().required(),
  isPublic: Joi.boolean().default(true),
});

export const updateCommentSchema = Joi.object({
  content: Joi.string().required().min(1).max(1000),
  isPublic: Joi.boolean(),
});

export const commentFilterSchema = Joi.object({
  issueId: Joi.string(),
  userId: Joi.string(),
  isPublic: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sortBy: Joi.string().valid("createdAt", "updatedAt").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});
