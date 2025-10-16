import mongoose, { Schema, Document } from "mongoose";

interface IDepartment extends Document {
  name: string;
  head_id: mongoose.Types.ObjectId;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true },
    head_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to populate employees
DepartmentSchema.virtual("employees", {
  ref: "DepartmentEmployee",
  localField: "_id",
  foreignField: "dept_id",
});

export default mongoose.models.Department ||
  mongoose.model<IDepartment>("Department", DepartmentSchema);
