const db = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    // Skip if no API key
    if (!apiKey) {
      return next();
    }

    // Get user plan
    const userResult = await db.query(
      `
      SELECT id, plan
      FROM api_users
      WHERE api_key = $1
      `,
      [apiKey]
    );

    if (userResult.rows.length === 0) {
      return next();
    }

    const user = userResult.rows[0];

    // Plan limits
    const limits = {
      free: 5000,
      premium: 50000,
      pro: 300000,
      unlimited: 1000000
    };

    const dailyLimit = limits[user.plan] || 5000;

    // Count today's requests
    const usageResult = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM api_logs
      WHERE api_user_id = $1
      AND created_at >= CURRENT_DATE
      `,
      [user.id]
    );

    const used = parseInt(usageResult.rows[0].total);

    const remaining = Math.max(dailyLimit - used, 0);

    // Attach metadata
    req.rateLimitLimit = dailyLimit;
    req.rateLimitRemaining = remaining;
    req.rateLimitReset = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    // Block if exceeded
    if (used >= dailyLimit) {
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Daily API quota exceeded'
      });
    }

    next();

  } catch (err) {
    console.error('Quota Middleware Error:', err.message);

    return res.status(500).json({
      success: false,
      error: 'QUOTA_ERROR',
      message: err.message
    });
  }
};