import mongoose, { Schema, Document } from "mongoose";
import { IssueStatus, PriorityLevel, Satisfaction } from "../utils/types";

interface IIssue extends Document {
  title: string;
  detail: string;
  locality: string;
  user_id: mongoose.Types.ObjectId;
  constituency_id: mongoose.Types.ObjectId;
  panchayat_id: mongoose.Types.ObjectId;
  ward_no: string;
  department_id?: mongoose.Types.ObjectId;
  handled_by?: mongoose.Types.ObjectId;
  status: IssueStatus;
  upvotes: number;
  priority_level: PriorityLevel;
  is_anonymous: boolean;
  attachments?: string;
  feedback?: string;
  satisfaction_score?: Satisfaction;
  created_at: Date;
  completed_at?: Date;
}

const IssueSchema = new Schema<IIssue>(
  {
    title: { type: String, required: true },
    detail: { type: String, required: true },
    locality: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    constituency_id: {
      type: Schema.Types.ObjectId,
      ref: "Constituency",
      required: true,
    },
    panchayat_id: {
      type: Schema.Types.ObjectId,
      ref: "Panchayat",
      required: true,
    },
    ward_no: { type: String, required: true },
    department_id: { type: Schema.Types.ObjectId, ref: "Department" },
    handled_by: { type: Schema.Types.ObjectId, ref: "DepartmentEmployee" },
    status: {
      type: String,
      enum: Object.values(IssueStatus),
      default: IssueStatus.PENDING,
    },
    upvotes: { type: Number, default: 0 },
    priority_level: {
      type: String,
      enum: Object.values(PriorityLevel),
      default: PriorityLevel.NORMAL,
    },
    is_anonymous: { type: Boolean, default: false },
    attachments: { type: String },
    feedback: { type: String },
    satisfaction_score: { type: String, enum: Object.values(Satisfaction) },
    created_at: { type: Date, default: Date.now },
    completed_at: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Issue ||
  mongoose.model<IIssue>("Issue", IssueSchema);
