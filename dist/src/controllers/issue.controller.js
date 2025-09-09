"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIssueStatistics = exports.deleteIssue = exports.addFeedback = exports.updateHandledBy = exports.updateIssueStatus = exports.updateIssue = exports.getIssuesByConstituency = exports.getIssuesByUserId = exports.getIssueById = exports.getAllIssues = exports.createBulkIssues = exports.createIssue = void 0;
const issueModel_1 = __importDefault(require("../models/issueModel"));
const userModel_1 = require("../models/userModel");
const constituencyModel_1 = __importDefault(require("../models/constituencyModel"));
const panchayatModel_1 = __importDefault(require("../models/panchayatModel"));
const userDetailsModel_1 = __importDefault(require("../models/userDetailsModel"));
const departmentModel_1 = __importDefault(require("../models/departmentModel"));
const departmentEmployeeModel_1 = __importDefault(require("../models/departmentEmployeeModel"));
const types_1 = require("../utils/types");
const validation_1 = require("../utils/validation");
const response_1 = require("../utils/response");
const validate_query_1 = require("../utils/validate_query");
// Helper function to get random priority level
const getRandomPriorityLevel = () => {
    const levels = Object.values(types_1.PriorityLevel);
    return levels[Math.floor(Math.random() * levels.length)];
};
// Helper function to validate hierarchy
const validateHierarchy = async (constituency_id, panchayat_id, ward_no) => {
    try {
        // Check if constituency exists
        const constituency = await constituencyModel_1.default.findById(constituency_id);
        if (!constituency) {
            return { isValid: false, error: "Constituency not found" };
        }
        // Check if panchayat exists and belongs to the constituency
        const panchayat = await panchayatModel_1.default.findById(panchayat_id);
        if (!panchayat) {
            return {
                isValid: false,
                error: "Panchayat not found",
            };
        }
        // Check if panchayat belongs to the constituency
        if (panchayat.constituency_id.toString() !== constituency._id.toString()) {
            return {
                isValid: false,
                error: "Panchayat does not belong to the specified constituency",
            };
        }
        // Check if ward exists in the panchayat
        const wardExists = panchayat.ward_list.some((ward) => ward.id === ward_no);
        if (!wardExists) {
            return {
                isValid: false,
                error: "Ward not found in the specified panchayat",
            };
        }
        return { isValid: true };
    }
    catch (error) {
        return { isValid: false, error: "Error validating hierarchy" };
    }
};
// Create single issue
const createIssue = async (req, res) => {
    try {
        const { title, detail, locality, department_id, // Optional - will be auto-found if not provided
        attachments, // Optional
        is_anonymous = false, } = req.body;
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
        // Fetch user details to get constituency, panchayat, and ward information
        const userDetails = await userDetailsModel_1.default.findOne({ user_id });
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "User details not found. Please complete your profile first.",
            });
        }
        // Extract constituency, panchayat, and ward from user details
        const constituency_id = userDetails.constituency;
        const panchayat_id = userDetails.panchayat_id;
        const ward_no = userDetails.ward_no;
        // Validate hierarchy
        const hierarchyValidation = await validateHierarchy(constituency_id.toString(), panchayat_id.toString(), ward_no);
        if (!hierarchyValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: hierarchyValidation.error,
            });
        }
        // Handle department logic
        let finalDepartmentId = department_id;
        let aiClassifiedDepartment = null;
        console.log("Environment variables check:");
        console.log("GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY);
        console.log("GROQ_API_KEY length:", process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0);
        if (!department_id) {
            try {
                // Check if GROQ API key is available
                if (!process.env.GROQ_API_KEY) {
                    console.log("GROQ_API_KEY not found in environment variables. Skipping AI classification.");
                    aiClassifiedDepartment = "AI classification not available - GROQ API key missing";
                }
                else {
                    // Combine title and detail for classification
                    const queryText = `${title}. ${detail}`;
                    console.log("Attempting AI classification for query:", queryText);
                    // Get classification result
                    const classification = await (0, validate_query_1.classifyUserQuery)(queryText);
                    aiClassifiedDepartment = classification.classification;
                    console.log(`AI classified department: ${aiClassifiedDepartment}`);
                    // Try to find department by name and set finalDepartmentId
                    if (aiClassifiedDepartment) {
                        const department = await departmentModel_1.default.findOne({
                            name: aiClassifiedDepartment
                        });
                        if (department) {
                            finalDepartmentId = department._id;
                            console.log(`Auto-assigned to department: ${aiClassifiedDepartment}`);
                        }
                        else {
                            console.log(`Department not found: ${aiClassifiedDepartment}`);
                        }
                    }
                }
            }
            catch (error) {
                console.error("Error in automatic department classification:", error);
                aiClassifiedDepartment = `AI classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
                // Continue without department assignment
            }
        }
        else {
            // Validate if the provided department exists
            const department = await departmentModel_1.default.findById(department_id);
            if (!department) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department ID provided",
                });
            }
        }
        // TODO: Uncomment below logic when department verification is needed
        /*
        // Handle department logic
        let finalDepartmentId = department_id;
        if (!department_id) {
          try {
            // Combine title and detail for classification
            const queryText = `${title}. ${detail}`;
            
            // Get classification result
            const classification = await classifyUserQuery(queryText);
            
            // Find department by name
            const department = await Department.findOne({
              name: classification.classification
            });
            
            if (department) {
              finalDepartmentId = department._id;
              console.log(`Auto-assigned to department: ${classification.classification}`);
            } else {
              console.log(`Department not found: ${classification.classification}`);
            }
          } catch (error) {
            console.error("Error in automatic department classification:", error);
            // Continue without department assignment
          }
        } else {
          // Validate if the provided department exists
          const department = await Department.findById(department_id);
          if (!department) {
            return res.status(400).json({
              success: false,
              message: "Invalid department ID provided",
            });
          }
        }
        */
        // Set random priority level
        const priority_level = getRandomPriorityLevel();
        const issue = new issueModel_1.default({
            title,
            detail,
            locality,
            user_id,
            constituency_id,
            panchayat_id,
            ward_no,
            department_id: finalDepartmentId,
            priority_level,
            is_anonymous,
            attachments,
            status: "pending", // Default status
            upvotes: 0,
        });
        await issue.save();
        // Populate all references
        await issue.populate([
            { path: "user_id", select: "name email phone_number role" },
            { path: "constituency_id", select: "name constituency_id" },
            { path: "panchayat_id", select: "name panchayat_id" },
            { path: "department_id", select: "name" },
        ]);
        res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: {
                ...issue.toObject(),
                aiClassifiedDepartment: aiClassifiedDepartment
            },
        });
    }
    catch (error) {
        console.error("Create issue error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.createIssue = createIssue;
// Create bulk issues
const createBulkIssues = async (req, res) => {
    try {
        const { issues } = req.body;
        if (!Array.isArray(issues) || issues.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Issues array is required and must not be empty",
            });
        }
        const results = [];
        const errors = [];
        for (const issueData of issues) {
            try {
                const { title, detail, locality, department_id, attachments, is_anonymous = false, } = issueData;
                const user_id = req.user?.userId;
                if (!user_id) {
                    errors.push({
                        title,
                        error: "User authentication required",
                    });
                    continue;
                }
                // Check if user exists
                const user = await userModel_1.userModel.findById(user_id);
                if (!user) {
                    errors.push({
                        title,
                        error: "User not found",
                    });
                    continue;
                }
                // Fetch user details to get constituency, panchayat, and ward information
                const userDetails = await userDetailsModel_1.default.findOne({ user_id });
                if (!userDetails) {
                    errors.push({
                        title,
                        error: "User details not found. Please complete your profile first.",
                    });
                    continue;
                }
                // Extract constituency, panchayat, and ward from user details
                const constituency_id = userDetails.constituency;
                const panchayat_id = userDetails.panchayat_id;
                const ward_no = userDetails.ward_no;
                // Validate hierarchy
                const hierarchyValidation = await validateHierarchy(constituency_id.toString(), panchayat_id.toString(), ward_no);
                if (!hierarchyValidation.isValid) {
                    errors.push({
                        title,
                        error: hierarchyValidation.error,
                    });
                    continue;
                }
                // Handle department logic
                let finalDepartmentId = department_id;
                if (!department_id) {
                    try {
                        // Combine title and detail for classification
                        const queryText = `${title}. ${detail}`;
                        // Get classification result
                        const classification = await (0, validate_query_1.classifyUserQuery)(queryText);
                        // Find department by name
                        const department = await departmentModel_1.default.findOne({
                            name: classification.classification
                        });
                        if (department) {
                            finalDepartmentId = department._id;
                            console.log(`Auto-assigned to department: ${classification.classification}`);
                        }
                        else {
                            console.log(`Department not found: ${classification.classification}`);
                        }
                    }
                    catch (error) {
                        console.error("Error in automatic department classification:", error);
                        // Continue without department assignment
                    }
                }
                else {
                    // Validate if the provided department exists
                    const department = await departmentModel_1.default.findById(department_id);
                    if (!department) {
                        errors.push({
                            title,
                            error: "Invalid department ID provided",
                        });
                        continue;
                    }
                }
                // Set random priority level
                const priority_level = getRandomPriorityLevel();
                const issue = new issueModel_1.default({
                    title,
                    detail,
                    locality,
                    user_id,
                    constituency_id,
                    panchayat_id,
                    ward_no,
                    department_id: finalDepartmentId,
                    priority_level,
                    is_anonymous,
                    attachments,
                    status: "pending",
                    upvotes: 0,
                });
                await issue.save();
                await issue.populate([
                    { path: "user_id", select: "name email phone_number role" },
                    { path: "constituency_id", select: "name constituency_id" },
                    { path: "panchayat_id", select: "name panchayat_id" },
                ]);
                results.push(issue);
            }
            catch (error) {
                errors.push({
                    title: issueData.title,
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }
        res.status(201).json({
            success: true,
            message: `Created ${results.length} issues successfully`,
            data: {
                created: results,
                errors: errors.length > 0 ? errors : undefined,
            },
        });
    }
    catch (error) {
        console.error("Bulk create issues error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.createBulkIssues = createBulkIssues;
// Get all issues with filtering
const getAllIssues = async (req, res) => {
    try {
        const { status, priority_level, constituency_id, panchayat_id, ward_no, user_id, department_id, startDate, endDate, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (priority_level)
            filter.priority_level = priority_level;
        if (constituency_id)
            filter.constituency_id = constituency_id;
        if (panchayat_id)
            filter.panchayat_id = panchayat_id;
        if (ward_no)
            filter.ward_no = ward_no;
        if (user_id)
            filter.user_id = user_id;
        if (department_id)
            filter.department_id = department_id;
        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sort = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;
        const issues = await issueModel_1.default.find(filter)
            .populate("user_id", "name email phone_number role")
            .populate("constituency_id", "name constituency_id")
            .populate("panchayat_id", "name panchayat_id")
            .populate("department_id", "name")
            .populate("handled_by", "name email")
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));
        const total = await issueModel_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            message: "Issues retrieved successfully",
            data: {
                issues,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        });
    }
    catch (error) {
        console.error("Get issues error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getAllIssues = getAllIssues;
// Get issue by ID
const getIssueById = async (req, res) => {
    try {
        const { id } = req.params;
        // Validate ObjectId format
        const validationError = (0, validation_1.validateObjectIdParam)(id, "issue ID");
        if (validationError) {
            return (0, response_1.createValidationErrorResponse)(res, validationError);
        }
        const issue = await issueModel_1.default.findById(id)
            .populate("user_id", "name email phone_number role")
            .populate("constituency_id", "name constituency_id")
            .populate("panchayat_id", "name panchayat_id")
            .populate("department_id", "name")
            .populate("handled_by", "name email");
        if (!issue) {
            return (0, response_1.createNotFoundErrorResponse)(res, "Issue not found");
        }
        res.status(200).json({
            success: true,
            message: "Issue retrieved successfully",
            data: issue,
        });
    }
    catch (error) {
        console.error("Get issue error:", error);
        (0, response_1.createInternalErrorResponse)(res);
    }
};
exports.getIssueById = getIssueById;
// Get issues by user ID
const getIssuesByUserId = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        // Validate ObjectId format
        const validationError = (0, validation_1.validateObjectIdParam)(user_id, "user ID");
        if (validationError) {
            return (0, response_1.createValidationErrorResponse)(res, validationError);
        }
        // Check if user exists
        const user = await userModel_1.userModel.findById(user_id);
        if (!user) {
            return (0, response_1.createNotFoundErrorResponse)(res, "User not found");
        }
        const skip = (Number(page) - 1) * Number(limit);
        const issues = await issueModel_1.default.find({ user_id })
            .populate("user_id", "name email phone_number role")
            .populate("constituency_id", "name constituency_id")
            .populate("panchayat_id", "name panchayat_id")
            .populate("department_id", "name")
            .populate("handled_by", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await issueModel_1.default.countDocuments({ user_id });
        res.status(200).json({
            success: true,
            message: "Issues retrieved successfully",
            issues: {
                issues,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        });
    }
    catch (error) {
        console.error("Get issues by user ID error:", error);
        (0, response_1.createInternalErrorResponse)(res);
    }
};
exports.getIssuesByUserId = getIssuesByUserId;
// Get issues by constituency
const getIssuesByConstituency = async (req, res) => {
    try {
        const { constituency_id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        // Validate constituency_id parameter
        if (!constituency_id || constituency_id === "constituency") {
            return (0, response_1.createValidationErrorResponse)(res, "Valid constituency ID is required");
        }
        // Validate ObjectId format
        const validationError = (0, validation_1.validateObjectIdParam)(constituency_id, "constituency ID");
        if (validationError) {
            return (0, response_1.createValidationErrorResponse)(res, validationError);
        }
        // Check if constituency exists
        const constituency = await constituencyModel_1.default.findById(constituency_id);
        if (!constituency) {
            return (0, response_1.createNotFoundErrorResponse)(res, "Constituency not found");
        }
        const skip = (Number(page) - 1) * Number(limit);
        const issues = await issueModel_1.default.find({ constituency_id })
            .populate("user_id", "name email phone_number role")
            .populate("constituency_id", "name constituency_id")
            .populate("panchayat_id", "name panchayat_id")
            .populate("department_id", "name")
            .populate("handled_by", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await issueModel_1.default.countDocuments({ constituency_id });
        res.status(200).json({
            success: true,
            message: "Issues retrieved successfully",
            issues: {
                issues,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        });
    }
    catch (error) {
        console.error("Get issues by constituency error:", error);
        (0, response_1.createInternalErrorResponse)(res);
    }
};
exports.getIssuesByConstituency = getIssuesByConstituency;
// Update issue
const updateIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const issue = await issueModel_1.default.findById(id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }
        // Check if user is authorized to update this issue
        const user_id = req.user?.userId;
        const user = await userModel_1.userModel.findById(user_id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }
        // Only allow users to update their own issues, or admins to update any issue
        if (issue.user_id.toString() !== user_id && user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this issue",
            });
        }
        // If updating hierarchy fields, validate them
        if (updateData.constituency_id ||
            updateData.panchayat_id ||
            updateData.ward_no) {
            const constituency_id = updateData.constituency_id || issue.constituency_id.toString();
            const panchayat_id = updateData.panchayat_id || issue.panchayat_id.toString();
            const ward_no = updateData.ward_no || issue.ward_no;
            const hierarchyValidation = await validateHierarchy(constituency_id, panchayat_id, ward_no);
            if (!hierarchyValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: hierarchyValidation.error,
                });
            }
        }
        // If updating department, validate it exists
        if (updateData.department_id) {
            const department = await departmentModel_1.default.findById(updateData.department_id);
            if (!department) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department ID provided",
                });
            }
        }
        const updatedIssue = await issueModel_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate([
            { path: "user_id", select: "name email phone_number role" },
            { path: "constituency_id", select: "name constituency_id" },
            { path: "panchayat_id", select: "name panchayat_id" },
            { path: "department_id", select: "name" },
            { path: "handled_by", select: "name email" },
        ]);
        res.status(200).json({
            success: true,
            message: "Issue updated successfully",
            data: updatedIssue,
        });
    }
    catch (error) {
        console.error("Update issue error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.updateIssue = updateIssue;
// Update issue status (user-driven, requires auth)
const updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user_id = req.user?.userId;
        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User authentication required",
            });
        }
        const issue = await issueModel_1.default.findById(id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }
        // Check if user is authorized to update this issue
        const user = await userModel_1.userModel.findById(user_id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }
        // Only allow users to update their own issues, or admins to update any issue
        if (issue.user_id.toString() !== user_id && user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this issue",
            });
        }
        // Update status and set completed_at if status is resolved
        const updateData = { status };
        if (status === "resolved") {
            updateData.completed_at = new Date();
        }
        const updatedIssue = await issueModel_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate([
            { path: "user_id", select: "name email phone_number role" },
            { path: "constituency_id", select: "name constituency_id" },
            { path: "panchayat_id", select: "name panchayat_id" },
            { path: "department_id", select: "name" },
        ]);
        res.status(200).json({
            success: true,
            message: "Issue status updated successfully",
            data: updatedIssue,
        });
    }
    catch (error) {
        console.error("Update issue status error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.updateIssueStatus = updateIssueStatus;
// Update handled_by (department head only, requires protected auth)
const updateHandledBy = async (req, res) => {
    try {
        const { id } = req.params;
        const { handled_by } = req.body;
        const user_id = req.user?.userId;
        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User authentication required",
            });
        }
        // Check if user is department head
        const user = await userModel_1.userModel.findById(user_id);
        if (!user || user.role !== "dept") {
            return res.status(403).json({
                success: false,
                message: "Only department heads can assign issues",
            });
        }
        const issue = await issueModel_1.default.findById(id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }
        // Validate that the handled_by user exists and is a department employee
        const departmentEmployee = await departmentEmployeeModel_1.default.findById(handled_by);
        if (!departmentEmployee) {
            return res.status(400).json({
                success: false,
                message: "Invalid department employee ID",
            });
        }
        const updatedIssue = await issueModel_1.default.findByIdAndUpdate(id, { handled_by }, {
            new: true,
            runValidators: true,
        }).populate([
            { path: "user_id", select: "name email phone_number role" },
            { path: "constituency_id", select: "name constituency_id" },
            { path: "panchayat_id", select: "name panchayat_id" },
            { path: "department_id", select: "name" },
            { path: "handled_by", select: "name email" },
        ]);
        res.status(200).json({
            success: true,
            message: "Issue assigned successfully",
            data: updatedIssue,
        });
    }
    catch (error) {
        console.error("Update handled_by error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.updateHandledBy = updateHandledBy;
// Add feedback (when status is completed)
const addFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback, satisfaction_score } = req.body;
        const user_id = req.user?.userId;
        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User authentication required",
            });
        }
        const issue = await issueModel_1.default.findById(id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }
        // Check if issue status is completed
        if (issue.status !== "resolved") {
            return res.status(400).json({
                success: false,
                message: "Feedback can only be added when issue status is resolved",
            });
        }
        // Check if user is authorized to add feedback (issue creator)
        const user = await userModel_1.userModel.findById(user_id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }
        if (issue.user_id.toString() !== user_id && user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to add feedback to this issue",
            });
        }
        const updatedIssue = await issueModel_1.default.findByIdAndUpdate(id, { feedback, satisfaction_score }, {
            new: true,
            runValidators: true,
        }).populate([
            { path: "user_id", select: "name email phone_number role" },
            { path: "constituency_id", select: "name constituency_id" },
            { path: "panchayat_id", select: "name panchayat_id" },
            { path: "department_id", select: "name" },
            { path: "handled_by", select: "name email" },
        ]);
        res.status(200).json({
            success: true,
            message: "Feedback added successfully",
            data: updatedIssue,
        });
    }
    catch (error) {
        console.error("Add feedback error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.addFeedback = addFeedback;
// Delete issue
const deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const issue = await issueModel_1.default.findById(id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }
        // Check if user is authorized to delete this issue
        const user_id = req.user?.userId;
        const user = await userModel_1.userModel.findById(user_id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }
        // Only allow users to delete their own issues, or admins to delete any issue
        if (issue.user_id.toString() !== user_id && user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this issue",
            });
        }
        await issueModel_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Issue deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete issue error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteIssue = deleteIssue;
// Get issue statistics
const getIssueStatistics = async (req, res) => {
    try {
        const { constituency_id, panchayat_id, ward_no } = req.query;
        const filter = {};
        if (constituency_id)
            filter.constituency_id = constituency_id;
        if (panchayat_id)
            filter.panchayat_id = panchayat_id;
        if (ward_no)
            filter.ward_no = ward_no;
        const [totalIssues, pendingIssues, inProgressIssues, resolvedIssues, rejectedIssues, highPriorityIssues, normalPriorityIssues, lowPriorityIssues, priorityStats,] = await Promise.all([
            issueModel_1.default.countDocuments(filter),
            issueModel_1.default.countDocuments({ ...filter, status: "pending" }),
            issueModel_1.default.countDocuments({ ...filter, status: "in_progress" }),
            issueModel_1.default.countDocuments({ ...filter, status: "resolved" }),
            issueModel_1.default.countDocuments({ ...filter, status: "rejected" }),
            issueModel_1.default.countDocuments({ ...filter, priority_level: "high" }),
            issueModel_1.default.countDocuments({ ...filter, priority_level: "normal" }),
            issueModel_1.default.countDocuments({ ...filter, priority_level: "low" }),
            issueModel_1.default.aggregate([
                { $match: filter },
                { $group: { _id: "$priority_level", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
        ]);
        res.status(200).json({
            success: true,
            message: "Issue statistics retrieved successfully",
            data: {
                total: totalIssues,
                byStatus: {
                    pending: pendingIssues,
                    inProgress: inProgressIssues,
                    resolved: resolvedIssues,
                    rejected: rejectedIssues,
                },
                byPriority: {
                    high: highPriorityIssues,
                    normal: normalPriorityIssues,
                    low: lowPriorityIssues,
                },
                priorityStats: priorityStats,
            },
        });
    }
    catch (error) {
        console.error("Get issue statistics error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getIssueStatistics = getIssueStatistics;
