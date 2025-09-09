"use strict";
/**
 * @swagger
 * components:
 *   schemas:
 *     UpvoteResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Upvote added successfully"
 *         data:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *             title:
 *               type: string
 *               example: "Broken Street Light"
 *             detail:
 *               type: string
 *               example: "Street light not working"
 *             upvotes:
 *               type: number
 *               example: 5
 *             status:
 *               type: string
 *               enum: [pending, in_progress, resolved, rejected]
 *               example: "pending"
 *             priority_level:
 *               type: string
 *               enum: [high, normal, low]
 *               example: "normal"
 *
 *     UpvoteStatusResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Upvote status retrieved successfully"
 *         data:
 *           type: object
 *           properties:
 *             issue_id:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *             user_id:
 *               type: string
 *               example: "507f1f77bcf86cd799439012"
 *             has_upvoted:
 *               type: boolean
 *               example: true
 *             upvotes_count:
 *               type: number
 *               example: 5
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Cannot upvote own issue"
 *         error:
 *           type: string
 *           description: Detailed error message
 *           example: "You cannot upvote your own issue"
 *
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
/**
 * @swagger
 * tags:
 *   name: Upvotes
 *   description: Upvote management endpoints
 */
/**
 * @swagger
 * /api/upvotes/{issue_id}:
 *   post:
 *     summary: Add upvote to an issue
 *     tags: [Upvotes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: issue_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     responses:
 *       200:
 *         description: Upvote added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpvoteResponse'
 *       400:
 *         description: Cannot upvote own issue or already upvoted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Issue not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     summary: Remove upvote from an issue
 *     tags: [Upvotes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: issue_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     responses:
 *       200:
 *         description: Upvote removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpvoteResponse'
 *       400:
 *         description: Not upvoted this issue
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Issue not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/upvotes/{issue_id}/check:
 *   get:
 *     summary: Check if user has upvoted an issue
 *     tags: [Upvotes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: issue_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     responses:
 *       200:
 *         description: Upvote status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpvoteStatusResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Issue not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
