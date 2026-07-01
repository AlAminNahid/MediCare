'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarPlus, Check, Stethoscope, Building2, Search, X, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';
import type { Chamber } from '@/types';

interface Doctor {
  doctorId: number;
  fullName: string;
  specialization: string;
  visitFee: number;
  phoneNumber: string;
  degrees: string[];
}

export default function BookAppointmentPage() {
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationQuery, setLocationQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [chambersLoading, setChambersLoading] = useState(false);
  const [chamberId, setChamberId] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    api.patient.getDoctors(undefined).then((d) => {
      setAllDoctors(d as Doctor[]);
      setDoctors(d as Doctor[]);
    }).finally(() => setLoading(false));
  }, []);

  const handleLocationSearch = (q: string) => {
    setLocationQuery(q);
    clearTimeout(searchTimer.current);
    if (!q.trim()) {
      setDoctors(allDoctors);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await api.patient.getDoctors(q) as Doctor[];
        setDoctors(results);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const clearLocation = () => {
    setLocationQuery('');
    setDoctors(allDoctors);
  };

  const handleDoctorSelect = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setChamberId(null);
    setChambersLoading(true);
    api.patient.getChambers(doc.doctorId).then((c) => setChambers(c as Chamber[])).finally(() => setChambersLoading(false));
  };

  const selectedChamber = chambers.find((c) => c.chamberId === chamberId) || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chamberId) return;
    setSaving(true); setError('');
    try {
      await api.patient.bookAppointment({ chamberId, date, reason });
      setSuccess(true);
      setSelectedDoctor(null); setChamberId(null); setDate(''); setReason('');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to book appointment');
    } finally { setSaving(false); }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <CalendarPlus className="h-6 w-6 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Book Appointment</h1>
          <p className="text-sm text-slate-500">Find a doctor by location, then pick a chamber</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <Check className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">Appointment booked successfully!</p>
            <p className="text-sm text-green-600">You can view your serial number in My Appointments.</p>
          </div>
          <button onClick={() => setSuccess(false)} className="ml-auto text-sm text-green-600 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Location search bar */}
      <div className="mb-5">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by area or location (e.g. Sreemongal, Dhaka)..."
            value={locationQuery}
            onChange={(e) => handleLocationSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {locationQuery && (
            <button onClick={clearLocation} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {locationQuery && !searching && (
          <p className="mt-1.5 text-xs text-slate-500">
            {doctors.length > 0 ? `${doctors.length} doctor${doctors.length !== 1 ? 's' : ''} found near "${locationQuery}"` : `No doctors found near "${locationQuery}"`}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Doctor list */}
        <div className="lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            {locationQuery ? 'Doctors in this area' : 'Available Doctors'}
          </h2>
          {loading || searching ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400">
              No doctors found{locationQuery ? ' in this area' : ''}
            </div>
          ) : (
            <div className="space-y-3">
              {doctors.map((doc) => (
                <button key={doc.doctorId} onClick={() => handleDoctorSelect(doc)}
                  className={`w-full rounded-xl border p-4 text-left transition ${selectedDoctor?.doctorId === doc.doctorId ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-500/20' : 'border-slate-200 bg-white hover:border-indigo-300'}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      {doc.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{doc.fullName}</p>
                      <p className="text-xs text-slate-500">{doc.specialization}</p>
                      {Array.isArray(doc.degrees) && doc.degrees.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {doc.degrees.map(d => (
                            <span key={d} className="flex items-center gap-0.5 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600">
                              <GraduationCap className="h-2.5 w-2.5" />{d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Booking form */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Appointment Details</h2>
          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            {!selectedDoctor ? (
              <div className="py-10 text-center text-slate-400">Select a doctor to see their chambers</div>
            ) : (
              <>
                {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Chamber</label>
                  {chambersLoading ? (
                    <div className="flex items-center justify-center py-6"><div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
                  ) : chambers.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400">This doctor has no chambers yet</div>
                  ) : (
                    <div className="space-y-2">
                      {chambers.map((c) => (
                        <button type="button" key={c.chamberId} onClick={() => setChamberId(c.chamberId)}
                          className={`flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition ${chamberId === c.chamberId ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-indigo-300'}`}>
                          <Building2 className="mt-0.5 h-4 w-4 text-indigo-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{c.name}</p>
                            <p className="text-xs text-slate-500">{c.address}</p>
                            <p className="text-xs text-slate-500">{c.startTime?.slice(0, 5)} – {c.endTime?.slice(0, 5)} · {Array.isArray(c.days) ? c.days.join(', ') : c.days}</p>
                            <p className="mt-1 text-sm font-semibold text-indigo-600">৳{c.visitFee ?? '-'}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedChamber && (
                  <div className="flex items-center gap-3 rounded-lg bg-indigo-50 p-4">
                    <Stethoscope className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium text-indigo-900">{selectedDoctor.fullName} · {selectedChamber.name}</p>
                      <p className="text-xs text-indigo-600">You'll receive the next available serial number for this date</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
                  <input type="date" required min={new Date().toISOString().split('T')[0]} value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Reason for Visit</label>
                  <textarea required rows={3} placeholder="Describe your symptoms or reason for the visit..." value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>

                <button type="submit" disabled={saving || !chamberId || !date}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60">
                  <CalendarPlus className="h-4 w-4" />{saving ? 'Booking...' : 'Confirm Booking'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
