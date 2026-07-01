'use client';

import { useEffect, useState } from 'react';
import { Pill, Plus, Trash2, X, Check } from 'lucide-react';
import { api } from '@/lib/api';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { Medicine } from '@/types';

const emptyForm = { name: '', type: '', strength: '', manufacturerName: '' };

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin
      .getMedicines()
      .then((d) => setMedicines(d as Medicine[]))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.type || !form.strength || !form.manufacturerName) {
      setError('All fields are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const added = await api.admin.addMedicine(form) as Medicine;
      setMedicines((prev) => [...prev, added]);
      setShowAdd(false);
      setForm(emptyForm);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to add medicine');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await api.admin.deleteMedicine(deleteId);
      setMedicines((prev) => prev.filter((m) => m.medicineId !== deleteId));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Pill className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Medicines</h1>
            <p className="text-sm text-slate-500">Reference list used when writing prescriptions</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Add Medicine
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : medicines.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No medicines yet. Add your first one.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {['#', 'Name', 'Type', 'Strength', 'Manufacturer', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicines.map((m, i) => (
                <tr key={m.medicineId} className="hover:bg-slate-50">
                  <td className="px-5 py-4 text-slate-400">{i + 1}</td>
                  <td className="px-5 py-4 font-medium text-slate-900">{m.name}</td>
                  <td className="px-5 py-4 text-slate-600">{m.type}</td>
                  <td className="px-5 py-4 text-slate-600">{m.strength}</td>
                  <td className="px-5 py-4 text-slate-600">{m.manufacturerName}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => setDeleteId(m.medicineId)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:border-red-300 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add medicine modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Add Medicine</h2>
              <button onClick={() => { setShowAdd(false); setError(''); setForm(emptyForm); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-6">
              {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">{error}</div>}
              {[
                { label: 'Medicine Name', key: 'name', placeholder: 'e.g. Paracetamol' },
                { label: 'Type', key: 'type', placeholder: 'e.g. Tablet, Capsule, Syrup' },
                { label: 'Strength', key: 'strength', placeholder: 'e.g. 500mg' },
                { label: 'Manufacturer', key: 'manufacturerName', placeholder: 'e.g. Square Pharmaceuticals' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
                  <input
                    value={(form as Record<string, string>)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => { setShowAdd(false); setError(''); setForm(emptyForm); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                <Check className="h-4 w-4" />{saving ? 'Adding...' : 'Add Medicine'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <ConfirmModal
          title="Delete this medicine?"
          message="This will permanently remove the medicine from the reference list."
          confirmLabel="Delete Medicine"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
