const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('Connecting to MySQL server...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('Creating database healthcare_management if not exists...');
    await connection.query('CREATE DATABASE IF NOT EXISTS healthcare_management;');
    await connection.query('USE healthcare_management;');

    console.log('Executing schema script...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    await connection.query(schemaSql);
    console.log('Database tables reset & created successfully.');

    // Seed Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    await connection.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      ['System Admin', 'admin@healthcare.com', '9876543210', adminPassword, 'admin']
    );
    console.log('Default admin created: admin@healthcare.com / admin123');

    // Seed 20 Indian Doctors
    const docPassword = await bcrypt.hash('doctor123', 10);
    
    const sampleDoctors = [
      { name: 'Dr. Rajesh Sharma', email: 'rajesh.sharma@healthcare.com', phone: '9876543210', specialty: 'Cardiology', experience: '15 years', bio: 'Senior Consultant Cardiologist specializing in interventional cardiology and heart wellness.', price: 800 },
      { name: 'Dr. Priya Ananth', email: 'priya.ananth@healthcare.com', phone: '9876543211', specialty: 'Dermatology', experience: '10 years', bio: 'Expert dermatologist in skin rejuvenation, laser treatments and cosmetic dermatology.', price: 600 },
      { name: 'Dr. Suresh Verma', email: 'suresh.verma@healthcare.com', phone: '9876543212', specialty: 'Pediatrics', experience: '12 years', bio: 'Senior Pediatrician dedicated to newborn care and adolescent development.', price: 500 },
      { name: 'Dr. Sunita Reddy', email: 'sunita.reddy@healthcare.com', phone: '9876543213', specialty: 'Neurology', experience: '14 years', bio: 'Consultant Neurologist specializing in brain disorders and stroke management.', price: 1000 },
      { name: 'Dr. Vikramaditya Rao', email: 'vikram.rao@healthcare.com', phone: '9876543214', specialty: 'Orthopedics', experience: '16 years', bio: 'Joint replacement specialist and orthopedic surgeon.', price: 900 },
      { name: 'Dr. Ananya Iyer', email: 'ananya.iyer@healthcare.com', phone: '9876543215', specialty: 'Gynecology', experience: '11 years', bio: 'Obstetrician and Gynecologist focused on high-risk pregnancy and women healthcare.', price: 700 },
      { name: 'Dr. Arjan Mehta', email: 'arjan.mehta@healthcare.com', phone: '9876543216', specialty: 'General Medicine', experience: '9 years', bio: 'General Physician specializing in preventive care and chronic disease management.', price: 400 },
      { name: 'Dr. Kavita Kulkarni', email: 'kavita.kulkarni@healthcare.com', phone: '9876543217', specialty: 'Ophthalmology', experience: '13 years', bio: 'Eye surgeon specializing in cataract surgeries and laser vision correction.', price: 650 },
      { name: 'Dr. Ramesh Choudhury', email: 'ramesh.c@healthcare.com', phone: '9876543218', specialty: 'ENT', experience: '8 years', bio: 'Ear, Nose, and Throat specialist with expertise in sinus treatments.', price: 500 },
      { name: 'Dr. Deepa Nair', email: 'deepa.nair@healthcare.com', phone: '9876543219', specialty: 'Endocrinology', experience: '10 years', bio: 'Diabetes and thyroid specialist focusing on hormonal health.', price: 750 },
      { name: 'Dr. Amit Patel', email: 'amit.patel@healthcare.com', phone: '9876543220', specialty: 'Gastroenterology', experience: '12 years', bio: 'Expert in digestive health, endoscopy, and liver disorders.', price: 850 },
      { name: 'Dr. Shalini Gupta', email: 'shalini.gupta@healthcare.com', phone: '9876543221', specialty: 'Psychiatry', experience: '9 years', bio: 'Compassionate psychiatrist focusing on stress, anxiety, and mental health care.', price: 700 },
      { name: 'Dr. Venkat Subramanian', email: 'venkat.subra@healthcare.com', phone: '9876543222', specialty: 'Nephrology', experience: '15 years', bio: 'Kidney care specialist expert in dialysis and kidney health.', price: 950 },
      { name: 'Dr. Neha Kapoor', email: 'neha.kapoor@healthcare.com', phone: '9876543223', specialty: 'Pulmonology', experience: '11 years', bio: 'Lung health and asthma specialist with extensive ICU care experience.', price: 750 },
      { name: 'Dr. Sanjay Deshmukh', email: 'sanjay.deshmukh@healthcare.com', phone: '9876543224', specialty: 'Urology', experience: '14 years', bio: 'Consultant Urologist specializing in minimally invasive laparoscopic surgery.', price: 900 },
      { name: 'Dr. Meenakshi Sundaram', email: 'meenakshi.s@healthcare.com', phone: '9876543225', specialty: 'Rheumatology', experience: '10 years', bio: 'Expert in arthritis, autoimmune diseases, and joint inflammation care.', price: 800 },
      { name: 'Dr. Harish Kumar', email: 'harish.kumar@healthcare.com', phone: '9876543226', specialty: 'Dentistry', experience: '7 years', bio: 'Cosmetic dentist and root canal treatment specialist.', price: 350 },
      { name: 'Dr. Ritu Malhotra', email: 'ritu.malhotra@healthcare.com', phone: '9876543227', specialty: 'Oncology', experience: '18 years', bio: 'Senior Medical Oncologist specializing in modern cancer care.', price: 1200 },
      { name: 'Dr. Kiran Mallya', email: 'kiran.mallya@healthcare.com', phone: '9876543228', specialty: 'Physiotherapy', experience: '8 years', bio: 'Sports injury rehabilitation and spine physical therapy expert.', price: 450 },
      { name: 'Dr. Arvind Swamy', email: 'arvind.swamy@healthcare.com', phone: '9876543229', specialty: 'Cardiology', experience: '20 years', bio: 'Senior Chief Cardiologist and heart surgeon.', price: 1500 }
    ];

    for (const doc of sampleDoctors) {
      const [uRes] = await connection.query(
        'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        [doc.name, doc.email, doc.phone, docPassword, 'doctor']
      );
      const userId = uRes.insertId;
      await connection.query(
        'INSERT INTO doctors (user_id, specialty, experience, bio, price) VALUES (?, ?, ?, ?, ?)',
        [userId, doc.specialty, doc.experience, doc.bio, doc.price]
      );
    }
    console.log('20 Indian sample doctors seeded successfully (password: doctor123).');

    await connection.end();
    console.log('Database re-initialization complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();
