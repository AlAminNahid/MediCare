'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { api } from '@/lib/api';

interface Patient {
  patientId: number;
  fullName: string;
  phoneNumber: string;
  age: number;
  gender: string;
  address: string;
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin
      .getPatients()
      .then((d) => setPatients(d as Patient[]))
      .finally(() => setLoading(false));
  }, []);

  const genderBadge = (gender: string) =>
    gender?.toLowerCase() === 'female'
      ? 'bg-pink-50 text-pink-700'
      : 'bg-sky-50 text-sky-700';

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-6 w-6 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500">Platform-wide view of registered patients</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : patients.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No patients found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {['#', 'Name', 'Phone', 'Age', 'Gender', 'Address'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p, i) => (
                <tr key={p.patientId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-slate-400">{i + 1}</td>
                  <td className="px-5 py-4 font-medium text-slate-900">{p.fullName}</td>
                  <td className="px-5 py-4 text-slate-600">{p.phoneNumber}</td>
                  <td className="px-5 py-4 text-slate-600">{p.age}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${genderBadge(p.gender)}`}>{p.gender}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 max-w-xs truncate">{p.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
