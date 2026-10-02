import React, { useState, useEffect } from 'react';
import { doctorService } from '../services/authService';
import { Stethoscope, Calendar, Search, Star, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await doctorService.getDoctors();
        setDoctors(data);
      } catch (err) {
        console.error('Failed to fetch doctors', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const specialties = ['All', ...new Set(doctors.map((d) => d.specialty).filter(Boolean))];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

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
        <h1 className="text-2xl font-bold text-slate-800">Find & Book Doctors</h1>
        <p className="text-slate-500 text-sm">Choose from our certified healthcare specialists</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 shadow-sm"
          />
        </div>

        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 shadow-sm"
        >
          {specialties.map((spec) => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <Stethoscope className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 font-medium">No doctors found matching criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.doctor_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:border-blue-200 transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-blue-500/20">
                    {doctor.name.replace('Dr. ', '').charAt(0) || 'D'}
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{doctor.rating} ({doctor.reviews_count})</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 text-lg">{doctor.name}</h3>
                <p className="text-sm font-semibold text-blue-600 mb-2">{doctor.specialty}</p>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{doctor.bio || 'Experienced medical professional.'}</p>

                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-slate-400" />
                    <span>Experience: {doctor.experience || '5+ years'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>{doctor.email}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-slate-800 pt-1">
                    <span>Consultation Fee:</span>
                    <span className="text-blue-600 text-sm">₹{doctor.price}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/book-appointment', { state: { doctorId: doctor.doctor_id, doctorName: doctor.name } })}
                className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
              >
                <Calendar className="h-4 w-4" />
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
