import { request } from './client';

export const authApi = {
  login: (email: string, password: string) =>
    request<{ access_token: string; role: string; adminId?: number; doctorId?: number; patientId?: number }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),

  register: (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    role: string;
    password: string;
  }) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  forgotPassword: (email: string, newPassword: string) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email, newPassword }) }),
};
