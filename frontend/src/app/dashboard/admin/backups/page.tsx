'use client';

import { useEffect, useState } from 'react';
import { HardDrive, Plus, Trash2, Download } from 'lucide-react';
import { api } from '@/lib/api';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Backup {
  backupId: number;
  fileName: string;
  createdAt: string;
  createdBy: string;
}

export default function AdminBackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.admin
      .getBackups()
      .then((d) => setBackups(d as Backup[]))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError('');
    try {
      // Download the .sql file — the filename comes from the Content-Disposition header
      const fileName = await api.admin.downloadBackup();
      // Log the backup record
      const added = await api.admin.createBackup(fileName) as Backup;
      setBackups((prev) => [added, ...prev]);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await api.admin.deleteBackup(deleteId);
      setBackups((prev) => prev.filter((b) => b.backupId !== deleteId));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const fmt = (dt: string) =>
    new Date(dt).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HardDrive className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Backups</h1>
            <p className="text-sm text-slate-500">Download a full SQL dump of the database</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
        >
          {creating ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create Backup
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Info banner */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Download className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
        <p className="text-sm text-blue-700">
          Clicking <strong>Create Backup</strong> generates a full SQL dump of all tables and downloads it as a <code className="rounded bg-blue-100 px-1 font-mono text-xs">.sql</code> file. Each backup is also logged below.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : backups.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No backups yet. Create your first one.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {['#', 'File Name', 'Created At', 'Created By', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backups.map((b, i) => (
                <tr key={b.backupId} className="hover:bg-slate-50">
                  <td className="px-5 py-4 text-slate-400">{i + 1}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-700">{b.fileName}</td>
                  <td className="px-5 py-4 text-slate-600">{fmt(b.createdAt)}</td>
                  <td className="px-5 py-4 text-slate-600">{b.createdBy}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setDeleteId(b.backupId)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {deleteId !== null && (
        <ConfirmModal
          title="Delete this backup record?"
          message="The backup log entry will be removed. The downloaded .sql file is unaffected."
          confirmLabel="Delete Record"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
