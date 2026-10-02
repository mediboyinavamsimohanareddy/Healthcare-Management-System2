# Healthcare Management System (Full Stack Web App)

A modern full-stack Healthcare Management System built using React.js, Node.js, Express.js, and MySQL.

## Features

- **Authentication & Security:** JWT-based authentication, password hashing with `bcryptjs`, protected routes, and role-based access control (Patient, Doctor, Admin).
- **Patient Module:** Account registration, profile management (age, blood group, emergency contact, medical history), doctor search, appointment booking, and medical records viewer.
- **Doctor Module:** Doctor directory, availability schedule, fee management, appointment request acceptance/rejection, and creation of medical records with prescriptions and diagnoses.
- **Appointment System:** Seamless booking workflow, doctor choice, date & time selection, status tracking (Pending, Accepted, Rejected, Cancelled), and appointment history.
- **Medical Records:** Centralized medical records with attachments support (images, PDFs), doctor notes, diagnoses, and prescriptions.
- **Admin Dashboard:** System-wide statistics (patients count, doctors count, appointment count, pending approvals), full management of doctors and patients.
- **Modern Responsive UI:** Built with Vite, React.js, Tailwind CSS v4, Lucide React icons, and mobile drawer navigation.

---

## Tech Stack

- **Frontend:** React.js, Vite, JavaScript, Tailwind CSS, React Router v6, Axios, Lucide Icons
- **Backend:** Node.js, Express.js, MySQL (via `mysql2` pool), JWT, BcryptJS, Multer
- **Database:** MySQL relational database with foreign key relationships, indexes, and constraints.

---

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- MySQL Server installed and running locally

### 2. Database Setup

1. Open your MySQL client (MySQL Workbench, Command Line, or phpMyAdmin).
2. Run the SQL script located in `backend/schema.sql` to create the `healthcare_management` database and required tables.
3. Configure your environment variables in `backend/.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=healthcare_management
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   JWT_SECRET=super_secret_healthcare_jwt_key
   ```
4. Seed the initial database with default admin and sample doctors:
   ```bash
   cd backend
   npm run init-db
   ```
   **Default Credentials Seeded:**
   - **Admin:** `admin@healthcare.com` / `admin123`
   - **Sample Doctor:** `sarah.jenkins@healthcare.com` / `doctor123`

---

### 3. Running the Backend Server

```bash
cd backend
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

---

### 4. Running the Frontend React App

```bash
cd frontend
npm install
npm run dev
```
The client will start on `http://localhost:3000`.

---

## API Endpoints Overview

### Auth
- `POST /api/auth/register` - Register a patient
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Patients
- `GET /api/patients` - Get all patients (Admin/Doctor)
- `GET /api/patients/:id` - Get patient profile
- `PUT /api/patients/profile` - Update patient profile
- `DELETE /api/patients/:id` - Delete patient record (Admin)

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor profile
- `POST /api/doctors` - Add new doctor (Admin)
- `PUT /api/doctors/:id` - Update doctor profile (Admin/Doctor)
- `DELETE /api/doctors/:id` - Delete doctor (Admin)

### Appointments
- `GET /api/appointments` - Get user/doctor appointments
- `POST /api/appointments` - Book appointment
- `PUT /api/appointments/:id` - Update status/reschedule
- `DELETE /api/appointments/:id` - Cancel appointment

### Medical Records
- `GET /api/medical-records` - Get medical records
- `POST /api/medical-records` - Create record with optional upload (Doctor/Admin)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
