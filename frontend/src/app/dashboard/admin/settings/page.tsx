'use client';

import { useEffect, useState } from 'react';
import { Settings, UserCircle, Lock, Save, CheckCircle, AlertCircle, Eye, EyeOff, Phone, Mail, User } from 'lucide-react';
import { api } from '@/lib/api';

interface AdminProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
}

type Tab = 'profile' | 'password';

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [profileForm, setProfileForm] = useState({ fullName: '', email: '', phoneNumber: '' });
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin
      .getProfile()
      .then((d) => {
        const p = d as AdminProfile;
        setProfile(p);
        setProfileForm({ fullName: p.fullName, email: p.email, phoneNumber: p.phoneNumber });
        localStorage.setItem('userFullName', p.fullName);
      })
      .finally(() => setLoading(false));
  }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setError('');
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.admin.updateProfile(profileForm);
      setProfile({ ...profileForm });
      localStorage.setItem('userFullName', profileForm.fullName);
      showSuccess('Profile updated successfully');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      await api.admin.updateProfile({ password: passwordForm.newPassword });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      showSuccess('Password updated successfully');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const passwordStrength = (pw: string) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-600', width: 'w-1/4' };
    if (score === 2) return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600', width: 'w-2/4' };
    if (score === 3) return { label: 'Good', color: 'bg-blue-500', text: 'text-blue-600', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-green-500', text: 'text-green-600', width: 'w-full' };
  };

  const strength = passwordStrength(passwordForm.newPassword);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
            <Settings className="h-5 w-5 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        </div>
        <p className="text-sm text-slate-500 ml-12">Manage your account information and security</p>
      </div>

      <div className="flex gap-8 max-w-4xl">
        {/* Sidebar tabs */}
        <div className="w-52 flex-shrink-0">
          <nav className="space-y-1">
            {([
              { key: 'profile', label: 'Profile', sub: 'Name, email, phone', icon: <UserCircle className="h-4 w-4" /> },
              { key: 'password', label: 'Password', sub: 'Change your password', icon: <Lock className="h-4 w-4" /> },
            ] as { key: Tab; label: string; sub: string; icon: React.ReactNode }[]).map(({ key, label, sub, icon }) => (
              <button
                key={key}
                onClick={() => { setTab(key); setSuccess(''); setError(''); }}
                className={`w-full flex items-start gap-3 rounded-xl px-3.5 py-3 text-left transition-colors ${
                  tab === key
                    ? 'bg-white border border-slate-200 shadow-sm'
                    : 'hover:bg-white/60'
                }`}
              >
                <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
                  tab === key ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {icon}
                </div>
                <div>
                  <p className={`text-sm font-medium ${tab === key ? 'text-slate-900' : 'text-slate-600'}`}>{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Alerts */}
          {success && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {tab === 'profile' && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Profile card header */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold text-white shadow-inner backdrop-blur-sm">
                    {profileForm.fullName.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{profile?.fullName}</p>
                    <p className="text-sm text-indigo-200">{profile?.email}</p>
                    <span className="mt-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">Admin</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="p-6 space-y-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account Information</p>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Sarah Johnson"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="+880 1700 000000"
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {tab === 'password' && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                    <Lock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Change Password</p>
                    <p className="text-xs text-slate-500">Choose a strong password to keep your account secure</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePasswordSave} className="p-6 space-y-5">
                {/* Requirements hint */}
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1.5">Password requirements</p>
                  <ul className="space-y-1 text-xs text-blue-600">
                    {[
                      'At least 8 characters long',
                      'Contains uppercase and lowercase letters',
                      'Includes at least one number',
                      'Has a special character (e.g. @, #, $)',
                    ].map((req) => (
                      <li key={req} className="flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-blue-400 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      required
                      placeholder="Enter new password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {strength && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full rounded-full bg-slate-100">
                        <div className={`h-1.5 rounded-full transition-all ${strength.color} ${strength.width}`} />
                      </div>
                      <p className={`mt-1 text-xs font-medium ${strength.text}`}>{strength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className={`w-full rounded-lg border py-2.5 px-3.5 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                        passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                  >
                    <Lock className="h-4 w-4" />
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
