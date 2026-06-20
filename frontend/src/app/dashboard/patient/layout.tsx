'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarDays,
  FileText,
  UserCircle,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard/patient', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Book Appointment', href: '/dashboard/patient/book-appointment', icon: <CalendarPlus className="h-4 w-4" /> },
  { label: 'My Appointments', href: '/dashboard/patient/appointments', icon: <CalendarDays className="h-4 w-4" /> },
  { label: 'My Prescriptions', href: '/dashboard/patient/prescriptions', icon: <FileText className="h-4 w-4" /> },
  { label: 'My Profile', href: '/dashboard/patient/profile', icon: <UserCircle className="h-4 w-4" /> },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout requiredRole="patient" navItems={navItems} roleLabel="Patient Portal">
      {children}
    </DashboardLayout>
  );
}
