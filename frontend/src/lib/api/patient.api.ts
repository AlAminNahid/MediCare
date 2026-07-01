import { request } from './client';

export const patientApi = {
  getProfile: () => request('/patient/profile'),
  updateProfile: (data: object) =>
    request('/patient/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  getDoctors: () => request('/patient/doctors'),
  getChambers: (doctorId: number) => request(`/patient/doctors/${doctorId}/chambers`),
  bookAppointment: (data: object) =>
    request('/patient/appointments', { method: 'POST', body: JSON.stringify(data) }),
  getAppointments: () => request('/patient/appointments'),
  cancelAppointment: (id: number) =>
    request(`/patient/appointments/${id}/cancel`, { method: 'PATCH' }),

  getPrescriptions: () => request('/patient/prescriptions'),
};
