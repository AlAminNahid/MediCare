'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, Eye, EyeOff, Check, X } from 'lucide-react';
import { api } from '@/lib/api';

// ── validation helpers ────────────────────────────────────────────────────────
const validateName = (v: string) => {
  if (!v.trim()) return 'Full name is required';
  if (!/^[a-zA-Z\s.'-]+$/.test(v)) return 'Name can only contain letters and spaces';
  if (v.trim().length < 2) return 'Name must be at least 2 characters';
  return '';
};

const validateEmail = (v: string) => {
  if (!v.trim()) return 'Email is required';
  if (!v.includes('@')) return 'Email must contain @';
  const [, domain] = v.split('@');
  if (!domain || !domain.includes('.')) return 'Email must have a valid domain (e.g. .com)';
  if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)) return 'Enter a valid email address';
  return '';
};

const validatePhone = (v: string) => {
  if (!v.trim()) return 'Phone number is required';
  if (!/^[+\d\s\-()]{7,}$/.test(v)) return 'Enter a valid phone number';
  return '';
};

const pwRules = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'Contains a letter', test: (v: string) => /[a-zA-Z]/.test(v) },
  { label: 'Contains a number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'Contains a special character (@ # $ ! % * ? &)', test: (v: string) => /[@#$!%*?&\-_]/.test(v) },
];

const validatePassword = (v: string) => {
  if (!v) return 'Password is required';
  for (const rule of pwRules) {
    if (!rule.test(v)) return rule.label.replace('Contains a', 'Password must contain a').replace('At least', 'Password must have at least');
  }
  return '';
};

// ── component ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', role: 'patient', password: '' });
  const [errors, setErrors] = useState({ fullName: '', email: '', phoneNumber: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validators: Record<string, (v: string) => string> = {
    fullName: validateName,
    email: validateEmail,
    phoneNumber: validatePhone,
    password: validatePassword,
  };

  const blurValidate = (field: keyof typeof errors) => {
    const msg = validators[field]((form as any)[field]);
    setErrors((prev) => ({ ...prev, [field]: msg }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      fullName: validateName(form.fullName),
      email: validateEmail(form.email),
      phoneNumber: validatePhone(form.phoneNumber),
      password: validatePassword(form.password),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setServerError('');
    setLoading(true);
    try {
      await api.register(form);
      router.push('/login');
    } catch (err: unknown) {
      setServerError((err as Error).message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (err: string) =>
    `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 ${
      err
        ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
    }`;

  return (
    <div className="flex min-h-screen">
      {/* ── Left branding panel ── */}
      <div className="hidden w-1/2 flex-col justify-between bg-slate-900 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">MediCare</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-white">Join thousands of healthcare professionals</h2>
          <p className="mt-4 text-slate-400">Manage your chamber, patients, and appointments all from one place.</p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: 'Doctors', stat: '500+' },
              { label: 'Patients Served', stat: '10k+' },
              { label: 'Appointments', stat: '50k+' },
              { label: 'Uptime', stat: '99.9%' },
            ].map(({ label, stat }) => (
              <div key={label} className="rounded-xl bg-slate-800 p-4">
                <p className="text-2xl font-bold text-white">{stat}</p>
                <p className="text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:underline">Sign in</Link>
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8">
            <Link href="/" className="mb-6 flex w-fit items-center gap-2 lg:hidden transition-opacity hover:opacity-70">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">MediCare</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500">Fill in the details below to get started.</p>
          </div>

          {serverError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                placeholder="Dr. John Smith"
                value={form.fullName}
                onChange={(e) => {
                  setForm({ ...form, fullName: e.target.value });
                  if (errors.fullName) setErrors((p) => ({ ...p, fullName: '' }));
                }}
                onBlur={() => blurValidate('fullName')}
                className={inputClass(errors.fullName)}
              />
              {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                }}
                onBlur={() => blurValidate('email')}
                className={inputClass(errors.email)}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone Number</label>
              <input
                type="tel"
                placeholder="+880 1234 567890"
                value={form.phoneNumber}
                onChange={(e) => {
                  setForm({ ...form, phoneNumber: e.target.value });
                  if (errors.phoneNumber) setErrors((p) => ({ ...p, phoneNumber: '' }));
                }}
                onBlur={() => blurValidate('phoneNumber')}
                className={inputClass(errors.phoneNumber)}
              />
              {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (errors.password) setErrors((p) => ({ ...p, password: '' }));
                  }}
                  onFocus={() => setPwFocused(true)}
                  onBlur={() => { setPwFocused(false); blurValidate('password'); }}
                  className={`${inputClass(errors.password)} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}

              {/* Password strength checklist */}
              {(pwFocused || form.password) && (
                <ul className="mt-2.5 space-y-1.5 rounded-lg border border-slate-200 bg-white p-3">
                  {pwRules.map(({ label, test }) => {
                    const passed = test(form.password);
                    return (
                      <li key={label} className={`flex items-center gap-2 text-xs ${passed ? 'text-green-600' : 'text-slate-400'}`}>
                        {passed
                          ? <Check className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                          : <X className="h-3.5 w-3.5 flex-shrink-0 text-slate-300" />}
                        {label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">I am a</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
