import React, { useState } from 'react';
import {
  DoorClosed,
  Edit2,
  Users,
  Check,
  X,
  Plus,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { DataTable, ColumnDef } from '../common/DataTable';
import { ClassRoom } from '../../types';

export const ClassMasterView: React.FC<{ onNavigate?: (menuId: string) => void }> = ({ onNavigate }) => {
  const { classes, teachers, addClass, updateClass, deleteClass, resetDefaultClasses } = useSchool();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const [formData, setFormData] = useState({
    classId: '',
    gradeLevel: '7' as '7' | '8' | '9',
    homeroomTeacherCode: '',
  });

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      classId: '',
      gradeLevel: '7',
      homeroomTeacherCode: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: ClassRoom) => {
    setEditingClass(c);
    setFormData({
      classId: c.classId,
      gradeLevel: c.gradeLevel,
      homeroomTeacherCode: c.homeroomTeacherId || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (c: ClassRoom) => {
    setConfirmDialog({
      isOpen: true,
      title: `Hapus Kelas ${c.classId}`,
      description: `Apakah Anda yakin ingin menghapus kelas ${c.classId}? Data rombel ini akan dihapus dari sistem.`,
      action: () => {
        deleteClass(c.classId);
        showNotify(`Kelas ${c.classId} berhasil dihapus.`);
      },
    });
  };

  const handleResetDefault = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Pulihkan 24 Rombel Standar',
      description: 'Sistem akan memulihkan 24 kelas standar (7A-7H, 8A-8H, 9A-9H).',
      action: () => {
        resetDefaultClasses();
        showNotify('Berhasil memulihkan 24 rombel kelas standar.');
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCode = formData.classId.trim().toUpperCase();
    if (!rawCode) {
      alert('Nama/Kode kelas wajib diisi (misal: 7H).');
      return;
    }

    const teacher = teachers.find(
      (t) => t.teacherCode === formData.homeroomTeacherCode || t.username === formData.homeroomTeacherCode
    );

    if (editingClass) {
      updateClass(editingClass.classId, {
        classId: rawCode,
        name: rawCode,
        gradeLevel: formData.gradeLevel,
        homeroomTeacherId: formData.homeroomTeacherCode || undefined,
        homeroomTeacherName: teacher ? teacher.name : undefined,
      });
      showNotify(`Kelas ${rawCode} berhasil diperbarui.`);
    } else {
      const exists = classes.some((c) => c.classId.toUpperCase() === rawCode);
      if (exists) {
        alert(`Kelas ${rawCode} sudah terdaftar.`);
        return;
      }

      addClass({
        classId: rawCode,
        name: rawCode,
        gradeLevel: formData.gradeLevel,
        homeroomTeacherId: formData.homeroomTeacherCode || undefined,
        homeroomTeacherName: teacher ? teacher.name : undefined,
        studentCount: 0,
        academicYear: '2026/2027',
        status: 'Aktif',
      });
      showNotify(`Kelas ${rawCode} berhasil ditambahkan.`);
    }

    setIsModalOpen(false);
  };

  const columns: ColumnDef<ClassRoom>[] = [
    {
      key: 'classId',
      header: 'Kelas',
      sortable: true,
      align: 'center',
      width: '90px',
      render: (c) => (
        <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded border border-blue-200">
          {c.classId}
        </span>
      ),
    },
    {
      key: 'gradeLevel',
      header: 'Tingkat',
      sortable: true,
      align: 'center',
      width: '100px',
      render: (c) => (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          Tingkat {c.gradeLevel}
        </span>
      ),
    },
    {
      key: 'homeroomTeacherName',
      header: 'Wali Kelas Terdaftar',
      sortable: true,
      render: (c) => (
        <div>
          <span className="font-medium text-slate-900 block">{c.homeroomTeacherName || 'Belum Ditetapkan'}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {c.homeroomTeacherId ? `Kode: ${c.homeroomTeacherId}` : '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'studentCount',
      header: 'Jumlah Siswa Aktif',
      sortable: true,
      align: 'right',
      width: '150px',
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5 font-mono font-bold text-slate-800 tabular-nums">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>{c.studentCount} Siswa</span>
        </div>
      ),
    },
    {
      key: 'academicYear',
      header: 'Tahun Ajaran',
      sortable: true,
      align: 'center',
      width: '110px',
      render: (c) => (
        <span className="text-xs font-mono text-slate-600">{c.academicYear}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      sortable: false,
      align: 'right',
      width: '90px',
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenEdit(c)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
            title="Edit Kelas & Wali Kelas"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(c)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
            title="Hapus Kelas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);

  return (
    <div className="space-y-4">
      {/* Notification Toast */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Data Master Kelas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan {classes.length} rombongan belajar SMPN 1 Mantap Unggulan dengan total {totalStudents} siswa
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onNavigate && (
            <button
              onClick={() => onNavigate('import_excel')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Import Excel Kelas</span>
            </button>
          )}

          <button
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Pulihkan 24 rombel standar"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Pulihkan 24 Rombel</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={classes}
        columns={columns}
        searchPlaceholder="Cari kelas (misal: 7H) atau nama wali kelas..."
        searchKeys={['classId', 'name', 'homeroomTeacherName', 'gradeLevel']}
        exportFilename={`Data_Kelas_SMPN1Mantap_${Date.now()}`}
        sheetName="Data Kelas"
      />

      {/* Confirmation Dialog */}
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
                Ya, Hapus Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingClass ? `Edit Kelas ${editingClass.classId}` : 'Tambah Kelas Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama / Kode Kelas (Cukup ketik singkat, misal: 7H, 8A, 9D)
                </label>
                <input
                  type="text"
                  value={formData.classId}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setFormData({
                      ...formData,
                      classId: val,
                      gradeLevel: val.startsWith('8') ? '8' : val.startsWith('9') ? '9' : '7',
                    });
                  }}
                  required
                  placeholder="Contoh: 7H"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono font-bold text-slate-900 text-sm uppercase"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Format sederhana langsung: ketik <strong>7H</strong> (tidak perlu menulis berlebih seperti 7H(7H) atau Kelas 7H).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tingkat Kelas
                </label>
                <select
                  value={formData.gradeLevel}
                  onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white font-medium text-slate-900"
                >
                  <option value="7">Tingkat 7 (SMP Kelas 1)</option>
                  <option value="8">Tingkat 8 (SMP Kelas 2)</option>
                  <option value="9">Tingkat 9 (SMP Kelas 3)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Guru Sebagai Wali Kelas (Opsional)
                </label>
                <select
                  value={formData.homeroomTeacherCode}
                  onChange={(e) => setFormData({ ...formData, homeroomTeacherCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white text-slate-900"
                >
                  <option value="">-- Belum Ditetapkan --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.teacherCode}>
                      {t.name} ({t.teacherCode} - {t.subject})
                    </option>
                  ))}
                </select>
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
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors shadow-2xs cursor-pointer"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
