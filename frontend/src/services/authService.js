import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const patientService = {
  getPatients: async () => {
    const response = await api.get('/patients');
    return response.data;
  },
  getPatientById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('/patients/profile', data);
    return response.data;
  },
  deletePatient: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },
};

export const doctorService = {
  getDoctors: async () => {
    const response = await api.get('/doctors');
    return response.data;
  },
  getDoctorById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },
  createDoctor: async (data) => {
    const response = await api.post('/doctors', data);
    return response.data;
  },
  updateDoctor: async (id, data) => {
    const response = await api.put(`/doctors/${id}`, data);
    return response.data;
  },
  deleteDoctor: async (id) => {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
  },
};

export const appointmentService = {
  getAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },
  bookAppointment: async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },
  updateAppointment: async (id, data) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },
  cancelAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
};

export const medicalRecordService = {
  getRecords: async (patientId) => {
    const response = await api.get('/medical-records', {
      params: patientId ? { patientId } : {},
    });
    return response.data;
  },
  createRecord: async (formData) => {
    const response = await api.post('/medical-records', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};
