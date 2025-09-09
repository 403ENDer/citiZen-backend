"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../middleware/adminAuth");
const constituency_controller_1 = require("../controllers/constituency.controller");
const userDetailsValidators_1 = require("../validators/userDetailsValidators");
const router = (0, express_1.Router)();
// Validation middleware
const validateConstituency = (req, res, next) => {
    const { error } = userDetailsValidators_1.constituencySchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validateBulkConstituency = (req, res, next) => {
    const { error } = userDetailsValidators_1.bulkConstituencySchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
        });
    }
    next();
};
const validatePanchayats = (req, res, next) => {
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
const validateUpdateConstituency = (req, res, next) => {
    const { error } = userDetailsValidators_1.updateConstituencySchema.validate(req.body);
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
router.post("/", adminAuth_1.adminAuth, validateConstituency, constituency_controller_1.createConstituency);
router.post("/bulk", adminAuth_1.adminAuth, validateBulkConstituency, constituency_controller_1.createBulkConstituencies);
router.post("/:constituency_id/panchayats", adminAuth_1.adminAuth, validatePanchayats, constituency_controller_1.addPanchayatsToConstituency);
router.get("/", constituency_controller_1.getAllConstituencies);
router.get("/:id", constituency_controller_1.getConstituencyById);
router.get("/info/:id", constituency_controller_1.getconstituencyInfo);
router.put("/:id", adminAuth_1.adminAuth, validateUpdateConstituency, constituency_controller_1.updateConstituency);
router.delete("/:id", adminAuth_1.adminAuth, constituency_controller_1.deleteConstituency);
exports.default = router;
