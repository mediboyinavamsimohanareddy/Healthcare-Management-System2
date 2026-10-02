const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);
router.post('/', authenticateToken, authorizeRoles('admin'), doctorController.createDoctor);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'doctor'), doctorController.updateDoctor);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), doctorController.deleteDoctor);

module.exports = router;
