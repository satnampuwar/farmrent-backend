const farmerService = require('../services/farmerService');

/**
 * Create Farmer Interest Controller
 */
const createFarmer = async (req, res) => {
  const { county, offered_price, email } = req.body;

  if (!county || !email || !offered_price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await farmerService.createFarmer({
      county,
      offered_price,
      email
    });
    res.json(result);
  } catch (err) {
    console.error('Error:', err);
    // Handle specific MongoDB errors
    if (err.name === 'MongoServerError' || err.name === 'MongoNetworkError') {
      return res.status(503).json({ error: 'Database connection error. Please try again later.' });
    }
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createFarmer
};
