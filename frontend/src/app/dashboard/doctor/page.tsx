'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CalendarDays, Users, FileText, Clock, ArrowRight, Stethoscope } from 'lucide-react';
import { api } from '@/lib/api';
import Skeleton from '@/components/ui/Skeleton';

const quickLinks = [
  { label: 'Appointments', href: '/dashboard/doctor/appointments', icon: <CalendarDays className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-50' },
  { label: 'My Patients', href: '/dashboard/doctor/patients', icon: <Users className="h-5 w-5 text-green-600" />, bg: 'bg-green-50' },
  { label: 'Prescriptions', href: '/dashboard/doctor/prescriptions', icon: <FileText className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50' },
  { label: 'Slots', href: '/dashboard/doctor/slots', icon: <Clock className="h-5 w-5 text-orange-600" />, bg: 'bg-orange-50' },
];

export default function DoctorDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.doctor
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
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-3 h-6 w-32 rounded-full" />
        </div>

        {/* Info cards skeleton */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <Skeleton className="mb-2 h-4 w-16" />
              <Skeleton className="h-9 w-24" />
            </div>
          ))}
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
        {profile?.specialization && (
          <span className="mt-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            {profile.specialization}
          </span>
        )}
      </div>

      {profile && (
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Visit Fee</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">৳{profile.visitFee}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Phone</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{profile.phoneNumber}</p>
          </div>
        </div>
      )}

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
