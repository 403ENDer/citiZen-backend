import mongoose, { Schema, Document } from "mongoose";

interface IConstituency extends Document {
  name: string;
  panchayats: mongoose.Types.ObjectId[];
  constituency_id: string;
  mla_id: mongoose.Types.ObjectId;
}

const ConstituencySchema = new Schema<IConstituency>(
  {
    name: { type: String, required: true, unique: true },
    panchayats: [
      { type: Schema.Types.ObjectId, ref: "Panchayat", required: true },
    ],
    constituency_id: { type: String, required: true, unique: true },
    mla_id: { type: Schema.Types.ObjectId, ref: "User", required: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Constituency ||
  mongoose.model<IConstituency>("Constituency", ConstituencySchema);
