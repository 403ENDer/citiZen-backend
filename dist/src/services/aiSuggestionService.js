"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AISuggestionService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const issueModel_1 = __importDefault(require("../models/issueModel"));
const aiSuggestionModel_1 = __importDefault(require("../models/aiSuggestionModel"));
const constituencyModel_1 = __importDefault(require("../models/constituencyModel"));
// Mock department data for testing
const MOCK_DEPARTMENTS = [
    {
        _id: new mongoose_1.default.Types.ObjectId("64f8a1b2c3d4e5f678901234"),
        name: "Electricity Department"
    },
    {
        _id: new mongoose_1.default.Types.ObjectId("64f8a1b2c3d4e5f678901235"),
        name: "Water Supply Department"
    },
    {
        _id: new mongoose_1.default.Types.ObjectId("64f8a1b2c3d4e5f678901236"),
        name: "Sanitation Department"
    },
    {
        _id: new mongoose_1.default.Types.ObjectId("64f8a1b2c3d4e5f678901237"),
        name: "Transport Department"
    },
    {
        _id: new mongoose_1.default.Types.ObjectId("64f8a1b2c3d4e5f678901238"),
        name: "Revenue Department"
    },
    {
        _id: new mongoose_1.default.Types.ObjectId("64f8a1b2c3d4e5f678901239"),
        name: "Health Department"
    },
    {
        _id: new mongoose_1.default.Types.ObjectId("64f8a1b2c3d4e5f678901240"),
        name: "Police Department"
    },
    {
        _id: new mongoose_1.default.Types.ObjectId("64f8a1b2c3d4e5f678901241"),
        name: "Education Department"
    }
];
class AISuggestionService {
    // Analyze issues for a constituency by department and location
    async analyzeIssues(constituencyId, month) {
        const startDate = new Date(month + "-01");
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        const issues = await issueModel_1.default.find({
            constituency_id: constituencyId,
            created_at: { $gte: startDate, $lte: endDate },
        });
        const analysis = {};
        issues.forEach((issue) => {
            const department_id = issue.department_id || MOCK_DEPARTMENTS[0]._id; // Use mock department if none assigned
            const location = issue.locality;
            const key = `${department_id}-${location}`;
            if (!analysis[key]) {
                analysis[key] = {
                    department_id,
                    location,
                    total_issues: 0,
                    avg_upvotes: 0,
                    resolution_rate: 0,
                };
            }
            analysis[key].total_issues++;
            analysis[key].avg_upvotes += issue.upvotes;
            // Calculate resolution rate
            if (issue.status === "resolved") {
                analysis[key].resolution_rate++;
            }
        });
        // Calculate averages and percentages
        Object.values(analysis).forEach((item) => {
            item.avg_upvotes = Math.round(item.avg_upvotes / item.total_issues);
            item.resolution_rate = Math.round((item.resolution_rate / item.total_issues) * 100);
        });
        return Object.values(analysis);
    }
    // Generate mock AI suggestions based on analysis
    generateMockSuggestions(analysis) {
        const suggestions = [];
        const suggestionTemplates = [
            {
                title: "Optimize Response Time",
                status: "High",
                impact: "High",
                description: "Department response time has increased by 15% this month. Consider implementing automated workflows.",
                implementation_time: "2-3 weeks",
                cost: "₹50,000",
                type: "Performance"
            },
            {
                title: "Budget Reallocation",
                status: "Medium",
                impact: "High",
                description: "Department has 16% budget remaining. Consider reallocating to high-priority projects.",
                implementation_time: "1 week",
                cost: "₹0",
                type: "Budget"
            },
            {
                title: "Mobile App Enhancement",
                status: "Medium",
                impact: "Medium",
                description: "User engagement drops 40% on weekends. Consider 24/7 support and mobile notifications.",
                implementation_time: "4-6 weeks",
                cost: "₹200,000",
                type: "User Experience"
            },
            {
                title: "Smart City Integration",
                status: "Low",
                impact: "High",
                description: "Implement IoT sensors for real-time monitoring of infrastructure.",
                implementation_time: "3-4 months",
                cost: "₹2,500,000",
                type: "Infrastructure"
            },
            {
                title: "Staff Training Program",
                status: "Medium",
                impact: "Medium",
                description: "Improve staff efficiency through specialized training programs.",
                implementation_time: "2-4 weeks",
                cost: "₹75,000",
                type: "Performance"
            },
            {
                title: "Digital Documentation",
                status: "Low",
                impact: "Medium",
                description: "Implement digital documentation system to reduce paper waste and improve efficiency.",
                implementation_time: "1-2 months",
                cost: "₹150,000",
                type: "Infrastructure"
            },
            {
                title: "Public Awareness Campaign",
                status: "Medium",
                impact: "High",
                description: "Launch awareness campaign to educate citizens about available services.",
                implementation_time: "3-4 weeks",
                cost: "₹100,000",
                type: "User Experience"
            },
            {
                title: "Emergency Response System",
                status: "High",
                impact: "High",
                description: "Implement 24/7 emergency response system for critical issues.",
                implementation_time: "1-2 months",
                cost: "₹500,000",
                type: "Infrastructure"
            },
            {
                title: "Performance Analytics",
                status: "Low",
                impact: "Medium",
                description: "Deploy analytics dashboard to track department performance metrics.",
                implementation_time: "2-3 weeks",
                cost: "₹80,000",
                type: "Performance"
            },
            {
                title: "Resource Optimization",
                status: "Medium",
                impact: "High",
                description: "Optimize resource allocation based on issue patterns and demand.",
                implementation_time: "1 month",
                cost: "₹120,000",
                type: "Budget"
            }
        ];
        // Generate suggestions based on analysis data
        analysis.forEach((item, index) => {
            if (index < 10) { // Limit to 10 suggestions
                const template = suggestionTemplates[index % suggestionTemplates.length];
                const department = MOCK_DEPARTMENTS.find(d => d._id.equals(item.department_id)) || MOCK_DEPARTMENTS[0];
                suggestions.push({
                    ...template,
                    department_id: item.department_id,
                    location: item.location,
                    metrics: {
                        total_issues: item.total_issues,
                        avg_upvotes: item.avg_upvotes,
                        resolution_rate: item.resolution_rate,
                    },
                });
            }
        });
        return suggestions.slice(0, 10); // Ensure max 10 suggestions
    }
    // Generate suggestions for a specific MLA
    async generateSuggestionsForMLA(mlaId, month) {
        const currentMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM format
        // Check if suggestions already exist for this month
        let existingSuggestion = await aiSuggestionModel_1.default.findOne({
            mla_id: mlaId,
            month: currentMonth,
        });
        if (existingSuggestion) {
            return existingSuggestion; // Return existing if already generated
        }
        // Get constituency for the MLA
        const constituency = await constituencyModel_1.default.findOne({ mla_id: mlaId });
        if (!constituency) {
            throw new Error("Constituency not found for MLA");
        }
        // Analyze issues
        const analysis = await this.analyzeIssues(constituency._id, currentMonth);
        // Generate mock suggestions
        const suggestions = this.generateMockSuggestions(analysis);
        // Create new suggestion document
        const aiSuggestion = new aiSuggestionModel_1.default({
            mla_id: mlaId,
            constituency_id: constituency._id,
            month: currentMonth,
            suggestions,
            generated_at: new Date(),
            is_active: true,
        });
        await aiSuggestion.save();
        return aiSuggestion;
    }
    // Get suggestions for an MLA
    async getSuggestionsForMLA(mlaId, month) {
        const currentMonth = month || new Date().toISOString().slice(0, 7);
        let suggestion = await aiSuggestionModel_1.default.findOne({
            mla_id: mlaId,
            month: currentMonth,
            is_active: true,
        });
        // If no suggestion exists, generate one
        if (!suggestion) {
            suggestion = await this.generateSuggestionsForMLA(mlaId, currentMonth);
        }
        return suggestion;
    }
    // Get historical suggestions
    async getHistoricalSuggestions(mlaId, limit = 6) {
        return await aiSuggestionModel_1.default.find({
            mla_id: mlaId,
            is_active: true,
        })
            .sort({ month: -1 })
            .limit(limit);
    }
    // Mark old suggestions as inactive (instead of deleting)
    async markOldSuggestionsInactive(cutoffMonth) {
        const result = await aiSuggestionModel_1.default.updateMany({ month: { $lt: cutoffMonth }, is_active: true }, { is_active: false });
        return { modifiedCount: result.modifiedCount };
    }
}
exports.AISuggestionService = AISuggestionService;
