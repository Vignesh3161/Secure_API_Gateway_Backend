require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { auditLogger } = require('./middlewares/auditLogger');
const validateApiKey = require('./middlewares/validateApiKey');
const verifyHMAC = require('./middlewares/verifyHMAC');
const replayProtection = require('./middlewares/replayProtection');
const rateLimiter = require('./middlewares/rateLimiter');
const decryptPayload = require('./middlewares/decryptPayload');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust for production
  },
});

// Connect to Database
connectDB().then(async () => {
  if (process.env.NODE_ENV !== 'production') {
    const ApiKey = require('./models/ApiKey');
    const User = require('./models/User');
    
    // Seed API Key
    const existingKey = await ApiKey.findOne({ key: 'test_key_123' });
    if (!existingKey) {
      await ApiKey.create({ name: 'Development Key', key: 'test_key_123' });
      console.log('✅ Created development API Key: test_key_123');
    }

    // Seed Default Admin
    const existingAdmin = await User.findOne({ email: 'admin@gateway.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'System Admin',
        email: 'admin@gateway.com',
        password: 'admin123', // Will be hashed by pre-save hook
        role: 'ADMIN'
      });
      console.log('👤 Created default admin: admin@gateway.com / admin123');
    }
  }
});

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Audit Logger (First in chain)
app.use(auditLogger);

// Security Middleware Chain
// Note: Apply to proxy routes specifically or globally depending on needs
// Here we apply security globally to everything except admin routes
const securityChain = [
  validateApiKey,
  rateLimiter,
  replayProtection,
  decryptPayload,
  verifyHMAC,
];

const { verifyToken } = require('./middlewares/authMiddleware');

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/admin', verifyToken, require('./routes/admin'));
app.use('/proxy', securityChain, require('./routes/proxy'));

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('Admin Dashboard connected:', socket.id);
  
  // Example: Emit real-time traffic updates
  // In a real scenario, this would be tied to the auditLogger
  socket.on('disconnect', () => {
    console.log('Dashboard disconnected');
  });
});

// Hook Socket.io into the auditLogger for live updates
// (Simplified approach: emit events directly from middleware)
app.set('socketio', io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`API Security Gateway running on port ${PORT}`);
});
