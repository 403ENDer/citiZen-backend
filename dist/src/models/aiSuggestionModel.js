"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const AISuggestionSchema = new mongoose_1.Schema({
    mla_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    constituency_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Constituency", required: true },
    month: { type: String, required: true }, // Format: "YYYY-MM"
    suggestions: [
        {
            title: { type: String, required: true },
            status: { type: String, enum: ["High", "Medium", "Low"], required: true },
            impact: { type: String, enum: ["High", "Medium", "Low"], required: true },
            description: { type: String, required: true },
            implementation_time: { type: String, required: true },
            cost: { type: String, required: true },
            type: { type: String, required: true },
            department_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Department", required: true },
            location: { type: String, required: true },
            metrics: {
                total_issues: { type: Number, default: 0 },
                avg_upvotes: { type: Number, default: 0 },
                resolution_rate: { type: Number, default: 0 },
            },
        },
    ],
    generated_at: { type: Date, default: Date.now },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true,
});
// Compound index to ensure one suggestion per MLA per month
AISuggestionSchema.index({ mla_id: 1, month: 1 }, { unique: true });
exports.default = mongoose_1.default.models.AISuggestion ||
    mongoose_1.default.model("AISuggestion", AISuggestionSchema);
