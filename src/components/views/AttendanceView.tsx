import React, { useState } from 'react';
import {
  CheckSquare,
  Users,
  Calendar,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { AttendanceStatus } from '../../types';
import { exportToExcel } from '../../utils/excel';

export const AttendanceView: React.FC = () => {
  const { schedules, students, classes, attendanceSessions, saveAttendanceSession, addViolation } = useSchool();
  const { currentUser, activeRole } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // Filter schedules available for dropdown
  const availableSchedules = schedules.filter((s) => {
    if (activeRole === 'guru_mapel') {
      const code = currentUser?.teacherCode;
      const name = currentUser?.name?.toLowerCase();
      if (code && s.teacherCode === code) return true;
      if (name && s.teacherName.toLowerCase() === name) return true;
      return false;
    }
    return true;
  });

  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(() => {
    return availableSchedules[0]?.id || schedules[0]?.id || '';
  });

  // Ensure selectedScheduleId is valid whenever availableSchedules change
  React.useEffect(() => {
    if (availableSchedules.length > 0 && !availableSchedules.some((s) => s.id === selectedScheduleId)) {
      setSelectedScheduleId(availableSchedules[0].id);
    }
  }, [availableSchedules, selectedScheduleId]);

  const [activeTab, setActiveTab] = useState<'input' | 'recap'>('input');
  const [topic, setTopic] = useState('Pendalaman Materi dan Diskusi Kelompok');
  const [notes, setNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [truantAlerts, setTruantAlerts] = useState<string[]>([]);

  // Relevant schedule
  const currentSchedule = schedules.find((s) => s.id === selectedScheduleId);
  const classStudents = currentSchedule
    ? students.filter((s) => s.classId === currentSchedule.classId)
    : [];

  // Existing session for this schedule & date
  const existingSession = attendanceSessions.find(
    (s) => s.scheduleId === selectedScheduleId && s.date === selectedDate
  );

  // Attendance state for students
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  // Per-student notes state (including membolos notes)
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({});

  // Sync with existing session or initialize all as Hadir
  React.useEffect(() => {
    if (existingSession) {
      setRecords(existingSession.records);
      setStudentNotes(existingSession.studentNotes || {});
      setTopic(existingSession.topic);
      setNotes(existingSession.notes || '');
    } else {
      const initialRecords: Record<string, AttendanceStatus> = {};
      const initialNotes: Record<string, string> = {};
      classStudents.forEach((st) => {
        initialRecords[st.id] = 'Hadir';
        initialNotes[st.id] = '';
      });
      setRecords(initialRecords);
      setStudentNotes(initialNotes);
    }
    setSaveSuccess(false);
    setTruantAlerts([]);
  }, [selectedScheduleId, selectedDate, existingSession]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleStudentNoteChange = (studentId: string, text: string) => {
    setStudentNotes((prev) => ({
      ...prev,
      [studentId]: text,
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach((st) => {
      updated[st.id] = status;
    });
    setRecords(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchedule) return;

    // 1. Save attendance session including studentNotes
    saveAttendanceSession({
      scheduleId: currentSchedule.id,
      date: selectedDate,
      classId: currentSchedule.classId,
      subjectCode: currentSchedule.subjectCode,
      subjectName: currentSchedule.subjectName,
      teacherCode: currentSchedule.teacherCode,
      teacherName: currentSchedule.teacherName,
      period: currentSchedule.period,
      topic,
      records,
      studentNotes,
      notes,
    });

    // 2. Auto-sync truant violations (+15 points) if teacher enters "membolos" or "bolos"
    const detectedTruants: string[] = [];
    classStudents.forEach((st) => {
      const note = (studentNotes[st.id] || '').trim();
      if (/membolos|bolos/i.test(note)) {
        detectedTruants.push(st.name);
        addViolation({
          studentId: st.id,
          studentName: st.name,
          classId: currentSchedule.classId,
          date: selectedDate,
          category: 'Sedang',
          violationType: 'Ketidakhadiran / Disiplin KBM',
          violationName: `Meninggalkan kelas saat KBM (Membolos Jam Pelajaran - ${currentSchedule.subjectName})`,
          description: `Siswa membolos pada jam pelajaran ${currentSchedule.subjectName}. Catatan guru: "${note}".`,
          points: 15,
          reporterCode: currentSchedule.teacherCode,
          reporterName: `${currentSchedule.teacherName} (Guru Mapel)`,
          reportedBy: `${currentSchedule.teacherName} (Guru Mapel)`,
          status: 'Terverifikasi',
          followUp: `Keterangan Absensi: "${note}". Poin otomatis tersinkron dari modul absensi KBM.`,
          notes: `Keterangan Absensi: "${note}". Poin otomatis tersinkron dari modul absensi KBM.`,
        });
      }
    });

    setTruantAlerts(detectedTruants);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 5000);
  };

  // Metrics
  const totalCount = classStudents.length;
  const hadirCount = Object.values(records).filter((s) => s === 'Hadir').length;
  const sakitCount = Object.values(records).filter((s) => s === 'Sakit').length;
  const izinCount = Object.values(records).filter((s) => s === 'Izin').length;
  const alpaCount = Object.values(records).filter((s) => s === 'Alpa').length;
  const attendanceRate = totalCount > 0 ? Math.round((hadirCount / totalCount) * 100) : 0;

  const handleExportRecap = () => {
    const recapRows = attendanceSessions.map((ses) => {
      const recs = Object.values(ses.records);
      const h = recs.filter((s) => s === 'Hadir').length;
      const s = recs.filter((st) => st === 'Sakit').length;
      const i = recs.filter((st) => st === 'Izin').length;
      const a = recs.filter((st) => st === 'Alpa').length;
      const rate = recs.length > 0 ? `${Math.round((h / recs.length) * 100)}%` : '0%';
      return {
        Tanggal: ses.date,
        Kelas: ses.classId,
        'Mata Pelajaran': ses.subjectName,
        'Guru Pengampu': ses.teacherName,
        Materi: ses.topic,
        'Total Siswa': recs.length,
        Hadir: h,
        Sakit: s,
        Izin: i,
        Alpa: a,
        'Persentase Kehadiran': rate,
      };
    });

    exportToExcel(recapRows, 'Rekap Presensi', `Rekap_Presensi_${Date.now()}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Modul Absensi Siswa Terintegrasi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Presensi pembelajaran berbasis jadwal harian, otomatis terhubung ke jurnal mengajar dan wali kelas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'input'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Form Absensi Sesi
          </button>
          <button
            onClick={() => setActiveTab('recap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'recap'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Riwayat & Rekap Sesi
          </button>
        </div>
      </div>

      {activeTab === 'input' ? (
        <>
          {/* Schedule & Date Selector Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Pembelajaran
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Jadwal Sesi Mengajar
                </label>
                <select
                  value={selectedScheduleId}
                  onChange={(e) => setSelectedScheduleId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white font-medium text-slate-900"
                >
                  {availableSchedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.day}] Kelas {s.classId} · {s.subjectName} · {s.teacherName} (Jam {s.period})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {currentSchedule && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-slate-600">
                  <span>
                    Kelas: <strong className="text-blue-700 font-bold">{currentSchedule.classId}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Mapel: <strong className="text-slate-900">{currentSchedule.subjectName}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Guru: <strong className="text-slate-900">{currentSchedule.teacherName}</strong>
                  </span>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  {existingSession ? (
                    <span className="text-emerald-700 font-semibold">
                      ✓ Sudah diabsen pada {new Date(existingSession.submittedAt).toLocaleTimeString()}
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold">
                      ⚠ Belum disimpan untuk tanggal ini
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* KPI Strip for Current Session */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-semibold uppercase text-slate-500">Tingkat Kehadiran</span>
              <p className="text-2xl font-bold font-mono text-blue-700 mt-0.5 tabular-nums">
                {attendanceRate}%
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-semibold uppercase text-emerald-700">Hadir (H)</span>
              <p className="text-2xl font-bold font-mono text-emerald-800 mt-0.5 tabular-nums">
                {hadirCount} <span className="text-xs font-normal text-emerald-600">siswa</span>
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-semibold uppercase text-blue-700">Sakit (S)</span>
              <p className="text-2xl font-bold font-mono text-blue-800 mt-0.5 tabular-nums">
                {sakitCount}
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-semibold uppercase text-amber-700">Izin (I)</span>
              <p className="text-2xl font-bold font-mono text-amber-800 mt-0.5 tabular-nums">
                {izinCount}
              </p>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-semibold uppercase text-rose-700">Alpa / Tanpa Ket (A)</span>
              <p className="text-2xl font-bold font-mono text-rose-800 mt-0.5 tabular-nums">
                {alpaCount}
              </p>
            </div>
          </div>

          {/* Quick Actions & Topic Input */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Materi / Topik Pembelajaran Hari Ini
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Bab 4 Teks Deskripsi & Asesmen Formatif"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Kejadian / Tindak Lanjut Sesi
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Siswa aktif bertanya, PR dikumpulkan lengkap"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600 mr-1">Tandai Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleMarkAll('Hadir')}
                  className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                >
                  Semua Hadir
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('Sakit')}
                  className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                >
                  Semua Sakit
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('Izin')}
                  className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
                >
                  Semua Izin
                </button>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Presensi Kelas</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Data presensi sesi berhasil disimpan ke dalam jurnal pembelajaran.</span>
              </div>
              {truantAlerts.length > 0 && (
                <div className="mt-1 pl-6 text-rose-800 font-medium">
                  🚨 <strong>Sanksi Otomatis (+15 Poin):</strong> Tercatat sanksi membolos untuk siswa:{' '}
                  <span className="font-bold underline">{truantAlerts.join(', ')}</span>. Data telah disinkronkan ke buku pelanggaran siswa, Wali Kelas, dan Guru BK.
                </div>
              )}
            </div>
          )}

          {/* Student Attendance List */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Daftar Peserta Didik Kelas {currentSchedule?.classId} ({classStudents.length} Siswa)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Pilih status kehadiran dan tulis keterangan jika ada siswa membolos jam pelajaran
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 w-24">NIS</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-2 w-16 text-center">Gender</th>
                    <th className="py-2.5 px-4 text-center w-72">Status Presensi</th>
                    <th className="py-2.5 px-4 min-w-[280px]">Keterangan Khusus / Catatan Jam Pelajaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((st, idx) => {
                    const currentStatus = records[st.id] || 'Hadir';
                    const currentNote = studentNotes[st.id] || '';
                    const isTruant = /membolos|bolos/i.test(currentNote);

                    return (
                      <tr key={st.id} className={isTruant ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50/80'}>
                        <td className="py-2 px-3 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-slate-700">
                          {st.nis}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {st.name}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-500 font-mono">
                          {st.gender}
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {(['Hadir', 'Sakit', 'Izin', 'Alpa'] as AttendanceStatus[]).map((stt) => {
                              const isSelected = currentStatus === stt;
                              let activeClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                              if (isSelected) {
                                if (stt === 'Hadir') activeClass = 'bg-emerald-600 text-white font-bold shadow-2xs';
                                else if (stt === 'Sakit') activeClass = 'bg-blue-600 text-white font-bold shadow-2xs';
                                else if (stt === 'Izin') activeClass = 'bg-amber-600 text-white font-bold shadow-2xs';
                                else activeClass = 'bg-rose-600 text-white font-bold shadow-2xs';
                              }

                              return (
                                <button
                                  key={stt}
                                  type="button"
                                  onClick={() => handleStatusChange(st.id, stt)}
                                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${activeClass}`}
                                >
                                  {stt === 'Hadir' ? 'Hadir (H)' : stt === 'Sakit' ? 'Sakit (S)' : stt === 'Izin' ? 'Izin (I)' : 'Alpa (A)'}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={currentNote}
                              onChange={(e) => handleStudentNoteChange(st.id, e.target.value)}
                              placeholder="Keterangan siswa (Ketik 'membolos' untuk sanksi poin otomatis)..."
                              className={`w-full px-2.5 py-1 text-xs border rounded-lg focus:outline-none focus:ring-1 ${
                                isTruant
                                  ? 'border-rose-400 bg-rose-50/60 text-rose-900 focus:ring-rose-500 font-medium'
                                  : 'border-slate-300 bg-white text-slate-900 focus:ring-blue-600'
                              }`}
                            />
                            {isTruant && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-700 bg-rose-100/90 border border-rose-300 px-2 py-0.5 rounded shadow-2xs">
                                <span>🚨 Sistem: Terdeteksi 'Membolos Jam Pelajaran' (+15 Poin Otomatis Saat Simpan)</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Recap Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Riwayat Pembelajaran & Rekap Sesi Presensi ({attendanceSessions.length} Sesi Terbaca)
            </span>
            <button
              onClick={handleExportRecap}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Rekap Excel</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-4">Mata Pelajaran</th>
                  <th className="py-2.5 px-4">Guru Pengampu</th>
                  <th className="py-2.5 px-4">Materi / Topik</th>
                  <th className="py-2.5 px-3 text-center">Hadir</th>
                  <th className="py-2.5 px-3 text-center">Sakit</th>
                  <th className="py-2.5 px-3 text-center">Izin</th>
                  <th className="py-2.5 px-3 text-center">Alpa</th>
                  <th className="py-2.5 px-4 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceSessions.map((ses) => {
                  const recs = Object.values(ses.records);
                  const h = recs.filter((s) => s === 'Hadir').length;
                  const s = recs.filter((st) => st === 'Sakit').length;
                  const i = recs.filter((st) => st === 'Izin').length;
                  const a = recs.filter((st) => st === 'Alpa').length;
                  const rate = recs.length > 0 ? Math.round((h / recs.length) * 100) : 0;

                  return (
                    <tr key={ses.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-slate-600">{ses.date}</td>
                      <td className="py-2 px-3 font-bold text-blue-700">{ses.classId}</td>
                      <td className="py-2 px-4 font-semibold text-slate-900">{ses.subjectName}</td>
                      <td className="py-2 px-4 text-slate-700">{ses.teacherName}</td>
                      <td className="py-2 px-4 text-slate-600 max-w-xs truncate">{ses.topic}</td>
                      <td className="py-2 px-3 text-center font-mono text-emerald-700 font-semibold">{h}</td>
                      <td className="py-2 px-3 text-center font-mono text-blue-700">{s}</td>
                      <td className="py-2 px-3 text-center font-mono text-amber-700">{i}</td>
                      <td className="py-2 px-3 text-center font-mono text-rose-700 font-bold">{a}</td>
                      <td className="py-2 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {rate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
