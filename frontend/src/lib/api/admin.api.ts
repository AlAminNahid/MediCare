import { request, API_URL } from './client';

export const adminApi = {
  getDashboard: () => request('/admin/dashboard'),
  getProfile: () => request('/admin/profile'),
  updateProfile: (data: object) =>
    request('/admin/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  getDoctors: () => request('/admin/doctors'),
  getPatients: () => request('/admin/patients'),
  getAppointments: () => request('/admin/appointments'),

  getMedicines: () => request('/admin/medicines'),
  addMedicine: (data: object) =>
    request('/admin/medicines', { method: 'POST', body: JSON.stringify(data) }),
  deleteMedicine: (id: number) => request(`/admin/medicines/${id}`, { method: 'DELETE' }),

  getBackups: () => request('/admin/backups'),
  createBackup: (fileName: string) =>
    request('/admin/backups', { method: 'POST', body: JSON.stringify({ fileName }) }),
  deleteBackup: (id: number) => request(`/admin/backups/${id}`, { method: 'DELETE' }),
  downloadBackup: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${API_URL}/api/admin/backups/download`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) throw new Error('Failed to generate backup');
    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="(.+?)"/);
    const fileName = match ? match[1] : `backup_${Date.now()}.sql`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return fileName;
  },

  getFeedbacks: () => request('/admin/feedback'),
  markFeedbackReviewed: (id: number) =>
    request(`/admin/feedback/${id}/reviewed`, { method: 'PATCH' }),
};
