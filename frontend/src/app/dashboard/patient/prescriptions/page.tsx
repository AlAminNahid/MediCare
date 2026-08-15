'use client';

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { api } from '@/lib/api';
import type { Prescription } from '@/types';
import PrescriptionSlip from '@/components/PrescriptionSlip';

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.patient.getPrescriptions().then((d) => setPrescriptions(d as Prescription[])).finally(() => setLoading(false));
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
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-400">
          No prescriptions found
        </div>
      ) : (
        <div className="space-y-5">
          {prescriptions.map((rx) => (
            <PrescriptionSlip key={rx.prescriptionId} rx={rx} />
          ))}
        </div>
      )}
    </div>
  );
}
