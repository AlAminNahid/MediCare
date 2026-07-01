'use client';

import { useEffect, useState } from 'react';
import { FileText, Building2, Calendar, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';

interface PrescriptionMedicine { medicineName: string; dosage: string; duration: string }
interface Prescription {
  prescriptionId: number;
  doctor: { fullName: string; specialization: string; degrees: string[] };
  chamber?: { name: string; address: string };
  date: string;
  notes: string;
  medicines: PrescriptionMedicine[];
}

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
          {prescriptions.map((rx) => {
            const degrees = Array.isArray(rx.doctor?.degrees) ? rx.doctor.degrees.join(', ') : '';
            return (
              <div key={rx.prescriptionId} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {/* Prescription header — letterhead */}
                <div className="border-b-2 border-indigo-600 bg-indigo-600 px-6 py-5 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xl font-bold">{rx.doctor?.fullName}</p>
                      {degrees && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-indigo-200">
                          <GraduationCap className="h-3.5 w-3.5" />{degrees}
                        </p>
                      )}
                      {rx.doctor?.specialization && <p className="mt-0.5 text-sm text-indigo-200">{rx.doctor.specialization}</p>}
                    </div>
                    <div className="text-right">
                      {rx.chamber && (
                        <>
                          <p className="flex items-center justify-end gap-1.5 font-semibold">
                            <Building2 className="h-4 w-4" />{rx.chamber.name}
                          </p>
                          <p className="mt-0.5 text-sm text-indigo-200">{rx.chamber.address}</p>
                        </>
                      )}
                      <p className="mt-1 flex items-center justify-end gap-1.5 text-sm text-indigo-200">
                        <Calendar className="h-3.5 w-3.5" />{rx.date}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-5">
                  {/* Medicines */}
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Rx</p>
                  <div className="space-y-2 mb-4">
                    {rx.medicines?.map((m, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{i + 1}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{m.medicineName}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {m.dosage && <span className="mr-3">Dose: {m.dosage}</span>}
                            {m.duration && <span>Duration: {m.duration}</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {rx.notes && (
                    <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-slate-700">
                      <span className="font-semibold text-amber-800">Note: </span>{rx.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
