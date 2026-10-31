import React, { useState } from 'react';
import { AlertTriangle, Plus, Trash2, ShieldAlert, HeartHandshake, X, Filter } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { ViolationRecord } from '../../types';
import { DataTable, ColumnDef } from '../common/DataTable';

export const ViolationView: React.FC = () => {
  const { students, classes, violations, addViolation, deleteViolation, getStudentPoints, getStudentViolationCategory } = useSchool();
  const { currentUser } = useAuth();

  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    date: '2026-10-31',
    category: 'Kedisiplinan' as 'Kedisiplinan' | 'Ketertiban' | 'Kerapian' | 'Sikap & Etika' | 'Berat',
    violationType: 'Terlambat masuk sekolah > 15 menit',
    description: '',
    points: 5,
    reporterCode: currentUser?.teacherCode || 'G01',
    reporterName: currentUser?.name || 'Guru Pelapor',
    notes: '',
  });

  const violationPresets: Record<string, { points: number; desc: string }> = {
    'Terlambat masuk sekolah > 15 menit': { points: 5, desc: 'Tiba di gerbang sekolah setelah bel masuk dibunyikan.' },
    'Seragam tidak sesuai ketentuan atribut': { points: 5, desc: 'Tidak mengenakan atribut lengkap seperti dasi, sabuk, atau kaos kaki putih.' },
    'Rambut panjang / tidak rapi (siswa putra)': { points: 8, desc: 'Panjang rambut melebihi kerah kemeja seragam sekolah.' },
    'Meninggalkan kelas saat jam pelajaran (Bolos Mapel)': { points: 15, desc: 'Keluar kelas tanpa izin guru pengampu saat KBM berlangsung.' },
    'Membawa gawai tanpa izin saat ujian': { points: 15, desc: 'Menggunakan smartphone di dalam ruang asesmen.' },
    'Merusak fasilitas / sarana prasarana sekolah': { points: 20, desc: 'Melakukan vandalisme atau mencoret meja/kursi/dinding sekolah.' },
    'Terlibat perkelahian / pertengkaran fisik': { points: 25, desc: 'Terlibat kontak fisik yang mengganggu ketertiban umum sekolah.' },
    'Melakukan tindakan perundungan (Bullying)': { points: 35, desc: 'Tindakan intimidasi fisik atau psikis berulang terhadap peserta didik lain.' },
  };

  const handleOpenAdd = () => {
    const firstStudent = students[0];
    setFormData({
      studentId: firstStudent ? firstStudent.id : '',
      date: new Date().toISOString().slice(0, 10),
      category: 'Kedisiplinan',
      violationType: 'Terlambat masuk sekolah > 15 menit',
      description: violationPresets['Terlambat masuk sekolah > 15 menit'].desc,
      points: 5,
      reporterCode: currentUser?.teacherCode || 'G01',
      reporterName: currentUser?.name || 'Guru Pelapor',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handlePresetChange = (type: string) => {
    const preset = violationPresets[type];
    setFormData({
      ...formData,
      violationType: type,
      points: preset ? preset.points : formData.points,
      description: preset ? preset.desc : formData.description,
    });
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

  const filteredViolations = violations.filter((v) => {
    if (selectedClass !== 'ALL' && v.classId !== selectedClass) return false;
    return true;
  });

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
      header: 'Nama Siswa',
      sortable: true,
      render: (v) => {
        const total = getStudentPoints(v.studentId);
        const cat = getStudentViolationCategory(total);
        return (
          <div>
            <span className="font-semibold text-slate-900 block">{v.studentName}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              Total: <strong className="text-slate-800">{total} Poin</strong> ({cat.badge})
            </span>
          </div>
        );
      },
    },
    {
      key: 'classId',
      header: 'Kelas',
      sortable: true,
      align: 'center',
      width: '80px',
      render: (v) => (
        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {v.classId}
        </span>
      ),
    },
    {
      key: 'violationType',
      header: 'Jenis Pelanggaran',
      sortable: true,
      render: (v) => (
        <div>
          <span className="font-semibold text-slate-900 block">{v.violationType}</span>
          <span className="text-[11px] text-slate-500 line-clamp-1">{v.description}</span>
        </div>
      ),
    },
    {
      key: 'points',
      header: 'Poin',
      sortable: true,
      align: 'center',
      width: '80px',
      render: (v) => (
        <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 tabular-nums">
          +{v.points}
        </span>
      ),
    },
    {
      key: 'reporterName',
      header: 'Guru Pelapor',
      sortable: true,
      render: (v) => (
        <span className="text-xs text-slate-600 truncate block max-w-[140px]">{v.reporterName}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      sortable: false,
      align: 'right',
      width: '70px',
      render: (v) => (
        <button
          onClick={() => {
            if (confirm('Hapus catatan pelanggaran ini?')) deleteViolation(v.id);
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
          title="Hapus Pelanggaran"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Catatan Poin Pelanggaran Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem akumulasi poin kedisiplinan dengan deteksi otomatis rekomendasi pembinaan Bimbingan Konseling (&gt;30 Poin)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Pelanggaran</span>
        </button>
      </div>

      {/* Point Range Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl text-xs">
          <span className="font-bold text-emerald-800 block">Normal (0–10 Poin)</span>
          <span className="text-[10px] text-emerald-600">Pelanggaran ringan, teguran lisan</span>
        </div>
        <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded-xl text-xs">
          <span className="font-bold text-amber-800 block">Perhatian (11–20 Poin)</span>
          <span className="text-[10px] text-amber-600">Peringatan tertulis oleh wali kelas</span>
        </div>
        <div className="bg-orange-50/70 border border-orange-200 p-2.5 rounded-xl text-xs">
          <span className="font-bold text-orange-800 block">Peringatan (21–30 Poin)</span>
          <span className="text-[10px] text-orange-600">Pemanggilan orang tua oleh wali kelas</span>
        </div>
        <div className="bg-rose-50/80 border border-rose-300 p-2.5 rounded-xl text-xs shadow-2xs">
          <span className="font-bold text-rose-800 block">Pembinaan BK (&gt; 30 Poin)</span>
          <span className="text-[10px] text-rose-600 font-semibold">Otomatis masuk daftar prioritas BK</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200">
        <span className="text-xs font-semibold text-slate-600">Filter Kelas:</span>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-medium text-slate-800"
        >
          <option value="ALL">Semua Kelas</option>
          {classes.map((c) => (
            <option key={c.classId} value={c.classId}>
              {c.classId}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        data={filteredViolations}
        columns={columns}
        searchPlaceholder="Cari siswa, jenis pelanggaran, atau guru pelapor..."
        searchKeys={['studentName', 'violationType', 'description', 'reporterName', 'classId']}
        exportFilename={`Data_Pelanggaran_Siswa_${Date.now()}`}
        sheetName="Pelanggaran"
      />

      {/* Add Violation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Pencatatan Poin Pelanggaran Siswa</span>
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
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Peserta Didik
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600 bg-white text-slate-900"
                >
                  {students.slice(0, 150).map((st) => (
                    <option key={st.id} value={st.id}>
                      [{st.classId}] {st.name} (NIS: {st.nis}) · Total {getStudentPoints(st.id)} Poin
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Kejadian</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Pelanggaran</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                  >
                    <option value="Kedisiplinan">Kedisiplinan</option>
                    <option value="Ketertiban">Ketertiban</option>
                    <option value="Kerapian">Kerapian</option>
                    <option value="Sikap & Etika">Sikap & Etika</option>
                    <option value="Berat">Berat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Jenis Pelanggaran (Standar Tata Tertib)
                </label>
                <select
                  value={formData.violationType}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium"
                >
                  {Object.keys(violationPresets).map((type) => (
                    <option key={type} value={type}>
                      {type} (+{violationPresets[type].points} Poin)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah Poin</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    min="1"
                    max="100"
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-rose-700 text-slate-900"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nama Guru Pelapor</label>
                  <input
                    type="text"
                    value={formData.reporterName}
                    onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi & Kronologi Kejadian</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  required
                  placeholder="Jelaskan secara ringkas tempat, waktu, dan kejadian..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan / Tindak Lanjut</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Contoh: Barang bukti disita guru piket"
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
                  className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold transition-colors shadow-2xs"
                >
                  Simpan Pelanggaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
