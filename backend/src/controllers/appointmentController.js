const pool = require('../config/db');

// Book Appointment
exports.bookAppointment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { doctorId, date, time, notes } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ error: 'Doctor, date, and time are required' });
    }

    // Retrieve patient_id
    const [patients] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
    let patientId;
    if (patients.length === 0) {
      // Auto-create patient record if not exists
      const [resP] = await pool.query('INSERT INTO patients (user_id) VALUES (?)', [userId]);
      patientId = resP.insertId;
    } else {
      patientId = patients[0].id;
    }

    // Insert appointment
    const [result] = await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, notes, status) VALUES (?, ?, ?, ?, ?, "Pending")',
      [patientId, doctorId, date, time, notes || null]
    );

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointmentId: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

// Get All Appointments (Role filtered)
exports.getAppointments = async (req, res, next) => {
  try {
    const { user } = req;
    let query = `
      SELECT a.id, a.patient_id, a.doctor_id, a.appointment_date, a.appointment_time, a.status, a.notes, a.created_at,
             u_p.name as patient_name, u_p.email as patient_email, u_p.phone as patient_phone,
             p.age as patient_age, p.gender as patient_gender, p.blood_group as patient_blood_group,
             u_d.name as doctor_name, u_d.email as doctor_email, u_d.phone as doctor_phone, d.specialty as doctor_specialty
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u_p ON p.user_id = u_p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u_d ON d.user_id = u_d.id
    `;
    const params = [];

    if (user.role === 'patient') {
      query += ' WHERE p.user_id = ?';
      params.push(user.id);
    } else if (user.role === 'doctor') {
      query += ' WHERE d.user_id = ?';
      params.push(user.id);
    }

    query += ' ORDER BY a.appointment_date DESC, a.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Update Appointment Status (Doctor / Admin / Reschedule)
exports.updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, date, time, notes } = req.body;

    const [existing] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await pool.query(
      `UPDATE appointments SET 
        status = COALESCE(?, status), 
        appointment_date = COALESCE(?, appointment_date), 
        appointment_time = COALESCE(?, appointment_time), 
        notes = COALESCE(?, notes) 
       WHERE id = ?`,
      [status, date, time, notes, id]
    );

    res.json({ message: 'Appointment updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Cancel or Delete Appointment
exports.deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ message: 'Appointment removed successfully' });
  } catch (err) {
    next(err);
  }
};
