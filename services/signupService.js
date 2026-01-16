const Signup = require('../models/Signup');

/**
 * Create a new newsletter signup
 * @param {string} email - Email address
 * @returns {Promise<Object>} Success message
 */
const createSignup = async (email) => {
  // Connection is already established at app startup, no need to reconnect
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
