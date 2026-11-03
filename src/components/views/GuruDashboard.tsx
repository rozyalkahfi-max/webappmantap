import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  CheckSquare,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  DoorClosed,
  AlertCircle,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import { consolidateScheduleItems } from '../../utils/scheduleConsolidator';

const DAYS_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const GuruDashboard: React.FC<{ onNavigate: (menuId: string) => void }> = ({ onNavigate }) => {
  const { schedules, attendanceSessions, grades, settings, teachers } = useSchool();
  const { currentUser } = useAuth();

  // Determine current day of week in Indonesian
  const todayDayName = useMemo(() => {
    const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday ...
    const idDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentName = idDays[dayIndex];
    // If weekend Sunday, default to Senin for school schedule context
    return currentName === 'Minggu' ? 'Senin' : currentName;
  }, []);

  // Selected day state defaults to today's day (e.g. Senin)
  const [selectedDay, setSelectedDay] = useState<string>(todayDayName);

  // Robust teacher code resolution
  const myTeacherCode = useMemo(() => {
    if (currentUser?.teacherCode) return currentUser.teacherCode;
    const match = teachers.find(
      (t) =>
        t.username.toLowerCase() === currentUser?.username.toLowerCase() ||
        t.name.toLowerCase() === currentUser?.name?.toLowerCase()
    );
    return match?.teacherCode || 'G01';
  }, [currentUser, teachers]);

  const teacherName = currentUser?.name || 'Bapak/Ibu Guru';
  const teacherSubject = currentUser?.subject || 'Mata Pelajaran';

  // All schedules for this teacher
  const myAllSchedules = useMemo(() => {
    return schedules.filter(
      (s) =>
        s.teacherCode === myTeacherCode ||
        s.teacherName.toLowerCase() === teacherName.toLowerCase()
    );
  }, [schedules, myTeacherCode, teacherName]);

  // Requirement 1: Consolidate contiguous periods (e.g. Jam 1 09:30-10:10 & Jam 2 10:10-10:50 -> 1 sesi 09:30-10:50)
  const myConsolidatedSchedules = useMemo(() => {
    return consolidateScheduleItems(myAllSchedules);
  }, [myAllSchedules]);

  // Schedules for the selected day, sorted by period (Jam Ke-1, Ke-2, etc.)
  const daySchedules = useMemo(() => {
    return myConsolidatedSchedules
      .filter((s) => s.day === selectedDay)
      .sort((a, b) => a.period - b.period);
  }, [myConsolidatedSchedules, selectedDay]);

  // Unique classes taught across all days
  const myClasses = Array.from(new Set(myConsolidatedSchedules.map((s) => s.classId)));

  // Today's date string
  const todayDateStr = new Date().toISOString().split('T')[0];

  const pendingAttendanceCount = useMemo(() => {
    return daySchedules.filter((sch) => {
      const done = attendanceSessions.some(
        (ses) =>
          (ses.date === todayDateStr || ses.date === '2026-10-31') &&
          (ses.scheduleId === sch.id ||
            sch.allScheduleIds.includes(ses.scheduleId) ||
            (ses.classId === sch.classId &&
              ses.subjectCode === sch.subjectCode &&
              ses.period === sch.period))
      );
      return !done;
    }).length;
  }, [daySchedules, attendanceSessions, todayDateStr]);

  // Group schedules by days to show teaching summary
  const scheduleDaysSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    DAYS_LIST.forEach((d) => {
      summary[d] = myConsolidatedSchedules.filter((s) => s.day === d).length;
    });
    return summary;
  }, [myConsolidatedSchedules]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
              Portal Guru Pengampu Terintegrasi
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Hari Ini: {todayDayName}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Selamat Datang, {teacherName}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Kode Guru: <strong className="text-white font-mono">{myTeacherCode}</strong> · Mengampu <strong className="text-white">{teacherSubject}</strong> · Tahun Ajaran {settings.activeAcademicYear} ({settings.activeSemester})
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('attendance')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Isi Presensi KBM</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title={`Jadwal Hari ${selectedDay}`}
          value={`${daySchedules.length} Sesi KBM`}
          subtitle={selectedDay === todayDayName ? 'Sesi tatap muka hari ini' : `Tatap muka hari ${selectedDay}`}
          icon={CalendarDays}
          accentColor="blue"
        />
        <StatCard
          title="Rombel Binaan"
          value={`${myClasses.length} Rombel`}
          subtitle={myClasses.length > 0 ? myClasses.slice(0, 5).join(', ') : 'Belum ada kelas'}
          icon={DoorClosed}
          accentColor="emerald"
        />
        <StatCard
          title="Presensi Belum Terisi"
          value={`${pendingAttendanceCount} Sesi`}
          subtitle={pendingAttendanceCount === 0 ? 'Semua sesi sudah dipresensi' : 'Memerlukan entri absensi'}
          icon={AlertCircle}
          accentColor={pendingAttendanceCount > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Total Jam Mengajar"
          value={`${myAllSchedules.length * 2} JP / Minggu`}
          subtitle="Jadwal otomatis terintegrasi"
          icon={Clock}
          accentColor="purple"
        />
      </div>

      {/* Day Selector & Daily Teaching Schedule */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Jadwal KBM Hari {selectedDay}
              </h3>
              {selectedDay === todayDayName && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Hari Aktif Sekarang
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Data pembelajaran langsung tersinkronisasi dengan akun Anda. Klik jadwal untuk langsung membuka lembar presensi.
            </p>
          </div>

          <button
            onClick={() => onNavigate('guru_schedule')}
            className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Lihat Matriks Mingguan Penuh</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Day Pills Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Pilih Hari:
          </span>
          {DAYS_LIST.map((day) => {
            const isSelected = selectedDay === day;
            const isToday = todayDayName === day;
            const count = scheduleDaysSummary[day] || 0;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-emerald-300' : 'bg-emerald-500'
                    }`}
                  />
                )}
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isSelected ? 'bg-blue-800 text-blue-200' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Schedule List */}
        <div className="space-y-3 pt-2">
          {daySchedules.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">
                Tidak ada jadwal mengajar pada hari {selectedDay}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
                Anda memiliki jadwal mengajar pada hari lain:
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {DAYS_LIST.filter((d) => (scheduleDaysSummary[d] || 0) > 0).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-700 rounded-md text-[11px] font-medium cursor-pointer shadow-2xs"
                  >
                    {d} ({scheduleDaysSummary[d]} sesi)
                  </button>
                ))}
              </div>
            </div>
          ) : (
            daySchedules.map((sch) => {
              const isSubmitted = attendanceSessions.some(
                (ses) =>
                  (ses.date === todayDateStr || ses.date === '2026-10-31') &&
                  (ses.scheduleId === sch.id ||
                    sch.allScheduleIds.includes(ses.scheduleId) ||
                    (ses.classId === sch.classId &&
                      ses.subjectCode === sch.subjectCode &&
                      ses.period === sch.period))
              );

              return (
                <div
                  key={sch.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex flex-col items-center justify-center font-bold">
                      <span className="text-[9px] uppercase tracking-wider text-blue-600 font-semibold">Kelas</span>
                      <span className="text-base font-mono leading-none">{sch.classId}</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{sch.subjectName}</span>
                        <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          {sch.periodDisplay}
                        </span>
                        {sch.periodCount > 1 && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                            {sch.periodCount} JP Terpadu (Presensi 1x)
                          </span>
                        )}
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Kode: {sch.subjectCode}
                        </span>
                      </div>
                      <p className="text-slate-500 font-mono text-[11px] mt-1 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Pukul: {sch.timeDisplay} WIB</span>
                        <span>·</span>
                        <span>Pengajar: {sch.teacherName} ({sch.teacherCode})</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isSubmitted ? (
                      <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Presensi Selesai</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => onNavigate('attendance')}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Buka Presensi Siswa</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('grading')}
          className="bg-white border border-slate-200 hover:border-blue-500 rounded-xl p-4 shadow-xs transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Award className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Input Nilai Akademik Siswa</h4>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Kelola nilai Tugas, Kuis, Praktik, PH, PTS, dan PAS dengan kalkulasi tuntas otomatis (KKM 75).
          </p>
        </div>

        <div
          onClick={() => onNavigate('violations')}
          className="bg-white border border-slate-200 hover:border-rose-500 rounded-xl p-4 shadow-xs transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
            <AlertCircle className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-700">Catat Pelanggaran KBM</h4>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Laporkan kejadian pelanggaran tata tertib siswa. Akumulasi {'>'} 30 poin otomatis terintegrasi ke ruang Bimbingan Konseling (BK).
          </p>
        </div>

        <div
          onClick={() => onNavigate('attitude')}
          className="bg-white border border-slate-200 hover:border-purple-500 rounded-xl p-4 shadow-xs transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700">Penilaian Sikap & Karakter</h4>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Evaluasi 7 aspek budi pekerti (Disiplin, Kejujuran, Kerja Sama, Santun, Tanggung Jawab, dll).
          </p>
        </div>
      </div>
    </div>
  );
};
