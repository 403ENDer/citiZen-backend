import mongoose, { Schema, Document } from "mongoose";

interface IPanchayat extends Document {
  name: string;
  ward_list: {
    ward_id: string;
    ward_name: string;
  }[];
  panchayat_id: string;
  constituency_id: mongoose.Types.ObjectId;
}

const PanchayatSchema = new Schema<IPanchayat>(
  {
    name: { type: String, required: true },
    ward_list: {
      type: [
        {
          ward_id: { type: String, required: true },
          ward_name: { type: String, required: true },
        },
      ],
      required: true,
      validate: {
        validator: function (wards: any[]) {
          return wards.length > 0;
        },
        message: "At least one ward is required",
      },
    },
    panchayat_id: { type: String, required: true, unique: true },
    constituency_id: {
      type: Schema.Types.ObjectId,
      ref: "Constituency",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Panchayat ||
  mongoose.model<IPanchayat>("Panchayat", PanchayatSchema);
