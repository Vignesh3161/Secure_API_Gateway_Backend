const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const authLimiter = require('../middlewares/authRateLimiter');

router.post('/login', authLimiter, login);

// Registration is only available for Admins to create new users
router.post('/register', verifyToken, checkRole(['ADMIN']), register);

module.exports = router;
