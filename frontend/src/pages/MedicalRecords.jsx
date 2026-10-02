import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { medicalRecordService, patientService } from '../services/authService';
import { FileText, Plus, Upload, ExternalLink, User, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export const MedicalRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form modal state for Doctor/Admin
  const [showModal, setShowModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [title, setTitle] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [file, setFile] = useState(null);

  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchRecords = async () => {
    try {
      const data = await medicalRecordService.getRecords();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load medical records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    if (user.role === 'doctor' || user.role === 'admin') {
      patientService.getPatients().then((pData) => {
        setPatients(pData);
        if (pData.length > 0) setSelectedPatientId(pData[0].patient_id);
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!title) {
      setError('Title is required');
      return;
    }

    setFormLoading(true);

    try {
      const formData = new FormData();
      if (user.role !== 'patient' && selectedPatientId) {
        formData.append('patientId', selectedPatientId);
      }
      formData.append('title', title);
      if (diagnosis) formData.append('diagnosis', diagnosis);
      if (prescription) formData.append('prescription', prescription);
      if (doctorNotes) formData.append('doctorNotes', doctorNotes);
      if (file) formData.append('file', file);

      await medicalRecordService.createRecord(formData);
      setMessage('Medical record added successfully!');
      setShowModal(false);
      // Reset form
      setTitle('');
      setDiagnosis('');
      setPrescription('');
      setDoctorNotes('');
      setFile(null);
      await fetchRecords();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add medical record');
    } finally {
      setFormLoading(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medical Records</h1>
          <p className="text-slate-500 text-sm">View diagnoses, prescriptions, and health documents</p>
        </div>

        {user.role === 'patient' ? (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-md shadow-blue-500/20"
          >
            <Upload className="h-4 w-4" /> Upload Health Record / Report
          </button>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-md shadow-blue-500/20"
          >
            <Plus className="h-4 w-4" /> Add New Record
          </button>
        )}
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Modal for Adding Record / File Upload */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800">
              {user.role === 'patient' ? 'Upload Personal Health Record / Report' : 'Create Medical Record'}
            </h2>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {user.role !== 'patient' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    {patients.map((p) => (
                      <option key={p.patient_id} value={p.patient_id}>
                        {p.name} ({p.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Record Title / Document Name *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Blood Test Report, Chest X-Ray, Lab Results"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosis / Description (Optional)</label>
                <textarea
                  rows="2"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Additional notes or diagnosis summary..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Attach Report File (PDF or Image) *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  required={user.role === 'patient'}
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {formLoading ? 'Uploading...' : 'Upload Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Records List */}
      {records.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 font-medium">No medical records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {records.map((record) => (
            <div key={record.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{record.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(record.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <FileText className="h-5 w-5" />
                </div>
              </div>

              {user.role !== 'patient' && (
                <div className="text-xs text-slate-600 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-semibold">Patient:</span> {record.patient_name}
                </div>
              )}

              {record.doctor_name && (
                <div className="text-xs text-slate-600 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-semibold">Doctor:</span> Dr. {record.doctor_name} ({record.doctor_specialty})
                </div>
              )}

              {record.diagnosis && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs font-semibold text-slate-700 mb-1">Diagnosis</p>
                  <p className="text-xs text-slate-600">{record.diagnosis}</p>
                </div>
              )}

              {record.prescription && (
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <p className="text-xs font-semibold text-blue-800 mb-1">Prescription</p>
                  <p className="text-xs text-blue-900">{record.prescription}</p>
                </div>
              )}

              {record.file_url && (
                <a
                  href={`http://localhost:5000${record.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                >
                  <ExternalLink className="h-4 w-4" /> View Attached File
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
