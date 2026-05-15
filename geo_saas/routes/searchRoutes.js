const express = require('express');
const router = express.Router();
const db = require('../config/db');
const apiAuth = require('../middleware/apiAuth');
const redisClient = require('../config/redis');

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search villages
 *     tags: [Search]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Village search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Result limit
 *     responses:
 *       200:
 *         description: Successful search
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get('/', apiAuth, async (req, res) => {
  const { query, limit = 10 } = req.query;

  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Query parameter required'
    });
  }

  try {
    // Redis cache key
    const cacheKey = `search:${query}:${limit}`;

    // Check Redis first
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // DB Query
    const result = await db.query(
      `
      SELECT
        v.village_code,
        INITCAP(v.village_name) AS village,
        INITCAP(sd.sub_district_name) AS sub_district,
        INITCAP(d.district_name) AS district,
        INITCAP(s.state_name) AS state,
        similarity(v.village_name, $1) AS score
      FROM villages v
      JOIN sub_districts sd 
        ON v.sub_district_code = sd.sub_district_code
      JOIN districts d 
        ON sd.district_code = d.district_code
      JOIN states s 
        ON d.state_code = s.state_code
      WHERE v.village_name % $1
      ORDER BY score DESC
      LIMIT $2;
      `,
      [query.toLowerCase(), parseInt(limit)]
    );

    const response = {
      success: true,
      count: result.rows.length,
      data: result.rows
    };

    // Save to Redis cache for 5 minutes
    await redisClient.setEx(
      cacheKey,
      300,
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