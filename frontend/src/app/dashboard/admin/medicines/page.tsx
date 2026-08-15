'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pill, Plus, Trash2, X, Check, Search, Pencil } from 'lucide-react';
import { api } from '@/lib/api';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { Medicine } from '@/types';

interface ExternalMedicineSuggestion {
  name: string;
  generic: string;
  company: string;
  dosage: string;
}

const emptyForm = { name: '', type: '', strength: '', manufacturerName: '' };

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // External medicine lookup typeahead (search-and-prefill only)
  const [suggestions, setSuggestions] = useState<ExternalMedicineSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.admin
      .getMedicines()
      .then((d) => setMedicines(d as Medicine[]))
      .finally(() => setLoading(false));
  }, []);

  const searchExternal = useCallback((q: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await api.admin.searchExternalMedicines(q) as ExternalMedicineSuggestion[];
        setSuggestions(results);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }, []);

  const handleNameChange = (value: string) => {
    setForm({ ...form, name: value });
    searchExternal(value);
  };

  const pickSuggestion = (sug: ExternalMedicineSuggestion) => {
    setForm({ ...form, name: sug.name, manufacturerName: sug.company });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditingId(null);
    setError('');
    setForm(emptyForm);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const openEdit = (m: Medicine) => {
    setEditingId(m.medicineId);
    setForm({ name: m.name, type: m.type, strength: m.strength, manufacturerName: m.manufacturerName });
    setError('');
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.type || !form.strength || !form.manufacturerName) {
      setError('All fields are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingId !== null) {
        const updated = await api.admin.updateMedicine(editingId, form) as Medicine;
        setMedicines((prev) => prev.map((m) => (m.medicineId === editingId ? updated : m)));
      } else {
        const added = await api.admin.addMedicine(form) as Medicine;
        setMedicines((prev) => [...prev, added]);
      }
      closeModal();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save medicine');
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
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(m)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(m.medicineId)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:border-red-300 hover:bg-red-50">
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

      {/* Add medicine modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">{editingId !== null ? 'Edit Medicine' : 'Add Medicine'}</h2>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-6">
              {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">{error}</div>}

              <div className="relative">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Medicine Name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="e.g. Paracetamol"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-8 pr-3.5 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
                    {suggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseDown={() => pickSuggestion(sug)}
                        className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-indigo-50 transition-colors"
                      >
                        <Pill className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{sug.name}</p>
                          <p className="text-xs text-slate-400">{sug.generic} · {sug.company}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {[
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
              <button onClick={closeModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                <Check className="h-4 w-4" />
                {saving ? 'Saving...' : editingId !== null ? 'Save Changes' : 'Add Medicine'}
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
