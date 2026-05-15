module.exports = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (payload) {
    const responseTime = Date.now() - req.startTime;

    const formatted = {
      success: payload.success ?? true,
      count: payload.count ?? (
        Array.isArray(payload.data)
          ? payload.data.length
          : payload.data
          ? 1
          : 0
      ),
      data: payload.data ?? payload,
      meta: {
        requestId: req.requestId,
        responseTime,
        rateLimit: {
          remaining: req.rateLimitRemaining ?? null,
          limit: req.rateLimitLimit ?? null,
          reset: req.rateLimitReset ?? null
        }
      }
    };

    return originalJson.call(this, formatted);
  };

  next();
};