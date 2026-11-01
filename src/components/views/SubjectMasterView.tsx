import React, { useState, useRef } from 'react';
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
  Upload,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { DataTable, ColumnDef } from '../common/DataTable';
import { Subject } from '../../types';
import * as XLSX from 'xlsx';
import { generateSubjectTemplate, validateSubjectsImport } from '../../utils/excel';

export const SubjectMasterView: React.FC = () => {
  const {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    deleteSubjectsBatch,
    deleteAllSubjects,
    resetDefaultSubjects,
    importSubjectsBatch,
  } = useSchool();

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message: msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    hoursPerWeek: 3,
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
      hoursPerWeek: 3,
      status: 'Aktif',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Subject) => {
    setEditingSubject(s);
    setFormData({
      code: s.code,
      name: s.name,
      hoursPerWeek: s.hoursPerWeek,
      status: s.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('Id Mapel dan Nama Mapel wajib diisi.');
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

  // Excel Upload Handler (Format: Id Mapel, Nama Mapel, Jam Mapel Per Minggu)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);

        if (!rawData || rawData.length === 0) {
          showNotify('Berkas Excel kosong atau tidak terbaca.', 'error');
          return;
        }

        const summary = validateSubjectsImport(rawData, subjects);
        const validSubjects = summary.items.filter((i) => i.isValid).map((i) => i.data);

        if (validSubjects.length === 0) {
          showNotify(`Gagal import: ${summary.invalidRows} baris tidak memenuhi format (Id Mapel, Nama Mapel, Jam Mapel Per Minggu).`, 'error');
          return;
        }

        const res = importSubjectsBatch(validSubjects);
        showNotify(`Berhasil import ${res.added} mata pelajaran baru dari berkas Excel.`);
      } catch (err: any) {
        showNotify(`Gagal membaca berkas Excel: ${err?.message || 'Format tidak sesuai'}`, 'error');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  // Table Columns: Id Mapel, Nama Mapel, Jam Mapel Per Minggu, Status, Aksi (NO Kelompok Kurikulum, NO KKM)
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
      header: 'Id Mapel',
      sortable: true,
      align: 'center',
      width: '100px',
      render: (s) => (
        <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
          {s.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Nama Mapel',
      sortable: true,
      render: (s) => (
        <div>
          <span className="font-semibold text-slate-900 block">{s.name}</span>
          <span className="text-[11px] text-slate-500 font-medium">Kurikulum Merdeka</span>
        </div>
      ),
    },
    {
      key: 'hoursPerWeek',
      header: 'Jam Mapel Per Minggu',
      sortable: true,
      align: 'center',
      width: '180px',
      render: (s) => (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-slate-800 font-mono font-semibold text-xs">
          <span>{s.hoursPerWeek} JP</span>
          <span className="text-slate-400 font-normal text-[11px]">/ Minggu</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
      width: '110px',
      render: (s) => (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            s.status === 'Aktif'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
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

  const totalWeeklyHours = subjects.reduce((sum, s) => sum + (s.hoursPerWeek || 0), 0);

  return (
    <div className="space-y-4">
      {/* Hidden File Input for Direct Excel Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header and Quick Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Data Master Mata Pelajaran
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
              Kurikulum Merdeka
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total <strong className="text-slate-800 font-mono">{subjects.length}</strong> mata pelajaran · Alokasi total <strong className="text-blue-700 font-mono">{totalWeeklyHours} JP</strong> per minggu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template Excel */}
          <button
            onClick={generateSubjectTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            title="Download Template Format Excel (Id Mapel, Nama Mapel, Jam Mapel Per Minggu)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Format Excel</span>
          </button>

          {/* Upload Data Mata Pelajaran Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Upload Berkas Excel (Id Mapel, Nama Mapel, Jam Mapel Per Minggu)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Data Mapel</span>
          </button>

          <button
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Pulihkan 12 mata pelajaran standar"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Pulihkan 12 Mapel</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mapel</span>
          </button>
        </div>
      </div>

      {/* Quick Action & Batch Toolbar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
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
              <span>Hapus Semua Mapel ({subjects.length})</span>
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
        searchPlaceholder="Cari berdasarkan nama mapel atau Id Mapel..."
        searchKeys={['code', 'name']}
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
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal (Only Id Mapel, Nama Mapel, Jam Mapel Per Minggu, Status) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
                </h3>
                <p className="text-[11px] text-slate-500">Kurikulum Merdeka</p>
              </div>
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
                  <label className="block font-semibold text-slate-700 mb-1">Id Mapel</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    placeholder="Contoh: MAT"
                    maxLength={8}
                    disabled={!!editingSubject}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono font-bold text-slate-900 uppercase disabled:bg-slate-100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nama Mapel</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Contoh: Matematika"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jam Mapel Per Minggu (JP)</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={formData.hoursPerWeek}
                  onChange={(e) => setFormData({ ...formData, hoursPerWeek: Number(e.target.value) })}
                  required
                  placeholder="Contoh: 5"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono text-slate-900 font-semibold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Alokasi jam tatap muka per minggu</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white text-slate-900 font-medium"
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
