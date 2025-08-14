/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePanchayatRequest:
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
 *     UpdatePanchayatRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the panchayat
 *           minLength: 2
 *           maxLength: 100
 *         panchayat_id:
 *           type: string
 *           description: Unique panchayat identifier
 *           minLength: 1
 *           maxLength: 50
 *         constituency_id:
 *           type: string
 *           description: ID of the constituency this panchayat belongs to
 *         ward_list:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Ward'
 *           minItems: 1
 *           description: List of wards in the panchayat
 *
 *     AddWardsRequest:
 *       type: object
 *       required:
 *         - ward_list
 *       properties:
 *         ward_list:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Ward'
 *           minItems: 1
 *           description: List of wards to add to the panchayat
 *
 *     BulkPanchayatRequest:
 *       type: object
 *       required:
 *         - panchayats
 *       properties:
 *         panchayats:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CreatePanchayatRequest'
 *           minItems: 1
 *           description: Array of panchayats to create
 *
 *     PanchayatResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Panchayat created successfully"
 *         data:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *             name:
 *               type: string
 *               example: "Sample Panchayat"
 *             panchayat_id:
 *               type: string
 *               example: "PANCH001"
 *             constituency_id:
 *               type: string
 *               example: "507f1f77bcf86cd799439012"
 *             ward_list:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ward'
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *
 *     PanchayatListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Panchayats retrieved successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PanchayatResponse'
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
 *   name: Panchayats
 *   description: Panchayat management endpoints
 */

/**
 * @swagger
 * /api/panchayats:
 *   post:
 *     summary: Create a new panchayat
 *     tags: [Panchayats]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePanchayatRequest'
 *           example:
 *             name: "Sample Panchayat"
 *             panchayat_id: "PANCH001"
 *             constituency_id: "507f1f77bcf86cd799439011"
 *             ward_list:
 *               - ward_id: "W001"
 *                 ward_name: "Ward 1"
 *               - ward_id: "W002"
 *                 ward_name: "Ward 2"
 *     responses:
 *       201:
 *         description: Panchayat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PanchayatResponse'
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
 *     summary: Get all panchayats
 *     tags: [Panchayats]
 *     responses:
 *       200:
 *         description: Panchayats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PanchayatListResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/panchayats/bulk:
 *   post:
 *     summary: Create multiple panchayats
 *     tags: [Panchayats]
 *     security:
 *       - BearerAuth: []
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
 *               - name: "Panchayat 2"
 *                 panchayat_id: "PANCH002"
 *                 constituency_id: "507f1f77bcf86cd799439012"
 *                 ward_list:
 *                   - ward_id: "W002"
 *                     ward_name: "Ward 2"
 *     responses:
 *       201:
 *         description: Panchayats created successfully
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
 *                   example: "Panchayats created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PanchayatResponse'
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
 * /api/panchayats/{id}:
 *   get:
 *     summary: Get panchayat by ID
 *     tags: [Panchayats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Panchayat ID
 *     responses:
 *       200:
 *         description: Panchayat retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PanchayatResponse'
 *       404:
 *         description: Panchayat not found
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
 *     summary: Update panchayat
 *     tags: [Panchayats]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Panchayat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePanchayatRequest'
 *           example:
 *             name: "Updated Panchayat Name"
 *             ward_list:
 *               - ward_id: "W003"
 *                 ward_name: "Ward 3"
 *     responses:
 *       200:
 *         description: Panchayat updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PanchayatResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: Panchayat not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     summary: Delete panchayat
 *     tags: [Panchayats]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Panchayat ID
 *     responses:
 *       200:
 *         description: Panchayat deleted successfully
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
 *                   example: "Panchayat deleted successfully"
 *       401:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: Panchayat not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/panchayats/add-wards/{id}:
 *   put:
 *     summary: Add wards to panchayat
 *     tags: [Panchayats]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Panchayat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddWardsRequest'
 *           example:
 *             ward_list:
 *               - ward_id: "W003"
 *                 ward_name: "Ward 3"
 *               - ward_id: "W004"
 *                 ward_name: "Ward 4"
 *     responses:
 *       200:
 *         description: Wards added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PanchayatResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: Panchayat not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/panchayats/constituency/{constituency_id}:
 *   get:
 *     summary: Get panchayats by constituency
 *     tags: [Panchayats]
 *     parameters:
 *       - in: path
 *         name: constituency_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Constituency ID
 *     responses:
 *       200:
 *         description: Panchayats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PanchayatListResponse'
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
 */
