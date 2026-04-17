const NodeCache = require('node-cache');
const { rateLimitMax, rateLimitWindowMs } = require('../config/security');

const rateCache = new NodeCache();

/**
 * Basic Rate Limiter using NodeCache (Fixed Window).
 */
const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const currentTime = Math.floor(Date.now() / rateLimitWindowMs);
  const key = `${ip}:${currentTime}`;

  let count = rateCache.get(key) || 0;

  if (count >= rateLimitMax) {
    return res.status(429).json({ error: 'Too many requests, please try again later.' });
  }

  rateCache.set(key, count + 1, rateLimitWindowMs / 1000);
  
  // Set headers for user feedback
  res.setHeader('X-RateLimit-Limit', rateLimitMax);
  res.setHeader('X-RateLimit-Remaining', rateLimitMax - (count + 1));
  
  next();
};

module.exports = rateLimiter;
