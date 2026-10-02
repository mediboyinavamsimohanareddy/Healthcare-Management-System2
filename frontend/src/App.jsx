import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { DoctorsList } from './pages/DoctorsList';
import { BookAppointment } from './pages/BookAppointment';
import { Appointments } from './pages/Appointments';
import { MedicalRecords } from './pages/MedicalRecords';
import { Profile } from './pages/Profile';
import { Emergency } from './pages/Emergency';
import { AdminDoctors } from './pages/AdminDoctors';
import { AdminPatients } from './pages/AdminPatients';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes inside Main Layout */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/*"
              element={
                <MainLayout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/doctors" element={<DoctorsList />} />
                    <Route path="/book-appointment" element={<BookAppointment />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/medical-records" element={<MedicalRecords />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/emergency" element={<Emergency />} />

                    {/* Admin Specific Routes */}
                    <Route
                      element={<ProtectedRoute allowedRoles={['admin']} />}
                    >
                      <Route path="/admin/doctors" element={<AdminDoctors />} />
                      <Route path="/admin/patients" element={<AdminPatients />} />
                    </Route>

                    {/* Default Fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </MainLayout>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
