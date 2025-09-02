"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const upvote_controller_1 = require("../controllers/upvote.controller");
const router = (0, express_1.Router)();
// Routes
// Add upvote to issue (requires authentication)
router.post("/:issue_id", auth_1.auth, upvote_controller_1.addUpvote);
// Remove upvote from issue (requires authentication)
router.delete("/:issue_id", auth_1.auth, upvote_controller_1.removeUpvote);
// Check if user has upvoted an issue (requires authentication)
router.get("/:issue_id/check", auth_1.auth, upvote_controller_1.checkUserUpvote);
exports.default = router;
