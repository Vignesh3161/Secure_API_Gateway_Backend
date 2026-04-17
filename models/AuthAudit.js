const mongoose = require('mongoose');

const authAuditSchema = new mongoose.Schema({
  email: { type: String, required: true },
  action: { type: String, enum: ['LOGIN_SUCCESS', 'LOGIN_FAILURE', 'REGISTER'], required: true },
  ip: { type: String },
  userAgent: { type: String },
  details: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuthAudit', authAuditSchema);
