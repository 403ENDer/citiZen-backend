import { Router } from "express";
import { auth } from "../middleware/auth";
import { mlaAuth } from "../middleware/mlaAuth";
import {
  getMLADashboard,
  getMLARealTimeStats,
} from "../controllers/mlaDashboard.controller";

const router = Router();

// Get MLA dashboard data for a specific constituency
router.get("/:constituencyId", auth, mlaAuth, getMLADashboard);

// Get real-time statistics for MLA dashboard
router.get("/:constituencyId/stats", auth, mlaAuth, getMLARealTimeStats);

export default router;
