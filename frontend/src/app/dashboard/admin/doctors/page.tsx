'use client';

import { useEffect, useState } from 'react';
import { Stethoscope, Pencil, Trash2, X, Check, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Doctor {
  doctorId: number;
  fullName: string;
  phoneNumber: string;
  specialization: string;
  visitFee: number;
}

const emptyAdd = { fullName: '', email: '', phoneNumber: '', specialization: '', visitFee: '', password: '' };


export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState(emptyAdd);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [addError, setAddError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () =>
    api.admin
      .getDoctors()
      .then((d) => setDoctors(d as Doctor[]))
      .catch(() => setError('Failed to load doctors'))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await api.admin.deleteDoctor(deleteId);
      setDoctors((prev) => prev.filter((d) => d.doctorId !== deleteId));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.admin.editDoctor(editing.doctorId, {
        fullName: editing.fullName,
        phoneNumber: editing.phoneNumber,
        specialization: editing.specialization,
        visitFee: editing.visitFee,
      });
      setDoctors((prev) => prev.map((d) => (d.doctorId === editing.doctorId ? editing : d)));
      setEditing(null);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!addForm.fullName || !addForm.email || !addForm.password) {
      setAddError('Full name, email and password are required');
      return;
    }
    setSaving(true);
    setAddError('');
    try {
      await api.register({
        fullName: addForm.fullName,
        email: addForm.email,
        phoneNumber: addForm.phoneNumber,
        role: 'doctor',
        password: addForm.password,
      });
      setAdding(false);
      setAddForm(emptyAdd);
      setLoading(true);
      load();
    } catch (err: unknown) {
      setAddError((err as Error).message || 'Failed to add doctor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Stethoscope className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Doctors</h1>
            <p className="text-sm text-slate-500">Manage all registered doctors</p>
          </div>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <UserPlus className="h-4 w-4" />
          Add Doctor
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No doctors found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left">
              <tr>
                {['#', 'Name', 'Phone', 'Specialization', 'Visit Fee', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctors.map((doc, i) => (
                <tr key={doc.doctorId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-slate-400">{i + 1}</td>
                  <td className="px-5 py-4 font-medium text-slate-900">{doc.fullName}</td>
                  <td className="px-5 py-4 text-slate-600">{doc.phoneNumber}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{doc.specialization}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">৳{doc.visitFee}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditing({ ...doc })}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(doc.doctorId)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Doctor modal */}
      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Add New Doctor</h2>
              <button onClick={() => { setAdding(false); setAddForm(emptyAdd); setAddError(''); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              {addError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">{addError}</div>}
              {[
                { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'e.g. Dr. Rahim Ahmed' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'doctor@medicare.com' },
                { label: 'Phone', key: 'phoneNumber', type: 'text', placeholder: '+880 1700 000000' },
                { label: 'Specialization', key: 'specialization', type: 'text', placeholder: 'e.g. Cardiology, Neurology' },
                { label: 'Password', key: 'password', type: 'password', placeholder: 'Min. 8 chars with letters & numbers' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(addForm as any)[key]}
                    onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => { setAdding(false); setAddForm(emptyAdd); setAddError(''); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                <Check className="h-4 w-4" />
                {saving ? 'Adding...' : 'Add Doctor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Edit Doctor</h2>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              {[
                { label: 'Full Name', key: 'fullName' },
                { label: 'Phone', key: 'phoneNumber' },
                { label: 'Specialization', key: 'specialization' },
                { label: 'Visit Fee', key: 'visitFee', type: 'number' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
                  <input
                    type={type || 'text'}
                    value={(editing as any)[key]}
                    onChange={(e) => setEditing({ ...editing, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                <Check className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <ConfirmModal
          title="Delete this doctor?"
          message="This will permanently remove the doctor and all their data."
          confirmLabel="Delete Doctor"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
