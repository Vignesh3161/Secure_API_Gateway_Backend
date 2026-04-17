const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { targets } = require('../config/proxy');

const router = express.Router();

// Apply proxy for each configured target
targets.forEach((targetConfig) => {
  router.use(
    targetConfig.path,
    createProxyMiddleware({
      target: targetConfig.target,
      changeOrigin: targetConfig.changeOrigin,
      pathRewrite: targetConfig.pathRewrite,
      onProxyReq: (proxyReq, req, res) => {
        // You can add headers here if needed for the internal service
        proxyReq.setHeader('X-Gateway-Verified', 'true');
      },
      onError: (err, req, res) => {
        res.status(502).json({ error: 'Proxy Error', message: err.message });
      },
    })
  );
});

module.exports = router;
