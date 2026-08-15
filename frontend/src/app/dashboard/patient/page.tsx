'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarPlus, CalendarDays, FileText, ArrowRight, Heart, User, Phone, RefreshCw } from 'lucide-react';
import { api } from '@/services';
import Skeleton from '@/components/ui/Skeleton';
import type { Appointment, Prescription } from '@/types';
import { APPOINTMENT_STATUS_COLORS as STATUS_COLORS } from '@/constants/appointments';

interface Profile {
  fullName?: string;
  age?: number;
  gender?: string;
  phoneNumber?: string;
}

const quickLinks = [
  { label: 'Book Appointment', href: '/dashboard/patient/book-appointment', icon: <CalendarPlus className="h-5 w-5 text-indigo-600" />, bg: 'bg-indigo-50', desc: 'Schedule with a doctor' },
  { label: 'My Appointments', href: '/dashboard/patient/appointments', icon: <CalendarDays className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-50', desc: 'View & manage bookings' },
  { label: 'My Prescriptions', href: '/dashboard/patient/prescriptions', icon: <FileText className="h-5 w-5 text-green-600" />, bg: 'bg-green-50', desc: 'Digital prescriptions' },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function PatientDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([
      api.patient.getProfile(),
      api.patient.getAppointments(),
      api.patient.getPrescriptions(),
    ])
      .then(([p, appts, rx]) => {
        setProfile(p as Profile);
        setAppointments(appts as Appointment[]);
        setPrescriptions(rx as Prescription[]);
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
          <Skeleton className="h-8 w-60" />
          <Skeleton className="mt-3 h-6 w-32 rounded-full" />
        </div>

        {/* Stat cards skeleton */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <Skeleton className="mb-2 h-3 w-10" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>

        {/* Next appointment skeleton */}
        <Skeleton className="mb-3 h-4 w-40" />
        <div className="mb-8 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <Skeleton className="h-16 w-full" />
        </div>

        {/* Quick links skeleton */}
        <Skeleton className="mb-3 h-4 w-24" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <Skeleton className="h-11 w-11 flex-shrink-0 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="mb-1.5 h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const today = todayStr();
  const upcoming = appointments
    .filter((a) => a.date >= today && (a.status === 'Waiting' || a.status === 'Serving'))
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextAppointment = upcoming[0];

  const recentPrescriptions = [...prescriptions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const statCards = [
    { label: 'Upcoming', value: upcoming.length, accent: 'border-l-indigo-500' },
    { label: 'Total Appointments', value: appointments.length, accent: 'border-l-purple-500' },
    { label: 'Prescriptions', value: prescriptions.length, accent: 'border-l-green-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Heart className="h-4 w-4" />
          Patient Portal
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {profile?.fullName || 'Patient'}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {(profile?.age !== undefined || profile?.gender) && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              <User className="h-3.5 w-3.5" />
              {profile?.age !== undefined ? `${profile.age} yrs` : ''}{profile?.age !== undefined && profile?.gender ? ' · ' : ''}{profile?.gender || ''}
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
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map(({ label, value, accent }) => (
          <div key={label} className={`rounded-xl border border-slate-100 border-l-4 ${accent} bg-white p-5 shadow-sm`}>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Next appointment */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Next Appointment</h2>
        {upcoming.length > 0 && (
          <Link href="/dashboard/patient/appointments" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        {nextAppointment ? (
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                {nextAppointment.doctor?.fullName?.charAt(0) || 'D'}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{nextAppointment.doctor?.fullName}</p>
                <p className="text-sm text-slate-500">{nextAppointment.chamber?.name}</p>
                <p className="mt-1 text-xs text-slate-400">{nextAppointment.date} · Serial #{nextAppointment.serialNumber}</p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[nextAppointment.status] || 'bg-slate-100 text-slate-600'}`}>
              {nextAppointment.status}
            </span>
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400">
            No upcoming appointments.{' '}
            <Link href="/dashboard/patient/book-appointment" className="text-indigo-600 hover:underline">Book one now</Link>
          </div>
        )}
      </div>

      {/* Recent prescriptions */}
      {recentPrescriptions.length > 0 && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Recent Prescriptions</h2>
            <Link href="/dashboard/patient/prescriptions" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mb-8 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
            {recentPrescriptions.map((rx) => (
              <div key={rx.prescriptionId} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-slate-800">{rx.doctor?.fullName}</p>
                </div>
                <p className="text-xs text-slate-400">{rx.date}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Quick Access</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quickLinks.map(({ label, href, icon, bg, desc }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>{icon}</div>
              <div>
                <p className="font-medium text-slate-800 group-hover:text-indigo-600">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}
