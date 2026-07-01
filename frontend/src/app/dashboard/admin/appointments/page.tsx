'use client';

import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { api } from '@/lib/api';
import type { Appointment, AppointmentStatus } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  Waiting: 'bg-blue-50 text-blue-700',
  Serving: 'bg-amber-50 text-amber-700',
  Done: 'bg-green-50 text-green-700',
  Cancelled: 'bg-red-50 text-red-700',
  'No Show': 'bg-slate-100 text-slate-500',
};

const ALL_STATUSES: AppointmentStatus[] = ['Waiting', 'Serving', 'Done', 'Cancelled', 'No Show'];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    api.admin
      .getAppointments()
      .then((d) => setAppointments(d as Appointment[]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
            <p className="text-sm text-slate-500">Platform-wide view of all appointments</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['All', ...ALL_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                filter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No appointments found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {['Serial', 'Doctor', 'Chamber', 'Patient', 'Date', 'Status', 'Reason'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a) => (
                <tr key={a.appointmentId} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">#{a.serialNumber}</td>
                  <td className="px-5 py-4 font-medium text-slate-900">{a.doctor?.fullName}</td>
                  <td className="px-5 py-4 text-slate-600">{a.chamber?.name}</td>
                  <td className="px-5 py-4 text-slate-700">{a.patient?.fullName}</td>
                  <td className="px-5 py-4 text-slate-600">{a.date}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 max-w-[180px] truncate">{a.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
