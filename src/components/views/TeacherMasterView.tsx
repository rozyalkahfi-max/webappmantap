import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  X,
  Check,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { DataTable, ColumnDef } from '../common/DataTable';
import { Teacher, UserRole } from '../../types';

export const TeacherMasterView: React.FC = () => {
  const {
    teachers,
    classes,
    subjects,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    deleteTeachersBatch,
    deleteAllTeachers,
    resetDefaultTeachers,
  } = useSchool();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Selected teachers for batch deletion
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<Set<string>>(new Set());

  // Confirm delete modal dialog
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
    username: '',
    name: '',
    nip: '',
    role: 'guru_mapel' as UserRole,
    classId: '',
    teacherCode: '',
    subject: 'Bahasa Indonesia',
    status: 'Aktif' as 'Aktif' | 'Cuti' | 'Nonaktif',
    email: '',
    phone: '',
  });

  const toggleSelectTeacher = (id: string) => {
    setSelectedTeacherIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedTeacherIds.size === teachers.length) {
      setSelectedTeacherIds(new Set());
    } else {
      setSelectedTeacherIds(new Set(teachers.map((t) => t.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedTeacherIds(new Set());
  };

  // Delete single teacher
  const handleDeleteSingle = (teacher: Teacher) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Data Guru',
      description: `Apakah Anda yakin ingin menghapus data guru ${teacher.name} (${teacher.teacherCode} - ${teacher.subject})?`,
      count: 1,
      action: () => {
        deleteTeacher(teacher.id);
        setSelectedTeacherIds((prev) => {
          const next = new Set(prev);
          next.delete(teacher.id);
          return next;
        });
        showNotify(`Guru ${teacher.name} berhasil dihapus.`);
      },
    });
  };

  // Delete selected batch
  const handleDeleteSelected = () => {
    const count = selectedTeacherIds.size;
    if (count === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Guru Terpilih',
      description: `Apakah Anda yakin ingin menghapus ${count} data guru yang ditandai? Tindakan ini akan menghapus data penugasan mereka.`,
      count,
      action: () => {
        deleteTeachersBatch(Array.from(selectedTeacherIds));
        setSelectedTeacherIds(new Set());
        showNotify(`Berhasil menghapus ${count} guru terpilih.`);
      },
    });
  };

  // Delete all teachers
  const handleDeleteAll = () => {
    const count = teachers.length;
    if (count === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Seluruh Data Guru',
      description: `PERINGATAN: Semua ${count} data guru pengajar akan dihapus secara langsung. Anda dapat menggunakan tombol "Pulihkan 50 Guru Awal" sewaktu-waktu untuk mengembalikan data awal.`,
      count,
      action: () => {
        deleteAllTeachers();
        setSelectedTeacherIds(new Set());
        showNotify(`Seluruh basis data guru (${count} guru) telah dihapus.`);
      },
    });
  };

  // Reset default teachers
  const handleResetDefault = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Pulihkan Data Guru Awal',
      description: 'Sistem akan memulihkan data lengkap 50 tenaga pendidik terintegrasi SMPN 1 Mantap Unggulan.',
      count: 50,
      action: () => {
        resetDefaultTeachers();
        setSelectedTeacherIds(new Set());
        showNotify('Berhasil memulihkan 50 data guru standar.');
      },
    });
  };

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    const nextCodeNum = teachers.length + 1;
    const code = `G${String(nextCodeNum).padStart(2, '0')}`;
    setFormData({
      username: `guru.${Math.random().toString(36).substring(2, 8)}`,
      name: '',
      nip: '',
      role: 'guru_mapel',
      classId: '',
      teacherCode: code,
      subject: subjects[0]?.name || 'Bahasa Indonesia',
      status: 'Aktif',
      email: '',
      phone: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      username: t.username,
      name: t.name,
      nip: t.nip || '',
      role: t.role,
      classId: t.classId || '',
      teacherCode: t.teacherCode,
      subject: t.subject,
      status: t.status,
      email: t.email || '',
      phone: t.phone || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.teacherCode.trim()) {
      alert('Nama guru dan Kode Guru Mapel wajib diisi.');
      return;
    }

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, formData);
      showNotify(`Data guru ${formData.name} berhasil diperbarui.`);
    } else {
      addTeacher(formData);
      showNotify(`Guru baru ${formData.name} berhasil ditambahkan.`);
    }
    setIsModalOpen(false);
  };

  const columns: ColumnDef<Teacher>[] = [
    {
      key: 'select',
      header: '',
      sortable: false,
      align: 'center',
      width: '44px',
      render: (t) => (
        <input
          type="checkbox"
          checked={selectedTeacherIds.has(t.id)}
          onChange={() => toggleSelectTeacher(t.id)}
          aria-label={`Pilih ${t.name}`}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      ),
    },
    {
      key: 'teacherCode',
      header: 'Kode',
      sortable: true,
      align: 'center',
      width: '80px',
      render: (t) => (
        <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {t.teacherCode}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Nama Lengkap & NIP',
      sortable: true,
      render: (t) => (
        <div>
          <span className="font-semibold text-slate-900 block">{t.name}</span>
          <span className="text-[11px] text-slate-500 font-mono">
            {t.nip ? `NIP. ${t.nip}` : 'NIP. -'}
          </span>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Mata Pelajaran',
      sortable: true,
      render: (t) => (
        <span className="font-medium text-slate-800">{t.subject}</span>
      ),
    },
    {
      key: 'role',
      header: 'Tanggung Jawab (Role)',
      sortable: true,
      render: (t) => {
        const isHomeroom = !!t.classId;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-800">
              {t.role.replace('_', ' ').toUpperCase()}
            </span>
            {isHomeroom && (
              <span className="text-[11px] text-indigo-700 font-medium">
                Wali Kelas: <strong className="font-bold">{t.classId}</strong>
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'username',
      header: 'Akun Login',
      sortable: true,
      render: (t) => (
        <span className="text-xs font-mono text-slate-600">{t.username}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
      width: '85px',
      render: (t) => (
        <span
          className={`text-[11px] font-semibold ${
            t.status === 'Aktif' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          {t.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      sortable: false,
      align: 'right',
      width: '90px',
      render: (t) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenEdit(t)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
            title="Edit Guru"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteSingle(t)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
            title="Hapus Satu Guru"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

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
            Data Master Guru & Penugasan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total <strong className="text-slate-800 font-mono">{teachers.length}</strong> guru terdaftar dengan kode unik guru pengampu dan penugasan kelas
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Pulihkan 50 data guru awal"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Pulihkan 50 Guru</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Guru</span>
          </button>
        </div>
      </div>

      {/* Quick Actions & Batch Deletion Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 text-slate-700 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {selectedTeacherIds.size === teachers.length && teachers.length > 0
                  ? 'Batalkan Pilihan Semua'
                  : `Tandai Semua Guru (${teachers.length})`}
              </span>
            </button>

            {selectedTeacherIds.size > 0 && (
              <button
                onClick={handleClearSelection}
                className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer"
              >
                Kosongkan Pilihan ({selectedTeacherIds.size})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteAll}
              disabled={teachers.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Langsung Semua Guru ({teachers.length})</span>
            </button>
          </div>
        </div>

        {/* Selected Banner */}
        {selectedTeacherIds.size > 0 && (
          <div className="p-3 bg-blue-900 text-white rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                <strong className="font-bold text-white font-mono text-sm">{selectedTeacherIds.size}</strong> guru sedang ditandai untuk dihapus.
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
                <span>Hapus {selectedTeacherIds.size} Guru Terpilih</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        data={teachers}
        columns={columns}
        searchPlaceholder="Cari guru berdasarkan nama, kode, mata pelajaran, atau akun..."
        searchKeys={['name', 'teacherCode', 'subject', 'username', 'role', 'classId']}
        exportFilename={`Data_Guru_SMPN1Mantap_${Date.now()}`}
        sheetName="Data Guru"
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
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h3>
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
                  <label className="block font-semibold text-slate-700 mb-1">Kode Guru Mapel</label>
                  <input
                    type="text"
                    value={formData.teacherCode}
                    onChange={(e) => setFormData({ ...formData, teacherCode: e.target.value.toUpperCase() })}
                    required
                    placeholder="Contoh: G51"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono font-bold text-slate-900 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username Akun</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Contoh: Rahmat Hidayat, S.Pd"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP (Opsional)</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="19800101 200501 1 001"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white text-slate-900"
                  >
                    {subjects.map((s) => (
                      <option key={s.code} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                    <option value="Bimbingan Konseling">Bimbingan Konseling (BK)</option>
                    <option value="Manajemen Sekolah">Manajemen Sekolah</option>
                    <option value="Operator IT">Operator IT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggung Jawab (Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white font-medium text-slate-900"
                  >
                    <option value="guru_mapel">Guru Mata Pelajaran</option>
                    <option value="wali_kelas">Wali Kelas (Merangkap Guru)</option>
                    <option value="guru_bk">Guru Bimbingan Konseling (BK)</option>
                    <option value="kepala_sekolah">Kepala Sekolah</option>
                    <option value="admin_operator">Admin Operator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kelas Binaan (Jika Wali Kelas)
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white text-slate-900"
                  >
                    <option value="">-- Bukan Wali Kelas --</option>
                    {classes.map((c) => (
                      <option key={c.classId} value={c.classId}>
                        {c.classId}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white text-slate-900"
                  >
                    <option value="Aktif">Aktif Mengajar</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08123456789"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
                  />
                </div>
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
                  {editingTeacher ? 'Simpan Perubahan' : 'Tambah Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
