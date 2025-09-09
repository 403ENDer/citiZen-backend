"use strict";
/**
 * @swagger
 * components:
 *   schemas:
 *     AISuggestion:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the suggestion
 *           example: "Optimize Response Time"
 *         status:
 *           type: string
 *           enum: [High, Medium, Low]
 *           description: Priority status of the suggestion
 *           example: "High"
 *         impact:
 *           type: string
 *           enum: [High, Medium, Low]
 *           description: Expected impact if implemented
 *           example: "High"
 *         description:
 *           type: string
 *           description: Detailed description of the suggestion
 *           example: "Department response time has increased by 15% this month. Consider implementing automated workflows."
 *         implementation_time:
 *           type: string
 *           description: Estimated time for implementation
 *           example: "2-3 weeks"
 *         cost:
 *           type: string
 *           description: Estimated cost in INR
 *           example: "₹50,000"
 *         type:
 *           type: string
 *           description: Type of suggestion
 *           example: "Performance"
 *         department_id:
 *           type: string
 *           description: ID of the department
 *           example: "64f8a1b2c3d4e5f678901234"
 *         location:
 *           type: string
 *           description: Location where the suggestion applies
 *           example: "Main Road"
 *         metrics:
 *           type: object
 *           properties:
 *             total_issues:
 *               type: number
 *               description: Total number of issues in this category
 *               example: 12
 *             avg_upvotes:
 *               type: number
 *               description: Average upvotes for issues in this category
 *               example: 8
 *             resolution_rate:
 *               type: number
 *               description: Resolution rate percentage
 *               example: 65
 *
 *     AISuggestionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             suggestions:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AISuggestion'
 *             month:
 *               type: string
 *               description: Month in YYYY-MM format
 *               example: "2024-01"
 *             generated_at:
 *               type: string
 *               format: date-time
 *             updated_at:
 *               type: string
 *               format: date-time
 *
 *     HistoricalSuggestionsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             suggestions:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   month:
 *                     type: string
 *                   suggestions:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/AISuggestion'
 *                   generated_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *
 *     GenerateSuggestionRequest:
 *       type: object
 *       properties:
 *         month:
 *           type: string
 *           description: Month in YYYY-MM format (optional, defaults to current month)
 *           example: "2024-01"
 */
/**
 * @swagger
 * tags:
 *   name: AI Suggestions
 *   description: AI-powered suggestions for MLAs based on constituency issues
 */
/**
 * @swagger
 * /api/ai-suggestions/{mlaId}:
 *   get:
 *     summary: Get current month AI suggestions for an MLA
 *     tags: [AI Suggestions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mlaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the MLA
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *         description: Month in YYYY-MM format (optional, defaults to current month)
 *     responses:
 *       200:
 *         description: Suggestions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AISuggestionResponse'
 *       400:
 *         description: Bad request - MLA ID is required
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: No suggestions found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /api/ai-suggestions/{mlaId}/history:
 *   get:
 *     summary: Get historical AI suggestions for an MLA
 *     tags: [AI Suggestions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mlaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the MLA
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Number of historical months to retrieve
 *     responses:
 *       200:
 *         description: Historical suggestions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoricalSuggestionsResponse'
 *       400:
 *         description: Bad request - MLA ID is required
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /api/ai-suggestions/{mlaId}/generate:
 *   post:
 *     summary: Manually generate AI suggestions for an MLA
 *     tags: [AI Suggestions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mlaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the MLA
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateSuggestionRequest'
 *     responses:
 *       200:
 *         description: Suggestions generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AISuggestionResponse'
 *       400:
 *         description: Bad request - MLA ID is required
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /api/ai-suggestions/all/{month}:
 *   get:
 *     summary: Get all AI suggestions for a specific month (Admin only)
 *     tags: [AI Suggestions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *         description: Month in YYYY-MM format
 *     responses:
 *       200:
 *         description: All suggestions for the month retrieved successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
