import React, { useState, useMemo } from 'react';
import { AlertTriangle, Plus, Trash2, ShieldAlert, HeartHandshake, X, Filter, BookOpen, CheckCircle2, Lock } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { ViolationRecord } from '../../types';
import { DataTable, ColumnDef } from '../common/DataTable';

export const ViolationView: React.FC = () => {
  const {
    students,
    classes,
    violations,
    violationRules,
    addViolation,
    deleteViolation,
    getStudentPoints,
    getStudentViolationCategory,
  } = useSchool();
  const { currentUser, activeRole } = useAuth();

  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // RBAC Permission check per requirement 3:
  // "yang berhak melihat masukan tiap point yang diberikan guru mapel, dan wali kelas, hanya wali kelas dan guru BK yang bisa melihat"
  // - Guru BK: see all records
  // - Wali Kelas: see records for their class
  // - Admin: see all
  // - Guru Mapel: see reports they created
  // - Kepala Sekolah: see severe cases (> 30 points) only
  const isBkOrAdmin = activeRole === 'guru_bk' || activeRole === 'admin_operator';
  const isWaliKelas = activeRole === 'wali_kelas';
  const isGuruMapel = activeRole === 'guru_mapel';
  const isKepsek = activeRole === 'kepala_sekolah';

  // Modal form state
  const defaultRule = violationRules[0] || {
    id: 'default',
    code: 'PLG01',
    category: 'Ringan' as const,
    name: 'Terlambat masuk sekolah > 15 menit',
    points: 5,
    description: 'Tiba setelah bel dibunyikan',
  };

  const [selectedRuleCode, setSelectedRuleCode] = useState<string>(defaultRule.code);
  const [formData, setFormData] = useState({
    studentId: '',
    date: new Date().toISOString().slice(0, 10),
    category: defaultRule.category as 'Ringan' | 'Sedang' | 'Berat',
    violationType: defaultRule.name,
    description: defaultRule.description,
    points: defaultRule.points,
    reporterCode: currentUser?.teacherCode || 'G01',
    reporterName: currentUser?.name || 'Guru Pelapor',
    notes: '',
  });

  const handleOpenAdd = () => {
    const firstStudent = students[0];
    const rule = violationRules.find((r) => r.code === selectedRuleCode) || defaultRule;

    setFormData({
      studentId: firstStudent ? firstStudent.id : '',
      date: new Date().toISOString().slice(0, 10),
      category: rule.category,
      violationType: rule.name,
      description: rule.description,
      points: rule.points,
      reporterCode: currentUser?.teacherCode || 'G01',
      reporterName: currentUser?.name || 'Guru Pelapor',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleRuleChange = (code: string) => {
    setSelectedRuleCode(code);
    const rule = violationRules.find((r) => r.code === code);
    if (rule) {
      setFormData((prev) => ({
        ...prev,
        category: rule.category,
        violationType: rule.name,
        points: rule.points,
        description: rule.description,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === formData.studentId);
    if (!st) {
      alert('Siswa wajib dipilih.');
      return;
    }

    addViolation({
      studentId: st.id,
      studentName: st.name,
      classId: st.classId,
      date: formData.date,
      category: formData.category,
      violationType: formData.violationType,
      description: formData.description,
      points: Number(formData.points),
      reporterCode: formData.reporterCode,
      reporterName: formData.reporterName,
      notes: formData.notes,
    });

    setIsModalOpen(false);
  };

  // Filter violations according to role permissions and filters
  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      // 1. Role Scoping
      if (isWaliKelas) {
        // Walas only sees students of their assigned class
        if (currentUser?.classId && v.classId !== currentUser.classId) return false;
      } else if (isGuruMapel) {
        // Guru mapel sees their reported violations
        const code = currentUser?.teacherCode;
        const name = currentUser?.name?.toLowerCase();
        const matchCode = code && v.reporterCode === code;
        const matchName = name && v.reporterName?.toLowerCase().includes(name);
        if (!matchCode && !matchName) return false;
      } else if (isKepsek) {
        // Kepsek only sees severe violations (> 30 total student points) per requirement 3
        const total = getStudentPoints(v.studentId);
        if (total <= 30) return false;
      }

      // 2. Class filter
      if (selectedClass !== 'ALL' && v.classId !== selectedClass) return false;

      // 3. Category filter (Ringan, Sedang, Berat)
      if (selectedCategoryFilter !== 'ALL' && v.category !== selectedCategoryFilter) return false;

      return true;
    });
  }, [violations, isWaliKelas, isGuruMapel, isKepsek, currentUser, selectedClass, selectedCategoryFilter, getStudentPoints]);

  const columns: ColumnDef<ViolationRecord>[] = [
    {
      key: 'date',
      header: 'Tanggal',
      sortable: true,
      width: '100px',
      render: (v) => <span className="font-mono text-slate-600">{v.date}</span>,
    },
    {
      key: 'studentName',
      header: 'Identitas Siswa',
      sortable: true,
      render: (v) => (
        <div>
          <span className="font-semibold text-slate-900 block">{v.studentName}</span>
          <span className="text-[11px] font-mono text-slate-500">Kelas {v.classId}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      sortable: true,
      align: 'center',
      width: '110px',
      render: (v) => {
        let badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
        if (v.category === 'Berat') badgeColor = 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
        else if (v.category === 'Sedang') badgeColor = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
        else badgeColor = 'bg-slate-50 text-slate-700 border-slate-200';

        return (
          <span className={`text-[10px] px-2 py-0.5 rounded border ${badgeColor}`}>
            {v.category}
          </span>
        );
      },
    },
    {
      key: 'violationType',
      header: 'Bentuk Pelanggaran',
      sortable: true,
      render: (v) => (
        <div>
          <span className="font-semibold text-slate-800 block">{v.violationType}</span>
          {v.description && (
            <span className="text-[11px] text-slate-500 line-clamp-1">{v.description}</span>
          )}
        </div>
      ),
    },
    {
      key: 'points',
      header: 'Bobot Poin',
      sortable: true,
      align: 'center',
      width: '100px',
      render: (v) => (
        <span className="font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded">
          +{v.points}
        </span>
      ),
    },
    {
      key: 'reporterName',
      header: 'Guru Pencatat',
      sortable: true,
      render: (v) => (
        <span className="text-xs text-slate-700 font-medium">
          {v.reporterName} ({v.reporterCode})
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      sortable: false,
      align: 'right',
      width: '80px',
      render: (v) => {
        // Only Admin, BK, or the reporter can delete
        const canDelete = isBkOrAdmin || v.reporterCode === currentUser?.teacherCode;
        if (!canDelete) return null;

        return (
          <button
            onClick={() => {
              if (confirm(`Hapus catatan pelanggaran untuk ${v.studentName}?`)) {
                deleteViolation(v.id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
            title="Hapus pelanggaran"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Buku Catatan Kedisiplinan & Poin Pelanggaran Siswa
            </h2>
            {isKepsek && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Mode Pengawasan Pimpinan (&gt;30 Poin)
              </span>
            )}
            {isWaliKelas && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                Wali Kelas {currentUser?.classId}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isKepsek
              ? 'Pengawasan Kasus Parah: Kepala Sekolah memantau siswa dengan akumulasi poin di atas 30 dan laporan penyelesaian konseling.'
              : isWaliKelas
              ? `Menampilkan catatan poin disiplin peserta didik khusus Kelas ${currentUser?.classId || ''} yang berhak dibimbing oleh Wali Kelas.`
              : 'Terkoneksi langsung dengan Master Kategori Pelanggaran (Ringan, Sedang, Berat) serta Guru Mapel dan Wali Kelas.'}
          </p>
        </div>

        {/* Can Add: Guru Mapel, Walas, BK, Admin (Kepsek is monitoring only) */}
        {!isKepsek && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Pelanggaran Siswa</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {!isWaliKelas && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Filter Rombel</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-semibold text-slate-800"
              >
                <option value="ALL">Semua Kelas</option>
                {classes.map((c) => (
                  <option key={c.classId} value={c.classId}>
                    Kelas {c.classId}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Kategori Pelanggaran</label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-semibold text-slate-800"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="Ringan">Ringan (5–10 Poin)</option>
              <option value="Sedang">Sedang (15–20 Poin)</option>
              <option value="Berat">Berat (25–50 Poin)</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          <strong className="text-slate-900">{filteredViolations.length}</strong> Pelanggaran Terdaftar
        </span>
      </div>

      {/* Table */}
      <DataTable
        data={filteredViolations}
        columns={columns}
        searchPlaceholder="Cari siswa, kelas, jenis pelanggaran, atau guru pelapor..."
        searchKeys={['studentName', 'classId', 'violationType', 'reporterName', 'category']}
        exportFilename={`Data_Pelanggaran_${Date.now()}`}
        sheetName="Catatan Pelanggaran"
      />

      {/* Add Violation Modal Connected to Master Rules */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pencatatan Poin Pelanggaran Siswa
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tersinkron dengan Master Aturan Disiplin (Ringan, Sedang, Berat)
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Peserta Didik</label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium"
                  >
                    <option value="">Pilih Siswa...</option>
                    {(isWaliKelas
                      ? students.filter((s) => s.classId === currentUser?.classId)
                      : students
                    ).map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.nis} - Kelas {st.classId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Kejadian</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Master Rule Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih dari Master Aturan Pelanggaran ({violationRules.length} Aturan Tersedia)
                </label>
                <select
                  value={selectedRuleCode}
                  onChange={(e) => handleRuleChange(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold"
                >
                  {violationRules.map((rule) => (
                    <option key={rule.id} value={rule.code}>
                      [{rule.code}] {rule.name} · ({rule.category} - +{rule.points} Poin)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Pelanggaran</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold text-slate-900"
                  >
                    <option value="Ringan">Ringan (5–10 Poin)</option>
                    <option value="Sedang">Sedang (15–20 Poin)</option>
                    <option value="Berat">Berat (25–50 Poin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bobot Poin Sanksi</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-rose-700 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan / Kronologi Kejadian</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan secara ringkas situasi pelanggaran..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Alur Bimbingan Bertahap Otomatis:</div>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li><strong>15 Poin:</strong> Bimbingan tahap awal oleh Wali Kelas.</li>
                  <li><strong>25 Poin:</strong> Sistem otomatis mengirim notifikasi ke Guru BK.</li>
                  <li><strong>&gt; 30 Poin:</strong> Notifikasi pelanggaran parah langsung ke Kepala Sekolah.</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors shadow-2xs cursor-pointer"
                >
                  Simpan Catatan Pelanggaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
