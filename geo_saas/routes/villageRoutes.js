const express = require('express');
const router = express.Router();
const db = require('../config/db');
const redisClient = require('../config/redis');


/**
 * @swagger
 * /villages/{sub_district_code}:
 *   get:
 *     summary: Get villages by subdistrict
 *     tags: [Villages]
 *     parameters:
 *       - in: path
 *         name: sub_district_code
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of villages
 *       500:
 *         description: Server error
 */

router.get('/:sub_district_code', async (req, res) => {
  const { sub_district_code } = req.params;

  if (isNaN(sub_district_code)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid sub_district_code'
    });
  }

  try {
    const cacheKey = `villages:${sub_district_code}`;

    // Check Redis cache
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // DB Query
    const result = await db.query(
      `
      SELECT
        village_code,
        INITCAP(village_name) AS village_name
      FROM villages
      WHERE sub_district_code = $1
      ORDER BY village_name
      LIMIT 100
      `,
      [sub_district_code]
    );

    const response = {
      success: true,
      count: result.rows.length,
      data: result.rows
    };

    // Save to Redis (30 mins)
    await redisClient.setEx(
      cacheKey,
      1800,
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