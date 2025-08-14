import mongoose, { Schema, Document } from "mongoose";

interface IUserDetails extends Document {
  user_id: mongoose.Types.ObjectId;
  panchayat_id: mongoose.Types.ObjectId;
  constituency: mongoose.Types.ObjectId;
  ward_no: string;
}

const UserDetailsSchema = new Schema<IUserDetails>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    panchayat_id: {
      type: Schema.Types.ObjectId,
      ref: "Panchayat",
      required: true,
    },
    constituency: {
      type: Schema.Types.ObjectId,
      ref: "Constituency",
      required: true,
    },
    ward_no: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.UserDetails ||
  mongoose.model<IUserDetails>("UserDetails", UserDetailsSchema);
