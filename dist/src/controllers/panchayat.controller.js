"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePanchayat = exports.addWardsToPanchayat = exports.updatePanchayat = exports.getPanchayatsByConstituency = exports.getPanchayatById = exports.getAllPanchayats = exports.createBulkPanchayats = exports.createPanchayat = void 0;
const panchayatModel_1 = __importDefault(require("../models/panchayatModel"));
const constituencyModel_1 = __importDefault(require("../models/constituencyModel"));
// Create single panchayat
const createPanchayat = async (req, res) => {
    try {
        const { name, panchayat_id, constituency_id, ward_list } = req.body;
        // Check if panchayat already exists
        const existingPanchayat = await panchayatModel_1.default.findOne({
            $or: [{ name }, { panchayat_id }],
        });
        if (existingPanchayat) {
            return res.status(400).json({
                success: false,
                message: "Panchayat with this name or ID already exists",
            });
        }
        // Verify constituency exists
        const constituency = await constituencyModel_1.default.findById(constituency_id);
        if (!constituency) {
            return res.status(400).json({
                success: false,
                message: "Constituency not found",
            });
        }
        // Validate ward_list has at least one ward
        if (!Array.isArray(ward_list) || ward_list.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one ward is required",
            });
        }
        // Validate ward data
        for (const ward of ward_list) {
            if (!ward.ward_id || !ward.ward_name) {
                return res.status(400).json({
                    success: false,
                    message: "Each ward must have ward_id and ward_name",
                });
            }
        }
        const panchayat = new panchayatModel_1.default({
            name,
            panchayat_id,
            constituency_id,
            ward_list,
        });
        await panchayat.save();
        // Populate constituency details
        await constituencyModel_1.default.findByIdAndUpdate(constituency_id, { $addToSet: { panchayats: panchayat._id } }, // $addToSet prevents duplicates
        { new: true });
        await panchayat.populate("constituency_id", "name constituency_id");
        res.status(201).json({
            success: true,
            message: "Panchayat created successfully",
            data: panchayat,
        });
    }
    catch (error) {
        console.error("Create panchayat error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.createPanchayat = createPanchayat;
// Create bulk panchayats
const createBulkPanchayats = async (req, res) => {
    try {
        const { panchayats } = req.body;
        if (!Array.isArray(panchayats) || panchayats.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Panchayats array is required and must not be empty",
            });
        }
        const results = [];
        const errors = [];
        for (const panchayatData of panchayats) {
            try {
                const { name, panchayat_id, constituency_id, ward_list } = panchayatData;
                // Check if panchayat already exists
                const existingPanchayat = await panchayatModel_1.default.findOne({
                    $or: [{ name }, { panchayat_id }],
                });
                if (existingPanchayat) {
                    errors.push({
                        panchayat_id,
                        error: "Panchayat with this name or ID already exists",
                    });
                    continue;
                }
                // Verify constituency exists
                const constituency = await constituencyModel_1.default.findById(constituency_id);
                if (!constituency) {
                    errors.push({
                        panchayat_id,
                        error: "Constituency not found",
                    });
                    continue;
                }
                // Validate ward_list has at least one ward
                if (!Array.isArray(ward_list) || ward_list.length === 0) {
                    errors.push({
                        panchayat_id,
                        error: "At least one ward is required",
                    });
                    continue;
                }
                // Validate ward data
                let wardValidationError = false;
                for (const ward of ward_list) {
                    if (!ward.ward_id || !ward.ward_name) {
                        errors.push({
                            panchayat_id,
                            error: "Each ward must have ward_id and ward_name",
                        });
                        wardValidationError = true;
                        break;
                    }
                }
                if (wardValidationError)
                    continue;
                const panchayat = new panchayatModel_1.default({
                    name,
                    panchayat_id,
                    constituency_id,
                    ward_list,
                });
                await panchayat.save();
                await panchayat.populate("constituency_id", "name constituency_id");
                results.push(panchayat);
            }
            catch (error) {
                errors.push({
                    panchayat_id: panchayatData.panchayat_id,
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }
        res.status(201).json({
            success: true,
            message: `Created ${results.length} panchayats successfully`,
            data: {
                created: results,
                errors: errors.length > 0 ? errors : undefined,
            },
        });
    }
    catch (error) {
        console.error("Bulk create panchayats error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.createBulkPanchayats = createBulkPanchayats;
// Get all panchayats
const getAllPanchayats = async (req, res) => {
    try {
        const panchayats = await panchayatModel_1.default.find()
            .populate("constituency_id", "name constituency_id")
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: "Panchayats retrieved successfully",
            data: panchayats,
        });
    }
    catch (error) {
        console.error("Get panchayats error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getAllPanchayats = getAllPanchayats;
// Get panchayat by ID
const getPanchayatById = async (req, res) => {
    try {
        const { id } = req.params;
        const panchayat = await panchayatModel_1.default.findById(id).populate("constituency_id", "name constituency_id");
        if (!panchayat) {
            return res.status(404).json({
                success: false,
                message: "Panchayat not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Panchayat retrieved successfully",
            data: panchayat,
        });
    }
    catch (error) {
        console.error("Get panchayat error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getPanchayatById = getPanchayatById;
// Get panchayats by constituency
const getPanchayatsByConstituency = async (req, res) => {
    try {
        const { constituency_id } = req.params;
        // Verify constituency exists
        const constituency = await constituencyModel_1.default.findById(constituency_id);
        if (!constituency) {
            return res.status(404).json({
                success: false,
                message: "Constituency not found",
            });
        }
        const panchayats = await panchayatModel_1.default.find({
            constituency_id: constituency._id,
        })
            .populate("constituency_id", "name constituency_id")
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: "Panchayats retrieved successfully",
            data: panchayats,
        });
    }
    catch (error) {
        console.error("Get panchayats by constituency error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getPanchayatsByConstituency = getPanchayatsByConstituency;
// Update panchayat
const updatePanchayat = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const panchayat = await panchayatModel_1.default.findById(id);
        if (!panchayat) {
            return res.status(404).json({
                success: false,
                message: "Panchayat not found",
            });
        }
        // If updating constituency, verify it exists
        if (updateData.constituency_id) {
            const constituency = await constituencyModel_1.default.findById(updateData.constituency_id);
            if (!constituency) {
                return res.status(400).json({
                    success: false,
                    message: "Constituency not found",
                });
            }
        }
        // If updating ward_list, validate it has at least one ward
        if (updateData.ward_list) {
            if (!Array.isArray(updateData.ward_list) ||
                updateData.ward_list.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "At least one ward is required",
                });
            }
            // Validate ward data
            for (const ward of updateData.ward_list) {
                if (!ward.ward_id || !ward.ward_name) {
                    return res.status(400).json({
                        success: false,
                        message: "Each ward must have ward_id and ward_name",
                    });
                }
            }
        }
        const updatedPanchayat = await panchayatModel_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate("constituency_id", "name constituency_id");
        res.status(200).json({
            success: true,
            message: "Panchayat updated successfully",
            data: updatedPanchayat,
        });
    }
    catch (error) {
        console.error("Update panchayat error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.updatePanchayat = updatePanchayat;
const addWardsToPanchayat = async (req, res) => {
    try {
        const { id } = req.params;
        const { ward_list } = req.body;
        const panchayat = await panchayatModel_1.default.findById(id);
        if (!panchayat) {
            return res.status(404).json({
                success: false,
                message: "Panchayat not found",
            });
        }
        // Validate ward_list has at least one ward
        if (!Array.isArray(ward_list) || ward_list.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one ward is required",
            });
        }
        // Validate ward data
        for (const ward of ward_list) {
            if (!ward.ward_id || !ward.ward_name) {
                return res.status(400).json({
                    success: false,
                    message: "Each ward must have ward_id and ward_name",
                });
            }
        }
        // Add wards to panchayat
        panchayat.ward_list.push(...ward_list);
        await panchayat.save();
        res.json({
            success: true,
            message: "Wards added successfully",
            data: panchayat,
        });
    }
    catch (error) {
        console.error("Add wards to panchayat error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.addWardsToPanchayat = addWardsToPanchayat;
// Delete panchayat
const deletePanchayat = async (req, res) => {
    try {
        const { id } = req.params;
        const panchayat = await panchayatModel_1.default.findById(id);
        if (!panchayat) {
            return res.status(404).json({
                success: false,
                message: "Panchayat not found",
            });
        }
        await panchayatModel_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Panchayat deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete panchayat error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deletePanchayat = deletePanchayat;
