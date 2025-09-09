"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AISuggestionController = void 0;
const aiSuggestionService_1 = require("../services/aiSuggestionService");
const response_1 = require("../utils/response");
const aiSuggestionService = new aiSuggestionService_1.AISuggestionService();
class AISuggestionController {
    // Get current month suggestions for an MLA
    async getSuggestions(req, res) {
        try {
            const { mlaId } = req.params;
            const { month } = req.query;
            if (!mlaId) {
                return (0, response_1.createErrorResponse)(res, 400, "MLA ID is required");
            }
            const suggestions = await aiSuggestionService.getSuggestionsForMLA(mlaId, month);
            if (!suggestions) {
                return (0, response_1.createNotFoundErrorResponse)(res, "No suggestions found");
            }
            return (0, response_1.createSuccessResponse)(res, 200, {
                success: true,
                message: "Suggestions retrieved successfully",
                data: {
                    suggestions: suggestions.suggestions,
                    month: suggestions.month,
                    generated_at: suggestions.generated_at,
                    updated_at: suggestions.updatedAt,
                },
            });
        }
        catch (error) {
            console.error("Error getting suggestions:", error);
            return (0, response_1.createErrorResponse)(res, 500, "Failed to get suggestions");
        }
    }
    // Get historical suggestions
    async getHistoricalSuggestions(req, res) {
        try {
            const { mlaId } = req.params;
            const { limit = 6 } = req.query;
            if (!mlaId) {
                return (0, response_1.createErrorResponse)(res, 400, "MLA ID is required");
            }
            const suggestions = await aiSuggestionService.getHistoricalSuggestions(mlaId, parseInt(limit));
            return (0, response_1.createSuccessResponse)(res, 200, {
                success: true,
                message: "Historical suggestions retrieved successfully",
                data: {
                    suggestions: suggestions.map(s => ({
                        month: s.month,
                        suggestions: s.suggestions,
                        generated_at: s.generated_at,
                        updated_at: s.updatedAt,
                    })),
                },
            });
        }
        catch (error) {
            console.error("Error getting historical suggestions:", error);
            return (0, response_1.createErrorResponse)(res, 500, "Failed to get historical suggestions");
        }
    }
    // Manually trigger suggestion generation
    async generateSuggestions(req, res) {
        try {
            const { mlaId } = req.params;
            const { month } = req.body;
            if (!mlaId) {
                return (0, response_1.createErrorResponse)(res, 400, "MLA ID is required");
            }
            const suggestions = await aiSuggestionService.generateSuggestionsForMLA(mlaId, month);
            return (0, response_1.createSuccessResponse)(res, 200, {
                success: true,
                message: "Suggestions generated successfully",
                data: {
                    suggestions: suggestions.suggestions,
                    month: suggestions.month,
                    generated_at: suggestions.generated_at,
                },
            });
        }
        catch (error) {
            console.error("Error generating suggestions:", error);
            return (0, response_1.createErrorResponse)(res, 500, "Failed to generate suggestions");
        }
    }
    // Get suggestions for all MLAs (admin endpoint)
    async getAllSuggestions(req, res) {
        try {
            const { month } = req.query;
            const currentMonth = month || new Date().toISOString().slice(0, 7);
            // This would require additional service method to get all MLAs
            // For now, return a message indicating this feature
            return (0, response_1.createSuccessResponse)(res, 200, {
                success: true,
                message: "Get all suggestions endpoint - implementation pending",
                data: {
                    month: currentMonth,
                    note: "This endpoint will return suggestions for all MLAs for the specified month"
                }
            });
        }
        catch (error) {
            console.error("Error getting all suggestions:", error);
            return (0, response_1.createErrorResponse)(res, 500, "Failed to get all suggestions");
        }
    }
}
exports.AISuggestionController = AISuggestionController;
