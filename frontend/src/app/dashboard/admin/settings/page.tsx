'use client';

import { useEffect, useState } from 'react';
import { Save, CheckCircle, AlertCircle, Eye, EyeOff, Pencil } from 'lucide-react';
import { api } from '@/services';

interface AdminProfile { fullName: string; email: string; phoneNumber: string }
type Tab = 'profile' | 'password' | 'plan';

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', email: '', phoneNumber: '' });
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin.getProfile().then((d) => {
      const p = d as AdminProfile;
      setProfile(p);
      setProfileForm({ fullName: p.fullName, email: p.email, phoneNumber: p.phoneNumber });
      localStorage.setItem('userFullName', p.fullName);
    }).finally(() => setLoading(false));
  }, []);

  const showMsg = (msg: string, isErr = false) => {
    if (isErr) { setError(msg); setSuccess(''); } else { setSuccess(msg); setError(''); }
    setTimeout(() => { setSuccess(''); setError(''); }, 4000);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.admin.updateProfile(profileForm);
      setProfile({ ...profileForm });
      localStorage.setItem('userFullName', profileForm.fullName);
      setEditing(false);
      showMsg('Profile updated successfully');
    } catch (err: unknown) { showMsg((err as Error).message || 'Failed to update profile', true); }
    finally { setSaving(false); }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { showMsg('Passwords do not match', true); return; }
    if (passwordForm.newPassword.length < 8) { showMsg('Password must be at least 8 characters', true); return; }
    setSaving(true);
    try {
      await api.admin.updateProfile({ password: passwordForm.newPassword });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      showMsg('Password updated successfully');
    } catch (err: unknown) { showMsg((err as Error).message || 'Failed to update password', true); }
    finally { setSaving(false); }
  };

  const strength = (() => {
    const pw = passwordForm.newPassword; if (!pw) return null;
    let s = 0; if (pw.length >= 8) s++; if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++;
    const levels = [
      { label: 'Weak', color: 'bg-red-500', text: 'text-red-600', width: 'w-1/4' },
      { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600', width: 'w-2/4' },
      { label: 'Good', color: 'bg-blue-500', text: 'text-blue-600', width: 'w-3/4' },
      { label: 'Strong', color: 'bg-green-500', text: 'text-green-600', width: 'w-full' },
    ];
    return levels[Math.max(0, Math.min(s - 1, 3))];
  })();

  if (loading) return <div className="flex h-full items-center justify-center"><div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'password', label: 'Password' },
    { key: 'plan', label: 'Plan' },
  ];

  const field = (label: string, value: string) => (
    <div key={label}>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-slate-800">{value || <span className="text-slate-400 italic">Not added</span>}</p>
    </div>
  );

  return (
    <div className="min-h-full bg-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account information and security</p>

        {/* Tab bar */}
        <div className="mt-6 flex border-b border-slate-200">
          {tabs.map(({ key, label }) => (
            <button key={key} onClick={() => { setTab(key); setEditing(false); setSuccess(''); setError(''); }}
              className={`mr-6 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {/* Alerts */}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />{success}
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
            </div>
          )}

          {/* Profile tab */}
          {tab === 'profile' && (
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-start justify-between p-6 pb-4">
                <div>
                  <h2 className="font-semibold text-slate-900">Admin Profile</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Your account information</p>
                </div>
                {!editing && (
                  <button onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <Pencil className="h-3.5 w-3.5" /> Edit profile
                  </button>
                )}
              </div>
              <div className="border-t border-slate-100" />

              {!editing ? (
                <div className="grid grid-cols-2 gap-6 p-6">
                  {field('Full Name', profile?.fullName ?? '')}
                  {field('Email Address', profile?.email ?? '')}
                  {field('Phone Number', profile?.phoneNumber ?? '')}
                  {field('Role', 'Admin')}
                </div>
              ) : (
                <form onSubmit={handleProfileSave} className="p-6 space-y-4">
                  {[
                    { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'Admin Name' },
                    { label: 'Email Address', key: 'email', type: 'email', placeholder: 'admin@medicare.com' },
                    { label: 'Phone Number', key: 'phoneNumber', type: 'text', placeholder: '+880 1700 000000' },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key} className="grid grid-cols-3 items-center gap-4">
                      <label className="text-sm font-medium text-slate-700 text-right">{label}</label>
                      <input type={type} placeholder={placeholder} value={(profileForm as any)[key]}
                        onChange={(e) => setProfileForm({ ...profileForm, [key]: e.target.value })}
                        className="col-span-2 rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                  ))}
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => { setEditing(false); setProfileForm({ fullName: profile?.fullName ?? '', email: profile?.email ?? '', phoneNumber: profile?.phoneNumber ?? '' }); }}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={saving}
                      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                      <Save className="h-3.5 w-3.5" />{saving ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Password tab */}
          {tab === 'password' && (
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="p-6 pb-4">
                <h2 className="font-semibold text-slate-900">Change Password</h2>
                <p className="mt-0.5 text-sm text-slate-500">Choose a strong, unique password</p>
              </div>
              <div className="border-t border-slate-100" />
              <form onSubmit={handlePasswordSave} className="p-6 space-y-4">
                <div className="grid grid-cols-3 items-start gap-4">
                  <label className="pt-2 text-sm font-medium text-slate-700 text-right">New Password</label>
                  <div className="col-span-2">
                    <div className="relative">
                      <input type={showNew ? 'text' : 'password'} required placeholder="New password" value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {strength && (
                      <div className="mt-2">
                        <div className="h-1 w-full rounded-full bg-slate-100"><div className={`h-1 rounded-full transition-all ${strength.color} ${strength.width}`} /></div>
                        <p className={`mt-1 text-xs font-medium ${strength.text}`}>{strength.label}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm font-medium text-slate-700 text-right">Confirm Password</label>
                  <div className="col-span-2 relative">
                    <input type={showConfirm ? 'text' : 'password'} required placeholder="Confirm password" value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className={`w-full rounded-lg border px-3.5 py-2 pr-10 text-sm focus:outline-none focus:ring-2 ${passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'}`} />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button type="submit" disabled={saving}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                    {saving ? 'Updating...' : 'Update password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Plan tab */}
          {tab === 'plan' && (
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="p-6 pb-4">
                <h2 className="font-semibold text-slate-900">Your Plan</h2>
                <p className="mt-0.5 text-sm text-slate-500">Upgrade or manage your subscription at any time.</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">FREE</span>
                  <span className="text-sm text-slate-500">Current plan</span>
                </div>
              </div>
              <div className="border-t border-slate-100" />
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Free plan — active */}
                  <div className="rounded-xl border-2 border-indigo-500 p-5">
                    <p className="font-semibold text-slate-900">FREE</p>
                    <p className="text-sm text-slate-500 mt-0.5">Free</p>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                      {['Appointment management', 'Doctor & patient management', 'Basic reports', 'Standard support'].map(f => (
                        <li key={f} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />{f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                      <span className="text-sm font-medium text-indigo-600">Current Plan</span>
                    </div>
                  </div>

                  {/* Pro plan */}
                  <div className="rounded-xl border border-slate-200 p-5">
                    <p className="font-semibold text-slate-900">PRO</p>
                    <p className="text-sm text-slate-500 mt-0.5">৳500/month</p>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                      {['Advanced analytics dashboard', 'Prescription tracking', 'Bulk data export', 'Priority support', 'Custom branding'].map(f => (
                        <li key={f} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />{f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                      <span className="text-sm text-slate-400">Upgrade</span>
                      <span className="ml-1.5 text-xs text-slate-400">soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
