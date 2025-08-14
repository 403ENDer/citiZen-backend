import mongoose, { Schema, Document } from "mongoose";

interface IDepartmentEmployee extends Document {
  user_id: mongoose.Types.ObjectId;
  dept_id: mongoose.Types.ObjectId;
}

const DepartmentEmployeeSchema = new Schema<IDepartmentEmployee>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dept_id: { type: Schema.Types.ObjectId, ref: "Department", required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DepartmentEmployee ||
  mongoose.model<IDepartmentEmployee>(
    "DepartmentEmployee",
    DepartmentEmployeeSchema
  );
