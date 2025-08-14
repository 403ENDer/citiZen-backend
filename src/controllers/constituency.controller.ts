import { Request, Response } from "express";
import Constituency from "../models/constituencyModel";
import Panchayat from "../models/panchayatModel";
import { userModel } from "../models/userModel";
import { RoleTypes } from "../utils/types";
import UserDetails from "../models/userDetailsModel";
import mongoose from "mongoose";
import { validateObjectIdParam } from "../utils/validation";
import {
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  createInternalErrorResponse,
} from "../utils/response";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Create single constituency (without panchayats)
export const createConstituency = async (req: AuthRequest, res: Response) => {
  try {
    const { name, constituency_id, mla_id } = req.body;

    // Check if constituency already exists
    const existingConstituency = await Constituency.findOne({
      $or: [{ name }, { constituency_id }],
    });

    if (existingConstituency) {
      return res.status(400).json({
        success: false,
        message: "Constituency with this name or ID already exists",
      });
    }

    // Verify MLA exists and has correct role
    const mla = await userModel.findById(mla_id);
    if (!mla || mla.role !== RoleTypes.MLASTAFF) {
      return res.status(400).json({
        success: false,
        message: "Invalid MLA ID or MLA does not have correct role",
      });
    }

    const constituency = new Constituency({
      name,
      constituency_id,
      mla_id,
      panchayats: [],
    });

    await constituency.save();

    // Populate mla details
    await constituency.populate("mla_id", "name email");

    res.status(201).json({
      success: true,
      message: "Constituency created successfully",
      data: constituency,
    });
  } catch (error) {
    console.error("Create constituency error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create constituency with panchayats (single)
export const createConstituencyWithPanchayats = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name, constituency_id, mla_id, panchayats } = req.body;
    // Check if constituency already exists
    const existingConstituency = await Constituency.findOne({
      $or: [{ name }, { constituency_id }],
    });

    if (existingConstituency) {
      return res.status(400).json({
        success: false,
        message: "Constituency with this name or ID already exists",
      });
    }

    // Verify MLA exists and has correct role
    const mla = await userModel.findById(mla_id);
    if (!mla || mla.role !== RoleTypes.MLASTAFF) {
      return res.status(400).json({
        success: false,
        message: "Invalid MLA ID or MLA does not have correct role",
      });
    }

    // Create constituency first
    const constituency = new Constituency({
      name,
      constituency_id,
      mla_id,
      panchayats: [],
    });

    await constituency.save();

    // Create panchayats
    const createdPanchayats = [];
    const errors = [];

    for (const panchayatData of panchayats) {
      try {
        const { name: panchayatName, panchayat_id, ward_list } = panchayatData;

        // Check if panchayat already exists
        const existingPanchayat = await Panchayat.findOne({
          $or: [{ name: panchayatName }, { panchayat_id }],
        });

        if (existingPanchayat) {
          errors.push({
            panchayat_id,
            error: "Panchayat with this name or ID already exists",
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

        if (wardValidationError) continue;

        const panchayat = new Panchayat({
          name: panchayatName,
          panchayat_id,
          constituency_id: constituency._id,
          ward_list,
        });

        await panchayat.save();
        createdPanchayats.push(panchayat);
      } catch (error) {
        errors.push({
          panchayat_id: panchayatData.panchayat_id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Update constituency with created panchayat IDs
    const panchayatIds = createdPanchayats.map((p) => p._id);
    constituency.panchayats = panchayatIds;
    await constituency.save();

    // Populate all details
    await constituency.populate([
      { path: "panchayats", select: "name panchayat_id ward_list" },
      { path: "mla_id", select: "name email" },
    ]);

    res.status(201).json({
      success: true,
      message: `Constituency created successfully with ${createdPanchayats.length} panchayats`,
      data: {
        constituency,
        createdPanchayats,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error("Create constituency with panchayats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create bulk constituencies (without panchayats)
export const createBulkConstituencies = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { constituencies } = req.body;

    if (!Array.isArray(constituencies) || constituencies.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Constituencies array is required and must not be empty",
      });
    }

    const results = [];
    const errors = [];

    for (const constituencyData of constituencies) {
      try {
        const { name, constituency_id, mla_id } = constituencyData;

        // Check if constituency already exists
        const existingConstituency = await Constituency.findOne({
          $or: [{ name }, { constituency_id }],
        });

        if (existingConstituency) {
          errors.push({
            constituency_id,
            error: "Constituency with this name or ID already exists",
          });
          continue;
        }

        // Verify MLA exists and has correct role
        const mla = await userModel.findById(mla_id);
        if (!mla || mla.role !== RoleTypes.MLASTAFF) {
          errors.push({
            constituency_id,
            error: "Invalid MLA ID or MLA does not have correct role",
          });
          continue;
        }

        const constituency = new Constituency({
          name,
          constituency_id,
          mla_id,
          panchayats: [],
        });

        await constituency.save();
        await constituency.populate("mla_id", "name email");

        results.push(constituency);
      } catch (error) {
        errors.push({
          constituency_id: constituencyData.constituency_id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${results.length} constituencies successfully`,
      data: {
        created: results,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error("Bulk create constituencies error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create bulk constituencies with panchayats
export const createBulkConstituenciesWithPanchayats = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { constituencies } = req.body;

    if (!Array.isArray(constituencies) || constituencies.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Constituencies array is required and must not be empty",
      });
    }

    const results = [];
    const errors = [];

    for (const constituencyData of constituencies) {
      try {
        const { name, constituency_id, mla_id, panchayats } = constituencyData;

        // Check if constituency already exists
        const existingConstituency = await Constituency.findOne({
          $or: [{ name }, { constituency_id }],
        });

        if (existingConstituency) {
          errors.push({
            constituency_id,
            error: "Constituency with this name or ID already exists",
          });
          continue;
        }

        // Verify MLA exists and has correct role
        const mla = await userModel.findById(mla_id);
        if (!mla || mla.role !== RoleTypes.MLASTAFF) {
          errors.push({
            constituency_id,
            error: "Invalid MLA ID or MLA does not have correct role",
          });
          continue;
        }

        // Create constituency first
        const constituency = new Constituency({
          name,
          constituency_id,
          mla_id,
          panchayats: [],
        });

        await constituency.save();

        // Create panchayats
        const createdPanchayats = [];
        const panchayatErrors = [];

        for (const panchayatData of panchayats) {
          try {
            const {
              name: panchayatName,
              panchayat_id,
              ward_list,
            } = panchayatData;

            // Check if panchayat already exists
            const existingPanchayat = await Panchayat.findOne({
              $or: [{ name: panchayatName }, { panchayat_id }],
            });

            if (existingPanchayat) {
              panchayatErrors.push({
                panchayat_id,
                error: "Panchayat with this name or ID already exists",
              });
              continue;
            }

            // Validate ward_list has at least one ward
            if (!Array.isArray(ward_list) || ward_list.length === 0) {
              panchayatErrors.push({
                panchayat_id,
                error: "At least one ward is required",
              });
              continue;
            }

            // Validate ward data
            let wardValidationError = false;
            for (const ward of ward_list) {
              if (!ward.ward_id || !ward.ward_name) {
                panchayatErrors.push({
                  panchayat_id,
                  error: "Each ward must have ward_id and ward_name",
                });
                wardValidationError = true;
                break;
              }
            }

            if (wardValidationError) continue;

            const panchayat = new Panchayat({
              name: panchayatName,
              panchayat_id,
              constituency_id: constituency._id,
              ward_list,
            });

            await panchayat.save();
            createdPanchayats.push(panchayat);
          } catch (error) {
            panchayatErrors.push({
              panchayat_id: panchayatData.panchayat_id,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        // Update constituency with created panchayat IDs
        const panchayatIds = createdPanchayats.map((p) => p._id);
        constituency.panchayats = panchayatIds;
        await constituency.save();

        // Populate all details
        await constituency.populate([
          { path: "panchayats", select: "name panchayat_id ward_list" },
          { path: "mla_id", select: "name email" },
        ]);

        results.push({
          constituency,
          createdPanchayats,
          panchayatErrors:
            panchayatErrors.length > 0 ? panchayatErrors : undefined,
        });
      } catch (error) {
        errors.push({
          constituency_id: constituencyData.constituency_id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${results.length} constituencies with panchayats successfully`,
      data: {
        created: results,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error("Bulk create constituencies with panchayats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Add panchayats to existing constituency
export const addPanchayatsToConstituency = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { constituency_id } = req.params;
    const { panchayats } = req.body;

    // Verify constituency exists
    const constituency = await Constituency.findById(constituency_id);
    if (!constituency) {
      return res.status(404).json({
        success: false,
        message: "Constituency not found",
      });
    }

    if (!Array.isArray(panchayats) || panchayats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Panchayats array is required and must not be empty",
      });
    }

    const createdPanchayats = [];
    const errors = [];

    for (const panchayatData of panchayats) {
      try {
        const { name, panchayat_id, ward_list } = panchayatData;

        // Check if panchayat already exists
        const existingPanchayat = await Panchayat.findOne({
          $or: [{ name }, { panchayat_id }],
        });

        if (existingPanchayat) {
          errors.push({
            panchayat_id,
            error: "Panchayat with this name or ID already exists",
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

        if (wardValidationError) continue;

        const panchayat = new Panchayat({
          name,
          panchayat_id,
          constituency_id: constituency._id,
          ward_list,
        });

        await panchayat.save();
        createdPanchayats.push(panchayat);
      } catch (error) {
        errors.push({
          panchayat_id: panchayatData.panchayat_id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Update constituency with new panchayat IDs
    const existingPanchayatIds = constituency.panchayats;
    const newPanchayatIds = createdPanchayats.map((p) => p._id);
    constituency.panchayats = [...existingPanchayatIds, ...newPanchayatIds];
    await constituency.save();

    // Populate all details
    await constituency.populate([
      { path: "panchayats", select: "name panchayat_id ward_list" },
      { path: "mla_id", select: "name email" },
    ]);

    res.status(200).json({
      success: true,
      message: `Added ${createdPanchayats.length} panchayats to constituency successfully`,
      data: {
        constituency,
        createdPanchayats,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error("Add panchayats to constituency error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all constituencies
export const getAllConstituencies = async (req: AuthRequest, res: Response) => {
  try {
    const constituencies = await Constituency.find()
      .populate("panchayats", "name panchayat_id ward_list")
      .populate("mla_id", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Constituencies retrieved successfully",
      data: constituencies,
    });
  } catch (error) {
    console.error("Get constituencies error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get constituency by ID
export const getConstituencyById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const constituency = await Constituency.findById(id)
      .populate("panchayats", "name panchayat_id ward_list")
      .populate("mla_id", "name email");

    if (!constituency) {
      return res.status(404).json({
        success: false,
        message: "Constituency not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Constituency retrieved successfully",
      data: constituency,
    });
  } catch (error) {
    console.error("Get constituency error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getconstituencyInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    const validationError = validateObjectIdParam(id, "constituency ID");
    if (validationError) {
      return createValidationErrorResponse(res, validationError);
    }

    const constituency = await Constituency.findById(id);
    if (!constituency) {
      return createNotFoundErrorResponse(res, "Constituency not found");
    }

    // Get all panchayats in this constituency
    const panchayats = await Panchayat.find({ constituency_id: id });

    // Calculate total wards across all panchayats
    const total_wards = panchayats.reduce((total, panchayat) => {
      return total + (panchayat.ward_list?.length || 0);
    }, 0);

    // Count total voters (users with role CITIZEN in this constituency)
    const total_voters = await UserDetails.countDocuments({
      constituency: id,
    });

    // Count active voters (verified users with role CITIZEN in this constituency)
    const active_voters = await UserDetails.aggregate([
      { $match: { constituency: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.is_verified": true, "user.role": "citizen" } },
      { $count: "count" },
    ]);

    const active_voters_count =
      active_voters.length > 0 ? active_voters[0].count : 0;

    // Prepare response data
    const constituencyInfo = {
      name: constituency.name,
      total_voters: total_voters,
      active_voters: active_voters_count,
      total_panchayats: panchayats.length,
      total_wards: total_wards,
    };

    res.status(200).json({
      success: true,
      message: "Constituency info retrieved successfully",
      data: constituencyInfo,
    });
  } catch (error) {
    console.error("Constituency info error:", error);
    createInternalErrorResponse(res);
  }
};

// Update constituency
export const updateConstituency = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const constituency = await Constituency.findById(id);
    if (!constituency) {
      return res.status(404).json({
        success: false,
        message: "Constituency not found",
      });
    }

    // If updating MLA, verify the new MLA exists and has correct role
    if (updateData.mla_id) {
      const mla = await userModel.findById(updateData.mla_id);
      if (!mla || mla.role !== RoleTypes.MLASTAFF) {
        return res.status(400).json({
          success: false,
          message: "Invalid MLA ID or MLA does not have correct role",
        });
      }
    }

    // If updating panchayats, verify they exist
    if (updateData.panchayats) {
      const panchayatIds = Array.isArray(updateData.panchayats)
        ? updateData.panchayats
        : [updateData.panchayats];
      const existingPanchayats = await Panchayat.find({
        _id: { $in: panchayatIds },
      });

      if (existingPanchayats.length !== panchayatIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more panchayats not found",
        });
      }
    }

    const updatedConstituency = await Constituency.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: "panchayats", select: "name panchayat_id ward_list" },
      { path: "mla_id", select: "name email" },
    ]);

    res.status(200).json({
      success: true,
      message: "Constituency updated successfully",
      data: updatedConstituency,
    });
  } catch (error) {
    console.error("Update constituency error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete constituency
export const deleteConstituency = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const constituency = await Constituency.findById(id);
    if (!constituency) {
      return res.status(404).json({
        success: false,
        message: "Constituency not found",
      });
    }

    // Check if any panchayats are associated with this constituency
    const associatedPanchayats = await Panchayat.find({
      constituency_id: id,
    });
    if (associatedPanchayats.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete constituency. Associated panchayats exist. Please delete panchayats first.",
      });
    }

    await Constituency.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Constituency deleted successfully",
    });
  } catch (error) {
    console.error("Delete constituency error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
