'use client';

import { useEffect, useState } from 'react';
import { FileText, Pill } from 'lucide-react';
import { api } from '@/lib/api';

interface Prescription {
  prescriptionId: number;
  doctor: { fullName: string; specialization: string };
  medicine: { name: string; type: string; strength: string };
  date: string;
  dosage: string;
  duration: string;
  additionalNotes: string;
}

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.patient
      .getPrescriptions()
      .then((d) => setPrescriptions(d as Prescription[]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <FileText className="h-6 w-6 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Prescriptions</h1>
          <p className="text-sm text-slate-500">Digital prescriptions from your doctors</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
      ) : prescriptions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-400">No prescriptions found</div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div key={rx.prescriptionId} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">Prescribed by</span>
                  <span className="font-semibold text-slate-900">{rx.doctor?.fullName}</span>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{rx.doctor?.specialization}</span>
                </div>
                <span className="text-sm text-slate-500">{rx.date}</span>
              </div>
              {/* Content */}
              <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                    <Pill className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Medicine</p>
                    <p className="font-semibold text-slate-900">{rx.medicine?.name}</p>
                    <p className="text-xs text-slate-500">{rx.medicine?.type} · {rx.medicine?.strength}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Dosage</p>
                  <p className="mt-0.5 font-medium text-slate-900">{rx.dosage}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Duration</p>
                  <p className="mt-0.5 font-medium text-slate-900">{rx.duration}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Notes</p>
                  <p className="mt-0.5 text-sm italic text-slate-600">{rx.additionalNotes || '—'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
