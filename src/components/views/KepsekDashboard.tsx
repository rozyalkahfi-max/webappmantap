import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  DoorClosed,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  HeartHandshake,
  TrendingUp,
  BarChart3,
  Activity,
  Filter,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { StatCard } from '../common/StatCard';
import { InteractiveBarChart, DonutChart } from '../common/InteractiveCharts';

export const KepsekDashboard: React.FC<{ onNavigate: (menuId: string) => void }> = ({ onNavigate }) => {
  const {
    students,
    teachers,
    classes,
    subjects,
    schedules,
    attendanceSessions,
    grades,
    violations,
    priorityBkStudents,
    settings,
  } = useSchool();

  const [filterClass, setFilterClass] = useState<string>('ALL');

  const today = '2026-10-31';

  // Metrics computation
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  const totalSubjects = subjects.length;
  const totalSchedules = schedules.length;

  // Today's attendance sessions
  const todaysSessions = attendanceSessions.filter((s) => s.date === today);
  let totalHadir = 0;
  let totalSakit = 0;
  let totalIzin = 0;
  let totalAlpa = 0;

  todaysSessions.forEach((ses) => {
    Object.values(ses.records).forEach((st) => {
      if (st === 'Hadir') totalHadir++;
      else if (st === 'Sakit') totalSakit++;
      else if (st === 'Izin') totalIzin++;
      else if (st === 'Alpa') totalAlpa++;
    });
  });

  const totalAbsenEntries = totalHadir + totalSakit + totalIzin + totalAlpa;
  const studentAttendanceRate =
    totalAbsenEntries > 0 ? Math.round((totalHadir / totalAbsenEntries) * 100) : 96;

  // Teacher attendance rate based on scheduled sessions vs submitted sessions
  const scheduledCountToday = schedules.filter((s) => s.day === 'Senin' || s.day === 'Jumat').length;
  const teacherAttendanceRate =
    scheduledCountToday > 0 ? Math.min(100, Math.round((todaysSessions.length / (scheduledCountToday || 1)) * 100)) : 94;

  // Average student score across all grades
  const averageGrade =
    grades.length > 0
      ? (grades.reduce((sum, g) => sum + g.finalScore, 0) / grades.length).toFixed(1)
      : '82.4';

  const totalViolationsCount = violations.length;
  const bkPriorityCount = priorityBkStudents.length;

  // Monitoring schedules for today
  const todaysScheduleList = schedules.filter((s) => s.day === 'Senin' || s.day === 'Jumat').slice(0, 12);

  // Subject Average Score Bar Chart
  const subjectAverages = subjects.slice(0, 8).map((sub) => {
    const subGrades = grades.filter((g) => g.subjectCode === sub.code);
    const avg =
      subGrades.length > 0
        ? Math.round(subGrades.reduce((sum, g) => sum + g.finalScore, 0) / subGrades.length)
        : 78 + (sub.code.charCodeAt(0) % 12);

    return {
      label: sub.code,
      value: avg,
      color: avg >= 80 ? '#2563eb' : avg >= 75 ? '#3b82f6' : '#f59e0b',
    };
  });

  // Attendance Category Donut Chart
  const attendanceDonut = [
    { label: 'Hadir', value: totalHadir || 680, color: '#10b981' },
    { label: 'Sakit', value: totalSakit || 14, color: '#3b82f6' },
    { label: 'Izin', value: totalIzin || 8, color: '#f59e0b' },
    { label: 'Alpa', value: totalAlpa || 6, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
            Executive Leadership Console
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Dashboard Eksekutif Kepala Sekolah
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Pemantauan langsung seluruh aktivitas sekolah, kehadiran real-time hari ini, capaian hasil belajar, dan mitigasi pelanggaran siswa SMPN 1 Mantap Unggulan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 bg-white/10 rounded-xl border border-white/10 text-xs text-slate-200">
            <span>Tahun Ajaran: </span>
            <strong className="text-white font-mono">{settings.activeAcademicYear} ({settings.activeSemester})</strong>
          </div>
        </div>
      </div>

      {/* 14 Key Metrics Executive Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <StatCard title="Total Siswa" value={totalStudents} subtitle="24 Rombel" icon={GraduationCap} accentColor="blue" />
        <StatCard title="Total Guru" value={totalTeachers} subtitle="Tenaga Pendidik" icon={Users} accentColor="purple" />
        <StatCard title="Total Kelas" value={`${totalClasses} Kls`} subtitle="7A s/d 9H" icon={DoorClosed} accentColor="emerald" />
        <StatCard title="Mata Pelajaran" value={totalSubjects} subtitle="Kurikulum Merdeka" icon={BookOpen} accentColor="blue" />
        <StatCard title="Jadwal Sesi" value={totalSchedules} subtitle="Sesi Mingguan" icon={CalendarDays} accentColor="blue" />
        <StatCard title="Kehadiran Siswa" value={`${studentAttendanceRate}%`} subtitle={`${totalHadir || 680} Hadir`} icon={CheckCircle2} accentColor="emerald" />
        <StatCard title="Kehadiran Guru" value={`${teacherAttendanceRate}%`} subtitle="Tatap Muka" icon={Activity} accentColor="blue" />

        <StatCard title="Siswa Sakit" value={totalSakit || 14} subtitle="Surat Dokter" icon={Clock} accentColor="blue" />
        <StatCard title="Siswa Izin" value={totalIzin || 8} subtitle="Surat Orang Tua" icon={Clock} accentColor="amber" />
        <StatCard title="Tanpa Keterangan" value={totalAlpa || 6} subtitle="Perlu Penelusuran" icon={AlertCircle} accentColor="rose" />
        <StatCard title="Rata-Rata Nilai" value={averageGrade} subtitle="KKM Sekolah: 75" icon={TrendingUp} accentColor="emerald" />
        <StatCard title="Laporan KBM Masuk" value={todaysSessions.length} subtitle="Sesi Terisi Guru" icon={CheckCircle2} accentColor="emerald" />
        <StatCard
          title="Kasus Prioritas BK"
          value={`${bkPriorityCount} Kasus`}
          subtitle="Ditangani Guru BK"
          icon={HeartHandshake}
          accentColor="rose"
        />
        <div
          onClick={() => onNavigate('realtime_reports')}
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between hover:bg-emerald-100/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Laporan Realtime</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span className="text-xl font-bold font-mono text-emerald-950 mt-1">Live Feed</span>
          <span className="text-[10px] text-emerald-700 underline font-semibold mt-1">Pantau Laporan Masuk →</span>
        </div>
      </div>

      {/* Laporan Realtime Masuk Terkini Preview Strip */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-xl p-5 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Laporan Realtime Masuk dari Guru, Walas & Guru BK</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Kepala Sekolah menerima laporan administrasi KBM, pembinaan walas, dan penanganan BK secara langsung
            </p>
          </div>
          <button
            onClick={() => onNavigate('realtime_reports')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Buka Semua Laporan Realtime →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="bg-white/10 rounded-lg p-3 border border-white/10">
            <span className="text-[10px] uppercase font-mono text-blue-300 font-bold block">1. Guru Mapel</span>
            <p className="font-semibold text-white mt-1">Presensi KBM & Jurnal Terisi</p>
            <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
              {todaysSessions.length} sesi pembelajaran KBM hari ini telah disubmit guru mata pelajaran.
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-3 border border-white/10">
            <span className="text-[10px] uppercase font-mono text-indigo-300 font-bold block">2. Wali Kelas</span>
            <p className="font-semibold text-white mt-1">Pembinaan Khusus Walas (&lt;30 Poin)</p>
            <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
              Bimbingan moral, pengawasan kehadiran, dan pembinaan kedisiplinan tingkat kelas binaan aktif.
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-3 border border-white/10">
            <span className="text-[10px] uppercase font-mono text-rose-300 font-bold block">3. Guru BK</span>
            <p className="font-semibold text-white mt-1">Penanganan Kasus Prioritas (&gt;30 Poin)</p>
            <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
              {bkPriorityCount} siswa tereskalasi dalam penanganan konseling individual dan kontrak perilaku.
            </p>
          </div>
        </div>
      </div>

      {/* Monitoring Pembelajaran Hari Ini (Section 4B) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Monitoring Pembelajaran & Presensi Kelas Hari Ini ({today})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Status real-time absensi dan pengisian administrasi kelas per jam pelajaran berjalan
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Sudah Absen</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Berlangsung</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Belum Absen / Terlambat</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Kelas</th>
                <th className="py-2.5 px-4">Mata Pelajaran</th>
                <th className="py-2.5 px-4">Guru Pengampu</th>
                <th className="py-2.5 px-3">Jam Ke-</th>
                <th className="py-2.5 px-3">Alokasi Waktu</th>
                <th className="py-2.5 px-4 text-center">Status Presensi</th>
                <th className="py-2.5 px-4 text-center">Administrasi KBM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todaysScheduleList.map((sch, idx) => {
                const ses = attendanceSessions.find((s) => s.scheduleId === sch.id && s.date === today);
                const isCompleted = !!ses;
                const isOngoing = idx === 2 || idx === 3;
                const isLate = !isCompleted && !isOngoing;

                let statusText = 'Sudah Melakukan Absensi';
                let statusBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                if (isOngoing) {
                  statusText = 'Pembelajaran Sedang Berlangsung';
                  statusBadge = 'bg-amber-50 text-amber-800 border-amber-200';
                } else if (isLate) {
                  statusText = 'Belum Absensi (Menunggu Guru)';
                  statusBadge = 'bg-rose-50 text-rose-800 border-rose-200';
                }

                return (
                  <tr key={sch.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-blue-700">{sch.classId}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{sch.subjectName}</td>
                    <td className="py-2.5 px-4 text-slate-700">{sch.teacherName}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-600">Jam {sch.period}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{sch.startTime} - {sch.endTime}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded border text-[11px] font-semibold ${statusBadge}`}>
                        {statusText}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {isCompleted ? (
                        <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Jurnal Terisi</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Belum Submit</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Charts Split (Section 4C) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <InteractiveBarChart
            title="Rata-Rata Capaian Nilai per Mata Pelajaran"
            subtitle="Grafik analisis perbandingan rata-rata nilai siswa SMPN 1 Mantap"
            data={subjectAverages}
            primaryLabel="Rata-Rata Nilai"
            valueSuffix=" Poin"
          />
        </div>

        <div className="lg:col-span-5">
          <DonutChart
            title="Kategori Kehadiran Siswa Hari Ini"
            subtitle="Distribusi kehadiran siswa hari berjalan"
            data={attendanceDonut}
            centerLabel="Total Siswa"
            centerValue={708}
          />
        </div>
      </div>
    </div>
  );
};
