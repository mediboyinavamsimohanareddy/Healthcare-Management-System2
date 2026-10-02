const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../utils/upload');

router.get('/', authenticateToken, medicalRecordController.getMedicalRecords);
router.post('/', authenticateToken, authorizeRoles('patient', 'doctor', 'admin'), upload.single('file'), medicalRecordController.createMedicalRecord);
router.put('/:id', authenticateToken, authorizeRoles('doctor', 'admin'), upload.single('file'), medicalRecordController.updateMedicalRecord);

module.exports = router;
