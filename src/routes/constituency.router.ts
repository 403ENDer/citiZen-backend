import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth";
import {
  createConstituency,
  createConstituencyWithPanchayats,
  createBulkConstituencies,
  createBulkConstituenciesWithPanchayats,
  addPanchayatsToConstituency,
  getAllConstituencies,
  getConstituencyById,
  getconstituencyInfo,
  updateConstituency,
  deleteConstituency,
} from "../controllers/constituency.controller";
import {
  constituencySchema,
  constituencyWithPanchayatsSchema,
  bulkConstituencySchema,
  bulkConstituencyWithPanchayatsSchema,
  updateConstituencySchema,
  bulkPanchayatSchema,
} from "../validators/userDetailsValidators";

const router = Router();

// Validation middleware
const validateConstituency = (req: any, res: any, next: any) => {
  const { error } = constituencySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.details[0].message,
    });
  }
  next();
};

const validateBulkConstituency = (req: any, res: any, next: any) => {
  const { error } = bulkConstituencySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.details[0].message,
    });
  }
  next();
};

const validatePanchayats = (req: any, res: any, next: any) => {
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

const validateUpdateConstituency = (req: any, res: any, next: any) => {
  const { error } = updateConstituencySchema.validate(req.body);
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
router.post("/", /*adminAuth,*/ validateConstituency, createConstituency);

router.post(
  "/bulk",
  /*adminAuth,*/
  validateBulkConstituency,
  createBulkConstituencies
);

router.post(
  "/:constituency_id/panchayats",
  /*adminAuth,*/
  validatePanchayats,
  addPanchayatsToConstituency
);
router.get("/", getAllConstituencies);
router.get("/:id", getConstituencyById);
router.get("/info/:id", getconstituencyInfo);
router.put(
  "/:id",
  /*adminAuth,*/ validateUpdateConstituency,
  updateConstituency
);
router.delete("/:id", /*adminAuth,*/ deleteConstituency);

export default router;
