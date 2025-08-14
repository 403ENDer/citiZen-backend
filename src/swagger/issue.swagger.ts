/**
 * @swagger
 * components:
 *   schemas:
 *     CreateIssueRequest:
 *       type: object
 *       required:
 *         - title
 *         - detail
 *         - locality
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the issue
 *           minLength: 5
 *           maxLength: 200
 *           example: "Broken Street Light on Main Road"
 *         detail:
 *           type: string
 *           description: Detailed description of the issue
 *           minLength: 10
 *           maxLength: 2000
 *           example: "There is a broken street light on Main Road near the bus stop. It has been non-functional for the past 3 days, making the area unsafe for pedestrians at night."
 *         locality:
 *           type: string
 *           description: Location/area where the issue exists
 *           minLength: 3
 *           maxLength: 200
 *           example: "Main Road, Ward 5"
 *         department_id:
 *           type: string
 *           description: ID of the department to handle the issue (optional - will be auto-found if not provided)
 *           example: "64f8a1b2c3d4e5f678901234"
 *         attachments:
 *           type: string
 *           description: File names or URLs of attached documents/images
 *           example: "photo1.jpg,photo2.jpg"
 *         is_anonymous:
 *           type: boolean
 *           description: Whether to post anonymously
 *           default: false
 *           example: false
 *
 *     UpdateIssueRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *         detail:
 *           type: string
 *           minLength: 10
 *           maxLength: 2000
 *         locality:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *         department_id:
 *           type: string
 *         attachments:
 *           type: string
 *         is_anonymous:
 *           type: boolean
 *
 *     UpdateIssueStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, in_progress, resolved, rejected]
 *           description: New status for the issue
 *
 *     UpdateHandledByRequest:
 *       type: object
 *       required:
 *         - handled_by
 *       properties:
 *         handled_by:
 *           type: string
 *           description: ID of the department employee assigned to handle the issue
 *
 *     AddFeedbackRequest:
 *       type: object
 *       required:
 *         - feedback
 *         - satisfaction_score
 *       properties:
 *         feedback:
 *           type: string
 *           description: User feedback about the resolution
 *           minLength: 1
 *           maxLength: 1000
 *         satisfaction_score:
 *           type: string
 *           enum: [good, average, poor]
 *           description: User satisfaction rating
 *
 *     BulkCreateIssueRequest:
 *       type: object
 *       required:
 *         - issues
 *       properties:
 *         issues:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CreateIssueRequest'
 *           minItems: 1
 *           description: Array of issues to create
 *
 *     IssueResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             title:
 *               type: string
 *             detail:
 *               type: string
 *             locality:
 *               type: string
 *             user_id:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone_number:
 *                   type: string
 *                 role:
 *                   type: string
 *             constituency_id:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 constituency_id:
 *                   type: string
 *             panchayat_id:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 panchayat_id:
 *                   type: string
 *             ward_no:
 *               type: string
 *             department_id:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *             handled_by:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *             status:
 *               type: string
 *               enum: [pending, in_progress, resolved, rejected]
 *             priority_level:
 *               type: string
 *               enum: [high, normal, low]
 *             upvotes:
 *               type: number
 *             is_anonymous:
 *               type: boolean
 *             attachments:
 *               type: string
 *             feedback:
 *               type: string
 *             satisfaction_score:
 *               type: string
 *               enum: [good, average, poor]
 *             created_at:
 *               type: string
 *               format: date-time
 *             completed_at:
 *               type: string
 *               format: date-time
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *
 *     IssueListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             issues:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/IssueResponse'
 *             pagination:
 *               type: object
 *               properties:
 *                 page:
 *                   type: number
 *                 limit:
 *                   type: number
 *                 total:
 *                   type: number
 *                 pages:
 *                   type: number
 *
 *     IssueStatistics:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *             byStatus:
 *               type: object
 *               properties:
 *                 pending:
 *                   type: number
 *                 in_progress:
 *                   type: number
 *                 resolved:
 *                   type: number
 *                 rejected:
 *                   type: number
 *             byPriority:
 *               type: object
 *               properties:
 *                 high:
 *                   type: number
 *                 normal:
 *                   type: number
 *                 low:
 *                   type: number
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
 *   name: Issues
 *   description: Issue management endpoints
 */

/**
 * @swagger
 * /api/issues:
 *   post:
 *     summary: Create a new issue
 *     tags: [Issues]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateIssueRequest'
 *           example:
 *             title: "Broken Street Light on Main Road"
 *             detail: "There is a broken street light on Main Road near the bus stop. It has been non-functional for the past 3 days, making the area unsafe for pedestrians at night."
 *             locality: "Main Road, Ward 5"
 *             is_anonymous: false
 *     responses:
 *       201:
 *         description: Issue created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation error"
 *                 error:
 *                   type: string
 *                   example: "\"title\" length must be at least 5 characters long"
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     summary: Get all issues with filtering and pagination
 *     tags: [Issues]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, resolved, rejected]
 *         description: Filter by status
 *       - in: query
 *         name: priority_level
 *         schema:
 *           type: string
 *           enum: [high, normal, low]
 *         description: Filter by priority level
 *       - in: query
 *         name: constituency_id
 *         schema:
 *           type: string
 *         description: Filter by constituency ID
 *       - in: query
 *         name: panchayat_id
 *         schema:
 *           type: string
 *         description: Filter by panchayat ID
 *       - in: query
 *         name: ward_no
 *         schema:
 *           type: string
 *         description: Filter by ward number
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, priority_level, upvotes, title]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Issues retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueListResponse'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/issues/bulk:
 *   post:
 *     summary: Create multiple issues
 *     tags: [Issues]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkCreateIssueRequest'
 *           example:
 *             issues:
 *               - title: "Broken Street Light"
 *                 detail: "Street light not working"
 *                 locality: "Main Road"
 *                 is_anonymous: false
 *               - title: "Garbage Collection Issue"
 *                 detail: "Garbage not being collected regularly"
 *                 locality: "Park Street"
 *                 is_anonymous: true
 *     responses:
 *       201:
 *         description: Issues created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/IssueResponse'
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           error:
 *                             type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/issues/{id}:
 *   get:
 *     summary: Get issue by ID
 *     tags: [Issues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     responses:
 *       200:
 *         description: Issue retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueResponse'
 *       404:
 *         description: Issue not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update issue
 *     tags: [Issues]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateIssueRequest'
 *     responses:
 *       200:
 *         description: Issue updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not authorized to update this issue
 *       404:
 *         description: Issue not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete issue
 *     tags: [Issues]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     responses:
 *       200:
 *         description: Issue deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not authorized to delete this issue
 *       404:
 *         description: Issue not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/issues/{id}/status:
 *   patch:
 *     summary: Update issue status
 *     tags: [Issues]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateIssueStatusRequest'
 *           example:
 *             status: "in_progress"
 *     responses:
 *       200:
 *         description: Issue status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not authorized to update this issue
 *       404:
 *         description: Issue not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/issues/{id}/assign:
 *   patch:
 *     summary: Assign issue to department employee (Department Head only)
 *     tags: [Issues]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateHandledByRequest'
 *           example:
 *             handled_by: "64f8a1b2c3d4e5f678901234"
 *     responses:
 *       200:
 *         description: Issue assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Department Head access required
 *       404:
 *         description: Issue not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/issues/{id}/feedback:
 *   post:
 *     summary: Add feedback to resolved issue
 *     tags: [Issues]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddFeedbackRequest'
 *           example:
 *             feedback: "The issue was resolved quickly and efficiently. Thank you!"
 *             satisfaction_score: "good"
 *     responses:
 *       200:
 *         description: Feedback added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueResponse'
 *       400:
 *         description: Validation error or issue not resolved
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not authorized to add feedback to this issue
 *       404:
 *         description: Issue not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/issues/user/{user_id}:
 *   get:
 *     summary: Get issues by user ID
 *     tags: [Issues]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Issues retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueListResponse'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/issues/constituency/{constituency_id}:
 *   get:
 *     summary: Get issues by constituency
 *     tags: [Issues]
 *     parameters:
 *       - in: path
 *         name: constituency_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Constituency ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Issues retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueListResponse'
 *       404:
 *         description: Constituency not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/issues/statistics:
 *   get:
 *     summary: Get issue statistics
 *     tags: [Issues]
 *     parameters:
 *       - in: query
 *         name: constituency_id
 *         schema:
 *           type: string
 *         description: Filter by constituency ID
 *       - in: query
 *         name: panchayat_id
 *         schema:
 *           type: string
 *         description: Filter by panchayat ID
 *       - in: query
 *         name: ward_no
 *         schema:
 *           type: string
 *         description: Filter by ward number
 *     responses:
 *       200:
 *         description: Issue statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueStatistics'
 *       500:
 *         description: Internal server error
 */
