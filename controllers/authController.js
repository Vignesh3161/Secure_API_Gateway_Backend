const User = require('../models/User');
const AuthAudit = require('../models/AuthAudit');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const user = new User({ name, email, password, role });
    await user.save();
    
    await AuthAudit.create({
      email,
      action: 'REGISTER',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: `User ${name} registered with role ${role}`
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      await AuthAudit.create({
        email,
        action: 'LOGIN_FAILURE',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'Invalid credentials'
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret_key_123',
      { expiresIn: '1d' }
    );

    await AuthAudit.create({
      email,
      action: 'LOGIN_SUCCESS',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: 'Successful portal access'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login };
