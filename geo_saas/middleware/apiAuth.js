const db = require('../config/db');

const apiAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  // API key missing
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API_KEY_REQUIRED',
      message: 'X-API-Key header required'
    });
  }

  try {

    // Find approved API user
    const result = await db.query(
      `
      SELECT *
      FROM api_users
      WHERE api_key = $1
      AND status = 'approved'
      `,
      [apiKey]
    );

    // Invalid or suspended user
    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'API access not approved'
      });
    }

    const user = result.rows[0];

    // Daily limits by plan
    const planLimits = {
      free: 5000,
      premium: 50000,
      pro: 300000,
      unlimited: 1000000
    };

    const dailyLimit =
      planLimits[user.plan] || 5000;

    // Count today's usage
    const usageResult = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM api_logs
      WHERE api_user_id = $1
      AND created_at >= CURRENT_DATE
      `,
      [user.id]
    );

    const todayUsage = parseInt(
      usageResult.rows[0].total
    );

    // Remaining requests
    const remaining = Math.max(
      dailyLimit - todayUsage,
      0
    );

    // Attach rate limit metadata
    req.rateLimitLimit = dailyLimit;
    req.rateLimitRemaining = remaining;
    req.rateLimitReset = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    // Block if limit exceeded
    if (todayUsage >= dailyLimit) {
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Daily API quota exceeded'
      });
    }

    // Attach authenticated user
    req.user = user;

    next();

  } catch (err) {
    console.error('API Auth Error:', err.message);

    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: err.message
    });
  }
};

module.exports = apiAuth;