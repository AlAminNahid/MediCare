'use client';

import { useEffect, useState } from 'react';
import { Building2, Plus, Trash2, X, Check, Pencil, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import type { Chamber } from '@/types';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const empty = { name: '', address: '', startTime: '', endTime: '', days: [] as string[], visitFee: '' };

export default function DoctorChambersPage() {
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Chamber | null>(null);
  const [editForm, setEditForm] = useState(empty);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    api.doctor
      .getChambers()
      .then((d) => setChambers(d as Chamber[]))
      .finally(() => setLoading(false));
  }, []);

  const normalizeDays = (days: string | string[]): string[] => {
    if (Array.isArray(days)) return days;
    return String(days).split(',').map((d) => d.trim());
  };

  const toggleDay = (day: string, current: string[], setter: (days: string[]) => void) => {
    setter(current.includes(day) ? current.filter((d) => d !== day) : [...current, day]);
  };

  const toPayload = (f: typeof empty) => ({
    name: f.name,
    address: f.address,
    startTime: f.startTime,
    endTime: f.endTime,
    days: f.days,
    ...(f.visitFee !== '' && { visitFee: Number(f.visitFee) }),
  });

  const handleCreate = async () => {
    setSaving(true);
    try {
      const added = await api.doctor.createChamber(toPayload(form)) as Chamber;
      setChambers((prev) => [...prev, added]);
      setShowForm(false);
      setForm(empty);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (chamber: Chamber) => {
    setEditError('');
    setEditing(chamber);
    setEditForm({
      name: chamber.name ?? '',
      address: chamber.address ?? '',
      startTime: chamber.startTime?.slice(0, 5) ?? '',
      endTime: chamber.endTime?.slice(0, 5) ?? '',
      days: normalizeDays(chamber.days),
      visitFee: chamber.visitFee != null ? String(chamber.visitFee) : '',
    });
  };

  const handleEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await api.doctor.updateChamber(editing.chamberId, toPayload(editForm)) as Chamber;
      setChambers((prev) => prev.map((c) => (c.chamberId === editing.chamberId ? updated : c)));
      setEditing(null);
    } catch (err: unknown) {
      setEditError((err as Error).message || 'Failed to update chamber');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await api.doctor.deleteChamber(deleteId);
      setChambers((prev) => prev.filter((c) => c.chamberId !== deleteId));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const chamberToDelete = chambers.find((c) => c.chamberId === deleteId);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Chambers</h1>
            <p className="text-sm text-slate-500">Manage the locations and schedules you sit at</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Add Chamber
        </button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : chambers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-400">
            No chambers yet. Add the first location you see patients at.
          </div>
        ) : (
          chambers.map((chamber) => {
            const days = normalizeDays(chamber.days);
            return (
              <div key={chamber.chamberId} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm text-slate-500">Chamber</p>
                    <p className="font-semibold text-slate-900">{chamber.name}</p>
                    <p className="text-xs text-slate-400">{chamber.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Hours</p>
                    <p className="font-medium text-slate-700">{chamber.startTime?.slice(0, 5)} – {chamber.endTime?.slice(0, 5)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Fee</p>
                    <p className="font-medium text-slate-700">৳{chamber.visitFee ?? '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1.5">Days</p>
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
                    onClick={() => openEdit(chamber)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(chamber.chamberId)}
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

      {/* Add Chamber modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Add Chamber</h2>
              <button onClick={() => { setShowForm(false); setForm(empty); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-5 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Chamber Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. City Health Point" className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
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
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Visit Fee (৳)</label>
                <input type="number" value={form.visitFee} onChange={(e) => setForm({ ...form, visitFee: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
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
              <button onClick={handleCreate} disabled={saving || !form.name || !form.address || !form.startTime || !form.endTime || form.days.length === 0}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                <Check className="h-4 w-4" />{saving ? 'Saving...' : 'Create Chamber'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Chamber modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Edit Chamber</h2>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-5 p-6">
              {editError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">{editError}</div>}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Chamber Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Address</label>
                <input type="text" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
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
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Visit Fee (৳)</label>
                <input type="number" value={editForm.visitFee} onChange={(e) => setEditForm({ ...editForm, visitFee: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
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
              <button onClick={handleEdit} disabled={saving || !editForm.name || !editForm.address || !editForm.startTime || !editForm.endTime || editForm.days.length === 0}
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
              <h3 className="mb-1 text-base font-semibold text-slate-900">Remove this chamber?</h3>
              {chamberToDelete && (
                <p className="text-sm text-slate-500">{chamberToDelete.name}</p>
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
                {deleting ? 'Removing...' : 'Remove Chamber'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
