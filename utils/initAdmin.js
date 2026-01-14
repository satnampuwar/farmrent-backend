const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const { connectDB, mongoose } = require('../config/database');

/**
 * Ensure super admin exists in database
 * Creates one if it doesn't exist
 */
const ensureSuperAdmin = async () => {
  try {
    // Wait for database connection
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // Check if any super admin exists
    const existingAdmin = await Admin.findOne({ role: 'super_admin' });
    
    if (existingAdmin) {
      console.log('Super admin already exists in database.');
      return;
    }

    // Get default admin credentials from environment variables
    const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@farmrent.ai';
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    // Create super admin
    const superAdmin = new Admin({
      email: defaultEmail,
      password: hashedPassword,
      role: 'super_admin'
    });

    await superAdmin.save();
    console.log('✅ Super admin created successfully!');
    console.log(`   Email: ${defaultEmail}`);
    console.log(`   Password: ${defaultPassword}`);
    console.log('   ⚠️  Please change the default password after first login!');
  } catch (error) {
    // If admin already exists (race condition), that's fine
    if (error.code === 11000) {
      console.log('Super admin already exists in database.');
    } else {
      console.error('Error creating super admin:', error.message);
    }
  }
};

module.exports = { ensureSuperAdmin };
