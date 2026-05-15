const express = require('express');
const router = express.Router();
const db = require('../config/db');
const redisClient = require('../config/redis');

/**
 * @swagger
 * /states:
 *   get:
 *     summary: Get all states
 *     tags: [States]
 *     responses:
 *       200:
 *         description: List of states
 *       500:
 *         description: Server error
 */

router.get('/', async (req, res) => {
  try {
    const cacheKey = 'states';

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const result = await db.query(`
      SELECT
        state_code,
        INITCAP(state_name) AS state_name
      FROM states
      ORDER BY state_name
    `);

    const response = {
      success: true,
      count: result.rows.length,
      data: result.rows
    };

    await redisClient.setEx(
      cacheKey,
      3600,
      JSON.stringify(response)
    );

    res.json(response);

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;