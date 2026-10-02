import React, { useState } from 'react';
import { PhoneCall, AlertTriangle, ShieldAlert, HeartPulse, Send, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const Emergency = () => {
  const [patientName, setPatientName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [emergencyType, setEmergencyType] = useState('Accident / Trauma');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleCall = (phoneNumber) => {
    // Direct window location trigger as fallback
    try {
      window.open(`tel:${phoneNumber}`, '_self');
    } catch (e) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      await api.post('/admin/emergency-request', {
        patientName,
        contactNumber,
        locationAddress,
        emergencyType,
        notes
      });

      setSuccess('Emergency request submitted! Dispatch team has been notified.');
      setPatientName('');
      setContactNumber('');
      setLocationAddress('');
      setNotes('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send emergency request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Emergency & Helplines</h1>
        <p className="text-slate-500 text-sm">Immediate contact numbers and 24/7 emergency dispatch requests</p>
      </div>

      {/* Main Dial Banner */}
      <a
        href="tel:102"
        onClick={() => handleCall('102')}
        className="bg-red-500 hover:bg-red-600 transition-all cursor-pointer rounded-2xl p-6 text-white shadow-xl flex items-center justify-between group block text-left"
      >
        <div>
          <span className="bg-red-600 group-hover:bg-red-700 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            24/7 National Emergency (Click to Call)
          </span>
          <h2 className="text-3xl font-extrabold mt-2 flex items-center gap-2">
            <span>Dial 102 / 911</span>
          </h2>
          <p className="text-red-100 text-sm mt-1">Tap here to trigger phone call dialer</p>
        </div>
        <div className="p-4 bg-white/10 group-hover:bg-white/20 rounded-2xl transition-all">
          <PhoneCall className="h-10 w-10 animate-pulse" />
        </div>
      </a>

      {/* Direct Call Helpline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a 
          href="tel:18005550199"
          onClick={() => handleCall('18005550199')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-red-200 hover:shadow-md transition-all cursor-pointer space-y-2 group block text-left"
        >
          <div className="p-3 bg-red-50 text-red-600 rounded-xl w-fit group-hover:bg-red-100 transition-colors">
            <HeartPulse className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800">Ambulance Dispatch Hotline</h3>
          <p className="text-xs text-slate-500">Fast-response medical transport units nearby</p>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm pt-2">
            <PhoneCall className="h-4 w-4" />
            <span>+1 (800) 555-0199</span>
          </div>
        </a>

        <a 
          href="tel:18005550122"
          onClick={() => handleCall('18005550122')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-200 hover:shadow-md transition-all cursor-pointer space-y-2 group block text-left"
        >
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit group-hover:bg-amber-100 transition-colors">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800">Hospital Emergency Room Desk</h3>
          <p className="text-xs text-slate-500">24/7 Trauma center and emergency department</p>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm pt-2">
            <PhoneCall className="h-4 w-4" />
            <span>+1 (800) 555-0122</span>
          </div>
        </a>
      </div>

      {/* Emergency Dispatch Request Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-3">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          <h3 className="font-bold text-base">Send Emergency Dispatch Request</h3>
        </div>

        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Patient / Requester Name *</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="John Doe"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone Number *</label>
              <input
                type="text"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup / Emergency Location Address *</label>
              <input
                type="text"
                required
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="House no, Street, Area, Landmark"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Type</label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                <option value="Accident / Trauma">Accident / Trauma</option>
                <option value="Cardiac Emergency">Cardiac Emergency</option>
                <option value="Respiratory Distress">Respiratory Distress</option>
                <option value="Pregnancy / Maternity">Pregnancy / Maternity</option>
                <option value="Other Medical Crisis">Other Medical Crisis</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Patient condition or specific details..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>{loading ? 'Dispatching Request...' : 'Send Emergency Dispatch Request'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
