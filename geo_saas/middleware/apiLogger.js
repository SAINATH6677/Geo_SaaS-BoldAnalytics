const db = require('../config/db');

module.exports = async (req, res, next) => {
  // Skip OPTIONS requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  const start = Date.now();

  res.on('finish', async () => {
    try {
      const apiKey = req.headers['x-api-key'] || null;

      let apiUserId = null;

      if (apiKey) {
        const userResult = await db.query(
          `
          SELECT id
          FROM api_users
          WHERE api_key = $1
          `,
          [apiKey]
        );

        if (userResult.rows.length > 0) {
          apiUserId = userResult.rows[0].id;
        }
      }

      await db.query(
        `
        INSERT INTO api_logs (
          api_user_id,
          api_key,
          endpoint,
          method,
          status_code,
          response_time
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          apiUserId,
          apiKey,
          req.originalUrl,
          req.method,
          res.statusCode,
          Date.now() - start
        ]
      );

    } catch (err) {
      console.error('API Log Error:', err.message);
    }
  });

  next();
};