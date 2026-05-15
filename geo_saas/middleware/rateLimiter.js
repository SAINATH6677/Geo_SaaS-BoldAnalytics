const db = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return next();
    }

    const result = await db.query(
      `
      SELECT plan
      FROM api_users
      WHERE api_key = $1
      `,
      [apiKey]
    );

    if (result.rows.length === 0) {
      return next();
    }

    const plan = result.rows[0].plan;

    const limits = {
      free: 5000,
      premium: 50000,
      pro: 300000,
      unlimited: 1000000
    };

    const limit = limits[plan] || 5000;

    req.rateLimitLimit = limit;
    req.rateLimitRemaining = limit;
    req.rateLimitReset = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    next();

  } catch (err) {
    console.error(err);
    next();
  }
};