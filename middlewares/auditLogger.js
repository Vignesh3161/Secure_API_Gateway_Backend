const winston = require('winston');
const AuditLog = require('../models/AuditLog');
const ApiKey = require('../models/ApiKey');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/gateway.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

const auditLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', async () => {
    const duration = Date.now() - start;
    let ownerId = null;

    // Find owner of the API key used
    if (req.apiKeyId) {
       const keyDoc = await ApiKey.findById(req.apiKeyId);
       if (keyDoc) ownerId = keyDoc.owner;
    }

    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      owner: ownerId,
    };
    
    // Save to DB for dynamic dashboard
    try {
      await AuditLog.create(logData);
    } catch (err) {
      logger.error('Failed to save audit log:', err);
    }

    logger.info('Gateway Request:', logData);
  });
  
  next();
};

module.exports = { auditLogger, logger };
