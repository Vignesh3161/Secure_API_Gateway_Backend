require('dotenv').config();

module.exports = {
  encryptionKey: process.env.ENCRYPTION_KEY || 'default_32_byte_key_for_aes_256_cbc', // Must be 32 bytes
  hmacSecret: process.env.HMAC_SECRET || 'your_super_secret_hmac_key',
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100, // Limit each IP to 100 requests per windowMs
  replayWindowSeconds: 300, // Nonce valid for 5 minutes
};
