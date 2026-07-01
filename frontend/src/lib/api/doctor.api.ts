import { request } from './client';

export const doctorApi = {
  getProfile: () => request('/doctor/profile'),
  updateProfile: (data: object) =>
    request('/doctor/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  getAppointments: (params?: { chamberId?: number; date?: string }) => {
    const query = new URLSearchParams();
    if (params?.chamberId) query.set('chamberId', String(params.chamberId));
    if (params?.date) query.set('date', params.date);
    const qs = query.toString();
    return request(`/doctor/appointments${qs ? `?${qs}` : ''}`);
  },
  updateAppointment: (id: number, data: object) =>
    request(`/doctor/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getPatients: () => request('/doctor/patients'),

  getMedicines: () => request('/doctor/medicines'),
  searchMedicines: (q: string) =>
    request(`/doctor/medicines?search=${encodeURIComponent(q)}`),
  createPrescription: (data: object) =>
    request('/doctor/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
  getPrescriptions: () => request('/doctor/prescriptions'),

  getChambers: () => request('/doctor/chambers'),
  createChamber: (data: object) =>
    request('/doctor/chambers', { method: 'POST', body: JSON.stringify(data) }),
  updateChamber: (id: number, data: object) =>
    request(`/doctor/chambers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteChamber: (id: number) => request(`/doctor/chambers/${id}`, { method: 'DELETE' }),

  submitFeedback: (data: object) =>
    request('/doctor/feedback', { method: 'POST', body: JSON.stringify(data) }),
};
