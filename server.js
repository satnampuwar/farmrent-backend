const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const { connectDB, mongoose } = require('./config/database');
const { ensureSuperAdmin } = require('./utils/initAdmin');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Brevo (Sendinblue) Email Configuration
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
  secure: false,
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

// Initialize connection and create super admin if needed
connectDB()
  .then(async () => {
    // Wait a bit to ensure connection is fully established
    await new Promise(resolve => setTimeout(resolve, 1000));
    await ensureSuperAdmin();
  })
  .catch(err => {
    console.error('Initial MongoDB connection failed:', err);
  });

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

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
  app.listen(port, async () => {
    console.log(`FarmRent API server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Ensure super admin exists after server starts
    try {
      await ensureSuperAdmin();
    } catch (err) {
      console.error('Error ensuring super admin:', err.message);
    }
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
