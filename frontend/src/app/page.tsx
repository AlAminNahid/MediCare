import Link from 'next/link';
import { Activity, Calendar, Users, FileText, Shield } from 'lucide-react';

const features = [
  {
    icon: <Users className="h-6 w-6 text-indigo-600" />,
    title: 'Patient Management',
    desc: 'Maintain complete patient records, history, and contact details in one place.',
  },
  {
    icon: <Calendar className="h-6 w-6 text-indigo-600" />,
    title: 'Appointment Scheduling',
    desc: 'Book, manage, and track appointments with real-time status updates.',
  },
  {
    icon: <FileText className="h-6 w-6 text-indigo-600" />,
    title: 'Digital Prescriptions',
    desc: 'Issue and store prescriptions digitally with medicine dosage details.',
  },
  {
    icon: <Shield className="h-6 w-6 text-indigo-600" />,
    title: 'Role-Based Access',
    desc: 'Separate portals for admins, doctors, and patients with proper permissions.',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">MediCare</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6 py-24 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700">
          <Activity className="h-3.5 w-3.5" />
          Clinic Management System
        </div>
        <h1 className="mx-auto max-w-3xl text-5xl font-extrabold tracking-tight text-slate-900">
          Modern healthcare management,{' '}
          <span className="text-indigo-600">simplified</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-500">
          MediCare brings doctors, patients, and administrators together on one intuitive platform — from appointments to prescriptions.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
          >
            Start for free
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to run a clinic</h2>
            <p className="mt-3 text-slate-500">Powerful features for every role in your healthcare team.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-6 transition hover:border-indigo-200 hover:shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                  {icon}
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-white">Ready to modernize your clinic?</h2>
        <p className="mt-3 text-indigo-200">Join hundreds of clinics already using MediCare.</p>
        <Link
          href="/register"
          className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-600 shadow-md transition hover:bg-indigo-50"
        >
          Create your account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white px-6 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} MediCare. Clinic Management System.
      </footer>
    </div>
  );
}
