'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';

// ── validation ──────────────────────────────────────────────────────────────
const validateEmail = (v: string) => {
  if (!v.trim()) return 'Email is required';
  if (!v.includes('@')) return 'Email must contain @';
  const [, domain] = v.split('@');
  if (!domain || !domain.includes('.')) return 'Email must have a valid domain (e.g. .com)';
  if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)) return 'Enter a valid email address';
  return '';
};

const validatePassword = (v: string) => {
  if (!v) return 'Password is required';
  if (v.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-zA-Z]/.test(v)) return 'Password must contain at least one letter';
  if (!/[0-9]/.test(v)) return 'Password must contain at least one number';
  if (!/[@#$!%*?&\-_]/.test(v)) return 'Password must contain a special character (@ # $ ! % * ? &)';
  return '';
};

// ── component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const blurValidate = (field: 'email' | 'password') => {
    const msg = field === 'email' ? validateEmail(form.email) : validatePassword(form.password);
    setErrors((prev) => ({ ...prev, [field]: msg }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(form.email);
    const passErr = validatePassword(form.password);
    setErrors({ email: emailErr, password: passErr });
    if (emailErr || passErr) return;

    setServerError('');
    setLoading(true);
    try {
      const res = await api.login(form.email, form.password);
      localStorage.setItem('token', res.access_token);
      localStorage.setItem('role', res.role);
      localStorage.setItem('userEmail', form.email);
      if (res.adminId) localStorage.setItem('adminId', String(res.adminId));
      if (res.doctorId) localStorage.setItem('doctorId', String(res.doctorId));
      if (res.patientId) localStorage.setItem('patientId', String(res.patientId));

      if (res.role === 'admin') router.push('/dashboard/admin');
      else if (res.role === 'doctor') router.push('/dashboard/doctor');
      else router.push('/dashboard/patient');
    } catch (err: unknown) {
      setServerError((err as Error).message || 'Login failed. Please check your credentials.');
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
          <blockquote className="text-2xl font-medium leading-snug text-white">
            "Streamline your clinic. Empower your team. Deliver exceptional patient care."
          </blockquote>
          <p className="mt-4 text-slate-400">The all-in-one clinic management platform.</p>
        </div>
        <div className="flex gap-6 text-sm text-slate-500">
          <span>Secure</span>
          <span>Reliable</span>
          <span>Fast</span>
        </div>
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
            <h1 className="text-2xl font-bold text-slate-900">Sign in to your account</h1>
            <p className="mt-1 text-sm text-slate-500">Welcome back! Enter your credentials to continue.</p>
          </div>

          {serverError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                  onBlur={() => blurValidate('password')}
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
            </div>

            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-xs text-indigo-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
