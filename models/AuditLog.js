const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  method: { type: String, required: true },
  url: { type: String, required: true },
  status: { type: Number, required: true },
  duration: { type: String },
  ip: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The owner of the API key used
  security: { type: String, default: 'Verified' }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
