"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../middleware/adminAuth");
const panchayat_controller_1 = require("../controllers/panchayat.controller");
const userDetailsValidators_1 = require("../validators/userDetailsValidators");
const router = (0, express_1.Router)();
// Validation middleware
const validatePanchayat = (req, res, next) => {
    const { error } = userDetailsValidators_1.panchayatSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validateBulkPanchayat = (req, res, next) => {
    const { error } = userDetailsValidators_1.bulkPanchayatSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validateUpdatePanchayat = (req, res, next) => {
    const { error } = userDetailsValidators_1.updatePanchayatSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validateAddWards = (req, res, next) => {
    const { error } = userDetailsValidators_1.addWardsSchema.validate(req.body);
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
router.post("/", adminAuth_1.adminAuth, validatePanchayat, panchayat_controller_1.createPanchayat);
router.post("/bulk", adminAuth_1.adminAuth, validateBulkPanchayat, panchayat_controller_1.createBulkPanchayats);
router.get("/", panchayat_controller_1.getAllPanchayats); // Public route for reading
router.get("/:id", panchayat_controller_1.getPanchayatById); // Public route for reading
router.get("/constituency/:constituency_id", panchayat_controller_1.getPanchayatsByConstituency); // Public route for reading
router.put("/:id", adminAuth_1.adminAuth, validateUpdatePanchayat, panchayat_controller_1.updatePanchayat);
router.put("/add-wards/:id", adminAuth_1.adminAuth, validateAddWards, panchayat_controller_1.addWardsToPanchayat);
router.delete("/:id", adminAuth_1.adminAuth, panchayat_controller_1.deletePanchayat);
exports.default = router;
