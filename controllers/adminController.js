const adminService = require('../services/adminService');

/**
 * Admin Login Controller
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and password are required' 
    });
  }
  
  try {
    const result = await adminService.loginAdmin(email, password);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    if (err.message === 'Invalid credentials') {
      return res.status(401).json({ 
        success: false, 
        error: err.message 
      });
    }
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

/**
 * Get All Signups Controller (with pagination)
 */
const getSignups = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await adminService.getSignups(page, limit);
    
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Error fetching signups:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get All Landlords Controller (with pagination)
 */
const getLandlords = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await adminService.getLandlords(page, limit);
    
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Error fetching landlords:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get All Farmers Controller (with pagination)
 */
const getFarmers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await adminService.getFarmers(page, limit);
    
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Error fetching farmers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get Dashboard Statistics Controller
 */
const getStats = async (req, res) => {
  try {
    const data = await adminService.getStats();
    
    res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  login,
  getSignups,
  getLandlords,
  getFarmers,
  getStats
};
