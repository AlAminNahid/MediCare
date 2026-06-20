'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  CalendarDays,
  Pill,
  HardDrive,
  Settings,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Doctors', href: '/dashboard/admin/doctors', icon: <Stethoscope className="h-4 w-4" /> },
  { label: 'Patients', href: '/dashboard/admin/patients', icon: <Users className="h-4 w-4" /> },
  { label: 'Appointments', href: '/dashboard/admin/appointments', icon: <CalendarDays className="h-4 w-4" /> },
  { label: 'Medicines', href: '/dashboard/admin/medicines', icon: <Pill className="h-4 w-4" /> },
  { label: 'Backups', href: '/dashboard/admin/backups', icon: <HardDrive className="h-4 w-4" /> },
  { label: 'Settings', href: '/dashboard/admin/settings', icon: <Settings className="h-4 w-4" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout requiredRole="admin" navItems={navItems} roleLabel="Admin Portal">
      {children}
    </DashboardLayout>
  );
}
