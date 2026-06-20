import { authApi } from './auth.api';
import { adminApi } from './admin.api';
import { doctorApi } from './doctor.api';
import { patientApi } from './patient.api';

export const api = {
  ...authApi,
  admin: adminApi,
  doctor: doctorApi,
  patient: patientApi,
};

export { request } from './client';
