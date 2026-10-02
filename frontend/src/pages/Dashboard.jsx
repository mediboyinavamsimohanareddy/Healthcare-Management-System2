import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService, appointmentService } from '../services/authService';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Find upcoming accepted/pending appointment deadline for patient
  const nextAppointment = appointments.find(
    (a) => a.status === 'Accepted' || a.status === 'Pending'
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'admin') {
          const statsData = await adminService.getStats();
          setStats(statsData);
        }
        const apptData = await appointmentService.getAppointments();
        setAppointments(apptData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Activity className="h-64 w-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-semibold backdrop-blur-md uppercase tracking-wider">
            {user.role} Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-3">
            {getGreeting()}, {user.name}! 👋
          </h1>
          <p className="text-blue-100 text-sm mt-2 leading-relaxed">
            Manage consultations, medical history, and appointments seamlessly from your centralized dashboard.
          </p>

          {/* Upcoming Appointment Deadline Badge */}
          {user.role === 'patient' && nextAppointment && (
            <div className="mt-4 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center gap-3 w-fit">
              <Clock className="h-5 w-5 text-amber-300 animate-pulse shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-300 uppercase tracking-wider block">Upcoming Consultation Deadline</span>
                <span className="text-white font-medium">
                  Dr. {nextAppointment.doctor_name} ({nextAppointment.doctor_specialty || 'General'}) • {nextAppointment.appointment_date} at {nextAppointment.appointment_time}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Stats Grid */}
      {user.role === 'admin' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalPatients}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Doctors</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalDoctors}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Stethoscope className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Appointments</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalAppointments}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Calendar className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingAppointments}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {/* Patient / Doctor Quick Actions */}
      {user.role === 'patient' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/book-appointment"
            className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-300 transition-all flex items-center gap-4 group"
          >
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Plus className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Book New Appointment</h3>
              <p className="text-xs text-slate-500">Find doctors and select a suitable date and time</p>
            </div>
          </Link>

          <Link
            to="/medical-records"
            className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-300 transition-all flex items-center gap-4 group"
          >
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">View Medical Records</h3>
              <p className="text-xs text-slate-500">Access your diagnoses, prescriptions and uploaded files</p>
            </div>
          </Link>
        </div>
      )}

      {/* Recent Appointments List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            {user.role === 'patient' ? 'Your Upcoming Appointments' : 'Recent Appointments'}
          </h2>
          <Link to="/appointments" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View All
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl">
            <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">No appointments found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.slice(0, 5).map((appt) => (
              <div key={appt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    {user.role === 'patient' ? `Dr. ${appt.doctor_name}` : appt.patient_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {appt.appointment_date} at {appt.appointment_time} {appt.doctor_specialty ? `• ${appt.doctor_specialty}` : ''}
                  </p>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      appt.status === 'Accepted'
                        ? 'bg-emerald-50 text-emerald-600'
                        : appt.status === 'Pending'
                        ? 'bg-amber-50 text-amber-600'
                        : appt.status === 'Cancelled' || appt.status === 'Rejected'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
