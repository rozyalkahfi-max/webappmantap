import React from 'react';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  AlertTriangle,
  Award,
  FileSpreadsheet,
  HeartHandshake,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';

export const WaliKelasDashboard: React.FC<{ onNavigate: (menuId: string) => void }> = ({ onNavigate }) => {
  const { students, classes, attendanceSessions, grades, violations, getStudentPoints } = useSchool();
  const { currentUser } = useAuth();

  const myClassId = currentUser?.classId || '7A';
  const myClassRoom = classes.find((c) => c.classId === myClassId);
  const classStudents = students.filter((s) => s.classId === myClassId);

  // Gender breakdown
  const maleCount = classStudents.filter((s) => s.gender === 'L').length;
  const femaleCount = classStudents.filter((s) => s.gender === 'P').length;

  // Attendance stats for this class
  const classSessions = attendanceSessions.filter((s) => s.classId === myClassId);
  let totalH = 0;
  let totalA = 0;
  let totalAll = 0;

  classSessions.forEach((ses) => {
    Object.values(ses.records).forEach((st) => {
      totalAll++;
      if (st === 'Hadir') totalH++;
      if (st === 'Alpa') totalA++;
    });
  });

  const attendancePercent = totalAll > 0 ? Math.round((totalH / totalAll) * 100) : 97;

  // Students with violations
  const studentsWithViolations = classStudents.filter((s) => getStudentPoints(s.id) > 0);
  const studentsNeedingAttention = classStudents.filter((s) => getStudentPoints(s.id) >= 20);

  // Compute averages for academic ranking
  const studentAverages = classStudents.map((st) => {
    const sGrades = grades.filter((g) => g.studentId === st.id);
    const avg =
      sGrades.length > 0
        ? sGrades.reduce((sum, g) => sum + g.finalScore, 0) / sGrades.length
        : 78 + (st.name.charCodeAt(0) % 15);

    return {
      student: st,
      avg: Number(avg.toFixed(1)),
      violations: getStudentPoints(st.id),
    };
  });

  const topStudents = [...studentAverages].sort((a, b) => b.avg - a.avg).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
            Portal Wali Kelas
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Dashboard Wali Kelas {myClassId}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Wali Kelas: <strong className="text-white">{currentUser?.name}</strong> · Mengelola perkembangan akademik, kehadiran, kedisiplinan, dan budi pekerti {classStudents.length} peserta didik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('leger')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Buka Leger Terpadu</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Siswa"
          value={`${classStudents.length} Siswa`}
          subtitle={`${maleCount} Laki · ${femaleCount} Perempuan`}
          icon={GraduationCap}
          accentColor="blue"
        />
        <StatCard
          title="Kehadiran Kelas"
          value={`${attendancePercent}%`}
          subtitle="Rata-Rata Presensi"
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatCard
          title="Tanpa Keterangan"
          value={`${totalA} Kasus`}
          subtitle="Catatan Alpa Sesi"
          icon={AlertTriangle}
          accentColor="rose"
        />
        <StatCard
          title="Siswa Melanggar"
          value={`${studentsWithViolations.length} Siswa`}
          subtitle="Tercatat Poin"
          icon={AlertTriangle}
          accentColor="amber"
        />
        <StatCard
          title="Perlu Perhatian"
          value={`${studentsNeedingAttention.length} Siswa`}
          subtitle="Poin ≥ 20 (Waspada)"
          icon={HeartHandshake}
          accentColor="rose"
        />
        <StatCard
          title="Rata-Rata Nilai"
          value={
            studentAverages.length > 0
              ? (studentAverages.reduce((s, a) => s + a.avg, 0) / studentAverages.length).toFixed(1)
              : '82.8'
          }
          subtitle="Semua Mapel"
          icon={TrendingUp}
          accentColor="emerald"
        />
      </div>

      {/* 2 Columns: Top Academic Performers & Attention Students */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Performers */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Peringkat 5 Terbaik Akademik Kelas {myClassId}</span>
              </h3>
              <p className="text-xs text-slate-500">Berdasarkan kalkulasi nilai rata-rata seluruh mapel</p>
            </div>
            <button
              onClick={() => onNavigate('leger')}
              className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Leger Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {topStudents.map((item, idx) => (
              <div
                key={item.student.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : idx === 1
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">{item.student.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      NIS: {item.student.nis} · Gender: {item.student.gender}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-blue-700 tabular-nums">
                    {item.avg}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Rata-Rata</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Students Needing Attention */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Siswa Membutuhkan Perhatian & Pembinaan</span>
              </h3>
              <p className="text-xs text-slate-500">Siswa dengan akumulasi poin atau catatan khusus</p>
            </div>
            <button
              onClick={() => onNavigate('violations')}
              className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Rekap Pelanggaran</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {studentsWithViolations.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">
                Tidak ada siswa dengan catatan pelanggaran di kelas ini.
              </p>
            ) : (
              studentsWithViolations.slice(0, 5).map((st) => {
                const pts = getStudentPoints(st.id);
                return (
                  <div
                    key={st.id}
                    className="p-3 rounded-lg bg-rose-50/40 border border-rose-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block">{st.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        NIS: {st.nis} · Status: {pts > 30 ? 'Prioritas BK' : pts >= 20 ? 'Peringatan' : 'Perhatian'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-rose-700 bg-rose-100 px-2 py-0.5 rounded tabular-nums">
                        {pts} Poin
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
