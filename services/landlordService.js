const Landlord = require('../models/Landlord');
const { connectDB } = require('../config/database');

/**
 * Create a new landlord post
 * @param {Object} landlordData - Landlord data
 * @returns {Promise<Object>} Created landlord
 */
const createLandlord = async (landlordData) => {
  await connectDB();
  
  const landlord = new Landlord({
    county: landlordData.county,
    spi: landlordData.spi || null,
    acres: landlordData.acres || null,
    asking_price: landlordData.asking_price,
    email: landlordData.email
  });
  
  const savedLandlord = await landlord.save();
  return {
    success: true,
    message: 'Landlord post created successfully',
    id: savedLandlord._id
  };
};

module.exports = {
  createLandlord
};
