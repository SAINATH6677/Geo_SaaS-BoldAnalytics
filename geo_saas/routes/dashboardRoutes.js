const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwtAuth = require('../middleware/jwtAuth');

/**
 * @swagger
 * /dashboard/me:
 *   get:
 *     summary: Get dashboard profile
 *     tags: [Dashboard]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Dashboard profile data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get('/me', jwtAuth, async (req, res) => {
  try {
    const clientResult = await db.query(
      'SELECT id, company_name, email, created_at FROM clients WHERE id = $1',
      [req.client.id]
    );

    const client = clientResult.rows[0];

    const apiUserResult = await db.query(
      'SELECT api_key, plan FROM api_users WHERE company_name = $1',
      [client.company_name]
    );

    const apiUser = apiUserResult.rows[0];

    res.json({
      success: true,
      client: {
        id: client.id,
        company_name: client.company_name,
        email: client.email,
        created_at: client.created_at,
        api_key: apiUser.api_key,
        plan: apiUser.plan
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

router.get('/usage', jwtAuth, async (req, res) => {
  try {
    // Get client
    const clientResult = await db.query(
      'SELECT * FROM clients WHERE id = $1',
      [req.client.id]
    );

    const client = clientResult.rows[0];

    // Get api user
    const apiUserResult = await db.query(
      'SELECT * FROM api_users WHERE company_name = $1',
      [client.company_name]
    );

    const apiUser = apiUserResult.rows[0];

    // Total requests
    const totalUsageResult = await db.query(
      `
      SELECT COUNT(*) 
      FROM api_logs
      WHERE api_user_id = $1
      `,
      [apiUser.id]
    );

    // Today's requests
    const todayUsageResult = await db.query(
      `
      SELECT COUNT(*)
      FROM api_logs
      WHERE api_user_id = $1
      AND created_at >= CURRENT_DATE
      `,
      [apiUser.id]
    );

    const totalRequests = parseInt(totalUsageResult.rows[0].count);
    const todayRequests = parseInt(todayUsageResult.rows[0].count);

    const planLimits = {
      free: 100,
      premium: 10000,
      pro: 100000,
      unlimited: 'Unlimited'
    };

    const limit = planLimits[apiUser.plan];

    res.json({
      success: true,
      usage: {
        company_name: client.company_name,
        plan: apiUser.plan,
        total_requests: totalRequests,
        today_requests: todayRequests,
        daily_limit: limit,
        remaining_today:
          limit === 'Unlimited'
            ? 'Unlimited'
            : limit - todayRequests
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

router.get('/api-key', jwtAuth, async (req, res) => {
  try {
    const clientResult = await db.query(
      'SELECT * FROM clients WHERE id = $1',
      [req.client.id]
    );

    const client = clientResult.rows[0];

    const apiUserResult = await db.query(
      `
      SELECT api_key, plan
      FROM api_users
      WHERE company_name = $1
      `,
      [client.company_name]
    );

    const apiUser = apiUserResult.rows[0];

    res.json({
      success: true,
      api_key: apiUser.api_key,
      plan: apiUser.plan
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

router.post('/regenerate-api-key', jwtAuth, async (req, res) => {
  try {
    const clientResult = await db.query(
      'SELECT * FROM clients WHERE id = $1',
      [req.client.id]
    );

    const client = clientResult.rows[0];

    const { v4: uuidv4 } = require('uuid');
    const newApiKey = uuidv4();

    await db.query(
      `
      UPDATE api_users
      SET api_key = $1
      WHERE company_name = $2
      `,
      [newApiKey, client.company_name]
    );

    res.json({
      success: true,
      message: 'API key regenerated successfully',
      new_api_key: newApiKey
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

router.post('/upgrade-plan', jwtAuth, async (req, res) => {
  try {
    const { plan } = req.body;

    const allowedPlans = [
      'free',
      'premium',
      'pro',
      'unlimited'
    ];

    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan'
      });
    }

    const clientResult = await db.query(
      'SELECT * FROM clients WHERE id = $1',
      [req.client.id]
    );

    const client = clientResult.rows[0];

    await db.query(
      `
      UPDATE api_users
      SET plan = $1
      WHERE company_name = $2
      `,
      [plan, client.company_name]
    );

    res.json({
      success: true,
      message: 'Plan updated successfully',
      new_plan: plan
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