const { decrypt } = require('../services/encryptionService');

/**
 * Middleware to decrypt incoming request body if it's encrypted.
 */
const decryptPayload = (req, res, next) => {
  // Only decrypt if the header indicates encryption
  if (req.headers['x-encryption-enabled'] === 'true' && req.body && req.body.data) {
    try {
      const decryptedData = decrypt(req.body.data);
      req.body = JSON.parse(decryptedData);
      next();
    } catch (error) {
      return res.status(400).json({ error: 'Payload decryption failed' });
    }
  } else {
    next();
  }
};

module.exports = decryptPayload;
