import { Router } from "express";
import { auth } from "../middleware/auth";
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  addDepartmentEmployee,
  getDepartmentEmployees,
  removeDepartmentEmployee,
  getAllDepartmentEmployees,
} from "../controllers/department.controller";

const router = Router();

// Department CRUD routes
router.post("/", auth, createDepartment);
router.get("/", auth, getDepartments);
router.get("/:id", auth, getDepartmentById);
router.put("/:id", auth, updateDepartment);
router.delete("/:id", auth, deleteDepartment);

// Department Employee routes
router.post("/employees", auth, addDepartmentEmployee);
router.get("/:dept_id/employees", auth, getDepartmentEmployees);
router.delete("/:dept_id/employees/:user_id", auth, removeDepartmentEmployee);
router.get("/employees/all", auth, getAllDepartmentEmployees);

export default router;
