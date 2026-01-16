const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  county: { type: String, required: true },
  offered_price: { type: Number, required: true },
  email: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

// Add index on created_at for faster sorting queries
farmerSchema.index({ created_at: -1 });

module.exports = mongoose.model('Farmer', farmerSchema);
