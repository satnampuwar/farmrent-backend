const Signup = require('../models/Signup');
const { connectDB } = require('../config/database');

/**
 * Create a new newsletter signup
 * @param {string} email - Email address
 * @returns {Promise<Object>} Success message
 */
const createSignup = async (email) => {
  await connectDB();
  
  // Check if email already exists
  const existingSignup = await Signup.findOne({ email });
  if (existingSignup) {
    return {
      success: true,
      message: 'Thank you for signing up!'
    };
  }
  
  const signup = new Signup({ email });
  await signup.save();
  
  return {
    success: true,
    message: 'Thank you for signing up!'
  };
};

module.exports = {
  createSignup
};
