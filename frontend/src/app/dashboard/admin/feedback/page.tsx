'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, CheckCircle, Clock, Stethoscope, User } from 'lucide-react';
import { api } from '@/lib/api';

interface Feedback {
  feedbackId: number;
  senderRole: 'doctor' | 'patient';
  subject: string;
  message: string;
  status: 'pending' | 'reviewed';
  createdAt: string;
  doctor?: { fullName: string };
  patient?: { fullName: string };
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<number | null>(null);

  useEffect(() => {
    api.admin.getFeedbacks().then((d) => setFeedbacks(d as Feedback[])).finally(() => setLoading(false));
  }, []);

  const markReviewed = async (id: number) => {
    setMarking(id);
    try {
      await api.admin.markFeedbackReviewed(id);
      setFeedbacks((prev) => prev.map((f) => f.feedbackId === id ? { ...f, status: 'reviewed' } : f));
    } finally {
      setMarking(null);
    }
  };

  const senderName = (fb: Feedback) =>
    fb.senderRole === 'doctor' ? fb.doctor?.fullName : fb.patient?.fullName;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Feedback & Complaints</h1>
          <p className="text-sm text-slate-500">Messages submitted by doctors and patients</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-400">
          No feedback received yet
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div key={fb.feedbackId} className={`rounded-xl border bg-white shadow-sm overflow-hidden transition ${fb.status === 'reviewed' ? 'border-slate-100 opacity-70' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full ${fb.senderRole === 'doctor' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {fb.senderRole === 'doctor'
                      ? <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
                      : <User className="h-3.5 w-3.5 text-green-600" />}
                  </div>
                  <span className="font-medium text-slate-800">{senderName(fb)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${fb.senderRole === 'doctor' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                    {fb.senderRole}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
                  {fb.status === 'reviewed' ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      <CheckCircle className="h-3 w-3" /> Reviewed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      <Clock className="h-3 w-3" /> Pending
                    </span>
                  )}
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="font-semibold text-slate-900">{fb.subject}</p>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{fb.message}</p>
              </div>
              {fb.status === 'pending' && (
                <div className="border-t border-slate-100 px-5 py-3 flex justify-end">
                  <button
                    onClick={() => markReviewed(fb.feedbackId)}
                    disabled={marking === fb.feedbackId}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    {marking === fb.feedbackId ? 'Marking...' : 'Mark as Reviewed'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
