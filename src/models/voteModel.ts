import mongoose, { Schema, Document } from "mongoose";

interface IVote extends Document {
  user_id: mongoose.Types.ObjectId;
  issue_id: mongoose.Types.ObjectId;
  vote_type: "upvote";
  voted_at: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issue_id: { type: Schema.Types.ObjectId, ref: "Issue", required: true },
    vote_type: { type: String, enum: ["upvote"], required: true },
    voted_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Vote ||
  mongoose.model<IVote>("Vote", VoteSchema);
