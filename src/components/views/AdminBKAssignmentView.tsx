import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { generateBKAssignmentTemplate, validateBKAssignmentImport } from '../../utils/excel';
import {
  Users,
  ShieldCheck,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Search,
  UserCheck,
  Layers,
  ChevronRight,
  Info,
  RefreshCw,
  Edit2,
  UserPlus
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const AdminBKAssignmentView: React.FC = () => {
  const {
    teachers,
    classes,
    students,
    bkAssignments,
    assignClassesToBK,
    assignStudentToBK,
    importBKAssignmentsBatch,
    getBKAssignedClasses,
    getBKAssignedStudents,
    violations,
    logAction
  } = useSchool();

  const { allUsers } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedCounselorFilter, setSelectedCounselorFilter] = useState('ALL');

  // Modal Range Assign state
  const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);
  const [modalCounselorId, setModalCounselorId] = useState('');
  const [selectedClassesForCounselor, setSelectedClassesForCounselor] = useState<string[]>([]);

  // Excel Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<{
    valid: any[];
    errors: string[];
    summary: { total: number; validCount: number; errorCount: number };
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter counselors
  const bkTeachers = useMemo(() => {
    return teachers.filter(
      (t) =>
        t.role === 'guru_bk' ||
        t.isBK ||
        t.teacherCode === 'G15' ||
        t.teacherCode === 'G16' ||
        (t.subject && (t.subject.toLowerCase().includes('bimbingan') || t.subject.toLowerCase().includes('bk')))
    );
  }, [teachers]);

  // Counselors summary data
  const counselorSummaries = useMemo(() => {
    return bkTeachers.map((counselor) => {
      const assignedClasses = getBKAssignedClasses(counselor.id);
      const assignedStudents = getBKAssignedStudents(counselor.id);

      // Student IDs with violations
      const studentIds = new Set(assignedStudents.map((s) => s.id));
      const counselorViolations = violations.filter((v) => studentIds.has(v.studentId));
      const criticalCases = assignedStudents.filter((s) => {
        const pts = violations
          .filter((v) => v.studentId === s.id)
          .reduce((sum, v) => sum + v.points, 0);
        return pts >= 25;
      });

      return {
        counselor,
        assignedClasses,
        assignedStudents,
        totalStudents: assignedStudents.length,
        totalViolations: counselorViolations.length,
        criticalCasesCount: criticalCases.length,
      };
    });
  }, [bkTeachers, bkAssignments, students, violations, getBKAssignedClasses, getBKAssignedStudents]);

  // Overall student mapping stats
  const totalAssignedStudentsCount = useMemo(() => {
    const set = new Set<string>();
    bkTeachers.forEach((c) => {
      const studs = getBKAssignedStudents(c.id);
      studs.forEach((s) => set.add(s.id));
    });
    return set.size;
  }, [bkTeachers, getBKAssignedStudents]);

  // Filtered student rows
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.classId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass = selectedClassFilter === 'ALL' || s.classId === selectedClassFilter;

      if (!matchSearch || !matchClass) return false;

      if (selectedCounselorFilter !== 'ALL') {
        const assignedCounselor = counselorSummaries.find((cs) =>
          cs.assignedStudents.some((st) => st.id === s.id)
        );
        return assignedCounselor?.counselor.id === selectedCounselorFilter;
      }

      return true;
    });
  }, [students, searchQuery, selectedClassFilter, selectedCounselorFilter, counselorSummaries]);

  // Open range modal for specific counselor
  const openRangeModalFor = (counselorId: string) => {
    const existingClasses = getBKAssignedClasses(counselorId);
    setModalCounselorId(counselorId);
    setSelectedClassesForCounselor(existingClasses);
    setIsRangeModalOpen(true);
  };

  const handleSaveRangeAssignment = () => {
    if (!modalCounselorId) return;
    assignClassesToBK(modalCounselorId, selectedClassesForCounselor);
    setIsRangeModalOpen(false);
    setFeedbackMsg({
      type: 'success',
      text: `Berhasil memperbarui rombel binaan untuk ${teachers.find((t) => t.id === modalCounselorId)?.name}!`,
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Handle template download
  const handleDownloadTemplate = () => {
    generateBKAssignmentTemplate();
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet);

        const availableClassIds = classes.map((c) => c.classId);
        const preview = validateBKAssignmentImport(rows, teachers, availableClassIds, students);
        setImportPreview({
          valid: preview.items.filter((i) => i.isValid).map((i) => i.data),
          errors: preview.items.flatMap((i) => i.errors),
          summary: {
            total: preview.totalRows,
            validCount: preview.validRows,
            errorCount: preview.invalidRows,
          },
        });
      } catch (err) {
        setFeedbackMsg({ type: 'error', text: 'Gagal membaca berkas Excel. Pastikan format valid.' });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExecuteImport = () => {
    if (!importPreview || importPreview.valid.length === 0) return;
    setIsProcessing(true);

    try {
      const result = importBKAssignmentsBatch(importPreview.valid);
      setIsImportModalOpen(false);
      setImportFile(null);
      setImportPreview(null);
      setFeedbackMsg({
        type: 'success',
        text: `Sukses mengimpor ${result.total} data siswa & rombel binaan Guru BK! Data langsung terdistribusi ke akun Guru BK terkait.`,
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Terjadi kesalahan saat memproses data import.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick preset standard 7A-7F & 7G-8C
  const handleApplyPreset = () => {
    if (bkTeachers.length < 2) {
      alert('Dibutuhkan minimal 2 Guru BK untuk menerapkan preset standar.');
      return;
    }
    const g1 = bkTeachers[0];
    const g2 = bkTeachers[1];

    assignClassesToBK(g1.id, ['7A', '7B', '7C', '7D', '7E', '7F']);
    assignClassesToBK(g2.id, ['7G', '7H', '7I', '8A', '8B', '8C']);

    setFeedbackMsg({
      type: 'success',
      text: `Preset diterapkan: ${g1.name} (7A - 7F) dan ${g2.name} (7G - 8C).`,
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 backdrop-blur-sm border border-emerald-400/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Modul Khusus Administrator & Operator
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Pembagian Siswa & Rombel Binaan Guru BK
          </h1>
          <p className="text-emerald-100/90 text-sm mt-1 max-w-2xl leading-relaxed">
            Kelola plotting rombel binaan per Guru BK (contoh: Guru A mengampu 7A–7F, Guru B mengampu 7G–8C) serta import Excel khusus dengan format Nama Siswa, Kelas, dan Guru BK. Laporan pelanggaran siswa akan otomatis terhubung ke Guru BK yang bertugas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-all border border-white/20 shadow-sm backdrop-blur-sm"
          >
            <Download className="w-4 h-4 text-emerald-300" />
            Template Excel
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-emerald-500/25"
          >
            <UploadCloud className="w-4 h-4" />
            Import Excel Siswa BK
          </button>
          <button
            onClick={handleApplyPreset}
            title="Terapkan pembagian kelas contoh (7A-7F & 7G-8C)"
            className="inline-flex items-center gap-2 px-3 py-2.5 bg-white/10 hover:bg-white/20 text-emerald-200 rounded-xl text-xs font-medium transition-all border border-white/15"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Preset 7A–7F / 7G–8C
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-xs underline text-gray-500 hover:text-gray-700"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Guru BK Aktif</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{bkTeachers.length} Guru</h3>
            <p className="text-xs text-gray-500 mt-0.5">Petugas bimbingan konseling</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Siswa Terplot BK</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{totalAssignedStudentsCount} / {students.length}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {students.length > 0 ? Math.round((totalAssignedStudentsCount / students.length) * 100) : 0}% terdistribusi
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rombel Terbagi</p>
            <h3 className="text-2xl font-bold text-teal-600 mt-1">
              {classes.filter((c) => bkTeachers.some((t) => getBKAssignedClasses(t.id).includes(c.classId))).length} / {classes.length}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Kelas termapping BK</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Penugasan Data</p>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">{bkAssignments.length} Rekord</h3>
            <p className="text-xs text-gray-500 mt-0.5">Pemetaan siswa & rombel</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Counselor Summary Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Plotting Rombel & Siswa Binaan Setiap Guru BK
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Klik "Ubah Pembagian Rombel" pada masing-masing guru untuk mengatur kelas yang diampu.
            </p>
          </div>
          <button
            onClick={() => {
              if (bkTeachers.length > 0) openRangeModalFor(bkTeachers[0].id);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-all border border-emerald-200"
          >
            <UserPlus className="w-4 h-4" />
            Atur Pembagian Cepat
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {counselorSummaries.map((item) => (
            <div
              key={item.counselor.id}
              className="border border-gray-200 hover:border-emerald-300 rounded-2xl p-5 bg-gradient-to-br from-white to-gray-50/50 shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-500/20 text-emerald-700 font-bold text-base flex items-center justify-center flex-shrink-0 shadow-inner">
                      {item.counselor.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-snug">{item.counselor.name}</h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        NIP: {item.counselor.nip || '-'} • Kode: {item.counselor.teacherCode || item.counselor.code}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-full">
                    Guru BK
                  </span>
                </div>

                {/* Assigned classes tag cloud */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-gray-700">Rombel Binaan:</span>
                    <span className="text-gray-500">{item.assignedClasses.length} Kelas</span>
                  </div>

                  {item.assignedClasses.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {item.assignedClasses.map((cid) => (
                        <span
                          key={cid}
                          className="px-2.5 py-1 bg-white border border-gray-200 text-gray-800 rounded-lg text-xs font-semibold shadow-2xs"
                        >
                          {cid}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg italic">
                      Belum ada rombel yang ditugaskan.
                    </p>
                  )}
                </div>

                {/* Counts breakdown */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 text-center">
                  <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                    <div className="text-xs text-emerald-700 font-medium">Total Siswa Binaan</div>
                    <div className="text-xl font-extrabold text-emerald-800">{item.totalStudents}</div>
                  </div>
                  <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-100">
                    <div className="text-xs text-rose-700 font-medium">Kasus Kritis (≥25 Poin)</div>
                    <div className="text-xl font-extrabold text-rose-700">{item.criticalCasesCount}</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openRangeModalFor(item.counselor.id)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Atur Rombel Binaan
                </button>
              </div>
            </div>
          ))}

          {bkTeachers.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">Belum Ada Data Guru BK Terdaftar</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Silakan tandai guru sebagai Guru BK di Data Master Guru atau impor data guru BK.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Student Mapping Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600" />
              Daftar Siswa & Pemetaan Guru BK
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Cari dan tinjau penugasan siswa secara spesifik atau ubah secara langsung per siswa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari NIS / Nama siswa..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Kelas ({classes.length})</option>
              {classes.map((c) => (
                <option key={c.classId} value={c.classId}>
                  Kelas {c.classId}
                </option>
              ))}
            </select>

            <select
              value={selectedCounselorFilter}
              onChange={(e) => setSelectedCounselorFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Guru BK</option>
              {bkTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">NIS / NISN</th>
                <th className="px-4 py-3">Nama Lengkap Siswa</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Poin Pelanggaran</th>
                <th className="px-4 py-3">Guru BK Pembina</th>
                <th className="px-4 py-3 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.slice(0, 50).map((st, idx) => {
                const points = violations
                  .filter((v) => v.studentId === st.id)
                  .reduce((sum, v) => sum + v.points, 0);

                // Find assigned counselor
                const assignedCounselorObj = counselorSummaries.find((cs) =>
                  cs.assignedStudents.some((s) => s.id === st.id)
                );

                return (
                  <tr key={st.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-2.5 text-gray-400 font-mono">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-mono text-gray-700">
                      <div>{st.nis}</div>
                      <div className="text-[10px] text-gray-400">{st.nisn}</div>
                    </td>
                    <td className="px-4 py-2.5 font-bold text-gray-900">{st.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-bold">
                        {st.classId}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          points >= 30
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : points >= 25
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : points >= 15
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {points} Poin
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {assignedCounselorObj ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                            {assignedCounselorObj.counselor.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800">
                            {assignedCounselorObj.counselor.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-600 italic text-[11px] bg-amber-50 px-2 py-0.5 rounded">
                          Belum terplot
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <select
                        value={assignedCounselorObj?.counselor.id || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            assignStudentToBK(st.id, e.target.value);
                          }
                        }}
                        className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 font-medium text-gray-700 hover:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">Pilih Guru BK...</option>
                        {bkTeachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400 italic">
                    Tidak ada siswa yang sesuai filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredStudents.length > 50 && (
          <p className="text-xs text-gray-400 text-right mt-2">
            Menampilkan 50 dari {filteredStudents.length} siswa. Gunakan filter kelas atau pencarian nama untuk hasil lebih spesifik.
          </p>
        )}
      </div>

      {/* Modal Range Assignment */}
      {isRangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Atur Rombel Binaan Guru BK
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Pilih kelas-kelas yang menjadi tanggung jawab bimbingan guru BK terkait.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Guru BK</label>
                <select
                  value={modalCounselorId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    setModalCounselorId(cid);
                    setSelectedClassesForCounselor(getBKAssignedClasses(cid));
                  }}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {bkTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.teacherCode || t.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-700">
                    Pilih Kelas ({selectedClassesForCounselor.length} Terpilih)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedClassesForCounselor(classes.map((c) => c.classId))}
                      className="text-[11px] text-emerald-600 hover:underline font-semibold"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedClassesForCounselor([])}
                      className="text-[11px] text-rose-600 hover:underline font-semibold"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-3 bg-gray-50 rounded-xl border border-gray-200">
                  {classes.map((c) => {
                    const isChecked = selectedClassesForCounselor.includes(c.classId);
                    return (
                      <button
                        key={c.classId}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setSelectedClassesForCounselor((prev) => prev.filter((id) => id !== c.classId));
                          } else {
                            setSelectedClassesForCounselor((prev) => [...prev, c.classId]);
                          }
                        }}
                        className={`px-3 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                          isChecked
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {c.classId}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <p className="text-[11px] font-semibold text-emerald-800 mb-1.5">Pilihan Cepat Rombel:</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedClassesForCounselor(['7A', '7B', '7C', '7D', '7E', '7F'])}
                    className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100"
                  >
                    Kelas 7A – 7F
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedClassesForCounselor(['7G', '7H', '7I', '8A', '8B', '8C'])}
                    className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100"
                  >
                    Kelas 7G – 8C
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedClassesForCounselor(['8D', '8E', '8F', '8G', '8H', '8I'])}
                    className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100"
                  >
                    Kelas 8D – 8I
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedClassesForCounselor(['9A', '9B', '9C', '9D', '9E', '9F'])}
                    className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100"
                  >
                    Kelas 9A – 9F
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsRangeModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRangeAssignment}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
              >
                Simpan Pembagian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Import Pembagian Siswa Guru BK (Excel)
                    </h3>
                    <p className="text-xs text-gray-500">
                      Format kolom: <span className="font-mono font-semibold">Nama Siswa, Kelas, Guru BK</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportFile(null);
                    setImportPreview(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="mt-4">
                <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-emerald-50/30 hover:bg-emerald-50/50 transition-all">
                  <UploadCloud className="w-10 h-10 text-emerald-600 mb-2" />
                  <span className="text-sm font-bold text-gray-800">
                    {importFile ? importFile.name : 'Pilih Berkas Excel (.xlsx, .xls)'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Gunakan file template resmi untuk hasil plotting otomatis yang akurat
                  </span>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preview Content */}
              {importPreview && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-gray-700">
                        Total Baris: <strong className="text-gray-900">{importPreview.summary.total}</strong>
                      </span>
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Valid: {importPreview.summary.validCount}
                      </span>
                      {importPreview.summary.errorCount > 0 && (
                        <span className="font-semibold text-rose-700 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Baris Bermasalah: {importPreview.summary.errorCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {importPreview.errors.length > 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 max-h-28 overflow-y-auto">
                      <p className="font-bold mb-1">Catatan Validasi:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {importPreview.errors.slice(0, 5).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 text-gray-700 font-semibold sticky top-0">
                        <tr>
                          <th className="px-3 py-2">Nama Siswa</th>
                          <th className="px-3 py-2">Kelas</th>
                          <th className="px-3 py-2">Guru BK Dituju</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {importPreview.valid.slice(0, 20).map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-1.5 font-medium text-gray-900">
                              {row.studentName || <span className="text-gray-400 italic">Semua Siswa Kelas</span>}
                            </td>
                            <td className="px-3 py-1.5">
                              <span className="px-2 py-0.5 bg-gray-100 rounded font-bold text-gray-700">
                                {row.classId}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 font-bold text-emerald-700">{row.counselorName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Template Excel Baru
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportFile(null);
                    setImportPreview(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!importPreview || importPreview.valid.length === 0 || isProcessing}
                  onClick={handleExecuteImport}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md flex items-center gap-1.5"
                >
                  {isProcessing ? 'Memproses...' : 'Terapkan & Simpan Pembagian'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
