const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmrent';

// Cache the connection to reuse in serverless environments
let cachedConnection = null;

// Enhanced MongoDB connection with proper timeout and error handling for serverless
const connectDB = async () => {
  // Return cached connection if available and connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // If connection exists but is disconnected, close it first
  if (cachedConnection && mongoose.connection.readyState !== 1) {
    await mongoose.connection.close().catch(() => {});
  }

  try {
    cachedConnection = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
      socketTimeoutMS: 45000, // 45 seconds timeout for socket operations
      connectTimeoutMS: 5000, // 5 seconds timeout for initial connection
      maxPoolSize: 10, // Increased pool size for better performance
      minPoolSize: 2, // Keep minimum connections alive for faster response
      retryWrites: true,
      w: 'majority'
    });

    console.log('Connected to MongoDB successfully');
    console.log(`Database: ${mongoose.connection.name}`);
    return cachedConnection;
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    console.error('Full error:', err);
    throw err;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
  cachedConnection = null; // Clear cache on error
});

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected from MongoDB');
  cachedConnection = null; // Clear cache on disconnect
});

module.exports = { connectDB, mongoose };
