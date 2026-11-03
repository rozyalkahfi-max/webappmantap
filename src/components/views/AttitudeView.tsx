import React, { useState } from 'react';
import { Sparkles, Plus, Check, X, Award, Save } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { AttitudeAssessment } from '../../types';

export const AttitudeView: React.FC = () => {
  const { students, classes, attitudes, saveAttitude } = useSchool();
  const { currentUser, activeRole } = useAuth();

  // Requirement 2: Lock strictly to homeroom class for Wali Kelas
  const walasClassId = React.useMemo(() => {
    return currentUser?.classId || classes.find((c) => c.homeroomTeacherId === currentUser?.teacherCode)?.classId || '7A';
  }, [currentUser, classes]);

  const defaultClass = activeRole === 'wali_kelas' ? walasClassId : (classes[0]?.classId || '7A');

  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync selectedClass if activeRole is wali_kelas
  React.useEffect(() => {
    if (activeRole === 'wali_kelas' && selectedClass !== walasClassId) {
      setSelectedClass(walasClassId);
    }
  }, [activeRole, walasClassId, selectedClass]);

  const classStudents = students.filter((s) => s.classId === selectedClass);
  const classAttitudes = attitudes.filter((a) => a.classId === selectedClass);

  const [formData, setFormData] = useState({
    studentId: '',
    discipline: 'A' as 'A' | 'B' | 'C' | 'D',
    responsibility: 'A' as 'A' | 'B' | 'C' | 'D',
    honesty: 'A' as 'A' | 'B' | 'C' | 'D',
    cooperation: 'A' as 'A' | 'B' | 'C' | 'D',
    politeness: 'A' as 'A' | 'B' | 'C' | 'D',
    care: 'A' as 'A' | 'B' | 'C' | 'D',
    activeness: 'A' as 'A' | 'B' | 'C' | 'D',
    notes: '',
    recommendation: '',
  });

  const handleOpenAdd = (studentId?: string) => {
    setFormData({
      studentId: studentId || (classStudents[0]?.id || ''),
      discipline: 'A',
      responsibility: 'A',
      honesty: 'A',
      cooperation: 'B',
      politeness: 'A',
      care: 'A',
      activeness: 'A',
      notes: 'Menunjukkan perkembangan sikap yang sangat baik dan konsisten mematuhi tata tertib.',
      recommendation: 'Pertahankan budi pekerti luhur dan aktif dalam kegiatan kolaboratif kelas.',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === formData.studentId);
    if (!st) return;

    saveAttitude({
      studentId: st.id,
      studentName: st.name,
      classId: st.classId,
      evaluatorId: currentUser?.teacherCode || 'G01',
      evaluatorName: currentUser?.name || 'Guru Penilai',
      evaluatorRole: activeRole === 'wali_kelas' ? 'Wali Kelas' : 'Guru Mapel',
      date: new Date().toISOString().slice(0, 10),
      discipline: formData.discipline,
      responsibility: formData.responsibility,
      honesty: formData.honesty,
      cooperation: formData.cooperation,
      politeness: formData.politeness,
      care: formData.care,
      activeness: formData.activeness,
      notes: formData.notes,
      recommendation: formData.recommendation,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Penilaian Perkembangan Sikap & Budi Pekerti
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi 7 aspek karakter profil pelajar Pancasila (Disiplin, Tanggung Jawab, Kejujuran, Kerja Sama, Kesantunan, Kepedulian, Keaktifan)
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Beri Penilaian Sikap</span>
        </button>
      </div>

      {/* Class Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {activeRole === 'wali_kelas' ? (
            <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-900 flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-blue-600 font-bold">Kelas Binaan Anda:</span>
              <span className="bg-blue-600 text-white font-mono font-bold px-2 py-0.5 rounded text-xs">{walasClassId}</span>
              <span className="text-slate-500 font-normal">({classStudents.length} Siswa)</span>
            </div>
          ) : (
            <>
              <span className="text-xs font-semibold text-slate-600">Rombel / Kelas:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-bold text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {classes.map((c) => (
                  <option key={c.classId} value={c.classId}>
                    {c.classId} ({c.studentCount} Siswa)
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Predikat: A (Sangat Baik) · B (Baik) · C (Cukup) · D (Perlu Pembinaan)
        </span>
      </div>

      {/* Student List with Attitude Status */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-800">
          Daftar Siswa Kelas {selectedClass} & Catatan Evaluasi Karakter
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3 w-20">NIS</th>
                <th className="py-2.5 px-4 min-w-[160px]">Nama Siswa</th>
                <th className="py-2.5 px-2 text-center w-14">Disiplin</th>
                <th className="py-2.5 px-2 text-center w-14">Tgjawab</th>
                <th className="py-2.5 px-2 text-center w-14">Jujur</th>
                <th className="py-2.5 px-2 text-center w-14">Kerjasama</th>
                <th className="py-2.5 px-2 text-center w-14">Santun</th>
                <th className="py-2.5 px-2 text-center w-14">Peduli</th>
                <th className="py-2.5 px-2 text-center w-14">Aktif</th>
                <th className="py-2.5 px-4 min-w-[200px]">Catatan Perkembangan</th>
                <th className="py-2.5 px-3 text-right w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((st, idx) => {
                const att = classAttitudes.find((a) => a.studentId === st.id);

                return (
                  <tr key={st.id} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-600">{st.nis}</td>
                    <td className="py-2 px-4 font-semibold text-slate-900 truncate max-w-[180px]">{st.name}</td>

                    <td className="py-2 px-2 text-center font-bold text-slate-800">{att ? att.discipline : 'B'}</td>
                    <td className="py-2 px-2 text-center font-bold text-slate-800">{att ? att.responsibility : 'B'}</td>
                    <td className="py-2 px-2 text-center font-bold text-slate-800">{att ? att.honesty : 'A'}</td>
                    <td className="py-2 px-2 text-center font-bold text-slate-800">{att ? att.cooperation : 'B'}</td>
                    <td className="py-2 px-2 text-center font-bold text-slate-800">{att ? att.politeness : 'A'}</td>
                    <td className="py-2 px-2 text-center font-bold text-slate-800">{att ? att.care : 'A'}</td>
                    <td className="py-2 px-2 text-center font-bold text-slate-800">{att ? att.activeness : 'B'}</td>

                    <td className="py-2 px-4 text-slate-600 text-[11px] truncate max-w-[240px]">
                      {att ? att.notes : 'Sikap baik dan mematuhi tata tertib sekolah.'}
                    </td>

                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleOpenAdd(st.id)}
                        className="text-blue-600 hover:underline font-semibold text-[11px]"
                      >
                        {att ? 'Ubah' : 'Nilai'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Penilaian Sikap */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Form Penilaian Sikap & Karakter</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold"
                >
                  {classStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} (NIS: {st.nis})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                {[
                  { key: 'discipline', label: 'Disiplin' },
                  { key: 'responsibility', label: 'Tanggung Jawab' },
                  { key: 'honesty', label: 'Kejujuran' },
                  { key: 'cooperation', label: 'Kerja Sama' },
                  { key: 'politeness', label: 'Kesantunan' },
                  { key: 'care', label: 'Kepedulian' },
                  { key: 'activeness', label: 'Keaktifan' },
                ].map((item) => (
                  <div key={item.key} className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
                    <label className="block text-[10px] font-semibold text-slate-600 truncate mb-1">
                      {item.label}
                    </label>
                    <select
                      value={(formData as any)[item.key]}
                      onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                      className="w-full text-center font-bold text-blue-700 bg-white border border-slate-200 rounded py-0.5 text-xs"
                    >
                      <option value="A">A (Sangat Baik)</option>
                      <option value="B">B (Baik)</option>
                      <option value="C">C (Cukup)</option>
                      <option value="D">D (Kurang)</option>
                    </select>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Deskripsi Perkembangan Sikap</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  required
                  placeholder="Deskripsi positif dan perilaku yang tampak..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rekomendasi Tindak Lanjut</label>
                <input
                  type="text"
                  value={formData.recommendation}
                  onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                  placeholder="Contoh: Diikutsertakan dalam kepengurusan OSIS"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
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
                  Simpan Evaluasi Sikap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
