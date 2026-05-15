const express = require('express');
const router = express.Router();
const db = require('../config/db');
const redisClient = require('../config/redis');


/**
 * @swagger
 * /subdistricts/{district_code}:
 *   get:
 *     summary: Get subdistricts by district
 *     tags: [Subdistricts]
 *     parameters:
 *       - in: path
 *         name: district_code
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of subdistricts
 *       500:
 *         description: Server error
 */

router.get('/:district_code', async (req, res) => {
  const { district_code } = req.params;

  if (isNaN(district_code)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid district_code'
    });
  }

  try {
    const cacheKey = `subdistricts:${district_code}`;

    // Check Redis cache
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // DB Query
    const result = await db.query(
      `
      SELECT
        sub_district_code,
        INITCAP(sub_district_name) AS sub_district_name
      FROM sub_districts
      WHERE district_code = $1
      ORDER BY sub_district_name
      `,
      [district_code]
    );

    const response = {
      success: true,
      count: result.rows.length,
      data: result.rows
    };

    // Save in Redis (1 hour)
    await redisClient.setEx(
      cacheKey,
      3600,
      JSON.stringify(response)
    );

    res.json(response);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;