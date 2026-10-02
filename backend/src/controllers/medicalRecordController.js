const pool = require('../config/db');

// Create Medical Record
exports.createMedicalRecord = async (req, res, next) => {
  try {
    const { patientId, appointmentId, title, diagnosis, prescription, doctorNotes } = req.body;
    let doctorId = null;
    let uploadedRole = req.user.role;

    let targetPatientId = patientId;

    if (req.user.role === 'patient') {
      const [pts] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);
      if (pts.length > 0) {
        targetPatientId = pts[0].id;
      } else {
        // Auto-create patient record if not present
        const [resP] = await pool.query('INSERT INTO patients (user_id) VALUES (?)', [req.user.id]);
        targetPatientId = resP.insertId;
      }
    } else if (req.user.role === 'doctor') {
      const [docs] = await pool.query('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
      if (docs.length > 0) doctorId = docs[0].id;
    }

    if (!targetPatientId || !title) {
      return res.status(400).json({ error: 'Patient ID and Title are required' });
    }

    let fileUrl = null;
    let fileType = null;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileType = req.file.mimetype.includes('image') ? 'image' : 'pdf';
    }

    const [result] = await pool.query(
      `INSERT INTO medical_records 
        (patient_id, doctor_id, appointment_id, title, diagnosis, prescription, doctor_notes, uploaded_by_role, file_url, file_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [targetPatientId, doctorId, appointmentId || null, title, diagnosis || null, prescription || null, doctorNotes || null, uploadedRole, fileUrl, fileType]
    );

    res.status(201).json({
      message: 'Medical record uploaded successfully',
      recordId: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

// Get Medical Records (Role filtered or by patient ID)
exports.getMedicalRecords = async (req, res, next) => {
  try {
    const { user } = req;
    const { patientId } = req.query;

    let query = `
      SELECT mr.id, mr.patient_id, mr.doctor_id, mr.appointment_id, mr.title, 
             mr.diagnosis, mr.prescription, mr.doctor_notes, mr.file_url, mr.file_type, mr.created_at,
             u_p.name as patient_name,
             u_d.name as doctor_name, d.specialty as doctor_specialty
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      JOIN users u_p ON p.user_id = u_p.id
      LEFT JOIN doctors d ON mr.doctor_id = d.id
      LEFT JOIN users u_d ON d.user_id = u_d.id
    `;
    const params = [];

    if (user.role === 'patient') {
      query += ' WHERE p.user_id = ?';
      params.push(user.id);
    } else if (patientId) {
      query += ' WHERE mr.patient_id = ? OR p.user_id = ?';
      params.push(patientId, patientId);
    }

    query += ' ORDER BY mr.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Update Medical Record
exports.updateMedicalRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, diagnosis, prescription, doctorNotes } = req.body;

    let fileUrl = undefined;
    let fileType = undefined;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileType = req.file.mimetype.includes('image') ? 'image' : 'pdf';
    }

    await pool.query(
      `UPDATE medical_records SET 
        title = COALESCE(?, title), 
        diagnosis = COALESCE(?, diagnosis), 
        prescription = COALESCE(?, prescription), 
        doctor_notes = COALESCE(?, doctor_notes),
        file_url = COALESCE(?, file_url),
        file_type = COALESCE(?, file_type)
       WHERE id = ?`,
      [title, diagnosis, prescription, doctorNotes, fileUrl, fileType, id]
    );

    res.json({ message: 'Medical record updated successfully' });
  } catch (err) {
    next(err);
  }
};
