const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');

// Public route
router.post('/login', adminController.login);

// Protected routes (require authentication)
router.get('/signups', authenticateAdmin, adminController.getSignups);
router.get('/landlords', authenticateAdmin, adminController.getLandlords);
router.get('/farmers', authenticateAdmin, adminController.getFarmers);
router.get('/stats', authenticateAdmin, adminController.getStats);

module.exports = router;
