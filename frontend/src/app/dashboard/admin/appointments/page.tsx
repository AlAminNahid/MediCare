'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Trash2, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Appointment {
  appointmentId: number;
  doctor: { fullName: string };
  patient: { fullName: string };
  date: string;
  time: string;
  status: string;
  reason: string;
}

const STATUS_COLORS: Record<string, string> = {
  Booked: 'bg-blue-50 text-blue-700',
  Approved: 'bg-green-50 text-green-700',
  Cancelled: 'bg-red-50 text-red-700',
  Rescheduled: 'bg-amber-50 text-amber-700',
};

const ALL_STATUSES = ['Booked', 'Approved', 'Cancelled', 'Rescheduled'];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.admin
      .getAppointments()
      .then((d) => setAppointments(d as Appointment[]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    await api.admin.updateAppointmentStatus(id, status);
    setAppointments((prev) =>
      prev.map((a) => (a.appointmentId === id ? { ...a, status } : a)),
    );
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await api.admin.deleteAppointment(deleteId);
      setAppointments((prev) => prev.filter((a) => a.appointmentId !== deleteId));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const filtered = filter === 'All' ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
            <p className="text-sm text-slate-500">View and manage all appointments</p>
          </div>
        </div>
        {/* Filter */}
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
                {['#', 'Doctor', 'Patient', 'Date', 'Time', 'Status', 'Reason', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a, i) => (
                <tr key={a.appointmentId} className="hover:bg-slate-50">
                  <td className="px-5 py-4 text-slate-400">{i + 1}</td>
                  <td className="px-5 py-4 font-medium text-slate-900">{a.doctor?.fullName}</td>
                  <td className="px-5 py-4 text-slate-700">{a.patient?.fullName}</td>
                  <td className="px-5 py-4 text-slate-600">{a.date}</td>
                  <td className="px-5 py-4 text-slate-600">{a.time?.slice(0, 5)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 max-w-[180px] truncate">{a.reason}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="relative group">
                        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-indigo-300">
                          Status <ChevronDown className="h-3 w-3" />
                        </button>
                        <div className="absolute right-0 top-full z-10 mt-1 hidden w-36 rounded-lg border border-slate-100 bg-white py-1 shadow-lg group-hover:block">
                          {ALL_STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(a.appointmentId, s)}
                              className="w-full px-4 py-2 text-left text-xs hover:bg-slate-50"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => setDeleteId(a.appointmentId)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:border-red-300 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {deleteId !== null && (
        <ConfirmModal
          title="Delete this appointment?"
          message="This will permanently remove the appointment record."
          confirmLabel="Delete Appointment"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
