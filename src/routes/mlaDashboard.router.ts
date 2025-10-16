import { Router } from "express";
import { auth } from "../middleware/auth";
import { mlaAuth } from "../middleware/mlaAuth";
import {
  getMLADashboard,
  getMLARealTimeStats,
  createMeeting,
  listMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
} from "../controllers/mlaDashboard.controller";

const router = Router();

// Get MLA dashboard data for a specific constituency
router.get("/:constituencyId", auth, mlaAuth, getMLADashboard);

// Get real-time statistics for MLA dashboard
router.get("/:constituencyId/stats", auth, mlaAuth, getMLARealTimeStats);

// Meetings CRUD
router.post("/:constituencyId/meetings", auth, mlaAuth, createMeeting);
router.get("/:constituencyId/meetings", auth, mlaAuth, listMeetings);
router.get("/:constituencyId/meetings/:id", auth, mlaAuth, getMeetingById);
router.put("/:constituencyId/meetings/:id", auth, mlaAuth, updateMeeting);
router.delete("/:constituencyId/meetings/:id", auth, mlaAuth, deleteMeeting);

export default router;
