const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ success: false, message: 'حدث خطأ داخلي في الخادم.' });
}

module.exports = errorHandler;