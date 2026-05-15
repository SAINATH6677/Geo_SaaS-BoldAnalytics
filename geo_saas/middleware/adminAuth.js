const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'NO_TOKEN_PROVIDED'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN_FORMAT'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'ADMIN_ACCESS_REQUIRED'
      });
    }

    req.admin = decoded;

    next();

  } catch (err) {

    console.error(err);

    return res.status(401).json({
      success: false,
      error: 'INVALID_OR_EXPIRED_TOKEN'
    });
  }
};