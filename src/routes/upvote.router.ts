import { Router } from "express";
import { auth } from "../middleware/auth";
import {
  addUpvote,
  removeUpvote,
  checkUserUpvote,
} from "../controllers/upvote.controller";

const router = Router();

// Routes
// Add upvote to issue (requires authentication)
router.post("/:issue_id", auth, addUpvote);

// Remove upvote from issue (requires authentication)
router.delete("/:issue_id", auth, removeUpvote);

// Check if user has upvoted an issue (requires authentication)
router.get("/:issue_id/check", auth, checkUserUpvote);

export default router;
