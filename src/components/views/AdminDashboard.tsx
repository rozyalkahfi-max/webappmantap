import React from 'react';
import {
  Users,
  GraduationCap,
  DoorClosed,
  BookOpen,
  CalendarDays,
  UserCog,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { StatCard } from '../common/StatCard';
import { InteractiveBarChart, DonutChart } from '../common/InteractiveCharts';

export const AdminDashboard: React.FC<{ onNavigate: (menuId: string) => void }> = ({ onNavigate }) => {
  const { students, teachers, classes, subjects, schedules, activityLogs, clearAllExceptAdmin } = useSchool();

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Aktif').length;
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.status === 'Aktif').length;
  const totalClasses = classes.length;
  const totalSubjects = subjects.length;
  const totalSchedules = schedules.length;

  // Grade breakdown: Kelas 7, 8, 9
  const grade7Count = students.filter((s) => s.classId.startsWith('7')).length;
  const grade8Count = students.filter((s) => s.classId.startsWith('8')).length;
  const grade9Count = students.filter((s) => s.classId.startsWith('9')).length;

  const barData = [
    { label: 'Tingkat 7 (7A–7H)', value: grade7Count, color: '#1d4ed8' },
    { label: 'Tingkat 8 (8A–8H)', value: grade8Count, color: '#2563eb' },
    { label: 'Tingkat 9 (9A–9H)', value: grade9Count, color: '#3b82f6' },
  ];

  const roleDonut = [
    { label: 'Wali Kelas', value: teachers.filter((t) => t.classId).length, color: '#4f46e5' },
    { label: 'Guru Mapel', value: teachers.filter((t) => !t.classId && t.role === 'guru_mapel').length, color: '#0284c7' },
    { label: 'Guru BK', value: teachers.filter((t) => t.role === 'guru_bk').length, color: '#d97706' },
    { label: 'Manajemen', value: 2, color: '#059669' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
              Portal Administrasi Terpadu
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold">
              Mode Uji Coba Import Bersih
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Dashboard Admin Operator IT
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Data operasional telah dikosongkan untuk memberi ruang pengujian import data demo Excel Anda. Gunakan menu Import Excel Massal untuk memasukkan data siswa, guru, rombel, mapel, dan jadwal.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => onNavigate('import_excel')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Excel Massal</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Kosongkan kembali semua data operasional dan hanya sisakan akun admin?')) {
                clearAllExceptAdmin();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Kosongkan ulang data jika ingin mengulang pengujian import"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data Bersih</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Siswa"
          value={totalStudents}
          subtitle={`${activeStudents} Siswa Aktif`}
          icon={GraduationCap}
          accentColor="blue"
        />
        <StatCard
          title="Tenaga Pendidik"
          value={totalTeachers}
          subtitle={`${activeTeachers} Guru Aktif`}
          icon={Users}
          accentColor="purple"
        />
        <StatCard
          title="Rombongan Belajar"
          value={`${totalClasses} Rombel`}
          subtitle="Tingkat 7, 8, dan 9"
          icon={DoorClosed}
          accentColor="emerald"
        />
        <StatCard
          title="Mata Pelajaran"
          value={totalSubjects}
          subtitle="Kurikulum Merdeka"
          icon={BookOpen}
          accentColor="blue"
        />
        <StatCard
          title="Jadwal Sesi"
          value={totalSchedules}
          subtitle="Sesi Mingguan"
          icon={CalendarDays}
          accentColor="blue"
        />
        <StatCard
          title="Akun Pengguna"
          value={totalTeachers + 1}
          subtitle="RBAC Multi-Role"
          icon={UserCog}
          accentColor="purple"
        />
      </div>

      {/* Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <InteractiveBarChart
            title="Distribusi Siswa per Jenjang Tingkat"
            subtitle="Sebaran 708 peserta didik dalam 24 rombel (7A–7H, 8A–8H, 9A–9H)"
            data={barData}
            primaryLabel="Jumlah Siswa"
            valueSuffix=" Siswa"
          />
        </div>

        <div className="lg:col-span-5">
          <DonutChart
            title="Komposisi Penugasan Tenaga Pendidik"
            subtitle="Distribusi tanggung jawab 50 guru sekolah"
            data={roleDonut}
            centerLabel="Guru"
            centerValue={totalTeachers}
          />
        </div>
      </div>

      {/* Recent Activity Log & Quick Admin Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Log */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Aktivitas Administrasi Terbaru</h3>
              <p className="text-xs text-slate-500">Log sinkronisasi dan pengelolaan sistem terkini</p>
            </div>
            <button
              onClick={() => onNavigate('activity')}
              className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activityLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({log.timestamp})</span>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      {log.category}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1">{log.details}</p>
                </div>
                <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                  {log.userName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Aksi Cepat Pengelolaan</h3>
          <p className="text-xs text-slate-500 mb-4">Navigasi langsung ke modul utama operator</p>

          <button
            onClick={() => onNavigate('admin_bk_assignment')}
            className="w-full p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:border-emerald-500 hover:bg-emerald-50 text-left transition-colors flex items-center justify-between text-xs group"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-semibold text-emerald-900 block group-hover:text-emerald-700">
                  Pembagian Siswa BK & Rombel
                </span>
                <span className="text-[10px] text-emerald-600">Plotting rombel & import Excel BK</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:text-emerald-700" />
          </button>

          <button
            onClick={() => onNavigate('import_excel')}
            className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-colors flex items-center justify-between text-xs group"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <div>
                <span className="font-semibold text-slate-900 block group-hover:text-blue-700">
                  Import Data Excel
                </span>
                <span className="text-[10px] text-slate-500">Unduh & unggah data massal</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>

          <button
            onClick={() => onNavigate('students')}
            className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-colors flex items-center justify-between text-xs group"
          >
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <div>
                <span className="font-semibold text-slate-900 block group-hover:text-blue-700">
                  Master Siswa (708)
                </span>
                <span className="text-[10px] text-slate-500">Kelola NIS, NISN, dan rombel</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>

          <button
            onClick={() => onNavigate('schedule')}
            className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-colors flex items-center justify-between text-xs group"
          >
            <div className="flex items-center gap-2.5">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <div>
                <span className="font-semibold text-slate-900 block group-hover:text-blue-700">
                  Jadwal Pembelajaran
                </span>
                <span className="text-[10px] text-slate-500">Penyusunan matriks anti-bentrok</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-colors flex items-center justify-between text-xs group"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <div>
                <span className="font-semibold text-slate-900 block group-hover:text-blue-700">
                  Identitas & Logo Sekolah
                </span>
                <span className="text-[10px] text-slate-500">Pengaturan profil dan semester</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
