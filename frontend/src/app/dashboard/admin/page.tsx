'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stethoscope, Users, CalendarDays, Pill, ArrowRight, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import Skeleton from '@/components/ui/Skeleton';

interface Stats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  totalMedicines: number;
}

const quickLinks = [
  { label: 'Manage Doctors', href: '/dashboard/admin/doctors', icon: <Stethoscope className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50' },
  { label: 'Manage Patients', href: '/dashboard/admin/patients', icon: <Users className="h-5 w-5 text-green-600" />, bg: 'bg-green-50' },
  { label: 'Appointments', href: '/dashboard/admin/appointments', icon: <CalendarDays className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-50' },
  { label: 'Medicines', href: '/dashboard/admin/medicines', icon: <Pill className="h-5 w-5 text-orange-600" />, bg: 'bg-orange-50' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin
      .getDashboard()
      .then((data) => setStats(data as Stats))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="p-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-4 w-20" />
          <Skeleton className="h-8 w-52" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>

        {/* Stat cards skeleton */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <Skeleton className="mb-4 h-10 w-10 rounded-xl" />
              <Skeleton className="h-9 w-14" />
              <Skeleton className="mt-2 h-4 w-28" />
            </div>
          ))}
        </div>

        {/* Quick links skeleton */}
        <Skeleton className="mb-3 h-4 w-24" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <Skeleton className="h-10 w-10 flex-shrink-0 rounded-lg" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: 'Total Doctors', value: stats.totalDoctors, icon: <Stethoscope className="h-5 w-5" />, color: 'text-blue-600 bg-blue-100' },
        { label: 'Total Patients', value: stats.totalPatients, icon: <Users className="h-5 w-5" />, color: 'text-green-600 bg-green-100' },
        { label: 'Appointments', value: stats.totalAppointments, icon: <CalendarDays className="h-5 w-5" />, color: 'text-purple-600 bg-purple-100' },
        { label: 'Medicines', value: stats.totalMedicines, icon: <Pill className="h-5 w-5" />, color: 'text-orange-600 bg-orange-100' },
      ]
    : [];

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <TrendingUp className="h-4 w-4" />
          Overview
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-slate-500">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ label, value, icon, color }) => (
            <div key={label} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                {icon}
              </div>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Quick Access</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map(({ label, href, icon, bg }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                {icon}
              </div>
              <span className="font-medium text-slate-700 group-hover:text-indigo-600">{label}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-indigo-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}
