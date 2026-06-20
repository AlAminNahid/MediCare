'use client';

import { useEffect, useState } from 'react';
import { Clock, Plus, Trash2, X, Check, Pencil, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface Slot {
  slotId: number;
  startTime: string;
  endTime: string;
  days: string[];
}

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const empty = { startTime: '', endTime: '', days: [] as string[] };

export default function DoctorSlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Slot | null>(null);
  const [editForm, setEditForm] = useState(empty);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    api.doctor
      .getSlots()
      .then((d) => setSlots(d as Slot[]))
      .finally(() => setLoading(false));
  }, []);

  const normalizeDays = (days: string | string[]): string[] => {
    if (Array.isArray(days)) return days;
    return String(days).split(',').map((d) => d.trim());
  };

  const toggleDay = (day: string, current: string[], setter: (days: string[]) => void) => {
    setter(current.includes(day) ? current.filter((d) => d !== day) : [...current, day]);
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const added = await api.doctor.createSlot(form) as Slot;
      setSlots((prev) => [...prev, added]);
      setShowForm(false);
      setForm(empty);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (slot: Slot) => {
    setEditError('');
    setEditing(slot);
    setEditForm({
      startTime: slot.startTime?.slice(0, 5) ?? '',
      endTime: slot.endTime?.slice(0, 5) ?? '',
      days: normalizeDays(slot.days),
    });
  };

  const handleEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await api.doctor.updateSlot(editing.slotId, editForm) as Slot;
      setSlots((prev) => prev.map((s) => (s.slotId === editing.slotId ? updated : s)));
      setEditing(null);
    } catch (err: unknown) {
      setEditError((err as Error).message || 'Failed to update slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await api.doctor.deleteSlot(deleteId);
      setSlots((prev) => prev.filter((s) => s.slotId !== deleteId));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const slotToDelete = slots.find((s) => s.slotId === deleteId);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Appointment Slots</h1>
            <p className="text-sm text-slate-500">Define your available appointment windows</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Add Slot
        </button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : slots.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-400">
            No slots yet. Add your first available time window.
          </div>
        ) : (
          slots.map((slot) => {
            const days = normalizeDays(slot.days);
            return (
              <div key={slot.slotId} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm text-slate-500">Time</p>
                    <p className="font-semibold text-slate-900">{slot.startTime?.slice(0, 5)} – {slot.endTime?.slice(0, 5)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1.5">Available Days</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_DAYS.map((d) => (
                        <span key={d} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${days.includes(d) ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(slot)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(slot.slotId)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:border-red-300 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Slot modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Add Appointment Slot</h2>
              <button onClick={() => { setShowForm(false); setForm(empty); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-5 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Start Time</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">End Time</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((d) => (
                    <button key={d} type="button" onClick={() => toggleDay(d, form.days, (days) => setForm({ ...form, days }))}
                      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${form.days.includes(d) ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => { setShowForm(false); setForm(empty); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.startTime || !form.endTime || form.days.length === 0}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                <Check className="h-4 w-4" />{saving ? 'Saving...' : 'Create Slot'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Slot modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Edit Slot</h2>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-5 p-6">
              {editError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">{editError}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Start Time</label>
                  <input type="time" value={editForm.startTime} onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">End Time</label>
                  <input type="time" value={editForm.endTime} onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((d) => (
                    <button key={d} type="button" onClick={() => toggleDay(d, editForm.days, (days) => setEditForm({ ...editForm, days }))}
                      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${editForm.days.includes(d) ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleEdit} disabled={saving || !editForm.startTime || !editForm.endTime || editForm.days.length === 0}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                <Check className="h-4 w-4" />{saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-1 text-base font-semibold text-slate-900">Remove this slot?</h3>
              {slotToDelete && (
                <p className="text-sm text-slate-500">
                  {slotToDelete.startTime?.slice(0, 5)} – {slotToDelete.endTime?.slice(0, 5)}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-400">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setDeleteId(null)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors">
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Removing...' : 'Remove Slot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
