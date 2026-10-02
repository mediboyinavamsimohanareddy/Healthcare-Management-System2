const pool = require('../config/db');

// Create Emergency Request
exports.createEmergencyRequest = async (req, res, next) => {
  try {
    const { patientName, contactNumber, locationAddress, emergencyType, notes } = req.body;
    if (!patientName || !contactNumber || !locationAddress) {
      return res.status(400).json({ error: 'Patient name, contact number, and location address are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO emergency_requests 
        (patient_name, contact_number, location_address, emergency_type, notes, status) 
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [patientName, contactNumber, locationAddress, emergencyType || 'General Emergency', notes || null]
    );

    res.status(201).json({
      message: 'Emergency request submitted successfully',
      requestId: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

// Get Dashboard Statistics
exports.getStats = async (req, res, next) => {
  try {
    const [[{ totalPatients }]] = await pool.query('SELECT COUNT(*) as totalPatients FROM patients');
    const [[{ totalDoctors }]] = await pool.query('SELECT COUNT(*) as totalDoctors FROM doctors');
    const [[{ totalAppointments }]] = await pool.query('SELECT COUNT(*) as totalAppointments FROM appointments');
    const [[{ pendingAppointments }]] = await pool.query('SELECT COUNT(*) as pendingAppointments FROM appointments WHERE status = "Pending"');
    const [[{ totalRecords }]] = await pool.query('SELECT COUNT(*) as totalRecords FROM medical_records');

    // Recent activity
    const [recentAppointments] = await pool.query(`
      SELECT a.id, a.appointment_date, a.appointment_time, a.status,
             u_p.name as patient_name, u_d.name as doctor_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u_p ON p.user_id = u_p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u_d ON d.user_id = u_d.id
      ORDER BY a.created_at DESC LIMIT 5
    `);

    res.json({
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      totalRecords,
      recentAppointments
    });
  } catch (err) {
    next(err);
  }
};
