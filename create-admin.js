/**
 * Script to create an admin user
 * Usage: node create-admin.js <email> <password>
 * Example: node create-admin.js admin@example.com mypassword123
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmrent';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'super_admin' },
  created_at: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node create-admin.js <email> <password>');
    console.error('Example: node create-admin.js admin@example.com mypassword123');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log(`Admin with email ${email} already exists.`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin
    const admin = new Admin({
      email,
      password: hashedPassword,
      role: 'super_admin'
    });

    await admin.save();
    console.log(`Admin created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`ID: ${admin._id}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    if (error.code === 11000) {
      console.error(`Admin with email ${email} already exists.`);
    }
    await mongoose.connection.close();
    process.exit(1);
  }
}

createAdmin();
