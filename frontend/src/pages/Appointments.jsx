import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/authService';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';

export const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id, status) => {
    setActionLoading(id);
    try {
      await appointmentService.updateAppointment(id, { status });
      await fetchAppointments();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setActionLoading(id);
    try {
      await appointmentService.cancelAppointment(id);
      await fetchAppointments();
    } catch (err) {
      console.error('Failed to cancel appointment', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {user.role === 'patient' ? 'My Appointments' : 'Appointments Management'}
        </h1>
        <p className="text-slate-500 text-sm">View and manage scheduled healthcare consultations</p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 font-medium">No appointments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">
                    {user.role === 'patient' ? 'Doctor' : 'Patient'}
                  </th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Notes</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      {user.role === 'patient' ? (
                        <div>
                          <p className="font-semibold text-slate-800">Dr. {appt.doctor_name}</p>
                          <p className="text-xs text-slate-500">{appt.doctor_specialty}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-slate-800">{appt.patient_name}</p>
                          <p className="text-xs text-slate-500">{appt.patient_email} • {appt.patient_phone || 'No phone'}</p>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{appt.appointment_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{appt.appointment_time}</span>
                      </div>
                    </td>

                    <td className="p-4">
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
                    </td>

                    <td className="p-4 text-xs text-slate-500 max-w-xs truncate">
                      {appt.notes || '—'}
                    </td>

                    <td className="p-4 text-right">
                      {actionLoading === appt.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 inline-block"></div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {(user.role === 'doctor' || user.role === 'admin') && appt.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(appt.id, 'Accepted')}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Accept
                              </button>
                              <button
                                onClick={() => handleStatusChange(appt.id, 'Rejected')}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Reject
                              </button>
                            </>
                          )}

                          {appt.status !== 'Cancelled' && appt.status !== 'Rejected' && (
                            <button
                              onClick={() => handleCancel(appt.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
