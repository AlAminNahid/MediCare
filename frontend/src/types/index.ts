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

export interface Appointment {
  appointmentId: number;
  doctor: { fullName: string };
  patient: { fullName: string; phoneNumber: string };
  date: string;
  time: string;
  status: string;
  reason: string;
}

export interface Medicine {
  medicineId: number;
  name: string;
  type: string;
  strength: string;
  manufacturerName: string;
  status: 'Active' | 'Inactive';
}

export interface Backup {
  backupId: number;
  fileName: string;
  createdAt: string;
  createdBy: string;
}

export interface Slot {
  slotId: number;
  startTime: string;
  endTime: string;
  days: string[];
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
