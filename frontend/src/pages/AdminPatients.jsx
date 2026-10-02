import React, { useState, useEffect } from 'react';
import { patientService } from '../services/authService';
import { Users, Trash2, Mail, Phone, Calendar } from 'lucide-react';

export const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const data = await patientService.getPatients();
      setPatients(data);
    } catch (err) {
      console.error('Failed to load patients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient record?')) return;
    try {
      await patientService.deletePatient(id);
      await fetchPatients();
    } catch (err) {
      console.error('Failed to delete patient', err);
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
        <h1 className="text-2xl font-bold text-slate-800">Manage Patients</h1>
        <p className="text-slate-500 text-sm">View registered patient profiles and medical records history</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-4">Patient Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Details</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p) => (
                <tr key={p.patient_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-800">{p.phone || 'N/A'}</p>
                    <p className="text-xs text-slate-500">Emergency: {p.emergency_contact || 'N/A'}</p>
                  </td>
                  <td className="p-4 text-xs">
                    <p><span className="font-semibold">Age/Gender:</span> {p.age || 'N/A'} / {p.gender || 'N/A'}</p>
                    <p><span className="font-semibold">Blood Group:</span> {p.blood_group || 'N/A'}</p>
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(p.patient_id)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
