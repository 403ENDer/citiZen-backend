"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserUpvote = exports.removeUpvote = exports.addUpvote = void 0;
const issueModel_1 = __importDefault(require("../models/issueModel"));
const userModel_1 = require("../models/userModel");
// Add upvote to issue
const addUpvote = async (req, res) => {
    try {
        const { issue_id } = req.params;
        const user_id = req.user?.userId;
        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User authentication required",
            });
        }
        // Check if user exists
        const user = await userModel_1.userModel.findById(user_id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }
        // Check if issue exists
        const issue = await issueModel_1.default.findById(issue_id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }
        // Check if user is trying to upvote their own issue
        if (issue.user_id.toString() === user_id) {
            return res.status(400).json({
                success: false,
                message: "You cannot upvote your own issue",
            });
        }
        // Check if user has already upvoted this issue
        if (issue.upvoted_by && issue.upvoted_by.includes(user_id)) {
            return res.status(400).json({
                success: false,
                message: "You have already upvoted this issue",
            });
        }
        // Add upvote
        const updatedIssue = await issueModel_1.default.findByIdAndUpdate(issue_id, {
            $inc: { upvotes: 1 },
            $push: { upvoted_by: user_id },
        }, { new: true }).populate([
            { path: "user_id", select: "name email phone_number role" },
            { path: "constituency_id", select: "name constituency_id" },
            { path: "panchayat_id", select: "name panchayat_id" },
        ]);
        res.status(200).json({
            success: true,
            message: "Upvote added successfully",
            data: updatedIssue,
        });
    }
    catch (error) {
        console.error("Add upvote error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.addUpvote = addUpvote;
// Remove upvote from issue
const removeUpvote = async (req, res) => {
    try {
        const { issue_id } = req.params;
        const user_id = req.user?.userId;
        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User authentication required",
            });
        }
        // Check if user exists
        const user = await userModel_1.userModel.findById(user_id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }
        // Check if issue exists
        const issue = await issueModel_1.default.findById(issue_id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }
        // Check if user has upvoted this issue
        if (!issue.upvoted_by || !issue.upvoted_by.includes(user_id)) {
            return res.status(400).json({
                success: false,
                message: "You have not upvoted this issue",
            });
        }
        // Remove upvote
        const updatedIssue = await issueModel_1.default.findByIdAndUpdate(issue_id, {
            $inc: { upvotes: -1 },
            $pull: { upvoted_by: user_id },
        }, { new: true }).populate([
            { path: "user_id", select: "name email phone_number role" },
            { path: "constituency_id", select: "name constituency_id" },
            { path: "panchayat_id", select: "name panchayat_id" },
        ]);
        res.status(200).json({
            success: true,
            message: "Upvote removed successfully",
            data: updatedIssue,
        });
    }
    catch (error) {
        console.error("Remove upvote error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.removeUpvote = removeUpvote;
// Check if user has upvoted an issue
const checkUserUpvote = async (req, res) => {
    try {
        const { issue_id } = req.params;
        const user_id = req.user?.userId;
        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User authentication required",
            });
        }
        // Check if issue exists
        const issue = await issueModel_1.default.findById(issue_id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }
        const hasUpvoted = issue.upvoted_by && issue.upvoted_by.includes(user_id);
        res.status(200).json({
            success: true,
            message: "Upvote status retrieved successfully",
            data: {
                issue_id,
                user_id,
                has_upvoted: hasUpvoted,
                upvotes_count: issue.upvotes,
            },
        });
    }
    catch (error) {
        console.error("Check user upvote error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.checkUserUpvote = checkUserUpvote;
