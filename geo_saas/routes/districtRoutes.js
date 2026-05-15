const express = require('express');
const router = express.Router();
const db = require('../config/db');
const redisClient = require('../config/redis');

/**
 * @swagger
 * /districts/{state_code}:
 *   get:
 *     summary: Get districts by state
 *     tags: [Districts]
 *     parameters:
 *       - in: path
 *         name: state_code
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of districts
 *       400:
 *         description: Invalid state code
 *       500:
 *         description: Server error
 */

router.get('/:state_code', async (req, res) => {
  const { state_code } = req.params;

  if (isNaN(state_code)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid state_code'
    });
  }

  try {
    const cacheKey = `districts:${state_code}`;

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const result = await db.query(
      `
      SELECT
        district_code,
        INITCAP(district_name) AS district_name
      FROM districts
      WHERE state_code = $1
      ORDER BY district_name
      `,
      [state_code]
    );

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