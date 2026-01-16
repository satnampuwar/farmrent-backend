const Farmer = require('../models/Farmer');
const Landlord = require('../models/Landlord');
const nodemailer = require('nodemailer');

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

/**
 * Create a new farmer interest and notify matching landlords
 * @param {Object} farmerData - Farmer data
 * @returns {Promise<Object>} Created farmer and match count
 */
const createFarmer = async (farmerData) => {
  // Connection is already established at app startup, no need to reconnect
  const farmer = new Farmer({
    county: farmerData.county,
    offered_price: farmerData.offered_price,
    email: farmerData.email,
  });

  await farmer.save();

  // Find matching landlords
  const landlords = await Landlord.find({
    county: farmerData.county,
    asking_price: { $lte: farmerData.offered_price },
  });

  // Send emails to matching landlords
  if (landlords.length > 0) {
    const emailPromises = landlords.map((landlord) =>
      transporter.sendMail({
        from: process.env.BREVO_FROM_EMAIL || 'FarmRent AI <noreply@farmrent.ai>',
        to: landlord.email,
        subject: 'Farmer Interest in Your Land - FarmRent AI',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">New Farmer Interest!</h2>
            <p>A farmer has expressed interest in land in <strong>${farmerData.county}</strong> county.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Farmer's Offer:</strong> $${farmerData.offered_price}/acre</p>
              <p><strong>Your Asking Price:</strong> $${landlord.asking_price}/acre</p>
              <p><strong>Contact Farmer:</strong> ${farmerData.email}</p>
            </div>
            <p style="color: #666; font-size: 14px;">This is an automated notification from FarmRent AI.</p>
          </div>
        `,
        text: `A farmer is willing to pay $${farmerData.offered_price}/acre for land in ${farmerData.county}. Contact them at ${farmerData.email}.`
      }).catch(error => {
        console.error(`Error sending email to ${landlord.email}:`, error);
      })
    );

    await Promise.all(emailPromises);
    console.log(`Sent ${landlords.length} email(s) to landlords`);
  }

  return {
    success: true,
    message: 'Farmer interest submitted successfully',
    matches: landlords.length,
  };
};

module.exports = {
  createFarmer
};
