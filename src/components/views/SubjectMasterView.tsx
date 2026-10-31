import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  X,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { DataTable, ColumnDef } from '../common/DataTable';
import { Subject } from '../../types';

export const SubjectMasterView: React.FC = () => {
  const {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    deleteSubjectsBatch,
    deleteAllSubjects,
    resetDefaultSubjects,
  } = useSchool();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [selectedSubjectCodes, setSelectedSubjectCodes] = useState<Set<string>>(new Set());

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
    code: '',
    name: '',
    group: 'Muatan Nasional' as 'Muatan Nasional' | 'Muatan Kewilayahan' | 'Muatan Lokal',
    hoursPerWeek: 3,
    passingGrade: 75,
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
  });

  const toggleSelectSubject = (code: string) => {
    setSelectedSubjectCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedSubjectCodes.size === subjects.length) {
      setSelectedSubjectCodes(new Set());
    } else {
      setSelectedSubjectCodes(new Set(subjects.map((s) => s.code)));
    }
  };

  const handleClearSelection = () => {
    setSelectedSubjectCodes(new Set());
  };

  // Delete single subject
  const handleDeleteSingle = (subject: Subject) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Mata Pelajaran',
      description: `Apakah Anda yakin ingin menghapus mata pelajaran ${subject.name} (${subject.code})?`,
      count: 1,
      action: () => {
        deleteSubject(subject.code);
        setSelectedSubjectCodes((prev) => {
          const next = new Set(prev);
          next.delete(subject.code);
          return next;
        });
        showNotify(`Mata pelajaran ${subject.name} berhasil dihapus.`);
      },
    });
  };

  // Delete selected batch
  const handleDeleteSelected = () => {
    const count = selectedSubjectCodes.size;
    if (count === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Mapel Terpilih',
      description: `Apakah Anda yakin ingin menghapus ${count} mata pelajaran yang ditandai?`,
      count,
      action: () => {
        deleteSubjectsBatch(Array.from(selectedSubjectCodes));
        setSelectedSubjectCodes(new Set());
        showNotify(`Berhasil menghapus ${count} mata pelajaran terpilih.`);
      },
    });
  };

  // Delete all subjects
  const handleDeleteAll = () => {
    const count = subjects.length;
    if (count === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Seluruh Mata Pelajaran',
      description: `PERINGATAN: Semua ${count} mata pelajaran akan dihapus. Anda dapat menggunakan tombol "Pulihkan 12 Mapel Standar" sewaktu-waktu untuk mengembalikan data awal.`,
      count,
      action: () => {
        deleteAllSubjects();
        setSelectedSubjectCodes(new Set());
        showNotify(`Seluruh basis data mata pelajaran (${count} mapel) telah dihapus.`);
      },
    });
  };

  // Reset default subjects
  const handleResetDefault = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Pulihkan 12 Mapel Standar',
      description: 'Sistem akan memulihkan data lengkap 12 mata pelajaran kurikulum standar SMP (PAI, PPKN, BIN, MAT, IPA, IPS, BIG, SEN, PJK, INF, PRA, BDA).',
      count: 12,
      action: () => {
        resetDefaultSubjects();
        setSelectedSubjectCodes(new Set());
        showNotify('Berhasil memulihkan 12 mata pelajaran standar.');
      },
    });
  };

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({
      code: '',
      name: '',
      group: 'Muatan Nasional',
      hoursPerWeek: 3,
      passingGrade: 75,
      status: 'Aktif',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Subject) => {
    setEditingSubject(s);
    setFormData({
      code: s.code,
      name: s.name,
      group: s.group,
      hoursPerWeek: s.hoursPerWeek,
      passingGrade: s.passingGrade,
      status: s.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('Kode Mapel dan Nama Mapel wajib diisi.');
      return;
    }

    if (editingSubject) {
      updateSubject(editingSubject.code, formData);
      showNotify(`Mata pelajaran ${formData.name} berhasil diperbarui.`);
    } else {
      addSubject(formData);
      showNotify(`Mata pelajaran ${formData.name} berhasil ditambahkan.`);
    }
    setIsModalOpen(false);
  };

  const columns: ColumnDef<Subject>[] = [
    {
      key: 'select',
      header: '',
      sortable: false,
      align: 'center',
      width: '44px',
      render: (s) => (
        <input
          type="checkbox"
          checked={selectedSubjectCodes.has(s.code)}
          onChange={() => toggleSelectSubject(s.code)}
          aria-label={`Pilih ${s.name}`}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      ),
    },
    {
      key: 'code',
      header: 'Kode',
      sortable: true,
      align: 'center',
      width: '80px',
      render: (s) => (
        <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {s.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Nama Mata Pelajaran',
      sortable: true,
      render: (s) => (
        <span className="font-semibold text-slate-900">{s.name}</span>
      ),
    },
    {
      key: 'group',
      header: 'Kelompok Kurikulum',
      sortable: true,
      render: (s) => (
        <span className="text-xs text-slate-600">{s.group}</span>
      ),
    },
    {
      key: 'hoursPerWeek',
      header: 'Alokasi Jam',
      sortable: true,
      align: 'center',
      width: '120px',
      render: (s) => (
        <span className="font-mono tabular-nums text-slate-800">{s.hoursPerWeek} JP / Minggu</span>
      ),
    },
    {
      key: 'passingGrade',
      header: 'KKM (Ketuntasan)',
      sortable: true,
      align: 'center',
      width: '130px',
      render: (s) => (
        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
          {s.passingGrade}
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
            title="Edit Mapel"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteSingle(s)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
            title="Hapus Satu Mapel"
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
            Data Master Mata Pelajaran
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total <strong className="text-slate-800 font-mono">{subjects.length}</strong> mata pelajaran kurikulum merdeka/nasional dan muatan lokal
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Pulihkan 12 mata pelajaran standar"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Pulihkan 12 Mapel</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mapel</span>
          </button>
        </div>
      </div>

      {/* Quick Action & Batch Toolbar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 text-slate-700 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {selectedSubjectCodes.size === subjects.length && subjects.length > 0
                  ? 'Batalkan Pilihan Semua'
                  : `Tandai Semua Mapel (${subjects.length})`}
              </span>
            </button>

            {selectedSubjectCodes.size > 0 && (
              <button
                onClick={handleClearSelection}
                className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer"
              >
                Kosongkan Pilihan ({selectedSubjectCodes.size})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteAll}
              disabled={subjects.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Mata Pelajaran ({subjects.length})</span>
            </button>
          </div>
        </div>

        {/* Selected Banner */}
        {selectedSubjectCodes.size > 0 && (
          <div className="p-3 bg-blue-900 text-white rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                <strong className="font-bold text-white font-mono text-sm">{selectedSubjectCodes.size}</strong> mata pelajaran ditandai untuk dihapus.
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
                <span>Hapus {selectedSubjectCodes.size} Mapel Terpilih</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        data={subjects}
        columns={columns}
        searchPlaceholder="Cari berdasarkan nama mapel atau kode..."
        searchKeys={['code', 'name', 'group']}
        exportFilename={`Data_Mapel_SMPN1Mantap_${Date.now()}`}
        sheetName="Data Mapel"
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
                Ya, Hapus Mapel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Kode Mapel</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    placeholder="BIN"
                    maxLength={6}
                    disabled={!!editingSubject}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono font-bold text-slate-900 uppercase disabled:bg-slate-100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nama Mata Pelajaran</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Contoh: Bahasa Indonesia"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kelompok Kurikulum</label>
                <select
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white text-slate-900"
                >
                  <option value="Muatan Nasional">Kelompok A (Muatan Nasional)</option>
                  <option value="Muatan Kewilayahan">Kelompok B (Muatan Kewilayahan / Seni / PJOK)</option>
                  <option value="Muatan Lokal">Kelompok C (Muatan Lokal)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alokasi Jam / Minggu</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.hoursPerWeek}
                    onChange={(e) => setFormData({ ...formData, hoursPerWeek: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">KKM Ketuntasan</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={formData.passingGrade}
                    onChange={(e) => setFormData({ ...formData, passingGrade: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Keaktifan</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white text-slate-900"
                >
                  <option value="Aktif">Aktif Diajarkan</option>
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
                  {editingSubject ? 'Simpan Perubahan' : 'Tambah Mapel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
