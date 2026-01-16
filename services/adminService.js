const Signup = require('../models/Signup');
const Landlord = require('../models/Landlord');
const Farmer = require('../models/Farmer');
const Admin = require('../models/Admin');

/**
 * Get paginated signups
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise<Object>} Paginated signups data
 */
const getSignups = async (page = 1, limit = 10) => {
  // Connection is already established at app startup, no need to reconnect
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;
  
  const [signups, total] = await Promise.all([
    Signup.find({})
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('_id email created_at')
      .lean(),
    Signup.countDocuments()
  ]);
  
  // Transform data to match expected format
  const formattedSignups = signups.map(signup => ({
    id: signup._id.toString(),
    email: signup.email,
    createdAt: signup.created_at
  }));
  
  return {
    data: formattedSignups,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1
    }
  };
};

/**
 * Get paginated landlords
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise<Object>} Paginated landlords data
 */
const getLandlords = async (page = 1, limit = 10) => {
  // Connection is already established at app startup, no need to reconnect
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;
  
  const [landlords, total] = await Promise.all([
    Landlord.find({})
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Landlord.countDocuments()
  ]);
  
  // Transform data to match expected format with field name variations
  const formattedLandlords = landlords.map(landlord => ({
    id: landlord._id.toString(),
    county: landlord.county,
    spi: landlord.spi,
    acres: landlord.acres,
    asking_price: landlord.asking_price,
    askingPrice: landlord.asking_price, // Support both formats
    email: landlord.email,
    createdAt: landlord.created_at,
    created_at: landlord.created_at, // Support both formats
    date: landlord.created_at // Support date format
  }));
  
  return {
    data: formattedLandlords,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1
    }
  };
};

/**
 * Get paginated farmers
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise<Object>} Paginated farmers data
 */
const getFarmers = async (page = 1, limit = 10) => {
  // Connection is already established at app startup, no need to reconnect
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;
  
  const [farmers, total] = await Promise.all([
    Farmer.find({})
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Farmer.countDocuments()
  ]);
  
  // Transform data to match expected format with field name variations
  const formattedFarmers = farmers.map(farmer => ({
    id: farmer._id.toString(),
    county: farmer.county,
    offered_price: farmer.offered_price,
    offeredPrice: farmer.offered_price, // Support both formats
    email: farmer.email,
    createdAt: farmer.created_at,
    created_at: farmer.created_at, // Support both formats
    date: farmer.created_at // Support date format
  }));
  
  return {
    data: formattedFarmers,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1
    }
  };
};

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Statistics data
 */
const getStats = async () => {
  // Connection is already established at app startup, no need to reconnect
  const [totalSignups, totalLandlords, totalFarmers] = await Promise.all([
    Signup.countDocuments(),
    Landlord.countDocuments(),
    Farmer.countDocuments()
  ]);
  
  return {
    totalSignups,
    totalLandlords,
    totalFarmers
  };
};

/**
 * Authenticate admin and generate JWT token
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<Object>} Token and admin data
 */
const loginAdmin = async (email, password) => {
  // Connection is already established at app startup, no need to reconnect
  const admin = await Admin.findOne({ email });
  
  if (!admin) {
    throw new Error('Invalid credentials');
  }
  
  const bcrypt = require('bcrypt');
  const isPasswordValid = await bcrypt.compare(password, admin.password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }
  
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { 
      id: admin._id.toString(), 
      email: admin.email 
    },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '24h' }
  );
  
  return {
    token,
    admin: {
      id: admin._id.toString(),
      email: admin.email
    }
  };
};

module.exports = {
  getSignups,
  getLandlords,
  getFarmers,
  getStats,
  loginAdmin
};
