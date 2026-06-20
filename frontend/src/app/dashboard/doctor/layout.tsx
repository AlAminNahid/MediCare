'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  Clock,
  Settings,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard/doctor', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Appointments', href: '/dashboard/doctor/appointments', icon: <CalendarDays className="h-4 w-4" /> },
  { label: 'My Patients', href: '/dashboard/doctor/patients', icon: <Users className="h-4 w-4" /> },
  { label: 'Prescriptions', href: '/dashboard/doctor/prescriptions', icon: <FileText className="h-4 w-4" /> },
  { label: 'Slots', href: '/dashboard/doctor/slots', icon: <Clock className="h-4 w-4" /> },
  { label: 'Settings', href: '/dashboard/doctor/settings', icon: <Settings className="h-4 w-4" /> },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout requiredRole="doctor" navItems={navItems} roleLabel="Doctor Portal">
      {children}
    </DashboardLayout>
  );
}
