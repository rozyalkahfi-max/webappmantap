import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  GraduationCap,
  X,
  Check,
  CheckSquare,
  Square,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { DataTable, ColumnDef } from '../common/DataTable';
import { Student } from '../../types';

export const StudentMasterView: React.FC = () => {
  const {
    students,
    classes,
    addStudent,
    updateStudent,
    deleteStudent,
    deleteStudentsBatch,
    deleteStudentsByGrade,
    deleteAllStudents,
    resetDefaultStudents,
  } = useSchool();

  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Selected students for batch operations
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Confirm delete dialog modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    count: number;
    action: () => void;
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    name: '',
    classId: '7A',
    gender: 'L' as 'L' | 'P',
    status: 'Aktif' as 'Aktif' | 'Mutasi' | 'Lulus' | 'Nonaktif',
  });

  // Filter students by selected Class & Grade
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass !== 'ALL' && s.classId !== selectedClass) return false;
      if (selectedGrade !== 'ALL' && !s.classId.startsWith(selectedGrade)) return false;
      return true;
    });
  }, [students, selectedClass, selectedGrade]);

  // Statistics per grade
  const grade7Count = useMemo(() => students.filter((s) => s.classId.startsWith('7')).length, [students]);
  const grade8Count = useMemo(() => students.filter((s) => s.classId.startsWith('8')).length, [students]);
  const grade9Count = useMemo(() => students.filter((s) => s.classId.startsWith('9')).length, [students]);

  // Toggle selection for one student
  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Mark all students in a grade
  const handleSelectGrade = (grade: '7' | '8' | '9') => {
    const gradeIds = students.filter((s) => s.classId.startsWith(grade)).map((s) => s.id);
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      const allSelected = gradeIds.every((id) => next.has(id));
      if (allSelected) {
        // Deselect this grade
        gradeIds.forEach((id) => next.delete(id));
      } else {
        // Select all in this grade
        gradeIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // Mark all currently filtered students
  const handleSelectAllFiltered = () => {
    const filteredIds = filteredStudents.map((s) => s.id);
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      const allSelected = filteredIds.every((id) => next.has(id));
      if (allSelected) {
        filteredIds.forEach((id) => next.delete(id));
      } else {
        filteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedStudentIds(new Set());
  };

  // Delete single student
  const handleDeleteSingle = (student: Student) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Data Siswa',
      description: `Apakah Anda yakin ingin menghapus data siswa ${student.name} (NIS: ${student.nis}, Kelas: ${student.classId})?`,
      count: 1,
      action: () => {
        deleteStudent(student.id);
        setSelectedStudentIds((prev) => {
          const next = new Set(prev);
          next.delete(student.id);
          return next;
        });
        showNotify(`Siswa ${student.name} berhasil dihapus.`);
      },
    });
  };

  // Delete selected batch
  const handleDeleteSelected = () => {
    const count = selectedStudentIds.size;
    if (count === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Siswa Terpilih',
      description: `Apakah Anda yakin ingin menghapus ${count} data siswa yang telah ditandai? Tindakan ini tidak dapat dibatalkan.`,
      count,
      action: () => {
        deleteStudentsBatch(Array.from(selectedStudentIds));
        setSelectedStudentIds(new Set());
        showNotify(`Berhasil menghapus massal ${count} data siswa.`);
      },
    });
  };

  // Quick delete entire grade
  const handleDeleteByGradeDirect = (grade: '7' | '8' | '9') => {
    const count = students.filter((s) => s.classId.startsWith(grade)).length;
    if (count === 0) {
      alert(`Tidak ada siswa di kelas ${grade}.`);
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: `Hapus Semua Siswa Kelas ${grade}`,
      description: `Peringatan: Seluruh ${count} siswa pada semua rombel tingkat ${grade} (${grade}A s/d ${grade}H) akan dihapus secara permanen.`,
      count,
      action: () => {
        const deletedCount = deleteStudentsByGrade(grade);
        // Clean selection of deleted ids
        setSelectedStudentIds((prev) => {
          const next = new Set(prev);
          students.forEach((s) => {
            if (s.classId.startsWith(grade)) next.delete(s.id);
          });
          return next;
        });
        showNotify(`Berhasil menghapus seluruh ${deletedCount} siswa kelas ${grade}.`);
      },
    });
  };

  // Delete all students
  const handleDeleteAll = () => {
    const count = students.length;
    if (count === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Seluruh Data Siswa',
      description: `PERINGATAN: Semua ${count} siswa di seluruh rombel sekolah akan dihapus. Anda dapat menggunakan tombol "Pulihkan Data Awal" sewaktu-waktu untuk mengembalikan data awal.`,
      count,
      action: () => {
        deleteAllStudents();
        setSelectedStudentIds(new Set());
        showNotify(`Seluruh basis data siswa (${count} siswa) telah dikosongkan.`);
      },
    });
  };

  // Reset default students
  const handleResetDefault = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Pulihkan Data Siswa Awal',
      description: 'Sistem akan memulihkan data lengkap 708 siswa standar SMPN 1 Mantap (24 Rombel 7A-9H). Data siswa saat ini akan digantikan.',
      count: 708,
      action: () => {
        resetDefaultStudents();
        setSelectedStudentIds(new Set());
        showNotify('Berhasil memulihkan 708 data siswa standar.');
      },
    });
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      nis: String(24000 + students.length + 1),
      nisn: `008${String(1000000 + students.length + 1).slice(1)}`,
      name: '',
      classId: classes[0]?.classId || '7A',
      gender: 'L',
      status: 'Aktif',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nis: student.nis,
      nisn: student.nisn,
      name: student.name,
      classId: student.classId,
      gender: student.gender,
      status: student.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nis.trim()) {
      alert('Nama dan NIS wajib diisi.');
      return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
      showNotify(`Data siswa ${formData.name} berhasil diperbarui.`);
    } else {
      addStudent(formData);
      showNotify(`Siswa baru ${formData.name} berhasil ditambahkan.`);
    }
    setIsModalOpen(false);
  };

  // Columns definition with row checkbox
  const columns: ColumnDef<Student>[] = [
    {
      key: 'select',
      header: '',
      sortable: false,
      align: 'center',
      width: '44px',
      render: (s) => (
        <input
          type="checkbox"
          checked={selectedStudentIds.has(s.id)}
          onChange={() => toggleSelectStudent(s.id)}
          aria-label={`Pilih ${s.name}`}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      ),
    },
    { key: 'id', header: 'ID Siswa', sortable: true, width: '90px' },
    { key: 'nis', header: 'NIS', sortable: true, width: '80px' },
    { key: 'nisn', header: 'NISN', sortable: true, width: '110px' },
    {
      key: 'name',
      header: 'Nama Lengkap Siswa',
      sortable: true,
      render: (s) => (
        <div>
          <span className="font-semibold text-slate-900 block">{s.name}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {s.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
          </span>
        </div>
      ),
    },
    {
      key: 'classId',
      header: 'Kelas',
      sortable: true,
      align: 'center',
      width: '80px',
      render: (s) => (
        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {s.classId}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
      width: '90px',
      render: (s) => (
        <span
          className={`text-[11px] font-semibold ${
            s.status === 'Aktif' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          {s.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      sortable: false,
      align: 'right',
      width: '90px',
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenEdit(s)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
            title="Edit Siswa"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteSingle(s)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
            title="Hapus Satu Siswa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const allFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedStudentIds.has(s.id));

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Data Master Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total <strong className="text-slate-800 font-mono">{students.length}</strong> siswa terdaftar di {classes.length} rombel
            (Kelas 7: {grade7Count} siswa · Kelas 8: {grade8Count} siswa · Kelas 9: {grade9Count} siswa)
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Pulihkan data siswa bawaan (708 siswa)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Pulihkan 708 Siswa</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Quick Mark & Auto Delete Toolbar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Quick Mark Buttons for Grade 7, 8, 9 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              Tandai Cepat:
            </span>

            <button
              onClick={() => handleSelectGrade('7')}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-800 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            >
              Semua Kelas 7 ({grade7Count})
            </button>

            <button
              onClick={() => handleSelectGrade('8')}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-800 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            >
              Semua Kelas 8 ({grade8Count})
            </button>

            <button
              onClick={() => handleSelectGrade('9')}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-800 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            >
              Semua Kelas 9 ({grade9Count})
            </button>

            <button
              onClick={handleSelectAllFiltered}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            >
              {allFilteredSelected ? 'Batalkan Filter Ini' : `Tandai Tampilan (${filteredStudents.length})`}
            </button>

            {selectedStudentIds.size > 0 && (
              <button
                onClick={handleClearSelection}
                className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer"
              >
                Kosongkan Pilihan
              </button>
            )}
          </div>

          {/* Direct Grade Deletion Buttons */}
          <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-2 lg:pt-0">
            <span className="text-xs font-bold text-rose-700 mr-1 flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              Hapus Massal Langsung:
            </span>

            <button
              onClick={() => handleDeleteByGradeDirect('7')}
              disabled={grade7Count === 0}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Hapus Kelas 7
            </button>

            <button
              onClick={() => handleDeleteByGradeDirect('8')}
              disabled={grade8Count === 0}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Hapus Kelas 8
            </button>

            <button
              onClick={() => handleDeleteByGradeDirect('9')}
              disabled={grade9Count === 0}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Hapus Kelas 9
            </button>

            <button
              onClick={handleDeleteAll}
              disabled={students.length === 0}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-black text-rose-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Hapus Semua Siswa
            </button>
          </div>
        </div>

        {/* Floating/Banner Action when items are selected */}
        {selectedStudentIds.size > 0 && (
          <div className="p-3 bg-blue-900 text-white rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                <strong className="font-bold text-white font-mono text-sm">{selectedStudentIds.size}</strong> siswa sedang ditandai.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearSelection}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Batalkan
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus {selectedStudentIds.size} Siswa Terpilih</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs">
        <span className="font-semibold text-slate-600 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          Filter Rombel:
        </span>
        <select
          value={selectedGrade}
          onChange={(e) => {
            setSelectedGrade(e.target.value);
            setSelectedClass('ALL');
          }}
          className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
        >
          <option value="ALL">Semua Tingkat (7, 8, 9)</option>
          <option value="7">Tingkat 7 ({grade7Count} Siswa)</option>
          <option value="8">Tingkat 8 ({grade8Count} Siswa)</option>
          <option value="9">Tingkat 9 ({grade9Count} Siswa)</option>
        </select>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
        >
          <option value="ALL">Semua Kelas ({classes.length} Rombel)</option>
          {classes
            .filter((c) => selectedGrade === 'ALL' || c.gradeLevel === selectedGrade)
            .map((c) => (
              <option key={c.classId} value={c.classId}>
                {c.classId} ({c.studentCount} Siswa)
              </option>
            ))}
        </select>

        <span className="text-xs text-slate-400 ml-auto font-mono tabular-nums">
          Ditemukan {filteredStudents.length} siswa
        </span>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredStudents}
        columns={columns}
        searchPlaceholder="Cari berdasarkan nama siswa, NIS, atau NISN..."
        searchKeys={['name', 'nis', 'nisn', 'id', 'classId']}
        exportFilename={`Data_Siswa_${selectedClass}_${Date.now()}`}
        sheetName="Data Siswa"
      />

      {/* Confirmation Dialog Modal */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {confirmDialog.title}
            </h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              {confirmDialog.description}
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold transition-colors cursor-pointer"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.action();
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIS</label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN</label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas Rombel</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white font-medium text-slate-900"
                  >
                    {classes.map((c) => (
                      <option key={c.classId} value={c.classId}>
                        {c.classId}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white text-slate-900"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Keaktifan</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white text-slate-900"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Mutasi">Mutasi Keluar</option>
                  <option value="Lulus">Lulus</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
