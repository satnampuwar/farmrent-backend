const landlordService = require('../services/landlordService');

/**
 * Create Landlord Post Controller
 */
const createLandlord = async (req, res) => {
  const { county, spi, acres, asking_price, email } = req.body;
  
  // Validation
  if (!county || !email || !asking_price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Ensure MongoDB connection before proceeding
  try {
    const { connectDB } = require('../config/database');
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    return res.status(503).json({ 
      error: 'Database connection unavailable. Please try again later.' 
    });
  }
  
  try {
    const result = await landlordService.createLandlord({
      county,
      spi,
      acres,
      asking_price,
      email
    });
    res.json(result);
  } catch (err) {
    console.error('Database error:', err);
    // Handle specific MongoDB errors
    if (err.name === 'MongoServerError' || err.name === 'MongoNetworkError') {
      return res.status(503).json({ error: 'Database connection error. Please try again later.' });
    }
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createLandlord
};
