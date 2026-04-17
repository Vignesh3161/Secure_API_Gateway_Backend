const NodeCache = require('node-cache');
const { replayWindowSeconds } = require('../config/security');

// Initialize cache for nonces. In theory, this should be Redis for distributed systems.
const nonceCache = new NodeCache({ stdTTL: replayWindowSeconds, checkperiod: 60 });

/**
 * Middleware to prevent replay attacks by ensuring each nonce is used only once.
 */
const replayProtection = (req, res, next) => {
  const nonce = req.headers['x-nonce'];

  if (!nonce) {
    return res.status(400).json({ error: 'Missing Nonce' });
  }

  if (nonceCache.has(nonce)) {
    return res.status(403).json({ error: 'Replay attack detected: Nonce already used' });
  }

  // Store nonce in cache
  nonceCache.set(nonce, true);
  next();
};

module.exports = replayProtection;
