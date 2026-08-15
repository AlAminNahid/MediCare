'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, Plus, X, Check, Pill, Trash2, Search } from 'lucide-react';
import { api } from '@/services';
import type { Prescription, PrescriptionMedicine } from '@/types';
import PrescriptionSlip from '@/components/features/prescriptions/PrescriptionSlip';

interface Patient { patientId: number; fullName: string }
interface Chamber { chamberId: number; name: string; address: string }
interface MedicineSuggestion { medicineId: number; name: string; type: string; strength: string }

const emptyMed = (): PrescriptionMedicine => ({ medicineName: '', dosage: '', duration: '' });

const emptyForm = {
  patientId: '',
  chamberId: '',
  date: new Date().toISOString().split('T')[0],
  diagnosis: '',
  tests: [] as string[],
  notes: '',
  medicines: [emptyMed()],
};

export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingPatientName, setEditingPatientName] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [testInput, setTestInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Typeahead state per medicine row
  const [suggestions, setSuggestions] = useState<Record<number, MedicineSuggestion[]>>({});
  const [showSuggestions, setShowSuggestions] = useState<Record<number, boolean>>({});
  const searchTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    Promise.all([
      api.doctor.getPrescriptions(),
      api.doctor.getPatients(),
      api.doctor.getChambers(),
    ]).then(([rx, pt, ch]) => {
      setPrescriptions(rx as Prescription[]);
      setPatients(pt as Patient[]);
      setChambers(ch as Chamber[]);
    }).finally(() => setLoading(false));
  }, []);

  const searchMedicine = useCallback((idx: number, q: string) => {
    clearTimeout(searchTimers.current[idx]);
    if (!q.trim()) { setSuggestions(s => ({ ...s, [idx]: [] })); return; }
    searchTimers.current[idx] = setTimeout(async () => {
      const results = await api.doctor.searchMedicines(q) as MedicineSuggestion[];
      setSuggestions(s => ({ ...s, [idx]: results }));
      setShowSuggestions(s => ({ ...s, [idx]: true }));
    }, 280);
  }, []);

  const updateMed = (idx: number, field: keyof PrescriptionMedicine, value: string) => {
    const meds = [...form.medicines];
    meds[idx] = { ...meds[idx], [field]: value };
    setForm({ ...form, medicines: meds });
    if (field === 'medicineName') searchMedicine(idx, value);
  };

  const pickSuggestion = (idx: number, sug: MedicineSuggestion) => {
    updateMed(idx, 'medicineName', `${sug.name} ${sug.strength}`.trim());
    setShowSuggestions(s => ({ ...s, [idx]: false }));
    setSuggestions(s => ({ ...s, [idx]: [] }));
  };

  const addMed = () => setForm({ ...form, medicines: [...form.medicines, emptyMed()] });
  const removeMed = (idx: number) => {
    if (form.medicines.length === 1) return;
    setForm({ ...form, medicines: form.medicines.filter((_, i) => i !== idx) });
  };

  const addTest = () => {
    const t = testInput.trim();
    if (t && !form.tests.includes(t)) setForm({ ...form, tests: [...form.tests, t] });
    setTestInput('');
  };
  const removeTest = (t: string) => setForm({ ...form, tests: form.tests.filter((x) => x !== t) });

  const closeModal = () => {
    setShowForm(false);
    setEditingId(null);
    setEditingPatientName('');
    setForm(emptyForm);
    setTestInput('');
    setSuggestions({});
  };

  const openEdit = (rx: Prescription) => {
    setEditingId(rx.prescriptionId);
    setEditingPatientName(rx.patient?.fullName ?? '');
    setForm({
      patientId: '',
      chamberId: rx.chamberId ? String(rx.chamberId) : '',
      date: rx.date,
      diagnosis: rx.diagnosis ?? '',
      tests: rx.tests ?? [],
      notes: rx.notes ?? '',
      medicines: rx.medicines?.length
        ? rx.medicines.map(m => ({ medicineName: m.medicineName, dosage: m.dosage, duration: m.duration }))
        : [emptyMed()],
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if ((!editingId && !form.patientId) || form.medicines.some(m => !m.medicineName)) return;
    setSaving(true);
    try {
      const payload = {
        chamberId: form.chamberId ? Number(form.chamberId) : undefined,
        date: form.date,
        diagnosis: form.diagnosis,
        tests: form.tests,
        notes: form.notes,
        medicines: form.medicines.filter(m => m.medicineName),
      };
      if (editingId !== null) {
        await api.doctor.updatePrescription(editingId, payload);
      } else {
        await api.doctor.createPrescription({ patientId: Number(form.patientId), ...payload });
      }
      const updated = await api.doctor.getPrescriptions() as Prescription[];
      setPrescriptions(updated);
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const selectedChamber = chambers.find(c => c.chamberId === Number(form.chamberId));

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
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> New Prescription
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
      ) : prescriptions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-400">No prescriptions yet</div>
      ) : (
        <div className="space-y-5">
          {prescriptions.map((rx) => (
            <PrescriptionSlip key={rx.prescriptionId} rx={rx} onEdit={() => openEdit(rx)} />
          ))}
        </div>
      )}

      {/* New Prescription Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-slate-900">{editingId !== null ? 'Edit Prescription' : 'New Prescription'}</h2>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Patient & Chamber */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Patient {editingId === null && <span className="text-red-500">*</span>}</label>
                  {editingId !== null ? (
                    <p className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600">{editingPatientName}</p>
                  ) : (
                    <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                      <option value="">Select patient...</option>
                      {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.fullName}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Chamber</label>
                  <select value={form.chamberId} onChange={(e) => setForm({ ...form, chamberId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">No chamber</option>
                    {chambers.map(c => <option key={c.chamberId} value={c.chamberId}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Diagnosis</label>
                <input type="text" placeholder="e.g. Acute viral fever" value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>

              {/* Medicines */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Medicines <span className="text-red-500">*</span></label>
                  <button type="button" onClick={addMed} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    <Plus className="h-3.5 w-3.5" /> Add Medicine
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Header row */}
                  <div className="grid grid-cols-12 gap-2 px-1">
                    <p className="col-span-5 text-xs font-medium text-slate-400">Name</p>
                    <p className="col-span-3 text-xs font-medium text-slate-400">Dosage</p>
                    <p className="col-span-3 text-xs font-medium text-slate-400">Duration</p>
                  </div>
                  {form.medicines.map((med, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                      {/* Medicine name with typeahead */}
                      <div className="col-span-5 relative">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Type medicine name..."
                            value={med.medicineName}
                            onChange={(e) => updateMed(idx, 'medicineName', e.target.value)}
                            onBlur={() => setTimeout(() => setShowSuggestions(s => ({ ...s, [idx]: false })), 200)}
                            className="w-full rounded-lg border border-slate-300 py-2 pl-8 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                        {showSuggestions[idx] && suggestions[idx]?.length > 0 && (
                          <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
                            {suggestions[idx].map(sug => (
                              <button key={sug.medicineId} type="button" onMouseDown={() => pickSuggestion(idx, sug)}
                                className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-indigo-50 transition-colors">
                                <Pill className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-400" />
                                <div>
                                  <p className="text-sm font-medium text-slate-800">{sug.name}</p>
                                  <p className="text-xs text-slate-400">{sug.type} · {sug.strength}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input type="text" placeholder="e.g. 1 tablet" value={med.dosage}
                        onChange={(e) => updateMed(idx, 'dosage', e.target.value)}
                        className="col-span-3 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      <input type="text" placeholder="e.g. 7 days" value={med.duration}
                        onChange={(e) => updateMed(idx, 'duration', e.target.value)}
                        className="col-span-3 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      <button type="button" onClick={() => removeMed(idx)} disabled={form.medicines.length === 1}
                        className="col-span-1 flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tests */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Tests Advised</label>
                {form.tests.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {form.tests.map((t) => (
                      <span key={t} className="flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                        {t}
                        <button type="button" onClick={() => removeTest(t)} className="text-indigo-400 hover:text-indigo-700"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input type="text" placeholder="e.g. CBC, Chest X-Ray" value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTest(); } }}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <button type="button" onClick={addTest}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Advice / Instructions</label>
                <textarea rows={3} placeholder="Special instructions, dietary advice, follow-up..." value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>

              {/* Prescription preview hint */}
              {selectedChamber && (
                <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
                  <p className="font-semibold">Prescription will show:</p>
                  <p className="mt-0.5">{selectedChamber.name} · {selectedChamber.address}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 sticky bottom-0 bg-white">
              <button onClick={closeModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave}
                disabled={saving || (editingId === null && !form.patientId) || form.medicines.every(m => !m.medicineName)}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                <Check className="h-4 w-4" />{saving ? 'Saving...' : editingId !== null ? 'Save Changes' : 'Create Prescription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
