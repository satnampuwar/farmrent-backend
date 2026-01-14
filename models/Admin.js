const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'super_admin' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Admin', adminSchema);
