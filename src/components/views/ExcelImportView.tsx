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
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import {
  generateStudentTemplate,
  generateTeacherTemplate,
  generateScheduleTemplate,
  parseExcelFile,
  validateStudentsImport,
  validateTeachersImport,
  validateScheduleImport,
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
    importStudentsBatch,
    importTeachersBatch,
    importSchedulesBatch,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'siswa' | 'guru' | 'jadwal'>('siswa');
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationSummary<any> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const availableClassIds = classes.map((c) => c.classId);

  const handleDownloadTemplate = () => {
    if (activeTab === 'siswa') generateStudentTemplate();
    else if (activeTab === 'guru') generateTeacherTemplate();
    else generateScheduleTemplate();
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
      } else {
        const val = validateScheduleImport(rawRows, teachers, subjects, availableClassIds, schedules);
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
        `Berhasil mengimpor data guru: ${res.added} akun terdaftar/diperbarui, terintegrasi langsung dengan hak akses sistem.`
      );
    } else {
      const res = importSchedulesBatch(validItems);
      setImportSuccessMessage(`Berhasil mengimpor ${res.added} jadwal pembelajaran ke dalam sistem kalender akademik.`);
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

  return (
    <div className="space-y-6">
      {/* Title & Kicker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Import Data Excel Massal Terintegrasi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Fitur pengisian massal untuk Siswa, Data Guru & Akun, serta Jadwal Pembelajaran Terpadu
          </p>
        </div>
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-300" />
          <span>
            Unduh Template {activeTab === 'siswa' ? 'Siswa' : activeTab === 'guru' ? 'Guru & Akun' : 'Jadwal Pembelajaran'} (.xlsx)
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab('siswa');
            setValidationResult(null);
            setFile(null);
            setImportSuccessMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
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
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
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
            setActiveTab('jadwal');
            setValidationResult(null);
            setFile(null);
            setImportSuccessMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'jadwal'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Import Jadwal Pembelajaran</span>
        </button>
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
          {activeTab === 'guru' && 'Format Kolom: No | Username | Password | Nama | Jabatan | Kelas | Mata Pelajaran'}
          {activeTab === 'jadwal' && 'Format Kolom: No | Nama Guru | Kode Guru | Mata Pelajaran | Kelas | Hari | Jam Ke- | Pukul'}
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {activeTab === 'siswa' && 'Mendukung data siswa untuk kelas 7A s/d 9H. Sistem akan memverifikasi duplikasi NIS dan kelas rombel.'}
          {activeTab === 'guru' && 'Akun langsung dibuat dan ditautkan ke sistem login. Jabatan diisi: "Guru Mapel", "Wali Kelas", "Kepala Sekolah", "Guru BK", atau "Admin". Jika Wali Kelas, isi kolom Kelas.'}
          {activeTab === 'jadwal' && 'Jadwal langsung terhubung ke akun guru pengajar masing-masing. Ketika guru mapel login pada hari terkait (misal Senin), jadwal dan absensi otomatis muncul di dashboard mereka. Sistem melakukan pengecekan bentrok guru dan bentrok kelas otomatis.'}
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors">
        <div className="max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Unggah File Excel ({activeTab === 'siswa' ? 'Template_Import_Siswa.xlsx' : activeTab === 'guru' ? 'Template_Import_Guru.xlsx' : 'Template_Import_Jadwal.xlsx'})
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Format file harus berekstensi .xlsx sesuai dengan template resmi. Sistem akan memvalidasi duplikasi, bentrok waktu, dan relasi data secara instan.
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-slate-500">Total Baris</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {validationResult.totalRows}
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-emerald-700">Data Valid</span>
              <p className="text-2xl font-bold font-mono text-emerald-800 mt-1 tabular-nums">
                {validationResult.validRows}
              </p>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-rose-700">Tidak Valid</span>
              <p className="text-2xl font-bold font-mono text-rose-800 mt-1 tabular-nums">
                {validationResult.invalidRows}
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-amber-700">Duplikat / Bentrok</span>
              <p className="text-2xl font-bold font-mono text-amber-800 mt-1 tabular-nums">
                {validationResult.duplicateRows}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-100 rounded-xl">
            <div className="text-xs text-slate-700">
              <span className="font-semibold">{validationResult.validRows} baris valid</span> siap dimasukkan ke dalam database.
              {validationResult.invalidRows > 0 && (
                <span className="text-rose-600 font-semibold ml-1">
                  ({validationResult.invalidRows} baris memiliki kesalahan).
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {validationResult.invalidRows > 0 && (
                <button
                  onClick={handleDownloadErrors}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-300 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <FileWarning className="w-4 h-4 text-rose-600" />
                  <span>Unduh Laporan Kesalahan (.xlsx)</span>
                </button>
              )}
              <button
                onClick={handleConfirmImport}
                disabled={validationResult.validRows === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi Simpan Import ({validationResult.validRows} Data)</span>
              </button>
            </div>
          </div>

          {/* Table Preview */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Pratinjau Hasil Validasi Data</span>
              <span className="text-slate-500 font-normal">Hanya menampilkan 50 baris pertama</span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">No.</th>
                    <th className="py-2.5 px-3">Status</th>
                    {activeTab === 'siswa' && (
                      <>
                        <th className="py-2.5 px-3">ID</th>
                        <th className="py-2.5 px-3">NIS</th>
                        <th className="py-2.5 px-3">NISN</th>
                        <th className="py-2.5 px-3">Nama Siswa</th>
                        <th className="py-2.5 px-3">Kelas</th>
                      </>
                    )}
                    {activeTab === 'guru' && (
                      <>
                        <th className="py-2.5 px-3">Username</th>
                        <th className="py-2.5 px-3">Password</th>
                        <th className="py-2.5 px-3">Nama Lengkap</th>
                        <th className="py-2.5 px-3">Jabatan (Role)</th>
                        <th className="py-2.5 px-3">Kelas</th>
                        <th className="py-2.5 px-3">Mata Pelajaran</th>
                      </>
                    )}
                    {activeTab === 'jadwal' && (
                      <>
                        <th className="py-2.5 px-3">Nama Guru</th>
                        <th className="py-2.5 px-3">Kode</th>
                        <th className="py-2.5 px-3">Mata Pelajaran</th>
                        <th className="py-2.5 px-3">Kelas</th>
                        <th className="py-2.5 px-3">Hari</th>
                        <th className="py-2.5 px-3">Jam Ke-</th>
                        <th className="py-2.5 px-3">Pukul</th>
                      </>
                    )}
                    <th className="py-2.5 px-3">Keterangan / Validasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validationResult.items.slice(0, 50).map((item) => (
                    <tr
                      key={item.rowNumber}
                      className={item.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40'}
                    >
                      <td className="py-2 px-3 font-mono text-slate-500">{item.rowNumber - 1}</td>
                      <td className="py-2 px-3">
                        {item.isValid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Valid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Invalid</span>
                          </span>
                        )}
                      </td>
                      {activeTab === 'siswa' && (
                        <>
                          <td className="py-2 px-3 font-mono text-slate-800">{item.data.id}</td>
                          <td className="py-2 px-3 font-mono text-slate-800">{item.data.nis}</td>
                          <td className="py-2 px-3 font-mono text-slate-800">{item.data.nisn}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{item.data.name}</td>
                          <td className="py-2 px-3 font-semibold text-blue-700">{item.data.classId}</td>
                        </>
                      )}
                      {activeTab === 'guru' && (
                        <>
                          <td className="py-2 px-3 font-mono font-medium text-slate-800">{item.data.username}</td>
                          <td className="py-2 px-3 font-mono text-slate-500">••••••••</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{item.data.name}</td>
                          <td className="py-2 px-3 font-semibold text-purple-700 capitalize">
                            {item.data.role?.replace('_', ' ')}
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-blue-700">
                            {item.data.classId || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-700">{item.data.subject}</td>
                        </>
                      )}
                      {activeTab === 'jadwal' && (
                        <>
                          <td className="py-2 px-3 font-medium text-slate-900">{item.data.teacherName}</td>
                          <td className="py-2 px-3 font-mono font-bold text-blue-700">{item.data.teacherCode}</td>
                          <td className="py-2 px-3 text-slate-800">{item.data.subjectName}</td>
                          <td className="py-2 px-3 font-semibold text-indigo-700 font-mono">{item.data.classId}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{item.data.day}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900 text-center">
                            Ke-{item.data.period}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600">
                            {item.data.pukulDisplay || `${item.data.startTime} - ${item.data.endTime}`}
                          </td>
                        </>
                      )}
                      <td className="py-2 px-3">
                        {item.errors.length > 0 ? (
                          <span className="text-rose-600 text-[11px] font-medium">{item.errors.join(', ')}</span>
                        ) : (
                          <span className="text-emerald-600 text-[11px] font-medium">Siap disimpan & terintegrasi</span>
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
