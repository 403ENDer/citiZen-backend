import { Request, Response } from "express";
import mongoose from "mongoose";
import Department from "../models/departmentModel";
import DepartmentEmployee from "../models/departmentEmployeeModel";
import { userModel } from "../models/userModel";
import { RoleTypes } from "../utils/types";
import { createSuccessResponse, createErrorResponse } from "../utils/response";

/**
 * Create a new department
 */
export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, head_id } = req.body;

    // Validation
    if (!name || !head_id) {
      return createErrorResponse(res, 400, "Name and head_id are required");
    }

    // Validate head_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(head_id)) {
      return createErrorResponse(res, 400, "Invalid head_id format");
    }

    // Check if head user exists and has appropriate role
    const headUser = await userModel.findById(head_id);
    if (!headUser) {
      return createErrorResponse(res, 404, "Head user not found");
    }

    if (headUser.role !== RoleTypes.DEPT) {
      return createErrorResponse(res, 400, "Head user must have 'dept' role");
    }

    // Check if department name already exists
    const existingDept = await Department.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingDept) {
      return createErrorResponse(
        res,
        409,
        "Department with this name already exists"
      );
    }

    // Check if user is already head of another department
    const existingHead = await Department.findOne({ head_id });
    if (existingHead) {
      return createErrorResponse(
        res,
        409,
        "User is already head of another department"
      );
    }

    const department = new Department({
      name,
      head_id,
    });

    await department.save();

    // Populate head details
    await department.populate({
      path: "head_id",
      select: "name email phone_number role",
    });

    createSuccessResponse(res, 201, {
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    createErrorResponse(res, 500, "Internal server error");
  }
};

/**
 * Get all departments with populated details
 */
export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await Department.find()
      .populate({
        path: "head_id",
        select: "name email phone_number role",
      })
      .populate({
        path: "employees",
        select: "user_id",
        populate: {
          path: "user_id",
          select: "name email phone_number role",
        },
      });

    createSuccessResponse(res, 200, {
      message: "Departments retrieved successfully",
      departments,
      count: departments.length,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    createErrorResponse(res, 500, "Internal server error");
  }
};

/**
 * Get department by ID with populated details
 */
export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return createErrorResponse(res, 400, "Invalid department ID format");
    }

    const department = await Department.findById(id)
      .populate({
        path: "head_id",
        select: "name email phone_number role",
      })
      .populate({
        path: "employees",
        select: "user_id",
        populate: {
          path: "user_id",
          select: "name email phone_number role",
        },
      });

    if (!department) {
      return createErrorResponse(res, 404, "Department not found");
    }

    createSuccessResponse(res, 200, {
      message: "Department retrieved successfully",
      department,
    });
  } catch (error) {
    console.error("Error fetching department:", error);
    createErrorResponse(res, 500, "Internal server error");
  }
};

/**
 * Update department
 */
export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, head_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return createErrorResponse(res, 400, "Invalid department ID format");
    }

    // Check if department exists
    const existingDept = await Department.findById(id);
    if (!existingDept) {
      return createErrorResponse(res, 404, "Department not found");
    }

    // Validate head_id if provided
    if (head_id) {
      if (!mongoose.Types.ObjectId.isValid(head_id)) {
        return createErrorResponse(res, 400, "Invalid head_id format");
      }

      const headUser = await userModel.findById(head_id);
      if (!headUser) {
        return createErrorResponse(res, 404, "Head user not found");
      }

      if (headUser.role !== RoleTypes.DEPT) {
        return createErrorResponse(res, 400, "Head user must have 'dept' role");
      }

      // Check if user is already head of another department
      const existingHead = await Department.findOne({
        head_id,
        _id: { $ne: id },
      });
      if (existingHead) {
        return createErrorResponse(
          res,
          409,
          "User is already head of another department"
        );
      }
    }

    // Check if department name already exists (if name is being updated)
    if (name && name !== existingDept.name) {
      const duplicateDept = await Department.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });
      if (duplicateDept) {
        return createErrorResponse(
          res,
          409,
          "Department with this name already exists"
        );
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (head_id) updateData.head_id = head_id;

    const department = await Department.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate({
      path: "head_id",
      select: "name email phone_number role",
    });

    createSuccessResponse(res, 200, {
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    console.error("Error updating department:", error);
    createErrorResponse(res, 500, "Internal server error");
  }
};

/**
 * Delete department
 */
export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return createErrorResponse(res, 400, "Invalid department ID format");
    }

    const department = await Department.findById(id);
    if (!department) {
      return createErrorResponse(res, 404, "Department not found");
    }

    // Delete all department employees first
    await DepartmentEmployee.deleteMany({ dept_id: id });

    // Delete the department
    await Department.findByIdAndDelete(id);

    createSuccessResponse(res, 200, {
      message: "Department and all its employees deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    createErrorResponse(res, 500, "Internal server error");
  }
};

/**
 * Add employee to department
 */
export const addDepartmentEmployee = async (req: Request, res: Response) => {
  try {
    const { dept_id, user_id } = req.body;

    // Validation
    if (!dept_id || !user_id) {
      return createErrorResponse(res, 400, "dept_id and user_id are required");
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(dept_id)) {
      return createErrorResponse(res, 400, "Invalid dept_id format");
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return createErrorResponse(res, 400, "Invalid user_id format");
    }

    // Check if department exists
    const department = await Department.findById(dept_id);
    if (!department) {
      return createErrorResponse(res, 404, "Department not found");
    }

    // Check if user exists and has appropriate role
    const user = await userModel.findById(user_id);
    if (!user) {
      return createErrorResponse(res, 404, "User not found");
    }

    if (user.role !== RoleTypes.DEPT_STAFF) {
      return createErrorResponse(res, 400, "User must have 'dept_staff' role");
    }

    // Check if user is already in this department
    const existingEmployee = await DepartmentEmployee.findOne({
      dept_id,
      user_id,
    });
    if (existingEmployee) {
      return createErrorResponse(
        res,
        409,
        "User is already an employee of this department"
      );
    }

    // Check if user is already in another department
    const existingDeptEmployee = await DepartmentEmployee.findOne({ user_id });
    if (existingDeptEmployee) {
      return createErrorResponse(
        res,
        409,
        "User is already an employee of another department"
      );
    }

    const departmentEmployee = new DepartmentEmployee({
      dept_id,
      user_id,
    });

    await departmentEmployee.save();

    // Populate details
    await departmentEmployee.populate([
      {
        path: "dept_id",
        select: "name head_id",
        populate: {
          path: "head_id",
          select: "name email",
        },
      },
      {
        path: "user_id",
        select: "name email phone_number role",
      },
    ]);

    createSuccessResponse(res, 201, {
      message: "Employee added to department successfully",
      departmentEmployee,
    });
  } catch (error) {
    console.error("Error adding department employee:", error);
    createErrorResponse(res, 500, "Internal server error");
  }
};

/**
 * Get employees of a department
 */
export const getDepartmentEmployees = async (req: Request, res: Response) => {
  try {
    const { dept_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(dept_id)) {
      return createErrorResponse(res, 400, "Invalid department ID format");
    }

    // Check if department exists
    const department = await Department.findById(dept_id);
    if (!department) {
      return createErrorResponse(res, 404, "Department not found");
    }

    const employees = await DepartmentEmployee.find({ dept_id }).populate({
      path: "user_id",
      select: "name email phone_number",
    });

    // Transform employees to only include required fields
    const transformedEmployees = employees.map((emp: any) => ({
      id: emp.user_id._id,
      name: emp.user_id.name,
      email: emp.user_id.email,
      phone_number: emp.user_id.phone_number,
    }));

    createSuccessResponse(res, 200, {
      message: "Department employees retrieved successfully",
      department: {
        _id: department._id,
        name: department.name,
      },
      employees: transformedEmployees,
      count: transformedEmployees.length,
    });
  } catch (error) {
    console.error("Error fetching department employees:", error);
    createErrorResponse(res, 500, "Internal server error");
  }
};

/**
 * Remove employee from department
 */
export const removeDepartmentEmployee = async (req: Request, res: Response) => {
  try {
    const { dept_id, user_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(dept_id)) {
      return createErrorResponse(res, 400, "Invalid department ID format");
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return createErrorResponse(res, 400, "Invalid user ID format");
    }

    // Check if department exists
    const department = await Department.findById(dept_id);
    if (!department) {
      return createErrorResponse(res, 404, "Department not found");
    }

    // Check if employee exists in this department
    const departmentEmployee = await DepartmentEmployee.findOne({
      dept_id,
      user_id,
    });
    if (!departmentEmployee) {
      return createErrorResponse(
        res,
        404,
        "Employee not found in this department"
      );
    }

    await DepartmentEmployee.findByIdAndDelete(departmentEmployee._id);

    createSuccessResponse(res, 200, {
      message: "Employee removed from department successfully",
    });
  } catch (error) {
    console.error("Error removing department employee:", error);
    createErrorResponse(res, 500, "Internal server error");
  }
};

/**
 * Get all department employees (across all departments)
 */
export const getAllDepartmentEmployees = async (
  req: Request,
  res: Response
) => {
  try {
    const employees = await DepartmentEmployee.find()
      .populate({
        path: "user_id",
        select: "name email phone_number role",
      })
      .populate({
        path: "dept_id",
        select: "name head_id",
        populate: {
          path: "head_id",
          select: "name email",
        },
      });

    createSuccessResponse(res, 200, {
      message: "All department employees retrieved successfully",
      employees,
      count: employees.length,
    });
  } catch (error) {
    console.error("Error fetching all department employees:", error);
    createErrorResponse(res, 500, "Internal server error");
  }
};
