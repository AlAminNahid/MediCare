'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Users, FileText, Clock, ArrowRight, Stethoscope, Phone, Wallet, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import Skeleton from '@/components/ui/Skeleton';
import type { Appointment } from '@/types';

interface Profile {
  fullName?: string;
  specialization?: string;
  visitFee?: number;
  phoneNumber?: string;
}

const quickLinks = [
  { label: 'Appointments', href: '/dashboard/doctor/appointments', icon: <CalendarDays className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-50' },
  { label: 'My Patients', href: '/dashboard/doctor/patients', icon: <Users className="h-5 w-5 text-green-600" />, bg: 'bg-green-50' },
  { label: 'Prescriptions', href: '/dashboard/doctor/prescriptions', icon: <FileText className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50' },
  { label: 'Chambers', href: '/dashboard/doctor/chambers', icon: <Clock className="h-5 w-5 text-orange-600" />, bg: 'bg-orange-50' },
];

const STATUS_COLORS: Record<string, string> = {
  Waiting: 'bg-blue-50 text-blue-700',
  Serving: 'bg-amber-50 text-amber-700',
  Done: 'bg-green-50 text-green-700',
  Cancelled: 'bg-red-50 text-red-700',
  'No Show': 'bg-slate-100 text-slate-500',
};

const QUEUE_PREVIEW_LIMIT = 8;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function DoctorDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([
      api.doctor.getProfile(),
      api.doctor.getAppointments({ date: todayStr() }),
      api.doctor.getPatients(),
    ])
      .then(([p, appts, patients]) => {
        setProfile(p as Profile);
        setTodayAppointments(appts as Appointment[]);
        setPatientCount((patients as unknown[]).length);
      })
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
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-3 h-6 w-32 rounded-full" />
        </div>

        {/* Stat cards skeleton */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <Skeleton className="mb-4 h-10 w-10 rounded-xl" />
              <Skeleton className="h-9 w-14" />
              <Skeleton className="mt-2 h-4 w-28" />
            </div>
          ))}
        </div>

        {/* Queue skeleton */}
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
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const waitingCount = todayAppointments.filter((a) => a.status === 'Waiting').length;

  const statCards = [
    { label: "Today's Appointments", value: todayAppointments.length, icon: <CalendarDays className="h-5 w-5" />, accent: 'border-l-purple-500', iconColor: 'text-purple-600 bg-purple-50' },
    { label: 'Waiting', value: waitingCount, icon: <Clock className="h-5 w-5" />, accent: 'border-l-amber-500', iconColor: 'text-amber-600 bg-amber-50' },
    { label: 'Total Patients', value: patientCount, icon: <Users className="h-5 w-5" />, accent: 'border-l-green-500', iconColor: 'text-green-600 bg-green-50' },
  ];

  const queuePreview = todayAppointments.slice(0, QUEUE_PREVIEW_LIMIT);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Stethoscope className="h-4 w-4" />
          Doctor Portal
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {profile?.fullName || 'Doctor'}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {profile?.specialization && (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {profile.specialization}
            </span>
          )}
          {profile?.visitFee !== undefined && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              <Wallet className="h-3.5 w-3.5" /> ৳{profile.visitFee} visit fee
            </span>
          )}
          {profile?.phoneNumber && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              <Phone className="h-3.5 w-3.5" /> {profile.phoneNumber}
            </span>
          )}
        </div>
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
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
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

      {/* Today's queue */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Today&apos;s Queue</h2>
        {todayAppointments.length > QUEUE_PREVIEW_LIMIT && (
          <Link href="/dashboard/doctor/appointments" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {queuePreview.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No patients booked for today</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {['Serial', 'Patient', 'Chamber', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queuePreview.map((a) => (
                <tr key={a.appointmentId} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">#{a.serialNumber}</td>
                  <td className="px-5 py-4 font-medium text-slate-900">{a.patient?.fullName}</td>
                  <td className="px-5 py-4 text-slate-600">{a.chamber?.name}</td>
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
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>{icon}</div>
              <span className="font-medium text-slate-700 group-hover:text-indigo-600">{label}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}
