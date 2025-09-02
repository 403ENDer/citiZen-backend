"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const aiSuggestionService_1 = require("../services/aiSuggestionService");
const constituencyModel_1 = __importDefault(require("../models/constituencyModel"));
const aiSuggestionService = new aiSuggestionService_1.AISuggestionService();
class Scheduler {
    // Generate suggestions for all MLAs on the 1st of every month
    static scheduleMonthlySuggestions() {
        node_cron_1.default.schedule("0 0 1 * *", async () => {
            console.log("Starting monthly AI suggestion generation...");
            try {
                // Get all constituencies with MLAs
                const constituencies = await constituencyModel_1.default.find({ mla_id: { $exists: true } });
                console.log(`Found ${constituencies.length} constituencies with MLAs`);
                for (const constituency of constituencies) {
                    if (constituency.mla_id) {
                        try {
                            await aiSuggestionService.generateSuggestionsForMLA(constituency.mla_id);
                            console.log(`Generated suggestions for MLA: ${constituency.mla_id}`);
                        }
                        catch (error) {
                            console.error(`Failed to generate suggestions for MLA ${constituency.mla_id}:`, error);
                        }
                    }
                }
                console.log("Monthly AI suggestion generation completed");
            }
            catch (error) {
                console.error("Error in monthly suggestion generation:", error);
            }
        }, {
            timezone: "Asia/Kolkata"
        });
        console.log("Monthly AI suggestion scheduler initialized");
    }
    // Clean up old suggestions (mark as inactive after 12 months)
    static scheduleCleanup() {
        node_cron_1.default.schedule("0 2 1 * *", async () => {
            console.log("Starting cleanup of old AI suggestions...");
            try {
                const twelveMonthsAgo = new Date();
                twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
                const cutoffMonth = twelveMonthsAgo.toISOString().slice(0, 7);
                // Mark old suggestions as inactive instead of deleting
                const result = await aiSuggestionService.markOldSuggestionsInactive(cutoffMonth);
                console.log(`Marked ${result.modifiedCount} old suggestions as inactive`);
            }
            catch (error) {
                console.error("Error in cleanup:", error);
            }
        }, {
            timezone: "Asia/Kolkata"
        });
        console.log("Cleanup scheduler initialized");
    }
    // Manual trigger for testing (can be called programmatically)
    static async generateSuggestionsForAllMLAs() {
        console.log("Manually triggering suggestion generation for all MLAs...");
        try {
            const constituencies = await constituencyModel_1.default.find({ mla_id: { $exists: true } });
            for (const constituency of constituencies) {
                if (constituency.mla_id) {
                    try {
                        await aiSuggestionService.generateSuggestionsForMLA(constituency.mla_id);
                        console.log(`Generated suggestions for MLA: ${constituency.mla_id}`);
                    }
                    catch (error) {
                        console.error(`Failed to generate suggestions for MLA ${constituency.mla_id}:`, error);
                    }
                }
            }
            console.log("Manual suggestion generation completed");
        }
        catch (error) {
            console.error("Error in manual suggestion generation:", error);
        }
    }
}
exports.Scheduler = Scheduler;
