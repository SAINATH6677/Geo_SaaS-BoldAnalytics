const express = require('express');
const router = express.Router();
const db = require('../config/db');
const apiAuth = require('../middleware/apiAuth');
const redisClient = require('../config/redis');

/**
 * @swagger
 * /autocomplete:
 *   get:
 *     summary: Autocomplete village search
 *     tags: [Autocomplete]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Autocomplete results
 *       500:
 *         description: Server error
 */


router.get('/', apiAuth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_QUERY',
        message: 'Query must be at least 2 characters'
      });
    }

    const cacheKey = `autocomplete:${q}:${limit}`;

    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await db.query(
      `
      SELECT
        v.village_code,
        INITCAP(v.village_name) AS village,
        INITCAP(sd.sub_district_name) AS sub_district,
        INITCAP(d.district_name) AS district,
        INITCAP(s.state_name) AS state
      FROM villages v
      JOIN sub_districts sd
        ON v.sub_district_code = sd.sub_district_code
      JOIN districts d
        ON sd.district_code = d.district_code
      JOIN states s
        ON d.state_code = s.state_code
      WHERE v.village_name ILIKE $1
      LIMIT $2
      `,
      [`${q}%`, parseInt(limit)]
    );

    const formattedData = result.rows.map(row => ({
      value: row.village_code,
      label: row.village,
      fullAddress: `${row.village}, ${row.sub_district}, ${row.district}, ${row.state}, India`,
      hierarchy: {
        village: row.village,
        subDistrict: row.sub_district,
        district: row.district,
        state: row.state,
        country: 'India'
      }
    }));

    const response = {
      success: true,
      count: formattedData.length,
      data: formattedData
    };

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
      error: 'INTERNAL_ERROR',
      message: err.message
    });
  }
});

module.exports = router;