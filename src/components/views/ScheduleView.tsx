import React, { useState } from 'react';
import { Plus, Calendar, AlertTriangle, Clock, Trash2, X, Check, Filter, FileSpreadsheet } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { ScheduleItem } from '../../types';

export const ScheduleView: React.FC<{ onNavigate?: (menuId: string) => void }> = ({ onNavigate }) => {
  const { schedules, classes, teachers, subjects, settings, addSchedule, deleteSchedule, checkScheduleConflict } = useSchool();

  const [selectedDay, setSelectedDay] = useState<string>('Senin');
  const [selectedClass, setSelectedClass] = useState<string>('7A');
  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('matrix');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

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

  const days: ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat')[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  const periods = [1, 2, 3, 4, 5, 6];

  const handleOpenAdd = () => {
    setConflictWarning(null);
    setFormData({
      day: selectedDay as any,
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
    // Find matching subject
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

    setIsModalOpen(false);
  };

  const filteredSchedules = schedules.filter((s) => {
    return s.classId === selectedClass;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Jadwal Pembelajaran Terpadu
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Integrasi alokasi ruang kelas, guru pengampu, dan mata pelajaran dengan pencegahan bentrok otomatis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Matriks Mingguan
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Daftar Tabel
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
        </div>
      </div>

      {/* Class Filter Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Pilih Rombel / Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-bold text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            {classes.map((c) => (
              <option key={c.classId} value={c.classId}>
                {c.classId}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Semester: <strong className="text-slate-800">{settings.activeSemester}</strong> · TP: <strong className="text-slate-800">{settings.activeAcademicYear}</strong>
        </div>
      </div>

      {/* Matrix View */}
      {viewMode === 'matrix' ? (
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
              const item = filteredSchedules.find((s) => s.day === day && s.period === 1);
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

                  {item && (
                    <button
                      onClick={() => deleteSchedule(item.id)}
                      className="self-end mt-2 text-slate-400 hover:text-rose-600 p-1"
                      title="Hapus Sesi"
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
              const item = filteredSchedules.find((s) => s.day === day && s.period === 4);
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

                  {item && (
                    <button
                      onClick={() => deleteSchedule(item.id)}
                      className="self-end mt-2 text-slate-400 hover:text-rose-600 p-1"
                      title="Hapus Sesi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-4">Hari</th>
                <th className="py-2.5 px-4">Jam Pelajaran</th>
                <th className="py-2.5 px-4">Waktu</th>
                <th className="py-2.5 px-4">Mata Pelajaran</th>
                <th className="py-2.5 px-4">Guru Pengampu</th>
                <th className="py-2.5 px-4">Kode Guru</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchedules.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-2 px-4 font-semibold text-slate-900">{s.day}</td>
                  <td className="py-2 px-4 font-mono font-bold text-blue-700">Jam {s.period}</td>
                  <td className="py-2 px-4 font-mono text-slate-500">{s.startTime} - {s.endTime}</td>
                  <td className="py-2 px-4 font-semibold text-slate-800">{s.subjectName}</td>
                  <td className="py-2 px-4">{s.teacherName}</td>
                  <td className="py-2 px-4 font-mono text-slate-600 font-bold">{s.teacherCode}</td>
                  <td className="py-2 px-4 text-right">
                    <button
                      onClick={() => deleteSchedule(s.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                className="text-slate-400 hover:text-slate-600"
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
                        {c.classId}
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
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors shadow-2xs"
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
