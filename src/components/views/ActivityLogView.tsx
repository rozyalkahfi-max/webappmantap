import React, { useState } from 'react';
import { History, Search, Download, ShieldCheck } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { DataTable, ColumnDef } from '../common/DataTable';
import { ActivityLog } from '../../types';

export const ActivityLogView: React.FC = () => {
  const { activityLogs } = useSchool();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredLogs = activityLogs.filter((log) => {
    if (selectedCategory !== 'ALL' && log.category !== selectedCategory) return false;
    return true;
  });

  const columns: ColumnDef<ActivityLog>[] = [
    {
      key: 'timestamp',
      header: 'Waktu Aktivitas',
      sortable: true,
      width: '160px',
      render: (l) => <span className="font-mono text-slate-500 text-[11px]">{l.timestamp}</span>,
    },
    {
      key: 'userName',
      header: 'Pengguna',
      sortable: true,
      render: (l) => (
        <div>
          <span className="font-semibold text-slate-900 block">{l.userName}</span>
          <span className="text-[10px] text-purple-700 font-mono">
            {l.userRole.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      sortable: true,
      align: 'center',
      width: '110px',
      render: (l) => (
        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {l.category}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Aksi / Tindakan',
      sortable: true,
      render: (l) => <span className="font-semibold text-slate-800">{l.action}</span>,
    },
    {
      key: 'details',
      header: 'Rincian Operasi',
      sortable: false,
      render: (l) => <span className="text-slate-600 text-[11px]">{l.details}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Riwayat Aktivitas & Audit Trail Sistem
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log operasional transparansi seluruh tindakan pengubahan data presensi, nilai, pelanggaran, dan master
          </p>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200">
        <span className="text-xs font-semibold text-slate-600">Filter Kategori:</span>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-medium text-slate-800"
        >
          <option value="ALL">Semua Kategori</option>
          <option value="Absensi">Absensi</option>
          <option value="Nilai">Nilai</option>
          <option value="Pelanggaran">Pelanggaran</option>
          <option value="BK">Bimbingan Konseling (BK)</option>
          <option value="Master">Data Master</option>
          <option value="Import">Import Excel</option>
          <option value="Pengaturan">Pengaturan</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto font-mono">
          {filteredLogs.length} Entri Log Tercatat
        </span>
      </div>

      <DataTable
        data={filteredLogs}
        columns={columns}
        searchPlaceholder="Cari berdasarkan nama pengguna, aksi, atau rincian..."
        searchKeys={['userName', 'action', 'details', 'category', 'timestamp']}
        exportFilename={`Audit_Trail_Log_${Date.now()}`}
        sheetName="Audit Log"
      />
    </div>
  );
};
