const { verifySignature } = require('../services/hmacService');

/**
 * Middleware to verify request integrity using HMAC.
 */
const verifyHMAC = (req, res, next) => {
  const signature = req.headers['x-hmac-signature'];
  const nonce = req.headers['x-nonce'];
  const timestamp = req.headers['x-timestamp'];

  if (!signature || !nonce || !timestamp) {
    return res.status(400).json({ error: 'Missing security headers (HMAC, Nonce, or Timestamp)' });
  }

  // Ensure timestamp is recent (within 5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    return res.status(401).json({ error: 'Request timestamp expired or skewed' });
  }

  // Ensure consistent stringification (no whitespace)
  const payload = req.method === 'GET' 
    ? JSON.stringify(req.query) 
    : JSON.stringify(req.body);
  
  if (!verifySignature(payload, nonce, timestamp, signature)) {
    console.log(`[HMAC Fail] Expected signature for payload: ${payload}`);
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  next();
};

module.exports = verifyHMAC;
