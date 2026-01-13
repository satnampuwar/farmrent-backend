const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection - Optimized for serverless (Vercel)
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
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection (shorter for serverless)
      socketTimeoutMS: 45000, // 45 seconds timeout for socket operations
      connectTimeoutMS: 10000, // 10 seconds timeout for initial connection
      maxPoolSize: 1, // Reduced pool size for serverless (1 connection per function)
      minPoolSize: 0, // No minimum pool for serverless
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

// Initialize connection (non-blocking)
connectDB().catch(err => {
  console.error('Initial MongoDB connection failed:', err);
});

// Mongoose Schemas
const landlordSchema = new mongoose.Schema({
  county: { type: String, required: true },
  spi: { type: Number, default: null },
  acres: { type: Number, default: null },
  asking_price: { type: Number, required: true },
  email: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const farmerSchema = new mongoose.Schema({
  county: { type: String, required: true },
  offered_price: { type: Number, required: true },
  email: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

// Mongoose Models
const Landlord = mongoose.model('Landlord', landlordSchema);
const Farmer = mongoose.model('Farmer', farmerSchema);

// Brevo (Sendinblue) Email Configuration
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_USER || '9f1295001@smtp-brevo.com',
    pass: process.env.BREVO_SMTP_PASSWORD || process.env.BREVO_API_KEY
  }
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Brevo email configuration error:', error);
  } else {
    console.log('Brevo email server is ready to send messages');
  }
});

// Route for Landlord Post
app.post('/api/landlord', async (req, res) => {
  const { county, spi, acres, asking_price, email } = req.body;
  
  // Validation
  if (!county || !email || !asking_price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Ensure MongoDB connection before proceeding
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    return res.status(503).json({ 
      error: 'Database connection unavailable. Please try again later.' 
    });
  }
  
  try {
    const landlord = new Landlord({
      county,
      spi: spi || null,
      acres: acres || null,
      asking_price,
      email
    });
    
    const savedLandlord = await landlord.save();
    res.json({ 
      success: true, 
      message: 'Landlord post created successfully',
      id: savedLandlord._id 
    });
  } catch (err) {
    console.error('Database error:', err);
    // Handle specific MongoDB errors
    if (err.name === 'MongoServerError' || err.name === 'MongoNetworkError') {
      return res.status(503).json({ error: 'Database connection error. Please try again later.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Route for Farmer Interest (match and notify)
app.post('/api/farmer', async (req, res) => {
  const { county, offered_price, email } = req.body;

  if (!county || !email || !offered_price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Ensure MongoDB connection before proceeding
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    return res.status(503).json({ 
      error: 'Database connection unavailable. Please try again later.' 
    });
  }

  try {
    const farmer = new Farmer({
      county,
      offered_price,
      email,
    });

    await farmer.save();

    const landlords = await Landlord.find({
      county,
      asking_price: { $lte: offered_price },
    });

    if (landlords.length > 0) {
      const emailPromises = landlords.map((landlord) =>
        transporter.sendMail({
          from: process.env.BREVO_FROM_EMAIL || 'FarmRent AI <noreply@farmrent.ai>',
          to: landlord.email,
          subject: 'Farmer Interest in Your Land - FarmRent AI',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #28a745;">New Farmer Interest!</h2>
              <p>A farmer has expressed interest in land in <strong>${county}</strong> county.</p>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Farmer's Offer:</strong> $${offered_price}/acre</p>
                <p><strong>Your Asking Price:</strong> $${landlord.asking_price}/acre</p>
                <p><strong>Contact Farmer:</strong> ${email}</p>
              </div>
              <p style="color: #666; font-size: 14px;">This is an automated notification from FarmRent AI.</p>
            </div>
          `,
          text: `A farmer is willing to pay $${offered_price}/acre for land in ${county}. Contact them at ${email}.`
        }).catch(error => {
          console.error(`Error sending email to ${landlord.email}:`, error);
        })
      );

      // ✅ THIS IS CRITICAL - Wait for all emails to be sent
      await Promise.all(emailPromises);

      console.log(`Sent ${landlords.length} email(s) to landlords`);
    }

    res.json({
      success: true,
      message: 'Farmer interest submitted successfully',
      matches: landlords.length,
    });
  } catch (err) {
    console.error('Error:', err);
    // Handle specific MongoDB errors
    if (err.name === 'MongoServerError' || err.name === 'MongoNetworkError') {
      return res.status(503).json({ error: 'Database connection error. Please try again later.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Route for signup (newsletter)
app.post('/api/signup', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // You can add a signups table if needed
  res.json({ 
    success: true, 
    message: 'Thank you for signing up!' 
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FarmRent API is running' });
});

// Error handling middlewares
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export app for Vercel serverless (required)
module.exports = app;

// Start server for local development
if (require.main === module) {
  app.listen(port, () => {
    console.log(`FarmRent API server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown for local development
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    } catch (err) {
      console.error('Error closing database:', err.message);
      process.exit(1);
    }
  });
}

