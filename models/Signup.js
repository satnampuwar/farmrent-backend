const mongoose = require('mongoose');

const signupSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Signup', signupSchema);
