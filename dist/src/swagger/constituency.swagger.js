"use strict";
/**
 * @swagger
 * components:
 *   schemas:
 *     Ward:
 *       type: object
 *       required:
 *         - ward_id
 *         - ward_name
 *       properties:
 *         ward_id:
 *           type: string
 *           description: Unique ward identifier
 *           minLength: 1
 *           maxLength: 50
 *           example: "W001"
 *         ward_name:
 *           type: string
 *           description: Name of the ward
 *           minLength: 2
 *           maxLength: 100
 *           example: "Ward 1"
 *
 *     Panchayat:
 *       type: object
 *       required:
 *         - name
 *         - panchayat_id
 *         - constituency_id
 *         - ward_list
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the panchayat
 *           minLength: 2
 *           maxLength: 100
 *           example: "Sample Panchayat"
 *         panchayat_id:
 *           type: string
 *           description: Unique panchayat identifier
 *           minLength: 1
 *           maxLength: 50
 *           example: "PANCH001"
 *         constituency_id:
 *           type: string
 *           description: ID of the constituency this panchayat belongs to
 *           example: "507f1f77bcf86cd799439011"
 *         ward_list:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Ward'
 *           minItems: 1
 *           description: List of wards in the panchayat
 *
 *     Constituency:
 *       type: object
 *       required:
 *         - name
 *         - constituency_id
 *         - mla_id
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the constituency
 *           minLength: 2
 *           maxLength: 100
 *           example: "Sample Constituency"
 *         constituency_id:
 *           type: string
 *           description: Unique constituency identifier
 *           minLength: 1
 *           maxLength: 50
 *           example: "CONST001"
 *         mla_id:
 *           type: string
 *           description: ID of the MLA assigned to this constituency
 *           example: "507f1f77bcf86cd799439012"
 *
 *     ConstituencyWithPanchayats:
 *       type: object
 *       required:
 *         - name
 *         - constituency_id
 *         - mla_id
 *         - panchayats
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the constituency
 *           minLength: 2
 *           maxLength: 100
 *           example: "Sample Constituency"
 *         constituency_id:
 *           type: string
 *           description: Unique constituency identifier
 *           minLength: 1
 *           maxLength: 50
 *           example: "CONST001"
 *         mla_id:
 *           type: string
 *           description: ID of the MLA assigned to this constituency
 *           example: "507f1f77bcf86cd799439012"
 *         panchayats:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Panchayat'
 *           minItems: 1
 *           description: Array of panchayats to create with the constituency
 *
 *     BulkConstituencyRequest:
 *       type: object
 *       required:
 *         - constituencies
 *       properties:
 *         constituencies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Constituency'
 *           minItems: 1
 *           description: Array of constituencies to create
 *
 *     BulkConstituencyWithPanchayatsRequest:
 *       type: object
 *       required:
 *         - constituencies
 *       properties:
 *         constituencies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ConstituencyWithPanchayats'
 *           minItems: 1
 *           description: Array of constituencies with panchayats to create
 *
 *     BulkPanchayatRequest:
 *       type: object
 *       required:
 *         - panchayats
 *       properties:
 *         panchayats:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Panchayat'
 *           minItems: 1
 *           description: Array of panchayats to add to a constituency
 *
 *     UpdateConstituencyRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the constituency
 *           minLength: 2
 *           maxLength: 100
 *         constituency_id:
 *           type: string
 *           description: Unique constituency identifier
 *           minLength: 1
 *           maxLength: 50
 *         mla_id:
 *           type: string
 *           description: ID of the MLA assigned to this constituency
 *         panchayats:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *           description: Array of panchayat IDs
 *
 *     ConstituencyResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Constituency created successfully"
 *         data:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *             name:
 *               type: string
 *               example: "Sample Constituency"
 *             constituency_id:
 *               type: string
 *               example: "CONST001"
 *             mla_id:
 *               type: string
 *               example: "507f1f77bcf86cd799439012"
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *
 *     ConstituencyListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Constituencies retrieved successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ConstituencyResponse'
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
 *           example: "Validation error"
 *         error:
 *           type: string
 *           description: Detailed error message
 *           example: "\"name\" is required"
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
 *   name: Constituencies
 *   description: Constituency management endpoints
 */
/**
 * @swagger
 * /api/constituencies:
 *   post:
 *     summary: Create a new constituency
 *     tags: [Constituencies]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Constituency'
 *           example:
 *             name: "Sample Constituency"
 *             constituency_id: "CONST001"
 *             mla_id: "507f1f77bcf86cd799439012"
 *     responses:
 *       201:
 *         description: Constituency created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConstituencyResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   get:
 *     summary: Get all constituencies
 *     tags: [Constituencies]
 *     responses:
 *       200:
 *         description: Constituencies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConstituencyListResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/constituencies/bulk:
 *   post:
 *     summary: Create multiple constituencies
 *     tags: [Constituencies]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkConstituencyRequest'
 *           example:
 *             constituencies:
 *               - name: "Constituency 1"
 *                 constituency_id: "CONST001"
 *                 mla_id: "507f1f77bcf86cd799439012"
 *               - name: "Constituency 2"
 *                 constituency_id: "CONST002"
 *                 mla_id: "507f1f77bcf86cd799439013"
 *     responses:
 *       201:
 *         description: Constituencies created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Constituencies created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ConstituencyResponse'
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           error:
 *                             type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/constituencies/{id}:
 *   get:
 *     summary: Get constituency by ID
 *     tags: [Constituencies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Constituency ID
 *     responses:
 *       200:
 *         description: Constituency retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConstituencyResponse'
 *       404:
 *         description: Constituency not found
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
 *   put:
 *     summary: Update constituency
 *     tags: [Constituencies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Constituency ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateConstituencyRequest'
 *           example:
 *             name: "Updated Constituency Name"
 *             mla_id: "507f1f77bcf86cd799439014"
 *     responses:
 *       200:
 *         description: Constituency updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConstituencyResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: Constituency not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     summary: Delete constituency
 *     tags: [Constituencies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Constituency ID
 *     responses:
 *       200:
 *         description: Constituency deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Constituency deleted successfully"
 *       401:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: Constituency not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/constituencies/{constituency_id}/panchayats:
 *   post:
 *     summary: Add panchayats to constituency
 *     tags: [Constituencies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: constituency_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Constituency ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkPanchayatRequest'
 *           example:
 *             panchayats:
 *               - name: "Panchayat 1"
 *                 panchayat_id: "PANCH001"
 *                 constituency_id: "507f1f77bcf86cd799439011"
 *                 ward_list:
 *                   - ward_id: "W001"
 *                     ward_name: "Ward 1"
 *                   - ward_id: "W002"
 *                     ward_name: "Ward 2"
 *     responses:
 *       201:
 *         description: Panchayats added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Panchayats added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Panchayat'
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           error:
 *                             type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: Constituency not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
