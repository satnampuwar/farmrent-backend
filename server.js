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

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmrent';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
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

// Nodemailer Transport Configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'yourgmail@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Route for Landlord Post
app.post('/api/landlord', async (req, res) => {
  const { county, spi, acres, asking_price, email } = req.body;
  
  // Validation
  if (!county || !email || !asking_price) {
    return res.status(400).json({ error: 'Missing required fields' });
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
    res.status(500).json({ error: err.message });
  }
});

// Route for Farmer Interest (match and notify)
app.post('/api/farmer', async (req, res) => {
  const { county, offered_price, email } = req.body;
  
  // Validation
  if (!county || !email || !offered_price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    // Save farmer interest
    const farmer = new Farmer({
      county,
      offered_price,
      email
    });
    
    const savedFarmer = await farmer.save();

    // Match landlords
    const landlords = await Landlord.find({
      county: county,
      asking_price: { $lte: offered_price }
    });

    // Send notifications to matched landlords
    if (landlords.length > 0) {
      const emailPromises = landlords.map(landlord => {
        const mailOptions = {
          from: process.env.EMAIL_USER || 'yourgmail@gmail.com',
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
        };
        
        return transporter.sendMail(mailOptions).catch(error => {
          console.error(`Error sending email to ${landlord.email}:`, error);
        });
      });
      
      Promise.all(emailPromises).then(() => {
        console.log(`Sent ${landlords.length} notification(s) to landlords`);
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Farmer interest submitted successfully',
      matches: landlords.length 
    });
  } catch (err) {
    console.error('Database error:', err);
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

app.listen(port, () => {
  console.log(`FarmRent API server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
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

