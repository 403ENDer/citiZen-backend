import mongoose, { Schema, Document } from "mongoose";

interface INotification extends Document {
  user_id: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  issue_id?: mongoose.Types.ObjectId;
  type: string;
  message: string;
  status: string;
  created_at: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issue_id: { type: Schema.Types.ObjectId, ref: "Issue", required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: "pending" },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
