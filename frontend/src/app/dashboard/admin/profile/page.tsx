'use client';

import { useEffect, useState } from 'react';
import { UserCircle, Save, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface AdminProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin
      .getProfile()
      .then((d) => {
        const p = d as AdminProfile;
        setProfile(p);
        setForm({ fullName: p.fullName, email: p.email, phoneNumber: p.phoneNumber, password: '' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await api.admin.updateProfile(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <UserCircle className="h-6 w-6 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-sm text-slate-500">Update your account information</p>
        </div>
      </div>

      <div className="max-w-lg">
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle className="h-4 w-4" /> Profile updated successfully
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          {/* Avatar placeholder */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
              {form.fullName.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{profile?.fullName}</p>
              <p className="text-sm text-slate-500">{profile?.email}</p>
            </div>
          </div>

          {[
            { label: 'Full Name', key: 'fullName', type: 'text' },
            { label: 'Email Address', key: 'email', type: 'email' },
            { label: 'Phone Number', key: 'phoneNumber', type: 'text' },
            { label: 'New Password', key: 'password', type: 'password' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {label}
                {key === 'password' && <span className="ml-1 text-slate-400">(leave blank to keep current)</span>}
              </label>
              <input
                type={type}
                required={key !== 'password'}
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
