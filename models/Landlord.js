const mongoose = require('mongoose');

const landlordSchema = new mongoose.Schema({
  county: { type: String, required: true },
  spi: { type: Number, default: null },
  acres: { type: Number, default: null },
  asking_price: { type: Number, required: true },
  email: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

// Add indexes for faster queries
landlordSchema.index({ created_at: -1 });
landlordSchema.index({ county: 1, asking_price: 1 }); // For matching queries in farmerService

module.exports = mongoose.model('Landlord', landlordSchema);
