/**
 * Basic anomaly detection for incoming requests.
 */
const detectAnomalies = (req) => {
  const anomalies = [];
  const body = req.body;
  
  // 1. Unusually large payload
  const contentLength = parseInt(req.headers['content-length'] || 0);
  if (contentLength > 1024 * 1024) { // 1MB
    anomalies.push({ type: 'PAYLOAD_SIZE', message: 'Payload exceeds 1MB threshold' });
  }

  // 2. High frequency of requests from same IP (already handled by rate limiter, but can be logged here)
  
  // 3. Sensitive data patterns in unencrypted parts (if any)
  // ... more logic can be added here
  
  return anomalies;
};

module.exports = { detectAnomalies };
