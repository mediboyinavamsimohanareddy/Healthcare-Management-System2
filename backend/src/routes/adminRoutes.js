const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/stats', authenticateToken, authorizeRoles('admin'), adminController.getStats);
router.post('/emergency-request', adminController.createEmergencyRequest);

module.exports = router;
