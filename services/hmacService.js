const crypto = require('crypto');
const { hmacSecret } = require('../config/security');

/**
 * Calculates HMAC-SHA256 signature for a given payload and nonce.
 * @param {string} payload - The request body as string.
 * @param {string} nonce - Unique random string.
 * @param {string} timestamp - Request timestamp.
 * @returns {string} - The calculated signature.
 */
const calculateSignature = (payload, nonce, timestamp) => {
  const data = `${timestamp}:${nonce}:${payload}`;
  return crypto
    .createHmac('sha256', hmacSecret)
    .update(data)
    .digest('hex');
};

/**
 * Verifies if the provided signature matches the calculated one.
 */
const verifySignature = (payload, nonce, timestamp, signature) => {
  const calculated = calculateSignature(payload, nonce, timestamp);
  
  const signatureBuffer = Buffer.from(signature, 'hex');
  const calculatedBuffer = Buffer.from(calculated, 'hex');

  if (signatureBuffer.length !== calculatedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, calculatedBuffer);
};

module.exports = {
  calculateSignature,
  verifySignature,
};
