import React, { useState, useMemo } from 'react';
import {
  Plus,
  Calendar,
  AlertTriangle,
  Clock,
  Trash2,
  X,
  Check,
  Filter,
  FileSpreadsheet,
  RotateCcw,
  LayoutGrid,
  Layers,
  Table as TableIcon,
  Search,
  CalendarDays,
  CheckCircle2,
  BookOpen,
  User,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { ScheduleItem } from '../../types';
import { consolidateScheduleItems, ConsolidatedScheduleItem } from '../../utils/scheduleConsolidator';

export const ScheduleView: React.FC<{ onNavigate?: (menuId: string) => void }> = ({ onNavigate }) => {
  const {
    schedules,
    classes,
    teachers,
    subjects,
    settings,
    addSchedule,
    deleteSchedule,
    deleteSchedulesByClass,
    deleteAllSchedules,
    resetDefaultSchedules,
    checkScheduleConflict,
  } = useSchool();
  const { currentUser, activeRole } = useAuth();
  const isTeacher = activeRole === 'guru_mapel';

  // Current day mapping
  const daysMap: Record<number, 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'> = {
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
  };
  const todayDayName: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' =
    daysMap[new Date().getDay()] || 'Senin';

  // For teachers: default is today only; button can toggle full weekly schedule
  const [showWeeklyForTeacher, setShowWeeklyForTeacher] = useState(false);

  const [viewMode, setViewMode] = useState<'menyeluruh' | 'matrix' | 'table'>('menyeluruh');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('Semua');
  const [selectedClass, setSelectedClass] = useState<string>('7A');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    action: () => void;
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const days: ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat')[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  const [formData, setFormData] = useState({
    day: 'Senin' as 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat',
    period: 1,
    startTime: '07:00',
    endTime: '08:30',
    classId: '7A',
    teacherCode: 'G01',
    subjectCode: 'BIN',
    academicYear: settings.activeAcademicYear,
    semester: settings.activeSemester,
  });

  const handleOpenAdd = () => {
    setConflictWarning(null);
    setFormData({
      day: (selectedDayFilter !== 'Semua' ? selectedDayFilter : 'Senin') as any,
      period: 1,
      startTime: '07:00',
      endTime: '08:30',
      classId: selectedClass,
      teacherCode: teachers[1]?.teacherCode || 'G01',
      subjectCode: subjects[0]?.code || 'BIN',
      academicYear: settings.activeAcademicYear,
      semester: settings.activeSemester,
    });
    setIsModalOpen(true);
  };

  const handleTeacherChange = (code: string) => {
    const t = teachers.find((tc) => tc.teacherCode === code);
    const matchedSub = subjects.find((s) => t?.subject.toLowerCase().includes(s.name.toLowerCase()));
    setFormData({
      ...formData,
      teacherCode: code,
      subjectCode: matchedSub ? matchedSub.code : formData.subjectCode,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = teachers.find((tc) => tc.teacherCode === formData.teacherCode);
    const sub = subjects.find((s) => s.code === formData.subjectCode);

    const payload = {
      ...formData,
      teacherName: t?.name || formData.teacherCode,
      subjectName: sub?.name || formData.subjectCode,
    };

    const conflict = checkScheduleConflict(payload);
    if (conflict.hasConflict) {
      setConflictWarning(conflict.message || 'Jadwal bertabrakan!');
      return;
    }

    const res = addSchedule(payload);
    if (!res.success) {
      setConflictWarning(res.conflict || 'Gagal menyimpan');
      return;
    }

    showNotify(`Jadwal ${payload.subjectName} (${payload.classId}) berhasil disimpan.`);
    setIsModalOpen(false);
  };

  // Delete handlers with confirmations
  const handleConfirmDeleteSingle = (item: ScheduleItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Sesi Jadwal',
      description: `Apakah Anda yakin ingin menghapus jadwal ${item.subjectName} (${item.classId}) hari ${item.day} Jam ke-${item.period} (${item.teacherName})?`,
      confirmText: 'Ya, Hapus Sesi',
      action: () => {
        deleteSchedule(item.id);
        showNotify(`Jadwal ${item.subjectName} (${item.classId}) berhasil dihapus.`);
      },
    });
  };

  const handleConfirmDeleteByClass = (classIdToDelete: string) => {
    const classSchedules = schedules.filter((s) => s.classId.toUpperCase() === classIdToDelete.toUpperCase());
    if (classSchedules.length === 0) {
      alert(`Tidak ada jadwal pembelajaran yang terdaftar untuk kelas ${classIdToDelete}.`);
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: `Hapus Seluruh Jadwal Kelas ${classIdToDelete}`,
      description: `PERHATIAN: Anda akan menghapus seluruh data jadwal (${classSchedules.length} sesi) untuk Kelas ${classIdToDelete}. Tindakan ini tidak dapat dibatalkan.`,
      confirmText: `Hapus ${classSchedules.length} Jadwal Kelas ${classIdToDelete}`,
      action: () => {
        const deleted = deleteSchedulesByClass(classIdToDelete);
        showNotify(`Berhasil menghapus seluruh jadwal (${deleted} sesi) untuk kelas ${classIdToDelete}.`);
      },
    });
  };

  const handleConfirmDeleteAll = () => {
    if (schedules.length === 0) {
      alert('Data jadwal pembelajaran sudah kosong.');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Seluruh Data Jadwal Pembelajaran',
      description: `PERINGATAN KRUSIAL: Anda akan menghapus SEMUA data jadwal (${schedules.length} sesi pembelajaran di seluruh kelas). Jadwal akan dikosongkan secara total.`,
      confirmText: 'Hapus Seluruh Jadwal Sekolah',
      action: () => {
        deleteAllSchedules();
        showNotify('Seluruh jadwal pembelajaran sekolah berhasil dikosongkan.');
      },
    });
  };

  const handleConfirmResetDefault = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Pulihkan Jadwal Pembelajaran Standar',
      description: 'Sistem akan memulihkan data matriks jadwal pembelajaran standar untuk 24 rombongan belajar.',
      confirmText: 'Pulihkan Jadwal Default',
      action: () => {
        resetDefaultSchedules();
        showNotify('Berhasil memulihkan jadwal pembelajaran standar.');
      },
    });
  };

  // In teacher mode, consolidate contiguous periods into single combined cards (Requirement 1)
  const effectiveSchedules = useMemo(() => {
    if (!isTeacher) return schedules;
    const myRaw = schedules.filter((s) => {
      const code = currentUser?.teacherCode;
      const name = currentUser?.name?.toLowerCase();
      if (code && s.teacherCode === code) return true;
      if (name && s.teacherName.toLowerCase().includes(name)) return true;
      return false;
    });
    return consolidateScheduleItems(myRaw);
  }, [schedules, isTeacher, currentUser]);

  // Filtered schedules for Menyeluruh View
  const displayDays = useMemo(() => {
    if (isTeacher) {
      if (!showWeeklyForTeacher) {
        return [todayDayName];
      }
      return days;
    }
    if (selectedDayFilter === 'Semua') return days;
    return days.filter((d) => d === selectedDayFilter);
  }, [selectedDayFilter, isTeacher, showWeeklyForTeacher, todayDayName]);

  const searchedSchedules = useMemo(() => {
    let list = effectiveSchedules;
    if (isTeacher && !showWeeklyForTeacher) {
      list = list.filter((s) => s.day === todayDayName);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (s) =>
        s.classId.toLowerCase().includes(q) ||
        s.subjectName.toLowerCase().includes(q) ||
        s.subjectCode.toLowerCase().includes(q) ||
        s.teacherName.toLowerCase().includes(q) ||
        s.teacherCode.toLowerCase().includes(q) ||
        s.day.toLowerCase().includes(q)
    );
  }, [effectiveSchedules, isTeacher, showWeeklyForTeacher, todayDayName, searchQuery]);

  const filteredClassSchedules = useMemo(() => {
    let list = effectiveSchedules.filter((s) => s.classId === selectedClass);
    if (isTeacher && !showWeeklyForTeacher) {
      list = list.filter((s) => s.day === todayDayName);
    }
    return list;
  }, [effectiveSchedules, selectedClass, isTeacher, showWeeklyForTeacher, todayDayName]);

  const getGradeBadgeColor = (classId: string) => {
    const firstChar = classId.charAt(0);
    if (firstChar === '7') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (firstChar === '8') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    return 'bg-purple-100 text-purple-800 border-purple-200';
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isTeacher ? 'Jadwal Pembelajaran Saya' : 'Jadwal Pembelajaran Terpadu'}
            </h2>
            {isTeacher && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                Mode Guru Mapel (Hanya Lihat)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTeacher
              ? `Jadwal mengajar resmi untuk ${currentUser?.name || 'Guru'} · Menampilkan jadwal hari ${showWeeklyForTeacher ? 'sepanjang minggu' : todayDayName + ' (Hari Ini)'}`
              : 'Penyusunan jadwal KBM menyeluruh per hari, matriks rombel, serta pengelolaan hapus data fleksibel'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle for Teacher: Hari Ini vs Mingguan */}
          {isTeacher ? (
            <button
              onClick={() => setShowWeeklyForTeacher(!showWeeklyForTeacher)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <CalendarDays className="w-4 h-4" />
              <span>
                {showWeeklyForTeacher
                  ? `Tampilkan Jadwal Hari Ini Saja (${todayDayName})`
                  : 'Tampilkan Semua Jadwal Mingguan'}
              </span>
            </button>
          ) : (
            <>
              {/* View Modes for Admin */}
              <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setViewMode('menyeluruh')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'menyeluruh' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Menyeluruh per Hari</span>
                </button>
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'matrix' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Matriks Rombel</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Daftar Tabel</span>
                </button>
              </div>

              {onNavigate && (
                <button
                  onClick={() => onNavigate('import_excel')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Import Jadwal (.xlsx)</span>
                </button>
              )}

              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jadwal</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Action Strip: Management, Day Filter & Delete Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Left side: View specific controls */}
        {viewMode === 'menyeluruh' ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Filter Hari:</span>
            </span>
            {['Semua', ...days].map((dayName) => {
              const count = dayName === 'Semua' ? effectiveSchedules.length : effectiveSchedules.filter((s) => s.day === dayName).length;
              const isActive = (isTeacher && !showWeeklyForTeacher) ? (dayName === todayDayName) : (selectedDayFilter === dayName);
              return (
                <button
                  key={dayName}
                  onClick={() => {
                    if (isTeacher) {
                      setShowWeeklyForTeacher(true);
                    }
                    setSelectedDayFilter(dayName);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{dayName}</span>
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        ) : viewMode === 'matrix' ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Pilih Rombel / Kelas:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-bold text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              {classes.map((c) => (
                <option key={c.classId} value={c.classId}>
                  Kelas {c.classId} ({effectiveSchedules.filter((s) => s.classId === c.classId).length} Sesi)
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kelas, mapel, atau guru..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        )}

        {/* Right side: Delete Menu & Reset Buttons (STRICTLY HIDDEN FOR TEACHER) */}
        {!isTeacher && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Hapus per Kelas */}
            <button
              onClick={() => handleConfirmDeleteByClass(selectedClass)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title={`Hapus seluruh jadwal kelas ${selectedClass}`}
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Hapus Jadwal Kelas {selectedClass}</span>
            </button>

            {/* Hapus Seluruh Data */}
            <button
              onClick={handleConfirmDeleteAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Hapus seluruh data jadwal di semua kelas"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Hapus Semua Jadwal ({schedules.length})</span>
            </button>

            {/* Pulihkan Default */}
            <button
              onClick={handleConfirmResetDefault}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Pulihkan jadwal standar 24 rombel"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Reset Default</span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: Menyeluruh Per Keterangan Hari */}
      {viewMode === 'menyeluruh' && (
        <div className="space-y-6">
          {displayDays.map((dayName) => {
            const daySchedules = effectiveSchedules
              .filter((s) => s.day === dayName)
              .sort((a, b) => a.period - b.period || a.classId.localeCompare(b.classId));

            const sesiPagi = daySchedules.filter((s) => s.period === 1);
            const sesiSiang = daySchedules.filter((s) => s.period === 4);
            const otherSesi = daySchedules.filter((s) => s.period !== 1 && s.period !== 4);

            return (
              <div key={dayName} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                {/* Day Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 to-blue-950 px-5 py-3 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CalendarDays className="w-4 h-4 text-blue-400" />
                    <h3 className="font-bold text-sm tracking-wide">
                      Hari {dayName}
                    </h3>
                    <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-mono">
                      {daySchedules.length} Sesi Terjadwal
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    SMPN 1 Mantap Unggulan · TP {settings.activeAcademicYear} ({settings.activeSemester})
                  </span>
                </div>

                <div className="p-4 space-y-5">
                  {daySchedules.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      Tidak ada jadwal pembelajaran pada hari {dayName}.
                    </div>
                  ) : isTeacher ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                          <h4 className="text-xs font-bold text-slate-900">
                            Jadwal KBM Mengajar Anda (Presensi Satu Kali Per Sesi)
                          </h4>
                        </div>
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {daySchedules.length} Sesi Terjadwal
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {daySchedules.map((item: any) => (
                          <div
                            key={item.id}
                            className="p-3.5 bg-gradient-to-br from-white to-blue-50/40 border border-slate-200 hover:border-blue-400 rounded-xl text-xs flex flex-col justify-between transition-all group shadow-2xs space-y-3"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] border ${getGradeBadgeColor(item.classId)}`}>
                                  Kelas {item.classId}
                                </span>
                                <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                                  {item.subjectCode}
                                </span>
                              </div>
                              <h5 className="font-bold text-slate-900 line-clamp-1 text-sm">
                                {item.subjectName}
                              </h5>
                              <div className="flex items-center gap-1.5 text-slate-600 text-[11px] mt-1">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="line-clamp-1">{item.teacherName}</span>
                              </div>
                            </div>

                            <div className="p-2 bg-white rounded-lg border border-slate-200/80 space-y-1 text-[11px]">
                              <div className="flex items-center justify-between text-slate-700">
                                <span className="text-slate-500 font-medium">Jam Pelajaran:</span>
                                <span className="font-bold font-mono text-blue-700">
                                  {item.periodDisplay || `Jam Ke-${item.period}`}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-slate-700">
                                <span className="text-slate-500 font-medium">Alokasi Waktu:</span>
                                <span className="font-mono font-semibold text-emerald-700">
                                  {item.timeDisplay || `${item.startTime} - ${item.endTime}`} WIB
                                </span>
                              </div>
                            </div>

                            {onNavigate && (
                              <button
                                onClick={() => onNavigate('attendance')}
                                className="w-full py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Input Presensi Sesi Ini</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Sesi Pagi */}
                      <div>
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                            <h4 className="text-xs font-bold text-slate-900">
                              Sesi Pagi: Jam Ke-1 s/d 3
                            </h4>
                            <span className="text-[11px] font-mono text-slate-500">
                              (07:00 – 09:15 WIB)
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {sesiPagi.length} Kelas Berjalan
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {sesiPagi.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-lg text-xs flex flex-col justify-between transition-all group"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] border ${getGradeBadgeColor(item.classId)}`}>
                                    Kelas {item.classId}
                                  </span>
                                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                                    {item.subjectCode}
                                  </span>
                                </div>
                                <h5 className="font-bold text-slate-900 line-clamp-1">
                                  {item.subjectName}
                                </h5>
                                <div className="flex items-center gap-1.5 text-slate-600 text-[11px] mt-1">
                                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="line-clamp-1">{item.teacherName}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/60 text-[10px] text-slate-500 font-mono">
                                <span>Kode: {item.teacherCode}</span>
                                {!isTeacher && (
                                  <button
                                    onClick={() => handleConfirmDeleteSingle(item)}
                                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer rounded hover:bg-rose-50"
                                    title="Hapus sesi ini"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sesi Siang */}
                      <div>
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                            <h4 className="text-xs font-bold text-slate-900">
                              Sesi Siang: Jam Ke-4 s/d 6
                            </h4>
                            <span className="text-[11px] font-mono text-slate-500">
                              (09:45 – 12:00 WIB)
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {sesiSiang.length} Kelas Berjalan
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {sesiSiang.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-lg text-xs flex flex-col justify-between transition-all group"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] border ${getGradeBadgeColor(item.classId)}`}>
                                    Kelas {item.classId}
                                  </span>
                                  <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                                    {item.subjectCode}
                                  </span>
                                </div>
                                <h5 className="font-bold text-slate-900 line-clamp-1">
                                  {item.subjectName}
                                </h5>
                                <div className="flex items-center gap-1.5 text-slate-600 text-[11px] mt-1">
                                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="line-clamp-1">{item.teacherName}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/60 text-[10px] text-slate-500 font-mono">
                                <span>Kode: {item.teacherCode}</span>
                                {!isTeacher && (
                                  <button
                                    onClick={() => handleConfirmDeleteSingle(item)}
                                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer rounded hover:bg-rose-50"
                                    title="Hapus sesi ini"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sesi Lainnya jika ada */}
                      {otherSesi.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                            <h4 className="text-xs font-bold text-slate-900">
                              Sesi Lainnya ({otherSesi.length})
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {otherSesi.map((item) => (
                              <div
                                key={item.id}
                                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-mono font-bold text-blue-700">Kelas {item.classId}</span>
                                    <span className="text-[10px] text-slate-500">Jam Ke-{item.period}</span>
                                  </div>
                                  <span className="font-semibold block">{item.subjectName}</span>
                                  <span className="text-[11px] text-slate-500">{item.teacherName}</span>
                                </div>
                                {!isTeacher && (
                                  <button
                                    onClick={() => handleConfirmDeleteSingle(item)}
                                    className="self-end mt-2 text-slate-400 hover:text-rose-600 p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Matriks Mingguan per Rombel */}
      {viewMode === 'matrix' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs overflow-x-auto">
          <div className="min-w-[700px] grid grid-cols-6 gap-2">
            {/* Headers: Jam & Days */}
            <div className="text-center font-bold text-xs text-slate-500 py-2 bg-slate-50 rounded">
              Jam Sesi
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="text-center font-bold text-xs text-slate-800 py-2 bg-slate-100/70 rounded"
              >
                {day}
              </div>
            ))}

            {/* Row 1: Session 1 (Jam 1 - 3, 07:00 - 09:15) */}
            <div className="p-3 bg-slate-50 rounded flex flex-col justify-center items-center text-center border border-slate-100">
              <span className="text-xs font-bold text-slate-800">Sesi Pagi</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">07:00 - 09:15</span>
              <span className="text-[9px] text-blue-600 font-semibold mt-1">Jam ke 1-3</span>
            </div>

            {days.map((day) => {
              const item = filteredClassSchedules.find((s) => s.day === day && s.period === 1);
              return (
                <div
                  key={`${day}-1`}
                  className={`p-3 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                    item
                      ? 'bg-blue-50/50 border-blue-200 hover:border-blue-300'
                      : 'bg-slate-50/40 border-dashed border-slate-200'
                  }`}
                >
                  {item ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900">{item.subjectName}</span>
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-1 rounded">
                          {item.subjectCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                        {item.teacherName}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">
                        Kode: {item.teacherCode}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center text-slate-300 py-4">Kosong</div>
                  )}

                  {item && !isTeacher && (
                    <button
                      onClick={() => handleConfirmDeleteSingle(item)}
                      className="self-end mt-2 text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      title="Hapus sesi ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Break indicator */}
            <div className="col-span-6 py-1.5 text-center bg-slate-100/60 rounded text-[11px] font-medium text-slate-500">
              ☕ Istirahat Pertama (09:15 - 09:45)
            </div>

            {/* Row 2: Session 2 (Jam 4 - 6, 09:45 - 12:00) */}
            <div className="p-3 bg-slate-50 rounded flex flex-col justify-center items-center text-center border border-slate-100">
              <span className="text-xs font-bold text-slate-800">Sesi Siang</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">09:45 - 12:00</span>
              <span className="text-[9px] text-indigo-600 font-semibold mt-1">Jam ke 4-6</span>
            </div>

            {days.map((day) => {
              const item = filteredClassSchedules.find((s) => s.day === day && s.period === 4);
              return (
                <div
                  key={`${day}-4`}
                  className={`p-3 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                    item
                      ? 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-300'
                      : 'bg-slate-50/40 border-dashed border-slate-200'
                  }`}
                >
                  {item ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-900">{item.subjectName}</span>
                        <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100 px-1 rounded">
                          {item.subjectCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                        {item.teacherName}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">
                        Kode: {item.teacherCode}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center text-slate-300 py-4">Kosong</div>
                  )}

                  {item && !isTeacher && (
                    <button
                      onClick={() => handleConfirmDeleteSingle(item)}
                      className="self-end mt-2 text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      title="Hapus sesi ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: Table View */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-4">Hari</th>
                <th className="py-2.5 px-4">Kelas</th>
                <th className="py-2.5 px-4">Jam Pelajaran</th>
                <th className="py-2.5 px-4">Waktu</th>
                <th className="py-2.5 px-4">Mata Pelajaran</th>
                <th className="py-2.5 px-4">Guru Pengampu</th>
                <th className="py-2.5 px-4">Kode Guru</th>
                {!isTeacher && <th className="py-2.5 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {searchedSchedules.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{s.day}</td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] border ${getGradeBadgeColor(s.classId)}`}>
                      {s.classId}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-blue-700">Jam {s.period}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">{s.startTime} - {s.endTime}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{s.subjectName}</td>
                  <td className="py-2.5 px-4">{s.teacherName}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 font-bold">{s.teacherCode}</td>
                  {!isTeacher && (
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleConfirmDeleteSingle(s)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Hapus sesi ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-rose-50 text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {confirmDialog.title}
                </h3>
                <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                  {confirmDialog.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  confirmDialog.action();
                  setConfirmDialog(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors cursor-pointer shadow-xs"
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Modal with live conflict check */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Penyusunan Jadwal Pembelajaran Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {conflictWarning && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Konflik Jadwal Ditemukan:</span>
                  <p className="mt-0.5 text-[11px] leading-relaxed">{conflictWarning}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rombel / Kelas</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-blue-700 bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.classId} value={c.classId}>
                        Kelas {c.classId}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hari</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Pelajaran Ke-</label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  >
                    <option value={1}>Jam Ke-1 (Sesi Pagi)</option>
                    <option value={4}>Jam Ke-4 (Sesi Siang)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Guru Pengampu (Kode Guru Mapel)
                </label>
                <select
                  value={formData.teacherCode}
                  onChange={(e) => handleTeacherChange(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.teacherCode}>
                      {t.name} ({t.teacherCode} - {t.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                <select
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold"
                >
                  {subjects.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors shadow-2xs cursor-pointer"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
