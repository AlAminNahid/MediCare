'use client';

import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { api } from '@/lib/api';
import type { Appointment, AppointmentStatus, Chamber } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  Waiting: 'bg-blue-50 text-blue-700',
  Serving: 'bg-amber-50 text-amber-700',
  Done: 'bg-green-50 text-green-700',
  Cancelled: 'bg-red-50 text-red-700',
  'No Show': 'bg-slate-100 text-slate-500',
};

const STATUSES: AppointmentStatus[] = ['Waiting', 'Serving', 'Done', 'Cancelled', 'No Show'];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function DoctorAppointmentsPage() {
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [chamberId, setChamberId] = useState<number | 'all'>('all');
  const [date, setDate] = useState(todayStr());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    api.doctor.getChambers().then((d) => setChambers(d as Chamber[]));
  }, []);

  useEffect(() => {
    setLoading(true);
    api.doctor
      .getAppointments({ chamberId: chamberId === 'all' ? undefined : chamberId, date })
      .then((d) => setAppointments(d as Appointment[]))
      .finally(() => setLoading(false));
  }, [chamberId, date]);

  const handleStatusChange = async (appointmentId: number, status: AppointmentStatus) => {
    setUpdatingId(appointmentId);
    try {
      await api.doctor.updateAppointment(appointmentId, { status });
      setAppointments((prev) =>
        prev.map((a) => (a.appointmentId === appointmentId ? { ...a, status } : a)),
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Today&apos;s Queue</h1>
            <p className="text-sm text-slate-500">{appointments.length} patients in serial order</p>
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={chamberId}
            onChange={(e) => setChamberId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Chambers</option>
            {chambers.map((c) => (
              <option key={c.chamberId} value={c.chamberId}>{c.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No patients booked for this day</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {['Serial', 'Patient', 'Phone', 'Chamber', 'Reason', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((a) => (
                <tr key={a.appointmentId} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">#{a.serialNumber}</td>
                  <td className="px-5 py-4 font-medium text-slate-900">{a.patient?.fullName}</td>
                  <td className="px-5 py-4 text-slate-600">{a.patient?.phoneNumber}</td>
                  <td className="px-5 py-4 text-slate-600">{a.chamber?.name}</td>
                  <td className="px-5 py-4 text-slate-600 max-w-[180px] truncate">{a.reason}</td>
                  <td className="px-5 py-4">
                    <select
                      value={a.status}
                      disabled={updatingId === a.appointmentId}
                      onChange={(e) => handleStatusChange(a.appointmentId, e.target.value as AppointmentStatus)}
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
