'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { Appointment } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  Waiting: 'bg-blue-50 text-blue-700',
  Serving: 'bg-amber-50 text-amber-700',
  Done: 'bg-green-50 text-green-700',
  Cancelled: 'bg-red-50 text-red-700',
  'No Show': 'bg-slate-100 text-slate-500',
};

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.patient
      .getAppointments()
      .then((d) => setAppointments(d as Appointment[]))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    if (cancelId === null) return;
    setCancelling(true);
    try {
      await api.patient.cancelAppointment(cancelId);
      setAppointments((prev) =>
        prev.map((a) => (a.appointmentId === cancelId ? { ...a, status: 'Cancelled' } : a)),
      );
    } finally {
      setCancelling(false);
      setCancelId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <CalendarDays className="h-6 w-6 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-sm text-slate-500">{appointments.length} total appointments</p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
        ) : appointments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-400">
            No appointments yet.{' '}
            <a href="/dashboard/patient/book-appointment" className="text-indigo-600 hover:underline">Book one now</a>
          </div>
        ) : (
          appointments.map((a) => (
            <div key={a.appointmentId} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
              <div className="flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                  {a.doctor?.fullName?.charAt(0) || 'D'}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{a.doctor?.fullName}</p>
                  <p className="text-sm text-slate-500">{a.chamber?.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{a.date} · Serial #{a.serialNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>{a.status}</span>
                  <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400">{a.reason}</p>
                </div>
                {a.status === 'Waiting' && (
                  <button
                    onClick={() => setCancelId(a.appointmentId)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {cancelId !== null && (
        <ConfirmModal
          title="Cancel this appointment?"
          message="The appointment will be marked as Cancelled. This cannot be undone."
          confirmLabel="Yes, Cancel"
          loading={cancelling}
          onConfirm={handleCancel}
          onCancel={() => setCancelId(null)}
        />
      )}
    </div>
  );
}
