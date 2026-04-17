const express = require('express');
const router = express.Router();
const ApiKey = require('../models/ApiKey');
const AuditLog = require('../models/AuditLog');
const { logger } = require('../middlewares/auditLogger');

// Management routes for API Keys (Isolated to Owner)
router.get('/keys', async (req, res) => {
  try {
    const keys = await ApiKey.find({ owner: req.user._id });
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/keys', async (req, res) => {
  const { name, key } = req.body;
  try {
    const newKey = new ApiKey({ 
      name, 
      key: key || require('crypto').randomBytes(16).toString('hex'),
      owner: req.user._id 
    });
    await newKey.save();
    res.status(201).json(newKey);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/keys/:id', async (req, res) => {
  try {
    const result = await ApiKey.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!result) return res.status(404).json({ error: 'Key not found or unauthorized' });
    res.json({ message: 'API Key deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dynamic Stats for Dashboard
router.get('/stats', async (req, res) => {
  try {
    const keysCount = await ApiKey.countDocuments({ owner: req.user._id });
    const requestsCount = await AuditLog.countDocuments({ owner: req.user._id });
    const failuresCount = await AuditLog.countDocuments({ owner: req.user._id, status: { $gte: 400 } });
    
    res.json({
      totalRequests: requestsCount.toLocaleString(), 
      projects: keysCount.toString(),
      failures: failuresCount.toString(),
      uptime: '99.9%'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dynamic Alerts for Dashboard
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await AuditLog.find({ 
      owner: req.user._id, 
      status: { $gte: 400 } 
    }).sort({ timestamp: -1 }).limit(20);
    
    // Map internal logs to friendly alert format
    const formattedAlerts = alerts.map(log => ({
      _id: log._id,
      type: log.status >= 500 ? 'critical' : 'error',
      title: log.status === 429 ? 'Rate Limit Exceeded' : 'Security Breach Attempt',
      description: `Target: ${log.url} from IP ${log.ip}. Method: ${log.method}`,
      time: log.timestamp
    }));

    res.json(formattedAlerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
