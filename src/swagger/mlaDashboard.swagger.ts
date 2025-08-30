/**
 * @swagger
 * components:
 *   schemas:
 *     MLADashboard:
 *       type: object
 *       properties:
 *         constituency_id:
 *           type: string
 *           description: ID of the constituency
 *         total_voters:
 *           type: number
 *           description: Total number of voters in the constituency
 *         active_voters:
 *           type: number
 *           description: Number of active voters
 *         total_panchayats:
 *           type: number
 *           description: Total number of panchayats
 *         total_wards:
 *           type: number
 *           description: Total number of wards
 *         area:
 *           type: string
 *           description: Area of the constituency
 *         population:
 *           type: string
 *           description: Population of the constituency
 *         literacy_rate:
 *           type: string
 *           description: Literacy rate
 *         department_stats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               issues:
 *                 type: number
 *               resolved:
 *                 type: number
 *               pending:
 *                 type: number
 *               avgResponse:
 *                 type: number
 *               satisfaction:
 *                 type: number
 *               budget:
 *                 type: number
 *               spent:
 *                 type: number
 *         monthly_issues:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               month:
 *                 type: string
 *               total:
 *                 type: number
 *               resolved:
 *                 type: number
 *               pending:
 *                 type: number
 *               critical:
 *                 type: number
 *               avgResolution:
 *                 type: number
 *               satisfaction:
 *                 type: number
 *         category_stats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               value:
 *                 type: number
 *               color:
 *                 type: string
 *               priority:
 *                 type: string
 *               avgResolution:
 *                 type: number
 *         user_engagement:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               day:
 *                 type: string
 *               activeUsers:
 *                 type: number
 *               newIssues:
 *                 type: number
 *               resolvedIssues:
 *                 type: number
 *               satisfaction:
 *                 type: number
 *               complaints:
 *                 type: number
 *         ai_suggestions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *               impact:
 *                 type: string
 *               implementation:
 *                 type: string
 *               cost:
 *                 type: string
 *               status:
 *                 type: string
 *         recent_issues:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *               status:
 *                 type: string
 *               submitted:
 *                 type: string
 *               location:
 *                 type: string
 *         last_updated:
 *           type: string
 *           format: date-time
 *     MLARealTimeStats:
 *       type: object
 *       properties:
 *         total_issues:
 *           type: number
 *         pending_issues:
 *           type: number
 *         resolved_issues:
 *           type: number
 *         in_progress_issues:
 *           type: number
 *         resolution_rate:
 *           type: number
 *         recent_issues:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *               status:
 *                 type: string
 *               submitted:
 *                 type: string
 *               location:
 *                 type: string
 */

/**
 * @swagger
 * /api/mla-dashboard/{constituencyId}:
 *   get:
 *     summary: Get MLA dashboard data for a specific constituency
 *     tags: [MLA Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: constituencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the constituency
 *     responses:
 *       200:
 *         description: MLA Dashboard data retrieved successfully
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
 *                   $ref: '#/components/schemas/MLADashboard'
 *       401:
 *         description: User authentication required
 *       403:
 *         description: Access denied. MLA role required.
 *       404:
 *         description: User or constituency not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update MLA dashboard data for a specific constituency
 *     tags: [MLA Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: constituencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the constituency
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MLADashboard'
 *     responses:
 *       200:
 *         description: MLA Dashboard data updated successfully
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
 *                   $ref: '#/components/schemas/MLADashboard'
 *       401:
 *         description: User authentication required
 *       403:
 *         description: Access denied. MLA role required.
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/mla-dashboard/{constituencyId}/stats:
 *   get:
 *     summary: Get real-time statistics for MLA dashboard
 *     tags: [MLA Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: constituencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the constituency
 *     responses:
 *       200:
 *         description: Real-time statistics retrieved successfully
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
 *                   $ref: '#/components/schemas/MLARealTimeStats'
 *       401:
 *         description: User authentication required
 *       403:
 *         description: Access denied. MLA role required.
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
