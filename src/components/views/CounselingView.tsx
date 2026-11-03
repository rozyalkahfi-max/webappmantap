import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  HeartHandshake,
  Lock,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  X,
  History,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { CounselingRecord, CounselingStatus } from '../../types';

export const CounselingView: React.FC = () => {
  const {
    priorityBkStudents,
    counselingRecords,
    addCounselingRecord,
    updateCounselingRecord,
    getBKAssignedStudents,
    getBKAssignedClasses,
    teachers,
  } = useSchool();
  const { currentUser, activeRole } = useAuth();

  const currentCounselor = useMemo(() => {
    return teachers.find(
      (t) =>
        t.name.toLowerCase() === currentUser?.name.toLowerCase() ||
        t.username === currentUser?.username ||
        t.id === currentUser?.id ||
        ((t.role === 'guru_bk' || t.isBK) && (t.teacherCode === currentUser?.teacherCode || t.code === currentUser?.teacherCode))
    );
  }, [teachers, currentUser]);

  const identifier = currentCounselor?.id || currentUser?.name || '';
  const myAssignedStudents = useMemo(() => getBKAssignedStudents(identifier), [getBKAssignedStudents, identifier]);
  const myAssignedClasses = useMemo(() => getBKAssignedClasses(identifier), [getBKAssignedClasses, identifier]);
  const myStudentIds = useMemo(() => new Set(myAssignedStudents.map((s) => s.id)), [myAssignedStudents]);

  const [filterMode, setFilterMode] = useState<'binaan' | 'all'>('binaan');

  const visiblePriorityStudents = useMemo(() => {
    if (activeRole === 'guru_bk' && filterMode === 'binaan' && myAssignedStudents.length > 0) {
      return priorityBkStudents.filter((p) => myStudentIds.has(p.student.id));
    }
    return priorityBkStudents;
  }, [activeRole, filterMode, priorityBkStudents, myAssignedStudents, myStudentIds]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    visiblePriorityStudents[0]?.student.id || priorityBkStudents[0]?.student.id || ''
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CounselingRecord | null>(null);

  const selectedPriority = visiblePriorityStudents.find((p: any) => p.student.id === selectedStudentId) || priorityBkStudents.find((p: any) => p.student.id === selectedStudentId);

  const [formData, setFormData] = useState({
    date: '2026-10-31',
    identifiedProblem: '',
    counselingMethod: 'Konseling Individual & Wawancara Pemetaan Masalah',
    counselingResult: '',
    actionPlan: '',
    progressNotes: '',
    status: 'Sedang Dalam Pembinaan' as CounselingStatus,
    confidential: true,
  });

  const handleOpenAdd = () => {
    if (!selectedPriority) return;
    setEditingRecord(null);
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      identifiedProblem: '',
      counselingMethod: 'Konseling Individual & Pendampingan Karakter',
      counselingResult: '',
      actionPlan: '',
      progressNotes: '',
      status: 'Sedang Dalam Pembinaan',
      confidential: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: CounselingRecord) => {
    setEditingRecord(rec);
    setFormData({
      date: rec.date,
      identifiedProblem: rec.identifiedProblem,
      counselingMethod: rec.counselingMethod,
      counselingResult: rec.counselingResult,
      actionPlan: rec.actionPlan,
      progressNotes: rec.progressNotes,
      status: rec.status,
      confidential: rec.confidential,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPriority) return;

    if (editingRecord) {
      updateCounselingRecord(editingRecord.id, formData);
    } else {
      addCounselingRecord({
        studentId: selectedPriority.student.id,
        studentName: selectedPriority.student.name,
        classId: selectedPriority.student.classId,
        counselorId: currentUser?.teacherCode || 'G15',
        counselorName: currentUser?.name || 'Guru BK Konselor',
        totalPoints: selectedPriority.totalPoints,
        date: formData.date,
        identifiedProblem: formData.identifiedProblem,
        counselingMethod: formData.counselingMethod,
        counselingResult: formData.counselingResult,
        actionPlan: formData.actionPlan,
        progressNotes: formData.progressNotes,
        status: formData.status,
        confidential: formData.confidential,
      });
    }

    setIsModalOpen(false);
  };

  const statusColors: Record<CounselingStatus, string> = {
    'Belum Ditangani': 'text-rose-700 bg-rose-50 border-rose-200',
    'Sedang Dalam Pembinaan': 'text-amber-700 bg-amber-50 border-amber-200',
    Monitoring: 'text-blue-700 bg-blue-50 border-blue-200',
    Selesai: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  };

  const studentCounselings = counselingRecords.filter(
    (c) => c.studentId === selectedStudentId
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Layanan Bimbingan Konseling (BK)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen penanganan kasus dan pembinaan intensif siswa dengan akumulasi &gt;30 poin pelanggaran
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Kerahasiaan Dokumen BK Terjaga</span>
          </span>
        </div>
      </div>

      {/* Tiered Guidance System (Tahap 15 Walas, 25 BK, >30 Kepsek) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Tahap 1 (15–24 Poin)</span>
            <span className="text-[10px] bg-amber-200/60 text-amber-900 font-semibold px-2 py-0.5 rounded">Wali Kelas</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Pembimbingan tahap awal dilakukan terlebih dahulu oleh <strong>Wali Kelas</strong> pada rombel siswa bersangkutan.
          </p>
        </div>

        <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wide">Tahap 2 (25–30 Poin)</span>
            <span className="text-[10px] bg-orange-200/60 text-orange-900 font-semibold px-2 py-0.5 rounded">Guru BK</span>
          </div>
          <p className="text-xs text-orange-900 leading-relaxed">
            Mendekati ambang 25 poin, sistem otomatis mengirimkan <strong>pemberitahuan ke Guru BK</strong> untuk konseling terarah.
          </p>
        </div>

        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wide">Tahap 3 (&gt;30 Poin) & Selesai</span>
            <span className="text-[10px] bg-rose-200/60 text-rose-900 font-semibold px-2 py-0.5 rounded">Kepala Sekolah</span>
          </div>
          <p className="text-xs text-rose-900 leading-relaxed">
            Pelanggaran parah (&gt;30 poin) langsung dilaporkan ke <strong>Kepala Sekolah</strong>, dan setiap pembimbingan yang selesai otomatis dikonfirmasi ke pimpinan.
          </p>
        </div>
      </div>

      {/* Auto-Detection Priority Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-rose-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-300" />
            <h3 className="text-sm font-bold tracking-tight">
              Sistem Deteksi Otomatis: {priorityBkStudents.length} Siswa Melewati Ambang 30 Poin
            </h3>
          </div>
          <p className="text-xs text-rose-100 max-w-2xl leading-relaxed">
            Setiap kali guru mencatat pelanggaran dan akumulasi mencapai lebih dari 30 poin, sistem secara otomatis memasukkan siswa ke dalam daftar antrean prioritas pembinaan BK dan mengirimkan notifikasi ke wali kelas serta kepala sekolah.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center px-4 py-2 bg-black/20 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase font-semibold text-rose-200">Total Prioritas BK</span>
            <p className="text-2xl font-bold font-mono">{priorityBkStudents.length} Siswa</p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout: Priority Queue on Left, Student Details & Counseling Records on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Priority Students List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                Daftar Siswa Prioritas (&gt;30 Poin)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {visiblePriorityStudents.length} Siswa
              </span>
            </div>

            {activeRole === 'guru_bk' && myAssignedStudents.length > 0 && (
              <div className="flex rounded-lg bg-slate-100 p-0.5 mb-2.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterMode('binaan')}
                  className={`flex-1 py-1 rounded-md transition-all text-center ${
                    filterMode === 'binaan'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Binaan Saya ({myAssignedClasses.join(', ') || 'Rombel'})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`flex-1 py-1 rounded-md transition-all text-center ${
                    filterMode === 'all'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua Kelas
                </button>
              </div>
            )}

            <div className="space-y-2">
              {visiblePriorityStudents.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">
                  {filterMode === 'binaan'
                    ? 'Tidak ada siswa binaan dalam daftar prioritas (>30 poin).'
                    : 'Tidak ada siswa dalam daftar prioritas saat ini.'}
                </p>
              ) : (
                visiblePriorityStudents.map((item: any) => {
                  const isSelected = item.student.id === selectedStudentId;
                  const cStatus = (item.latestCounseling?.status || 'Belum Ditangani') as CounselingStatus;

                  return (
                    <div
                      key={item.student.id}
                      onClick={() => setSelectedStudentId(item.student.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-xs text-slate-900 block truncate max-w-[160px]">
                            {item.student.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Kelas {item.student.classId} · NIS {item.student.nis}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 tabular-nums">
                          {item.totalPoints} Poin
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Status Pembinaan:</span>
                        <span className={`px-2 py-0.5 rounded border font-semibold ${statusColors[cStatus] || 'text-slate-600'}`}>
                          {cStatus}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Case Workspace */}
        <div className="lg:col-span-8 space-y-4">
          {selectedPriority ? (
            <>
              {/* Student Summary Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base">
                      {selectedPriority.student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {selectedPriority.student.name}
                        </h3>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          Kelas {selectedPriority.student.classId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        NIS: {selectedPriority.student.nis} · NISN: {selectedPriority.student.nisn} · Akumulasi:{' '}
                        <strong className="text-rose-700 font-bold">{selectedPriority.totalPoints} Poin Pelanggaran</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-center"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Catat Sesi Bimbingan</span>
                  </button>
                </div>
              </div>

              {/* Infraction Timeline History */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Riwayat Lengkap Pelanggaran Siswa</span>
                </h4>

                <div className="space-y-2.5">
                  {selectedPriority.violations.map((v: any, vIdx: number) => (
                    <div
                      key={v.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{v.violationType}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({v.date})</span>
                          <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-1.5 rounded">
                            {v.category}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{v.description}</p>
                        <p className="text-[10px] text-slate-400">
                          Dilaporkan oleh: <span className="font-medium text-slate-700">{v.reporterName}</span>
                          {v.notes && <span> · Tindak lanjut awal: {v.notes}</span>}
                        </p>
                      </div>

                      <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 shrink-0 tabular-nums">
                        +{v.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Counseling Records List */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-blue-600" />
                    <span>Catatan Penanganan & Tindak Lanjut Konseling</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {studentCounselings.length} Sesi Terdata
                  </span>
                </div>

                {studentCounselings.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Belum ada sesi konseling yang dicatat untuk siswa ini. Klik &quot;Catat Sesi Bimbingan&quot; di atas untuk memulai penanganan.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studentCounselings.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{c.counselingMethod}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Tanggal: {c.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${statusColors[c.status]}`}>
                              {c.status}
                            </span>
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="text-blue-600 hover:underline font-medium text-[11px]"
                            >
                              Edit
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-500 font-semibold block text-[11px]">Identifikasi Masalah:</span>
                          <p className="text-slate-800 leading-relaxed mt-0.5">{c.identifiedProblem}</p>
                        </div>

                        <div>
                          <span className="text-slate-500 font-semibold block text-[11px]">Hasil Konseling & Komitmen Siswa:</span>
                          <p className="text-slate-800 leading-relaxed mt-0.5">{c.counselingResult}</p>
                        </div>

                        <div>
                          <span className="text-slate-500 font-semibold block text-[11px]">Rencana Tindak Lanjut (Monitoring):</span>
                          <p className="text-slate-800 leading-relaxed mt-0.5">{c.actionPlan}</p>
                        </div>

                        {c.progressNotes && (
                          <div className="p-2 bg-blue-50/70 border border-blue-200/60 rounded text-[11px] text-blue-900">
                            <strong>Catatan Perkembangan:</strong> {c.progressNotes}
                          </div>
                        )}

                        <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-200/60">
                          <span>Konselor: {c.counselorName}</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Lock className="w-3 h-3 text-amber-500" />
                            <span>Rahasia Layanan BK</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
              Pilih siswa prioritas dari daftar sebelah kiri untuk meninjau riwayat dan mencatat bimbingan konseling.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Counseling Modal */}
      {isModalOpen && selectedPriority && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-blue-700" />
                <span>Form Penanganan Kasus Konseling BK</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs">
                <strong>Siswa Terkait:</strong> {selectedPriority.student.name} (Kelas {selectedPriority.student.classId}) · Akumulasi {selectedPriority.totalPoints} Poin
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Konseling</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Penanganan</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold text-slate-900"
                  >
                    <option value="Sedang Dalam Pembinaan">Sedang Dalam Pembinaan</option>
                    <option value="Monitoring">Monitoring Berkala</option>
                    <option value="Selesai">Selesai (Kasus Ditutup)</option>
                    <option value="Belum Ditangani">Belum Ditangani</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bentuk Pembinaan</label>
                <input
                  type="text"
                  value={formData.counselingMethod}
                  onChange={(e) => setFormData({ ...formData, counselingMethod: e.target.value })}
                  required
                  placeholder="Contoh: Konseling Individual & Kontrak Perilaku"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Identifikasi Akar Permasalahan</label>
                <textarea
                  value={formData.identifiedProblem}
                  onChange={(e) => setFormData({ ...formData, identifiedProblem: e.target.value })}
                  rows={2}
                  required
                  placeholder="Penyebab dan faktor pemicu timbulnya pelanggaran..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hasil Bimbingan / Konseling</label>
                <textarea
                  value={formData.counselingResult}
                  onChange={(e) => setFormData({ ...formData, counselingResult: e.target.value })}
                  rows={2}
                  required
                  placeholder="Kesepakatan dan komitmen perubahan sikap siswa..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rencana Tindak Lanjut & Monitoring</label>
                <textarea
                  value={formData.actionPlan}
                  onChange={(e) => setFormData({ ...formData, actionPlan: e.target.value })}
                  rows={2}
                  required
                  placeholder="Langkah evaluasi bersama wali kelas dan orang tua..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Perkembangan Terkini</label>
                <input
                  type="text"
                  value={formData.progressNotes}
                  onChange={(e) => setFormData({ ...formData, progressNotes: e.target.value })}
                  placeholder="Catatan kemajuan perilaku..."
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
                  Simpan Catatan Konseling
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
