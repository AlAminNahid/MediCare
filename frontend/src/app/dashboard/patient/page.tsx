'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CalendarPlus, CalendarDays, FileText, ArrowRight, Heart } from 'lucide-react';
import { api } from '@/lib/api';
import Skeleton from '@/components/ui/Skeleton';

const quickLinks = [
  { label: 'Book Appointment', href: '/dashboard/patient/book-appointment', icon: <CalendarPlus className="h-5 w-5 text-indigo-600" />, bg: 'bg-indigo-50', desc: 'Schedule with a doctor' },
  { label: 'My Appointments', href: '/dashboard/patient/appointments', icon: <CalendarDays className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-50', desc: 'View & manage bookings' },
  { label: 'My Prescriptions', href: '/dashboard/patient/prescriptions', icon: <FileText className="h-5 w-5 text-green-600" />, bg: 'bg-green-50', desc: 'Digital prescriptions' },
];

export default function PatientDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.patient
      .getProfile()
      .then(setProfile)
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="p-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-8 w-60" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>

        {/* Profile cards skeleton */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <Skeleton className="mb-2 h-3 w-10" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Heart className="h-4 w-4" />
          Patient Portal
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {profile?.fullName || 'Patient'}</h1>
        <p className="mt-1 text-slate-500">Manage your health appointments and prescriptions.</p>
      </div>

      {profile && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Age', value: profile.age ? `${profile.age} yrs` : '—' },
            { label: 'Gender', value: profile.gender || '—' },
            { label: 'Phone', value: profile.phoneNumber || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
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
