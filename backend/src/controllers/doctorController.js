const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Get all doctors
exports.getAllDoctors = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.id as doctor_id, u.id as user_id, u.name, u.email, u.phone, 
             d.specialty, d.experience, d.bio, d.profile_image, d.rating, d.reviews_count, d.price, d.availability
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      ORDER BY u.name ASC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Get single doctor details
exports.getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT d.id as doctor_id, u.id as user_id, u.name, u.email, u.phone, 
             d.specialty, d.experience, d.bio, d.profile_image, d.rating, d.reviews_count, d.price, d.availability
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ? OR d.user_id = ?
    `, [id, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// Create new Doctor (Admin or Doctor Register)
exports.createDoctor = async (req, res, next) => {
  try {
    const { name, email, password, phone, specialty, experience, bio, price, availability } = req.body;

    if (!name || !email || !password || !specialty) {
      return res.status(400).json({ error: 'Name, email, password, and specialty are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [uResult] = await pool.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, "doctor")',
      [name, email, phone || null, hashedPassword]
    );

    const userId = uResult.insertId;

    const [dResult] = await pool.query(
      'INSERT INTO doctors (user_id, specialty, experience, bio, price, availability) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, specialty, experience || '', bio || '', price || 500, availability || 'Mon - Fri (09:00 AM - 05:00 PM)']
    );

    res.status(201).json({
      message: 'Doctor created successfully',
      doctorId: dResult.insertId,
      userId
    });
  } catch (err) {
    next(err);
  }
};

// Update Doctor profile
exports.updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, specialty, experience, bio, price, availability } = req.body;

    // Get doctor record
    const [docs] = await pool.query('SELECT user_id FROM doctors WHERE id = ? OR user_id = ?', [id, id]);
    if (docs.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const userId = docs[0].user_id;

    if (name || phone) {
      await pool.query('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?', [name, phone, userId]);
    }

    await pool.query(
      `UPDATE doctors SET 
        specialty = COALESCE(?, specialty), 
        experience = COALESCE(?, experience), 
        bio = COALESCE(?, bio), 
        price = COALESCE(?, price), 
        availability = COALESCE(?, availability) 
       WHERE user_id = ?`,
      [specialty, experience, bio, price, availability, userId]
    );

    res.json({ message: 'Doctor profile updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete Doctor (Admin)
exports.deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [docs] = await pool.query('SELECT user_id FROM doctors WHERE id = ?', [id]);
    
    if (docs.length > 0) {
      await pool.query('DELETE FROM users WHERE id = ?', [docs[0].user_id]);
    } else {
      await pool.query('DELETE FROM users WHERE id = ? AND role = "doctor"', [id]);
    }

    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    next(err);
  }
};
