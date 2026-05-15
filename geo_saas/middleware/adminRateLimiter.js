const rateLimitMap = new Map();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 200;

module.exports = (req, res, next) => {

  try {

    // Get admin token / IP
    const key =
      req.headers.authorization ||
      req.ip;

    const now = Date.now();

    // Existing data
    let data = rateLimitMap.get(key);

    // First request
    if (!data) {

      data = {
        count: 1,
        startTime: now
      };

      rateLimitMap.set(key, data);

      return next();
    }

    // Window expired
    if (now - data.startTime > WINDOW_MS) {

      data = {
        count: 1,
        startTime: now
      };

      rateLimitMap.set(key, data);

      return next();
    }

    // Increase count
    data.count += 1;

    // Limit exceeded
    if (data.count > MAX_REQUESTS) {

      return res.status(429).json({
        success: false,
        error: 'ADMIN_RATE_LIMIT_EXCEEDED',
        message: 'Too many admin requests. Try again later.',
        meta: {
          limit: MAX_REQUESTS,
          window_minutes: 15
        }
      });
    }

    next();

  } catch (err) {

    console.error('Admin Rate Limit Error:', err);

    return res.status(500).json({
      success: false,
      error: 'ADMIN_RATE_LIMIT_ERROR'
    });
  }
};