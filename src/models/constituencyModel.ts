import mongoose, { Schema, Document } from "mongoose";

interface IConstituency extends Document {
  name: string;
  constituency_id: string;
  mla_id: mongoose.Types.ObjectId;
  panchayats: mongoose.Types.ObjectId[];
  total_voters?: number;
  active_voters?: number;
  area?: string;
  population?: number;
  literacy_rate?: number;
}

const ConstituencySchema = new Schema<IConstituency>(
  {
    name: { type: String, required: true, unique: true },
    constituency_id: { type: String, required: true, unique: true },
    mla_id: { type: Schema.Types.ObjectId, ref: "User", required: false },
    panchayats: [{ type: Schema.Types.ObjectId, ref: "Panchayat" }],
    total_voters: { type: Number, default: 0 },
    active_voters: { type: Number, default: 0 },
    area: { type: String, default: "N/A" },
    population: { type: Number, default: 0 },
    literacy_rate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Constituency ||
  mongoose.model<IConstituency>("Constituency", ConstituencySchema);
