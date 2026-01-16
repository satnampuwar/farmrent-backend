const signupService = require('../services/signupService');

/**
 * Create Newsletter Signup Controller
 */
const createSignup = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    const result = await signupService.createSignup(email);
    res.json(result);
  } catch (err) {
    console.error('Database error:', err);
    // Handle duplicate key error gracefully
    if (err.code === 11000) {
      return res.json({ 
        success: true, 
        message: 'Thank you for signing up!' 
      });
    }
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSignup
};
