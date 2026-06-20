'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Pencil, X, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface Appointment {
  appointmentId: number;
  patient: { fullName: string; phoneNumber: string };
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

const STATUSES = ['Booked', 'Approved', 'Cancelled', 'Rescheduled'];

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [editForm, setEditForm] = useState({ date: '', time: '', status: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    api.doctor
      .getAppointments()
      .then((d) => setAppointments(d as Appointment[]))
      .finally(() => setLoading(false));
  }, []);

  const openEdit = (a: Appointment) => {
    setEditError('');
    setEditing(a);
    setEditForm({
      date: a.date ?? '',
      time: a.time?.slice(0, 5) ?? '',
      status: a.status ?? 'Booked',
      reason: a.reason ?? '',
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await api.doctor.updateAppointment(editing.appointmentId, editForm) as Appointment;
      setAppointments((prev) =>
        prev.map((a) => (a.appointmentId === editing.appointmentId ? { ...a, ...updated } : a))
      );
      setEditing(null);
    } catch (err: unknown) {
      setEditError((err as Error).message || 'Failed to update appointment');
    } finally {
      setSaving(false);
    }
  };

  const filterOptions = ['All', ...STATUSES];
  const filtered = filter === 'All' ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
            <p className="text-sm text-slate-500">{appointments.length} total appointments</p>
          </div>
        </div>
        <div className="flex gap-2">
          {filterOptions.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${filter === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
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
                {['#', 'Patient', 'Phone', 'Date', 'Time', 'Status', 'Reason', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a, i) => (
                <tr key={a.appointmentId} className="hover:bg-slate-50">
                  <td className="px-5 py-4 text-slate-400">{i + 1}</td>
                  <td className="px-5 py-4 font-medium text-slate-900">{a.patient?.fullName}</td>
                  <td className="px-5 py-4 text-slate-600">{a.patient?.phoneNumber}</td>
                  <td className="px-5 py-4 text-slate-600">{a.date}</td>
                  <td className="px-5 py-4 text-slate-600">{a.time?.slice(0, 5)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 max-w-[180px] truncate">{a.reason}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => openEdit(a)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">Edit Appointment</h2>
                <p className="text-xs text-slate-500 mt-0.5">{editing.patient?.fullName}</p>
              </div>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {editError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">{editError}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Time</label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, status: s })}
                      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                        editForm.status === s
                          ? STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-current'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Reason / Notes</label>
                <textarea
                  rows={3}
                  value={editForm.reason}
                  onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                  placeholder="Add notes or reason for changes..."
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                <Check className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
