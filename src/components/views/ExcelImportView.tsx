import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileWarning,
  Users,
  GraduationCap,
  Calendar,
  DoorClosed,
  BookOpen,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import {
  generateStudentTemplate,
  generateTeacherTemplate,
  generateClassTemplate,
  generateScheduleTemplate,
  generateSubjectTemplate,
  generateViolationRuleTemplate,
  generateWaliKelasTemplate,
  parseExcelFile,
  validateStudentsImport,
  validateTeachersImport,
  validateClassesImport,
  validateScheduleImport,
  validateSubjectsImport,
  validateViolationRulesImport,
  validateWaliKelasImport,
  downloadErrorReport,
  ValidationSummary,
} from '../../utils/excel';

export const ExcelImportView: React.FC = () => {
  const {
    students,
    teachers,
    classes,
    subjects,
    schedules,
    violationRules,
    importStudentsBatch,
    importTeachersBatch,
    importClassesBatch,
    importSchedulesBatch,
    importSubjectsBatch,
    importViolationRulesBatch,
    importWaliKelasBatch,
    clearAllExceptAdmin,
  } = useSchool();

  const { activeRole } = useAuth();
  const isAdmin = activeRole === 'admin_operator';

  type ImportTab = 'siswa' | 'guru' | 'wali_kelas' | 'kelas' | 'jadwal' | 'mapel' | 'pelanggaran';
  const [activeTab, setActiveTab] = useState<ImportTab>('siswa');
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationSummary<any> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const availableClassIds = classes.map((c) => c.classId);

  const handleDownloadTemplate = () => {
    switch (activeTab) {
      case 'siswa':
        generateStudentTemplate();
        break;
      case 'guru':
        generateTeacherTemplate();
        break;
      case 'wali_kelas':
        generateWaliKelasTemplate();
        break;
      case 'kelas':
        generateClassTemplate();
        break;
      case 'jadwal':
        generateScheduleTemplate();
        break;
      case 'mapel':
        generateSubjectTemplate();
        break;
      case 'pelanggaran':
        generateViolationRuleTemplate();
        break;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);
    setIsProcessing(true);
    setImportSuccessMessage(null);

    try {
      const rawRows = await parseExcelFile(uploaded);

      if (activeTab === 'siswa') {
        const val = validateStudentsImport(rawRows, students, availableClassIds);
        setValidationResult(val);
      } else if (activeTab === 'guru') {
        const val = validateTeachersImport(rawRows, teachers, availableClassIds, subjects);
        setValidationResult(val);
      } else if (activeTab === 'wali_kelas') {
        const val = validateWaliKelasImport(rawRows, teachers, classes);
        setValidationResult(val);
      } else if (activeTab === 'kelas') {
        const val = validateClassesImport(rawRows, classes);
        setValidationResult(val);
      } else if (activeTab === 'jadwal') {
        const val = validateScheduleImport(rawRows, teachers, subjects, availableClassIds, schedules);
        setValidationResult(val);
      } else if (activeTab === 'mapel') {
        const val = validateSubjectsImport(rawRows, subjects);
        setValidationResult(val);
      } else if (activeTab === 'pelanggaran') {
        const val = validateViolationRulesImport(rawRows, violationRules);
        setValidationResult(val);
      }
    } catch (err: any) {
      alert(`Gagal membaca file Excel: ${err.message || 'Format tidak valid'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!validationResult) return;
    const validItems = validationResult.items.filter((i) => i.isValid).map((i) => i.data);

    if (validItems.length === 0) {
      alert('Tidak ada data valid yang dapat diimpor.');
      return;
    }

    if (activeTab === 'siswa') {
      const res = importStudentsBatch(validItems);
      setImportSuccessMessage(`Berhasil mengimpor ${res.added} siswa ke dalam basis data sekolah.`);
    } else if (activeTab === 'guru') {
      const res = importTeachersBatch(validItems);
      setImportSuccessMessage(
        `Berhasil mengimpor data guru: ${res.added} akun baru terdaftar, ${res.merged} penugasan digabungkan. Nama wali kelas otomatis tersinkron ke data rombel kelas!`
      );
    } else if (activeTab === 'wali_kelas') {
      const res = importWaliKelasBatch(validItems);
      setImportSuccessMessage(
        `Berhasil mengimpor data penugasan Wali Kelas: ${res.total} penugasan diproses. Akun guru otomatis berstatus Wali Kelas & sinkron ke data rombel kelas!`
      );
    } else if (activeTab === 'kelas') {
      const res = importClassesBatch(validItems);
      setImportSuccessMessage(
        `Berhasil mengimpor data kelas: ${res.added} rombel kelas baru ditambahkan, ${res.updated} rombel diperbarui.`
      );
    } else if (activeTab === 'jadwal') {
      const res = importSchedulesBatch(validItems);
      setImportSuccessMessage(`Berhasil mengimpor ${res.added} jadwal pembelajaran ke dalam sistem kalender akademik.`);
    } else if (activeTab === 'mapel') {
      const res = importSubjectsBatch(validItems);
      setImportSuccessMessage(`Berhasil mengimpor ${res.added} mata pelajaran baru ke dalam sistem kurikulum.`);
    } else if (activeTab === 'pelanggaran') {
      const res = importViolationRulesBatch(validItems);
      setImportSuccessMessage(`Berhasil mengimpor ${res.added} master aturan & kategori poin pelanggaran. Terkoneksi langsung dengan Guru Mapel dan Wali Kelas!`);
    }

    setValidationResult(null);
    setFile(null);
  };

  const handleDownloadErrors = () => {
    if (!validationResult) return;
    const invalidItems = validationResult.items.filter((i) => !i.isValid);
    const errorsList = invalidItems.map((item) => ({
      row: item.rowNumber,
      identifier: JSON.stringify(item.data),
      errors: item.errors,
    }));
    downloadErrorReport(errorsList);
  };

  const getTemplateFileName = () => {
    switch (activeTab) {
      case 'siswa':
        return 'Template_Import_Siswa.xlsx';
      case 'guru':
        return 'Template_Import_Guru.xlsx';
      case 'wali_kelas':
        return 'Template_Import_Wali_Kelas.xlsx';
      case 'kelas':
        return 'Template_Import_Kelas.xlsx';
      case 'jadwal':
        return 'Template_Import_Jadwal.xlsx';
      case 'mapel':
        return 'Template_Import_Mapel.xlsx';
      case 'pelanggaran':
        return 'Template_Import_Kategori_Pelanggaran.xlsx';
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto my-12 text-slate-800 space-y-3">
        <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <FileWarning className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-rose-900">Akses Dibatasi: Khusus Admin Operator</h3>
        <p className="text-xs text-rose-700 leading-relaxed">
          Kewenangan mengatur data aplikasi dan import data massal (Excel) hanya dapat dilakukan melalui akun Admin Operator demi menjaga integritas data sistem sekolah.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Kicker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Import Data Excel Massal Terintegrasi
            </h2>
            <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
              {students.length} Siswa • {teachers.length} Guru • {classes.length} Rombel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fitur pengisian massal untuk Siswa, Guru & Akun, Kelas, Jadwal, Mata Pelajaran, serta Master Kategori Poin Pelanggaran
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>
              Unduh Template {activeTab === 'siswa' ? 'Siswa' : activeTab === 'guru' ? 'Guru & Akun' : activeTab === 'wali_kelas' ? 'Wali Kelas' : activeTab === 'kelas' ? 'Kelas' : activeTab === 'jadwal' ? 'Jadwal' : activeTab === 'mapel' ? 'Mata Pelajaran' : 'Master Pelanggaran'} (.xlsx)
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Kosongkan semua data dan pertahankan hanya akun admin?')) {
                clearAllExceptAdmin();
                setValidationResult(null);
                setFile(null);
                setImportSuccessMessage('Data berhasil dikosongkan. Basis data kini siap untuk import data demo baru.');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Kosongkan ulang data jika ingin mengulang proses uji coba import"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => {
            setActiveTab('siswa');
            setValidationResult(null);
            setFile(null);
            setImportSuccessMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'siswa'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Import Data Siswa</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('guru');
            setValidationResult(null);
            setFile(null);
            setImportSuccessMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'guru'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Import Data Guru & Akun</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('wali_kelas');
            setValidationResult(null);
            setFile(null);
            setImportSuccessMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'wali_kelas'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          <span>Import Khusus Wali Kelas</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('kelas');
            setValidationResult(null);
            setFile(null);
            setImportSuccessMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'kelas'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <DoorClosed className="w-4 h-4" />
          <span>Import Data Kelas</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('jadwal');
            setValidationResult(null);
            setFile(null);
            setImportSuccessMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'jadwal'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Import Jadwal Pembelajaran</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('mapel');
            setValidationResult(null);
            setFile(null);
            setImportSuccessMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'mapel'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Import Data Mapel</span>
        </button>

        {/* Master Kategori Poin Pelanggaran: Admin Operator Only */}
        {isAdmin && (
          <button
            onClick={() => {
              setActiveTab('pelanggaran');
              setValidationResult(null);
              setFile(null);
              setImportSuccessMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'pelanggaran'
                ? 'border-rose-600 text-rose-600 bg-rose-50/50 rounded-t-lg'
                : 'border-transparent text-rose-700 hover:text-rose-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Master Poin Pelanggaran (Admin)</span>
          </button>
        )}
      </div>

      {/* Success Notification */}
      {importSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{importSuccessMessage}</span>
        </div>
      )}

      {/* Format Specification Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="text-xs font-bold text-slate-800 mb-1">
          {activeTab === 'siswa' && 'Format Kolom: No | ID | NIS | NISN | Nama | Kelas'}
          {activeTab === 'guru' && 'Format Kolom: Username | Password | NIP | Nama | Jabatan | Mata Pelajaran | Wali Kelas'}
          {activeTab === 'wali_kelas' && 'Format Kolom: Username | Password | Kelas ID | Tahun Ajaran'}
          {activeTab === 'kelas' && 'Format Kolom: Kelas | Tingkat | Tahun Ajaran'}
          {activeTab === 'jadwal' && 'Format Kolom: No | Nama Guru | Kode Guru | Mata Pelajaran | Kelas | Hari | Jam Ke- | Pukul'}
          {activeTab === 'mapel' && 'Format Kolom: Id Mapel | Nama Mapel | Jam Mapel Per Minggu'}
          {activeTab === 'pelanggaran' && 'Format Kolom: Kode | Kategori (Ringan / Sedang / Berat) | Nama Pelanggaran | Poin | Keterangan'}
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {activeTab === 'siswa' && 'Mendukung data siswa untuk rombel kelas 7A s/d 9H. Sistem akan memverifikasi duplikasi NIS dan kelas rombel.'}
          {activeTab === 'guru' && 'Format baru mencakup NIP dan kolom Wali Kelas. Ketika guru diimpor dan ditugaskan di kolom Wali Kelas (misal 7A), nama guru otomatis muncul sebagai Wali Kelas di menu Data Master Kelas!'}
          {activeTab === 'wali_kelas' && 'Import khusus data penugasan Wali Kelas: format baris mencakup Username, Password, Kelas ID (7A–9H), dan Tahun Ajaran. Sistem otomatis menghubungkan akun guru dengan rombel binaan, mengaktifkan hak akses Wali Kelas, dan memisahkan portal login masuk Guru Mapel vs Wali Kelas.'}
          {activeTab === 'kelas' && 'Import massal rombongan belajar dengan spesifikasi: Kelas (contoh 7A, 8B, 9C), Tingkat (7, 8, atau 9), dan Tahun Ajaran (contoh 2026/2027).'}
          {activeTab === 'jadwal' && 'Jadwal langsung terhubung ke akun guru pengajar masing-masing. Ketika guru mapel login pada hari terkait (misal Senin), jadwal dan absensi otomatis muncul di dashboard mereka. Sistem melakukan pencegahan bentrok guru dan bentrok kelas.'}
          {activeTab === 'mapel' && 'Format ringkas Kurikulum Merdeka tanpa kelompok kurikulum dan tanpa KKM. Cukup sediakan Id Mapel (misal: MAT, BIN), Nama Mapel, dan Jam Mapel Per Minggu (JP).'}
          {activeTab === 'pelanggaran' && 'Khusus Admin Utama: Import master kategori bobot poin pelanggaran (Ringan, Sedang, Berat). Aturan ini otomatis terkoneksi dan dapat dipilih langsung oleh Guru Mapel dan Wali Kelas saat mencatat kedisiplinan siswa.'}
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors">
        <div className="max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Unggah File Excel ({getTemplateFileName()})
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Format file harus berekstensi .xlsx sesuai dengan template resmi. Sistem akan memvalidasi duplikasi, kelengkapan data, dan relasi sistem secara otomatis.
          </p>

          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors">
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isProcessing ? 'Memproses Data...' : 'Pilih File Excel'}</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="hidden"
            />
          </label>

          {file && (
            <p className="mt-3 text-xs text-slate-600 font-mono">
              File terpilih: <span className="font-semibold text-slate-900">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
      </div>

      {/* Validation Result & Preview */}
      {validationResult && (
        <div className="space-y-4">
          {/* Summary Strip */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-slate-600">Total Baris: <strong className="text-slate-900">{validationResult.totalRows}</strong></span>
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Valid: <strong>{validationResult.validRows}</strong>
              </span>
              {validationResult.invalidRows > 0 && (
                <span className="text-rose-700 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Bermasalah: <strong>{validationResult.invalidRows}</strong>
                </span>
              )}
              {validationResult.duplicateRows > 0 && (
                <span className="text-amber-700 flex items-center gap-1">
                  <FileWarning className="w-4 h-4 text-amber-600" />
                  Duplikat: <strong>{validationResult.duplicateRows}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {validationResult.invalidRows > 0 && (
                <button
                  onClick={handleDownloadErrors}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Log Error</span>
                </button>
              )}
              <button
                onClick={handleConfirmImport}
                disabled={validationResult.validRows === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Konfirmasi & Simpan ke Sistem ({validationResult.validRows} Baris)
              </button>
            </div>
          </div>

          {/* Table Preview */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
              Pratinjau Data (Maksimal 10 Baris Pertama)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-2.5 px-3 w-16 text-center">Baris</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Pratinjau Data</th>
                    <th className="py-2.5 px-3">Keterangan / Diagnosa Validasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validationResult.items.slice(0, 10).map((item, idx) => (
                    <tr
                      key={idx}
                      className={item.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40 hover:bg-rose-50/70'}
                    >
                      <td className="py-2 px-3 text-center font-mono text-slate-500">
                        {item.rowNumber}
                      </td>
                      <td className="py-2 px-3">
                        {item.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Error
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-800">
                        {activeTab === 'siswa' && (
                          <span>
                            {item.data.nis} - {item.data.name} (Kelas {item.data.classId})
                          </span>
                        )}
                        {activeTab === 'guru' && (
                          <span>
                            {item.data.name} ({item.data.username}) · {item.data.role} {item.data.classId ? `[Wali ${item.data.classId}]` : ''}
                          </span>
                        )}
                        {activeTab === 'kelas' && (
                          <span>
                            {item.data.name} · Tingkat {item.data.gradeLevel} · TP {item.data.academicYear}
                          </span>
                        )}
                        {activeTab === 'jadwal' && (
                          <span>
                            {item.data.day} Jam ke-{item.data.period} ({item.data.pukulDisplay}) · Kelas {item.data.classId} · {item.data.subjectName} ({item.data.teacherName})
                          </span>
                        )}
                        {activeTab === 'mapel' && (
                          <span>
                            [{item.data.code}] {item.data.name} · {item.data.weeklyHours} JP/Minggu
                          </span>
                        )}
                        {activeTab === 'pelanggaran' && (
                          <span>
                            [{item.data.code}] {item.data.name} ({item.data.category} - {item.data.points} Poin)
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {item.isValid ? (
                          <span className="text-slate-400 italic">Siap diimpor</span>
                        ) : (
                          <span className="text-rose-600 font-medium">
                            {item.errors.join('; ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
