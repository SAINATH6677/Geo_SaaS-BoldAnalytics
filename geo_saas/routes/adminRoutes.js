const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const adminRateLimiter = require('../middleware/adminRateLimiter');
const adminAuth = require('../middleware/adminAuth');

//
// ADMIN LOGIN
//

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Admin authenticated
 */
router.post('/login',adminRateLimiter, async (req, res) => {
  try {

    const { email, password } = req.body;

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_ADMIN_CREDENTIALS'
      });
    }

    const token = jwt.sign(
      {
        role: 'admin',
        email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    res.json({
      success: true,
      token
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

//
// GET ALL USERS (PAGINATED)
//

//
// GET ALL USERS (FILTERS + PAGINATION)
//

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all API users
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 20
 *
 *       - in: query
 *         name: plan
 *         schema:
 *           type: string
 *         example: premium
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         example: approved
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: bold
 *
 *     responses:
 *       200:
 *         description: List of API users
 *       500:
 *         description: Server error
 */

router.get('/users', adminAuth, async (req, res) => {

  try {

    // ---------------- PAGINATION ----------------

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const offset = (page - 1) * limit;

    // ---------------- FILTERS ----------------

    const plan = req.query.plan;
    const status = req.query.status;
    const search = req.query.search;

    // ---------------- DYNAMIC QUERY ----------------

    let query = `
      SELECT
        id,
        company_name,
        CONCAT(
          LEFT(api_key, 4),
          '****',
          RIGHT(api_key, 4)
        ) AS api_key,
        plan,
        status,
        created_at
      FROM api_users
      WHERE 1=1
    `;

    let countQuery = `
      SELECT COUNT(*) AS total
      FROM api_users
      WHERE 1=1
    `;

    const values = [];

    // PLAN FILTER
    if (plan) {

      values.push(plan);

      query += `
        AND plan = $${values.length}
      `;

      countQuery += `
        AND plan = $${values.length}
      `;
    }

    // STATUS FILTER
    if (status) {

      values.push(status);

      query += `
        AND status = $${values.length}
      `;

      countQuery += `
        AND status = $${values.length}
      `;
    }

    // SEARCH FILTER
    if (search) {

      values.push(`%${search}%`);

      query += `
        AND (
          company_name ILIKE $${values.length}
          OR api_key ILIKE $${values.length}
        )
      `;

      countQuery += `
        AND (
          company_name ILIKE $${values.length}
          OR api_key ILIKE $${values.length}
        )
      `;
    }

    // PAGINATION

    values.push(limit);
    values.push(offset);

    query += `
      ORDER BY created_at DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `;

    // ---------------- EXECUTE ----------------

    const result = await db.query(query, values);

    // Count query uses filter values only
    const countValues = values.slice(0, values.length - 2);

    const totalResult = await db.query(
      countQuery,
      countValues
    );

    const total = parseInt(
      totalResult.rows[0].total
    );

    res.json({
      success: true,
      count: result.rows.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: result.rows
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: err.message
    });
  }
});

//
// APPROVE USER
//

/**
 * @swagger
 * /admin/users/{id}/approve:
 *   patch:
 *     summary: Approve API user
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User approved
 *       500:
 *         description: Server error
 */
router.patch('/users/:id/approve', adminAuth, async (req, res) => {

  const { id } = req.params;

  try {

    const result = await db.query(
      `
      UPDATE api_users
      SET status = 'approved'
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    res.json({
      success: true,
      message: 'User approved',
      data: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

//
// SUSPEND USER
//

/**
 * @swagger
 * /admin/users/{id}/suspend:
 *   patch:
 *     summary: Suspend API user
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User suspended
 *       500:
 *         description: Server error
 */
router.patch('/users/:id/suspend', adminAuth, async (req, res) => {

  const { id } = req.params;

  try {

    const result = await db.query(
      `
      UPDATE api_users
      SET status = 'suspended'
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    res.json({
      success: true,
      message: 'User suspended',
      data: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

//
// UPDATE USER PLAN
//

/**
 * @swagger
 * /admin/users/{id}/plan:
 *   patch:
 *     summary: Update user subscription plan
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *                 example: premium
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *       500:
 *         description: Server error
 */
router.patch(
  '/users/:id/plan',
  adminAuth,
  async (req, res) => {

    const { id } = req.params;
    const { plan } = req.body;

    const validPlans = [
      'free',
      'premium',
      'pro',
      'unlimited'
    ];

    if (!validPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PLAN'
      });
    }

    try {

      const result = await db.query(
        `
        UPDATE api_users
        SET plan = $1
        WHERE id = $2
        RETURNING *
        `,
        [plan, id]
      );

      res.json({
        success: true,
        message: 'Plan updated successfully',
        data: result.rows[0]
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

//
// API LOGS (PAGINATED)
//

//
// API LOGS WITH FILTERS + PAGINATION
//

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: Get API request logs
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 50
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         example: 200
 *
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *         example: GET
 *
 *       - in: query
 *         name: endpoint
 *         schema:
 *           type: string
 *         example: /v1/search
 *
 *     responses:
 *       200:
 *         description: API logs retrieved
 *       500:
 *         description: Server error
 */

router.get('/logs', adminAuth, async (req, res) => {
  try {

    // ---------------- PAGINATION ----------------

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const offset = (page - 1) * limit;

    // ---------------- FILTERS ----------------

    const status = req.query.status;
    const method = req.query.method;
    const endpoint = req.query.endpoint;

    // ---------------- DYNAMIC QUERY ----------------

    let query = `
      SELECT
        l.id,
        l.endpoint,
        l.method,
        l.status_code,
        l.response_time,
        l.created_at,
        u.company_name,
        u.plan
      FROM api_logs l
      LEFT JOIN api_users u
        ON l.api_user_id = u.id
      WHERE 1=1
    `;

    const values = [];

    // STATUS FILTER
    if (status) {
      values.push(status);

      query += `
        AND l.status_code = $${values.length}
      `;
    }

    // METHOD FILTER
    if (method) {
      values.push(method);

      query += `
        AND l.method = $${values.length}
      `;
    }

    // ENDPOINT FILTER
    if (endpoint) {
      values.push(`%${endpoint}%`);

      query += `
        AND l.endpoint ILIKE $${values.length}
      `;
    }

    // ORDER + PAGINATION

    values.push(limit);
    values.push(offset);

    query += `
      ORDER BY l.created_at DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `;

    // ---------------- EXECUTE ----------------

    const result = await db.query(query, values);

    res.json({
      success: true,
      count: result.rows.length,
      page,
      limit,
      data: result.rows
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: err.message
    });
  }
});

//
// PLATFORM ANALYTICS
//

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get platform analytics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Analytics retrieved
 *       500:
 *         description: Server error
 */
router.get('/analytics', adminAuth, async (req, res) => {

  try {

    const totalUsers = await db.query(
      'SELECT COUNT(*) FROM api_users'
    );

    const totalRequests = await db.query(
      'SELECT COUNT(*) FROM api_logs'
    );

    const approvedUsers = await db.query(
      `
      SELECT COUNT(*)
      FROM api_users
      WHERE status = 'approved'
      `
    );

    const suspendedUsers = await db.query(
      `
      SELECT COUNT(*)
      FROM api_users
      WHERE status = 'suspended'
      `
    );

    const avgResponse = await db.query(
      `
      SELECT AVG(response_time)
      FROM api_logs
      `
    );

    const todayRequests = await db.query(
      `
      SELECT COUNT(*)
      FROM api_logs
      WHERE created_at >= CURRENT_DATE
      `
    );

    const planStats = await db.query(
      `
      SELECT
        plan,
        COUNT(*)
      FROM api_users
      GROUP BY plan
      `
    );

    res.json({
      success: true,
      data: {
        total_users: parseInt(
          totalUsers.rows[0].count
        ),

        approved_users: parseInt(
          approvedUsers.rows[0].count
        ),

        suspended_users: parseInt(
          suspendedUsers.rows[0].count
        ),

        total_requests: parseInt(
          totalRequests.rows[0].count
        ),

        today_requests: parseInt(
          todayRequests.rows[0].count
        ),

        average_response_time: Math.round(
          avgResponse.rows[0].avg || 0
        ),

        plans: planStats.rows
      }
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;