const express = require('express');
const router = express.Router();
const landlordController = require('../controllers/landlordController');
const farmerController = require('../controllers/farmerController');
const signupController = require('../controllers/signupController');

// Public routes
router.post('/landlord', landlordController.createLandlord);
router.post('/farmer', farmerController.createFarmer);
router.post('/signup', signupController.createSignup);

module.exports = router;
