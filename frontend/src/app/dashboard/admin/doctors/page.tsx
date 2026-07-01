'use client';

import { useEffect, useState } from 'react';
import { Stethoscope } from 'lucide-react';
import { api } from '@/lib/api';

interface Doctor {
  doctorId: number;
  fullName: string;
  phoneNumber: string;
  specialization: string;
  visitFee: number;
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin
      .getDoctors()
      .then((d) => setDoctors(d as Doctor[]))
      .catch(() => setError('Failed to load doctors'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Stethoscope className="h-6 w-6 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctors</h1>
          <p className="text-sm text-slate-500">Platform-wide view of registered doctors</p>
        </div>
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
                {['#', 'Name', 'Phone', 'Specialization', 'Visit Fee'].map((h) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
