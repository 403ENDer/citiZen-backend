import mongoose, { Schema, Document } from "mongoose";

interface IMeeting extends Document {
  name: string;
  description?: string;
  constituency_id: mongoose.Types.ObjectId;
  departments: mongoose.Types.ObjectId[]; // refs Department
  date: Date; // meeting date (no time portion relied on)
  time: string; // 24h HH:MM
  created_by: mongoose.Types.ObjectId; // MLA/staff user id
}

const MeetingSchema = new Schema<IMeeting>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },
    description: { type: String, trim: true, maxlength: 2000 },
    constituency_id: {
      type: Schema.Types.ObjectId,
      ref: "Constituency",
      required: true,
    },
    departments: [
      { type: Schema.Types.ObjectId, ref: "Department", required: true },
    ],
    date: { type: Date, required: true },
    time: { type: String, required: true }, // validated in controller as HH:MM 24h
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Optional index for querying meetings by constituency and date
MeetingSchema.index({ constituency_id: 1, date: 1 });

export default mongoose.models.Meeting ||
  mongoose.model<IMeeting>("Meeting", MeetingSchema);
