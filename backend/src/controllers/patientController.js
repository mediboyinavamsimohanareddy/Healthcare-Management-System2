const pool = require('../config/db');

// Get all patients (Admin / Doctor)
exports.getAllPatients = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id as patient_id, u.id as user_id, u.name, u.email, u.phone, 
             p.age, p.gender, p.blood_group, p.emergency_contact, p.medical_history, u.created_at
      FROM patients p
      JOIN users u ON p.user_id = u.id
      ORDER BY u.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Get single patient profile
exports.getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params; // patient_id or user_id check
    const [rows] = await pool.query(`
      SELECT p.id as patient_id, u.id as user_id, u.name, u.email, u.phone, 
             p.age, p.gender, p.blood_group, p.emergency_contact, p.medical_history, u.created_at
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ? OR p.user_id = ?
    `, [id, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// Create or update patient profile info
exports.updatePatientProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, phone, age, gender, bloodGroup, emergencyContact, medicalHistory, village, city, town, district, state, pincode } = req.body;

    // Update user table
    if (name || phone) {
      await pool.query('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?', [name, phone, userId]);
    }

    // Check if patient profile exists
    const [existing] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [userId]);

    if (existing.length === 0) {
      await pool.query(
        'INSERT INTO patients (user_id, age, gender, blood_group, emergency_contact, medical_history, village, city, town, district, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, age || null, gender || null, bloodGroup || null, emergencyContact || null, medicalHistory || null, village || null, city || null, town || null, district || null, state || null, pincode || null]
      );
    } else {
      await pool.query(
        `UPDATE patients SET 
          age = COALESCE(?, age), 
          gender = COALESCE(?, gender), 
          blood_group = COALESCE(?, blood_group), 
          emergency_contact = COALESCE(?, emergency_contact), 
          medical_history = COALESCE(?, medical_history),
          village = COALESCE(?, village),
          city = COALESCE(?, city),
          town = COALESCE(?, town),
          district = COALESCE(?, district),
          state = COALESCE(?, state),
          pincode = COALESCE(?, pincode)
         WHERE user_id = ?`,
        [age, gender, bloodGroup, emergencyContact, medicalHistory, village, city, town, district, state, pincode, userId]
      );
    }

    res.json({ message: 'Patient profile updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete patient (Admin)
exports.deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [patient] = await pool.query('SELECT user_id FROM patients WHERE id = ?', [id]);
    
    if (patient.length > 0) {
      await pool.query('DELETE FROM users WHERE id = ?', [patient[0].user_id]);
    } else {
      await pool.query('DELETE FROM users WHERE id = ? AND role = "patient"', [id]);
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    next(err);
  }
};
