const { v4: uuidv4 } = require('uuid');

module.exports = (req, res, next) => {
  req.requestId = `req_${uuidv4()}`;
  req.startTime = Date.now();

  next();
};