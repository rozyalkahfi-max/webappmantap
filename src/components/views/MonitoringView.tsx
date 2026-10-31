import React, { useState } from 'react';
import { Activity, Clock, CheckCircle2, AlertCircle, Bell, Search, Filter } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const MonitoringView: React.FC = () => {
  const { schedules, attendanceSessions, teachers, classes } = useSchool();

  const today = '2026-10-31';
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [notifiedTeachers, setNotifiedTeachers] = useState<Set<string>>(new Set());

  // Schedules today (Senin/Jumat)
  const todaysSchedules = schedules.filter((s) => s.day === 'Senin' || s.day === 'Jumat');

  const rows = todaysSchedules.map((sch, idx) => {
    const ses = attendanceSessions.find((s) => s.scheduleId === sch.id && s.date === today);
    const isCompleted = !!ses;
    const isOngoing = idx === 1 || idx === 4;
    const isLate = !isCompleted && !isOngoing;

    let statusType: 'completed' | 'ongoing' | 'late' = 'completed';
    if (isOngoing) statusType = 'ongoing';
    else if (isLate) statusType = 'late';

    return {
      schedule: sch,
      session: ses,
      statusType,
      isCompleted,
    };
  });

  const filteredRows = rows.filter((r) => {
    if (filterStatus !== 'ALL' && r.statusType !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        r.schedule.classId.toLowerCase().includes(term) ||
        r.schedule.teacherName.toLowerCase().includes(term) ||
        r.schedule.subjectName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleSendReminder = (teacherCode: string, teacherName: string) => {
    setNotifiedTeachers((prev) => new Set(prev).add(teacherCode));
    alert(`Pengingat berhasil dikirimkan ke guru ${teacherName} (${teacherCode}) via sistem notifikasi internal.`);
  };

  const completedCount = rows.filter((r) => r.statusType === 'completed').length;
  const ongoingCount = rows.filter((r) => r.statusType === 'ongoing').length;
  const lateCount = rows.filter((r) => r.statusType === 'late').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Monitoring Pembelajaran & Presensi Kelas Hari Ini
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengawasan eksekutif terhadap kehadiran guru, ketertiban absensi, dan administrasi jurnal KBM
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span>Tanggal: <strong className="text-slate-900">{today}</strong></span>
        </div>
      </div>

      {/* Status Counters Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={() => setFilterStatus('completed')}
          className={`p-4 rounded-xl border transition-colors cursor-pointer ${
            filterStatus === 'completed'
              ? 'bg-emerald-50 border-emerald-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Sudah Absensi / Selesai</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-900 mt-1 tabular-nums">
            {completedCount} Sesi
          </p>
          <span className="text-[11px] text-emerald-600">Jurnal administrasi terisi lengkap</span>
        </div>

        <div
          onClick={() => setFilterStatus('ongoing')}
          className={`p-4 rounded-xl border transition-colors cursor-pointer ${
            filterStatus === 'ongoing'
              ? 'bg-amber-50 border-amber-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Sedang Berlangsung</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-900 mt-1 tabular-nums">
            {ongoingCount} Sesi
          </p>
          <span className="text-[11px] text-amber-600">KBM aktif di ruang kelas</span>
        </div>

        <div
          onClick={() => setFilterStatus('late')}
          className={`p-4 rounded-xl border transition-colors cursor-pointer ${
            filterStatus === 'late'
              ? 'bg-rose-50 border-rose-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800">Belum Absensi / Terlambat</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-900 mt-1 tabular-nums">
            {lateCount} Sesi
          </p>
          <span className="text-[11px] text-rose-600">Memerlukan teguran kepala sekolah</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kelas, nama guru, atau mapel..."
            className="w-full text-xs border-none focus:outline-none text-slate-900 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tampilkan Semua ({rows.length})
          </button>
        </div>
      </div>

      {/* Monitoring Grid Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
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
              <th className="py-2.5 px-4 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.map(({ schedule, session, statusType, isCompleted }) => {
              const isNotified = notifiedTeachers.has(schedule.teacherCode);

              return (
                <tr key={schedule.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-blue-700">{schedule.classId}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{schedule.subjectName}</td>
                  <td className="py-2.5 px-4">
                    <span className="text-slate-800 block font-medium">{schedule.teacherName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Kode: {schedule.teacherCode}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-600">Jam {schedule.period}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{schedule.startTime} - {schedule.endTime}</td>

                  <td className="py-2.5 px-4 text-center">
                    {statusType === 'completed' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Selesai</span>
                      </span>
                    )}
                    {statusType === 'ongoing' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-800 font-semibold text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Sedang Berlangsung</span>
                      </span>
                    )}
                    {statusType === 'late' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-rose-200 bg-rose-50 text-rose-800 font-semibold text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Belum Absensi</span>
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-4 text-center">
                    {isCompleted ? (
                      <span className="text-emerald-700 font-semibold text-[11px]">✓ Jurnal Terisi</span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Belum Submit</span>
                    )}
                  </td>

                  <td className="py-2.5 px-4 text-right">
                    {statusType === 'late' ? (
                      <button
                        onClick={() => handleSendReminder(schedule.teacherCode, schedule.teacherName)}
                        disabled={isNotified}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                          isNotified
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer'
                        }`}
                      >
                        <Bell className="w-3 h-3" />
                        <span>{isNotified ? 'Terkirim' : 'Kirim Peringatan'}</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
