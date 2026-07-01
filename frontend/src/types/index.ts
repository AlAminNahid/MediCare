export interface Doctor {
  doctorId: number;
  fullName: string;
  phoneNumber: string;
  specialization: string;
  visitFee: number;
}

export interface Patient {
  patientId: number;
  fullName: string;
  phoneNumber: string;
  age: number;
  gender: string;
  address: string;
}

export interface Chamber {
  chamberId: number;
  doctorId: number;
  name: string;
  address: string;
  days: string[];
  startTime: string;
  endTime: string;
  visitFee: number;
}

export type AppointmentStatus = 'Waiting' | 'Serving' | 'Done' | 'Cancelled' | 'No Show';

export interface Appointment {
  appointmentId: number;
  doctor: { fullName: string };
  patient: { fullName: string; phoneNumber: string };
  chamber: { name: string; address: string };
  date: string;
  serialNumber: number;
  status: AppointmentStatus;
  reason: string;
}

export interface Medicine {
  medicineId: number;
  name: string;
  type: string;
  strength: string;
  manufacturerName: string;
}

export interface Backup {
  backupId: number;
  fileName: string;
  createdAt: string;
  createdBy: string;
}

export interface Prescription {
  prescriptionId: number;
  patient: { fullName: string };
  doctor: { fullName: string };
  medicines: { name: string; dosage: string; duration: string }[];
  notes: string;
  createdAt: string;
}

export type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};
