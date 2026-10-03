const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a user/patient
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = 'patient', age, gender, bloodGroup, emergencyContact, medicalHistory } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check existing email
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, hashedPassword, role]
    );

    const userId = result.insertId;

    // If patient, create patient profile
    if (role === 'patient') {
      await pool.query(
        'INSERT INTO patients (user_id, age, gender, blood_group, emergency_contact, medical_history) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, age || null, gender || null, bloodGroup || null, emergencyContact || null, medicalHistory || null]
      );
    } else if (role === 'doctor') {
      await pool.query(
        'INSERT INTO doctors (user_id, specialty, experience) VALUES (?, ?, ?)',
        [userId, req.body.specialty || 'General Physician', req.body.experience || '5 years']
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email, role, name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, name, email, role, phone }
    });
  } catch (err) {
    next(err);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Fetch related profile ID if patient or doctor
    let profileId = null;
    if (user.role === 'patient') {
      const [p] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [user.id]);
      if (p.length > 0) profileId = p[0].id;
    } else if (user.role === 'doctor') {
      const [d] = await pool.query('SELECT id FROM doctors WHERE user_id = ?', [user.id]);
      if (d.length > 0) profileId = d[0].id;
    }

    const token = jwt.sign(
      { id: user.id, profileId, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        profileId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get current profile
exports.getMe = async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    let extraDetails = {};

    if (user.role === 'patient') {
      const [p] = await pool.query('SELECT * FROM patients WHERE user_id = ?', [user.id]);
      if (p.length > 0) extraDetails = p[0];
    } else if (user.role === 'doctor') {
      const [d] = await pool.query('SELECT * FROM doctors WHERE user_id = ?', [user.id]);
      if (d.length > 0) extraDetails = d[0];
    }

    res.json({ ...user, ...extraDetails });
  } catch (err) {
    next(err);
  }
};
