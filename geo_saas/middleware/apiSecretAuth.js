const db = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key');
    const apiSecret = req.header('X-API-Secret');

    // Check headers exist
    if (!apiKey || !apiSecret) {
      return res.status(401).json({
        success: false,
        error: 'API Key and Secret required'
      });
    }

    // Validate credentials
    const result = await db.query(
      `
      SELECT *
      FROM api_users
      WHERE api_key = $1
      AND api_secret = $2
      `,
      [apiKey, apiSecret]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API credentials'
      });
    }

    // Attach user to request
    req.apiUser = result.rows[0];

    next();

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};