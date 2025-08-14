import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth";
import {
  createPanchayat,
  createBulkPanchayats,
  getAllPanchayats,
  getPanchayatById,
  getPanchayatsByConstituency,
  updatePanchayat,
  deletePanchayat,
  addWardsToPanchayat,
} from "../controllers/panchayat.controller";
import {
  panchayatSchema,
  bulkPanchayatSchema,
  updatePanchayatSchema,
  addWardsSchema,
} from "../validators/userDetailsValidators";

const router = Router();

// Validation middleware
const validatePanchayat = (req: any, res: any, next: any) => {
  const { error } = panchayatSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.details[0].message,
    });
  }
  next();
};

const validateBulkPanchayat = (req: any, res: any, next: any) => {
  const { error } = bulkPanchayatSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.details[0].message,
    });
  }
  next();
};

const validateUpdatePanchayat = (req: any, res: any, next: any) => {
  const { error } = updatePanchayatSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.details[0].message,
    });
  }
  next();
};

const validateAddWards = (req: any, res: any, next: any) => {
  const { error } = addWardsSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.details[0].message,
    });
  }
  next();
};

// Routes (all require admin authentication)
router.post("/", adminAuth, validatePanchayat, createPanchayat);
router.post("/bulk", adminAuth, validateBulkPanchayat, createBulkPanchayats);
router.get("/", getAllPanchayats); // Public route for reading
router.get("/:id", getPanchayatById); // Public route for reading
router.get("/constituency/:constituency_id", getPanchayatsByConstituency); // Public route for reading
router.put("/:id", adminAuth, validateUpdatePanchayat, updatePanchayat);
router.put("/add-wards/:id", adminAuth, validateAddWards, addWardsToPanchayat);
router.delete("/:id", adminAuth, deletePanchayat);

export default router;
