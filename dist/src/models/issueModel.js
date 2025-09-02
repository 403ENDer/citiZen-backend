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
const types_1 = require("../utils/types");
const IssueSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    detail: { type: String, required: true },
    locality: { type: String, required: true },
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    constituency_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Constituency",
        required: true,
    },
    panchayat_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Panchayat",
        required: true,
    },
    ward_no: { type: String, required: true },
    department_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Department" },
    handled_by: { type: mongoose_1.Schema.Types.ObjectId, ref: "DepartmentEmployee" },
    status: {
        type: String,
        enum: Object.values(types_1.IssueStatus),
        default: types_1.IssueStatus.PENDING,
    },
    upvotes: { type: Number, default: 0 },
    priority_level: {
        type: String,
        enum: Object.values(types_1.PriorityLevel),
        default: types_1.PriorityLevel.NORMAL,
    },
    is_anonymous: { type: Boolean, default: false },
    attachments: { type: String },
    feedback: { type: String },
    satisfaction_score: { type: String, enum: Object.values(types_1.Satisfaction) },
    created_at: { type: Date, default: Date.now },
    completed_at: { type: Date },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.models.Issue ||
    mongoose_1.default.model("Issue", IssueSchema);
