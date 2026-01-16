const mongoose = require('mongoose');

const signupSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  created_at: { type: Date, default: Date.now }
});

// Add index on created_at for faster sorting queries
signupSchema.index({ created_at: -1 });

module.exports = mongoose.model('Signup', signupSchema);
