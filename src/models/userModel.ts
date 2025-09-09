import mongoose, { Schema, Document, Types } from "mongoose";
import { RoleTypes } from "../utils/types";

interface users extends Document {
  name: string;
  email: string;
  password_hash?: string;
  phone_number: string;
  role: RoleTypes;
  is_verified: boolean;
  google_access_token?: string;
}

const userSchema = new Schema<users>(
  {
    name: { type: String, required: true, minlength: 2, trim: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: false },
    phone_number: {
      type: String,
      required: true,
      minlength: 10,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(RoleTypes),
      default: RoleTypes.CITIZEN,
      required: true,
    },
    is_verified: { type: Boolean, default: false },
    google_access_token: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export const userModel =
  mongoose.models.User || mongoose.model<users>("User", userSchema);
