const axios = require('axios');
const crypto = require('crypto');

const API_KEY = 'test_key_123';
const HMAC_SECRET = 'your_super_secret_hmac_key';
const GATEWAY_URL = 'http://localhost:4000/proxy/api/v1/test';

const calculateSignature = (payload, nonce, timestamp) => {
  const data = `${timestamp}:${nonce}:${payload}`;
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(data)
    .digest('hex');
};

async function testGateway() {
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payload = JSON.stringify({ message: 'Hello Gateway' });
  
  const signature = calculateSignature(payload, nonce, timestamp);

  console.log('--- Testing Valid Request ---');
  try {
    const res = await axios.post(GATEWAY_URL, payload, {
      headers: {
        'x-api-key': API_KEY,
        'x-hmac-signature': signature,
        'x-nonce': nonce,
        'x-timestamp': timestamp,
        'Content-Type': 'application/json'
      }
    });
    console.log('Success:', res.status, res.data);
  } catch (err) {
    console.error('Failed:', err.response?.status, err.response?.data);
  }

  console.log('\n--- Testing Replay Attack (Same Nonce) ---');
  try {
    const res = await axios.post(GATEWAY_URL, payload, {
      headers: {
        'x-api-key': API_KEY,
        'x-hmac-signature': signature,
        'x-nonce': nonce,
        'x-timestamp': timestamp,
        'Content-Type': 'application/json'
      }
    });
    console.log('Success (Expected Failure!):', res.status);
  } catch (err) {
    console.log('Expected Failure:', err.response?.status, err.response?.data);
  }

  console.log('\n--- Testing Invalid Signature ---');
  try {
    const res = await axios.post(GATEWAY_URL, payload, {
      headers: {
        'x-api-key': API_KEY,
        'x-hmac-signature': 'invalid_sig',
        'x-nonce': crypto.randomBytes(16).toString('hex'),
        'x-timestamp': timestamp,
        'Content-Type': 'application/json'
      }
    });
    console.log('Success (Expected Failure!):', res.status);
  } catch (err) {
    console.log('Expected Failure:', err.response?.status, err.response?.data);
  }

  console.log('\n--- Testing Rate Limiting (Firing 10 requests) ---');
  for (let i = 0; i < 10; i++) {
    const n = crypto.randomBytes(16).toString('hex');
    const t = Math.floor(Date.now() / 1000).toString();
    const s = calculateSignature(payload, n, t);
    try {
      await axios.post(GATEWAY_URL, payload, {
        headers: {
          'x-api-key': API_KEY,
          'x-hmac-signature': s,
          'x-nonce': n,
          'x-timestamp': t,
          'Content-Type': 'application/json'
        }
      });
      process.stdout.write('.');
    } catch (err) {
      console.log('\nRate Limit Hit:', err.response?.status, err.response?.data);
      break;
    }
  }
}

// Note: Ensure backend is running and a test key exists in DB
// For testing purposes, you might want to bypass DB check or insert a key manually.
testGateway();
