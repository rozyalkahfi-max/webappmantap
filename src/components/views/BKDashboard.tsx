import React from 'react';
import {
  ShieldAlert,
  HeartHandshake,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  FileSpreadsheet,
  Users,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import { DonutChart } from '../common/InteractiveCharts';

export const BKDashboard: React.FC<{ onNavigate: (menuId: string) => void }> = ({ onNavigate }) => {
  const { priorityBkStudents, counselingRecords, violations } = useSchool();
  const { currentUser } = useAuth();

  const totalPriority = priorityBkStudents.length;

  // Counseling statuses
  const inProgressCount = counselingRecords.filter((c) => c.status === 'Sedang Dalam Pembinaan').length;
  const monitoringCount = counselingRecords.filter((c) => c.status === 'Monitoring').length;
  const completedCount = counselingRecords.filter((c) => c.status === 'Selesai').length;
  const pendingCount = Math.max(0, totalPriority - (inProgressCount + monitoringCount + completedCount));

  const statusDonut = [
    { label: 'Dalam Pembinaan', value: inProgressCount, color: '#f59e0b' },
    { label: 'Monitoring', value: monitoringCount, color: '#3b82f6' },
    { label: 'Selesai', value: completedCount, color: '#10b981' },
    { label: 'Belum Ditangani', value: pendingCount, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 rounded-2xl p-6 text-white shadow-lg border border-rose-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">
            Portal Bimbingan Konseling (BK)
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Dashboard Konselor Sekolah
          </h2>
          <p className="text-xs text-rose-200 mt-1 max-w-xl leading-relaxed">
            Konselor: <strong className="text-white">{currentUser?.name}</strong> · Menangani siswa dengan akumulasi &gt;30 poin pelanggaran melalui konseling individual, mediasi restorative justice, dan kontrak perilaku.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('counseling')}
            className="flex items-center gap-2 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Tangani Kasus BK</span>
          </button>
        </div>
      </div>

      {/* Automatic Red Warning Banner for BK Priority Cases (>30-50+ points) - Requirement 8 */}
      {totalPriority > 0 && (
        <div className="p-4 bg-gradient-to-r from-red-700 via-rose-600 to-red-800 text-white rounded-xl shadow-lg border-2 border-red-500 animate-in fade-in space-y-2.5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white px-2 py-0.5 rounded">
                  Peringatan Merah Otomatis Sistem BK
                </span>
                <span className="text-xs text-rose-200 font-mono">Batas Eskalasi: 30–50+ Poin</span>
              </div>
              <h3 className="font-bold text-sm tracking-tight text-white mt-0.5">
                🚨 Perhatian Konselor: {totalPriority} Siswa Mencapai Akumulasi Poin Di Atas 30–50
              </h3>
              <p className="text-xs text-rose-100 mt-1 leading-relaxed">
                Pelanggaran di bawah 30 poin telah dibimbing oleh Wali Kelas masing-masing. Siswa dengan akumulasi &gt;30 poin di bawah ini memerlukan tindak lanjut langsung dari Guru BK (Konseling individual, mediasi, surat pemanggilan orang tua, dan kontrak perilaku).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-500/60">
            <div className="flex flex-wrap gap-2">
              {priorityBkStudents.map((item) => (
                <div
                  key={item.student.id}
                  className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs"
                >
                  <span className="font-bold">{item.student.name}</span>
                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                    Kelas {item.student.classId}
                  </span>
                  <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {item.totalPoints} Poin
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('counseling')}
              className="px-3 py-1.5 bg-white text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer shrink-0"
            >
              Buka Form Penanganan Kasus →
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="Siswa Prioritas BK"
          value={`${totalPriority} Siswa`}
          subtitle="Akumulasi > 30 Poin"
          icon={ShieldAlert}
          accentColor="rose"
        />
        <StatCard
          title="Sedang Dibina"
          value={`${inProgressCount} Kasus`}
          subtitle="Proses Konseling Aktif"
          icon={Clock}
          accentColor="amber"
        />
        <StatCard
          title="Fase Monitoring"
          value={`${monitoringCount} Kasus`}
          subtitle="Pemantauan Perilaku"
          icon={CheckCircle2}
          accentColor="blue"
        />
        <StatCard
          title="Kasus Selesai"
          value={`${completedCount} Siswa`}
          subtitle="Komitmen Terpenuhi"
          icon={CheckCircle2}
          accentColor="emerald"
        />
      </div>

      {/* 2-Columns: Priority Queue Table & Donut Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Antrean Siswa Prioritas Bimbingan (&gt;30 Poin)</span>
              </h3>
              <p className="text-xs text-slate-500">Siswa yang terdeteksi otomatis oleh sistem tata tertib</p>
            </div>
            <button
              onClick={() => onNavigate('counseling')}
              className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Seluruh Kasus</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {priorityBkStudents.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">
                Tidak ada siswa yang melebihi batas 30 poin pelanggaran.
              </p>
            ) : (
              priorityBkStudents.map((item) => (
                <div
                  key={item.student.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 text-xs hover:border-blue-400 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.student.name}</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 rounded">
                        Kelas {item.student.classId}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                      NIS: {item.student.nis} · {item.violations.length} Pelanggaran Tercatat
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Status: <strong className="text-slate-700">{item.latestCounseling?.status || 'Belum Ditangani'}</strong>
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 tabular-nums">
                      {item.totalPoints} Poin
                    </span>
                    <button
                      onClick={() => onNavigate('counseling')}
                      className="text-[11px] text-blue-600 hover:underline font-semibold"
                    >
                      Buka Kasus →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <DonutChart
            title="Distribusi Status Penanganan Kasus BK"
            subtitle="Pemantauan alur penanganan bimbingan konseling"
            data={statusDonut}
            centerLabel="Total Kasus"
            centerValue={totalPriority}
          />
        </div>
      </div>
    </div>
  );
};
