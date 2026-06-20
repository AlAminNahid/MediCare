'use client';

import { useEffect, useState } from 'react';
import { FileText, Plus, X, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface Prescription {
  prescriptionId: number;
  patient: { fullName: string };
  medicine: { name: string; type: string };
  date: string;
  dosage: string;
  duration: string;
  additionalNotes: string;
}

interface Patient { patientId: number; fullName: string }
interface Medicine { medicineId: number; name: string; type: string; strength: string }

const empty = { patientId: '', medicineId: '', date: '', dosage: '', duration: '', additionalNotes: '' };

export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.doctor.getPrescriptions(),
      api.doctor.getPatients(),
      api.doctor.getMedicines(),
    ]).then(([rx, pt, med]) => {
      setPrescriptions(rx as Prescription[]);
      // patients from doctor portal returns raw rows
      setPatients((pt as any[]).map((p) => ({ patientId: p.p_patientid, fullName: p.p_fullname })));
      setMedicines(med as Medicine[]);
    }).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const added = await api.doctor.createPrescription({
        patientId: Number(form.patientId),
        medicineId: Number(form.medicineId),
        date: form.date,
        dosage: form.dosage,
        duration: form.duration,
        additionalNotes: form.additionalNotes,
      }) as Prescription;
      // refresh
      const updated = await api.doctor.getPrescriptions() as Prescription[];
      setPrescriptions(updated);
      setShowForm(false);
      setForm(empty);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Prescriptions</h1>
            <p className="text-sm text-slate-500">Issue and view digital prescriptions</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> New Prescription
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No prescriptions yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {['#', 'Patient', 'Medicine', 'Date', 'Dosage', 'Duration', 'Notes'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescriptions.map((rx, i) => (
                <tr key={rx.prescriptionId} className="hover:bg-slate-50">
                  <td className="px-5 py-4 text-slate-400">{i + 1}</td>
                  <td className="px-5 py-4 font-medium text-slate-900">{rx.patient?.fullName}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{rx.medicine?.name}</p>
                    <p className="text-xs text-slate-400">{rx.medicine?.type}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{rx.date}</td>
                  <td className="px-5 py-4 text-slate-600">{rx.dosage}</td>
                  <td className="px-5 py-4 text-slate-600">{rx.duration}</td>
                  <td className="px-5 py-4 text-slate-500 max-w-[180px] truncate text-xs italic">{rx.additionalNotes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">New Prescription</h2>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Patient</label>
                <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="">Select patient...</option>
                  {patients.map((p) => <option key={p.patientId} value={p.patientId}>{p.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Medicine</label>
                <select value={form.medicineId} onChange={(e) => setForm({ ...form, medicineId: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="">Select medicine...</option>
                  {medicines.map((m) => <option key={m.medicineId} value={m.medicineId}>{m.name} ({m.strength})</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              {[
                { label: 'Dosage', key: 'dosage', placeholder: '1 tablet' },
                { label: 'Duration', key: 'duration', placeholder: 'Once daily for 7 days' },
                { label: 'Additional Notes', key: 'additionalNotes', placeholder: 'Take on empty stomach' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
                  <input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.patientId || !form.medicineId || !form.date} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                <Check className="h-4 w-4" />{saving ? 'Saving...' : 'Create Prescription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
