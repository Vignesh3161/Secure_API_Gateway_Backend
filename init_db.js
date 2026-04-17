require('dotenv').config();
const mongoose = require('mongoose');
const ApiKey = require('./models/ApiKey');

const init = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/api_gateway');
    
    const existing = await ApiKey.findOne({ key: 'test_key_123' });
    if (!existing) {
      await ApiKey.create({
        name: 'Test Key',
        key: 'test_key_123',
        status: 'active'
      });
      console.log('✅ Test API Key created: test_key_123');
    } else {
      console.log('ℹ️ Test API Key already exists.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error initializing DB:', err.message);
    process.exit(1);
  }
};

init();
