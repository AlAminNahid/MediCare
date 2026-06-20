import { request } from './client';

export const doctorApi = {
  getProfile: () => request('/doctor/profile'),
  updateProfile: (data: object) =>
    request('/doctor/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  getAppointments: () => request('/doctor/appointments'),
  updateAppointment: (id: number, data: object) =>
    request(`/doctor/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getPatients: () => request('/doctor/patients'),

  getMedicines: () => request('/doctor/medicines'),
  createPrescription: (data: object) =>
    request('/doctor/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
  getPrescriptions: () => request('/doctor/prescriptions'),

  getSlots: () => request('/doctor/slots'),
  createSlot: (data: object) =>
    request('/doctor/slots', { method: 'POST', body: JSON.stringify(data) }),
  updateSlot: (id: number, data: object) =>
    request(`/doctor/slots/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSlot: (id: number) => request(`/doctor/slots/${id}`, { method: 'DELETE' }),
};
