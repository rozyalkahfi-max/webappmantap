import React, { useState, useMemo } from 'react';
import { History, Search, Download, ShieldCheck, Filter } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { DataTable, ColumnDef } from '../common/DataTable';
import { ActivityLog } from '../../types';

export const ActivityLogView: React.FC = () => {
  const { activityLogs } = useSchool();
  const { activeRole, currentUser } = useAuth();

  // Role-scoped categories per requirement 8:
  // "fitur kategori di Riwayat tampilkan hanya semestinya jika guru tidak perlu melihat yang bukan role nya. Hanya admin yang bisa melihat semua Riwayat aktifitas"
  const allowedCategories = useMemo(() => {
    switch (activeRole) {
      case 'admin_operator':
        return ['ALL', 'Absensi', 'Nilai', 'Pelanggaran', 'BK', 'Master', 'Import', 'Pengaturan'];
      case 'guru_mapel':
        return ['ALL', 'Absensi', 'Nilai', 'Pelanggaran'];
      case 'wali_kelas':
        return ['ALL', 'Absensi', 'Nilai', 'Pelanggaran', 'BK'];
      case 'guru_bk':
        return ['ALL', 'Pelanggaran', 'BK'];
      case 'kepala_sekolah':
        return ['ALL', 'Absensi', 'Nilai', 'Pelanggaran', 'BK'];
      default:
        return ['ALL', 'Absensi', 'Nilai'];
    }
  }, [activeRole]);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Filter logs:
  // 1. If not admin, restrict logs strictly to allowed categories for that role
  // 2. Also restrict to selectedCategory dropdown
  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      // Non-admin cannot see categories outside their allowed scope
      if (activeRole !== 'admin_operator' && !allowedCategories.includes(log.category)) {
        return false;
      }

      // Dropdown filter
      if (selectedCategory !== 'ALL' && log.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [activityLogs, activeRole, allowedCategories, selectedCategory]);

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
          <span className="text-[10px] text-blue-700 font-mono">
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
            {activeRole === 'admin_operator'
              ? 'Akses Penuh Admin: Memantau riwayat seluruh aktivitas operasional, master data, dan konfigurasi sistem.'
              : 'Menampilkan riwayat aktivitas relevan sesuai dengan hak akses dan peran Anda.'}
          </p>
        </div>
      </div>

      {/* Filter Ribbon with Role Restrictions */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <Filter className="w-4 h-4 text-slate-500" />
        <span className="text-xs font-semibold text-slate-700">Filter Kategori Peran:</span>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
        >
          {allowedCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'ALL' ? 'Semua Kategori Diizinkan' : cat}
            </option>
          ))}
        </select>

        <span className="text-xs text-slate-500 ml-auto font-mono">
          <strong className="text-slate-900">{filteredLogs.length}</strong> Log Ditampilkan
        </span>
      </div>

      <DataTable
        data={filteredLogs}
        columns={columns}
        searchPlaceholder="Cari riwayat aktivitas..."
        searchKeys={['action', 'details', 'userName', 'category']}
        exportFilename={`Riwayat_Aktivitas_${Date.now()}`}
        sheetName="Audit Trail"
      />
    </div>
  );
};
