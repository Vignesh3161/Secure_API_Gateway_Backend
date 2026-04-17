const ApiKey = require('../models/ApiKey');

/**
 * Middleware to validate the API Key provided in headers.
 */
const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API Key' });
  }

  try {
    const keyRecord = await ApiKey.findOne({ key: apiKey, status: 'active' });

    if (!keyRecord) {
      return res.status(403).json({ error: 'Invalid or Inactive API Key' });
    }

    // Attach key ID to request for auditing
    req.apiKeyId = keyRecord._id;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error during Key Validation' });
  }
};

module.exports = validateApiKey;
