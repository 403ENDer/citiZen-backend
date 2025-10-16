import mongoose, { Schema, Document } from "mongoose";

interface IFeedback extends Document {
  issue_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  feedback: string;
  rating: number;
  created_at: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    issue_id: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    feedback: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one feedback per user per issue
FeedbackSchema.index({ issue_id: 1, user_id: 1 }, { unique: true });

export default mongoose.models.Feedback ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);
