'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Stethoscope, Users, CalendarDays, Pill, Building2, ArrowRight, TrendingUp, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '@/lib/api';
import Skeleton from '@/components/ui/Skeleton';
import type { Appointment } from '@/types';

interface TrendPoint {
  date: string;
  count: number;
}

interface Stats {
  totalDoctors: number;
  totalPatients: number;
  totalChambers: number;
  totalAppointments: number;
  totalMedicines: number;
  recentAppointments: Appointment[];
  appointmentTrend: TrendPoint[];
}

const STATUS_COLORS: Record<string, string> = {
  Waiting: 'bg-blue-50 text-blue-700',
  Serving: 'bg-amber-50 text-amber-700',
  Done: 'bg-green-50 text-green-700',
  Cancelled: 'bg-red-50 text-red-700',
  'No Show': 'bg-slate-100 text-slate-500',
};

const quickLinks = [
  { label: 'View Doctors', href: '/dashboard/admin/doctors', icon: <Stethoscope className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50' },
  { label: 'View Patients', href: '/dashboard/admin/patients', icon: <Users className="h-5 w-5 text-green-600" />, bg: 'bg-green-50' },
  { label: 'Appointments', href: '/dashboard/admin/appointments', icon: <CalendarDays className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-50' },
  { label: 'Medicines', href: '/dashboard/admin/medicines', icon: <Pill className="h-5 w-5 text-orange-600" />, bg: 'bg-orange-50' },
];

function formatDayLabel(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(() => {
    setLoading(true);
    setError('');
    api.admin
      .getDashboard()
      .then((data) => setStats(data as Stats))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

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
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <Skeleton className="mb-4 h-10 w-10 rounded-xl" />
              <Skeleton className="h-9 w-14" />
              <Skeleton className="mt-2 h-4 w-28" />
            </div>
          ))}
        </div>

        {/* Trend chart skeleton */}
        <Skeleton className="mb-3 h-4 w-32" />
        <div className="mb-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <Skeleton className="h-56 w-full" />
        </div>

        {/* Recent activity skeleton */}
        <Skeleton className="mb-3 h-4 w-32" />
        <div className="mb-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <Skeleton className="h-48 w-full" />
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
        { label: 'Total Doctors', value: stats.totalDoctors, icon: <Stethoscope className="h-5 w-5" />, accent: 'border-l-blue-500', iconColor: 'text-blue-600 bg-blue-50' },
        { label: 'Total Patients', value: stats.totalPatients, icon: <Users className="h-5 w-5" />, accent: 'border-l-green-500', iconColor: 'text-green-600 bg-green-50' },
        { label: 'Chambers', value: stats.totalChambers, icon: <Building2 className="h-5 w-5" />, accent: 'border-l-indigo-500', iconColor: 'text-indigo-600 bg-indigo-50' },
        { label: 'Appointments', value: stats.totalAppointments, icon: <CalendarDays className="h-5 w-5" />, accent: 'border-l-purple-500', iconColor: 'text-purple-600 bg-purple-50' },
        { label: 'Medicines', value: stats.totalMedicines, icon: <Pill className="h-5 w-5" />, accent: 'border-l-orange-500', iconColor: 'text-orange-600 bg-orange-50' },
      ]
    : [];

  const chartData = (stats?.appointmentTrend ?? []).map((p) => ({ ...p, label: formatDayLabel(p.date) }));
  const recentAppointments = stats?.recentAppointments ?? [];

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

      {error && (
        <div className="mb-8 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>
          <button
            onClick={loadDashboard}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Stats grid */}
      {stats && (
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {statCards.map(({ label, value, icon, accent, iconColor }) => (
            <div
              key={label}
              className={`rounded-xl border border-slate-100 border-l-4 ${accent} bg-white p-6 shadow-sm transition hover:shadow-md`}
            >
              <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconColor}`}>
                {icon}
              </div>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Appointment trend */}
      {stats && (
        <>
          <div className="mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Appointments, Last 14 Days</h2>
          </div>
          <div className="mb-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13 }} />
                <Bar dataKey="count" name="Appointments" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Recent activity */}
      {stats && (
        <>
          <div className="mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Recent Activity</h2>
          </div>
          <div className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {recentAppointments.length === 0 ? (
              <div className="py-16 text-center text-slate-400">No recent appointments</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    {['Serial', 'Doctor', 'Patient', 'Date', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAppointments.map((a) => (
                    <tr key={a.appointmentId} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-900">#{a.serialNumber}</td>
                      <td className="px-5 py-4 font-medium text-slate-900">{a.doctor?.fullName}</td>
                      <td className="px-5 py-4 text-slate-700">{a.patient?.fullName}</td>
                      <td className="px-5 py-4 text-slate-600">{a.date}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
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
