const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, authorizeRoles('admin', 'doctor'), patientController.getAllPatients);
router.get('/:id', authenticateToken, patientController.getPatientById);
router.put('/profile', authenticateToken, authorizeRoles('patient'), patientController.updatePatientProfile);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), patientController.deletePatient);

module.exports = router;
