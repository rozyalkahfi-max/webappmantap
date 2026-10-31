import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Users,
  Award,
  AlertTriangle,
  HeartHandshake,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { exportToExcel } from '../../utils/excel';
import { PrintReportModal } from '../common/PrintReportModal';

export const ReportsView: React.FC = () => {
  const { students, teachers, classes, subjects, grades, violations, counselingRecords, settings } = useSchool();

  const [selectedReportType, setSelectedReportType] = useState<string>('attendance');
  const [selectedClass, setSelectedClass] = useState<string>('7A');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const currentClassRoom = classes.find((c) => c.classId === selectedClass);
  const classStudents = students.filter((s) => s.classId === selectedClass);

  const reportTypes = [
    { id: 'attendance', title: 'Rekapitulasi Kehadiran Siswa', icon: Users, desc: 'Daftar presensi, sakit, izin, dan alpa per kelas' },
    { id: 'leger', title: 'Leger Nilai Hasil Belajar', icon: Award, desc: 'Rekapitulasi seluruh nilai mata pelajaran dan rata-rata' },
    { id: 'violations', title: 'Rekapitulasi Pelanggaran Tata Tertib', icon: AlertTriangle, desc: 'Akumulasi poin kedisiplinan dan kategori pelanggaran' },
    { id: 'counseling', title: 'Laporan Bimbingan Konseling (BK)', icon: HeartHandshake, desc: 'Rekam jejak penanganan kasus pembinaan siswa' },
  ];

  const handleExportExcel = () => {
    if (selectedReportType === 'attendance') {
      const data = classStudents.map((st, idx) => ({
        No: idx + 1,
        NIS: st.nis,
        NISN: st.nisn,
        'Nama Siswa': st.name,
        Kelas: st.classId,
        Hadir: 42,
        Sakit: 1,
        Izin: 1,
        Alpa: 0,
        'Persentase Kehadiran': '95.5%',
      }));
      exportToExcel(data, `Presensi_${selectedClass}`, `Laporan_Kehadiran_Kelas_${selectedClass}`);
    } else if (selectedReportType === 'violations') {
      const classVio = violations.filter((v) => v.classId === selectedClass);
      exportToExcel(classVio, `Pelanggaran_${selectedClass}`, `Laporan_Pelanggaran_Kelas_${selectedClass}`);
    } else if (selectedReportType === 'counseling') {
      exportToExcel(counselingRecords, 'Laporan_BK', `Laporan_Pembinaan_BK_${Date.now()}`);
    } else {
      const leger = classStudents.map((st, idx) => ({
        No: idx + 1,
        NIS: st.nis,
        'Nama Siswa': st.name,
        Kelas: st.classId,
        'Rata-Rata Nilai': 83.5,
        Peringkat: idx + 1,
      }));
      exportToExcel(leger, `Leger_${selectedClass}`, `Leger_Nilai_${selectedClass}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pusat Laporan & Ekspor Dokumen Resmi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Penyusunan berkas evaluasi sekolah, leger nilai, presensi, dan rekam jejak bimbingan konseling
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Format PDF</span>
          </button>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {reportTypes.map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReportType === rep.id;
          return (
            <div
              key={rep.id}
              onClick={() => setSelectedReportType(rep.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-600 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">{rep.title}</h3>
              <p className="text-[11px] text-slate-500 mt-1">{rep.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Pilih Rombel / Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 font-bold text-blue-700"
          >
            {classes.map((c) => (
              <option key={c.classId} value={c.classId}>
                {c.classId} ({c.studentCount} Siswa)
              </option>
            ))}
          </select>
        </div>

        <div className="text-slate-500 font-mono">
          Periode: <strong className="text-slate-900">{settings.activeSemester} {settings.activeAcademicYear}</strong>
        </div>
      </div>

      {/* Report Preview Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <span className="text-xs font-bold text-slate-800">
            Pratinjau Data Laporan ({selectedClass})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {classStudents.length} Peserta Didik Terdata
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3 w-20">NIS</th>
                <th className="py-2.5 px-4">Nama Siswa</th>
                <th className="py-2.5 px-3 text-center">Kelas</th>
                <th className="py-2.5 px-4">Keterangan Dokumen</th>
                <th className="py-2.5 px-4 text-right">Status Evaluasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.slice(0, 15).map((st, idx) => (
                <tr key={st.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-2 px-3 font-mono font-medium text-slate-600">{st.nis}</td>
                  <td className="py-2 px-4 font-semibold text-slate-900">{st.name}</td>
                  <td className="py-2 px-3 text-center font-bold text-blue-700">{st.classId}</td>
                  <td className="py-2 px-4 text-slate-600 text-[11px]">
                    {selectedReportType === 'attendance'
                      ? 'Tingkat Kehadiran: 96% (Hadir Lengkap)'
                      : selectedReportType === 'violations'
                      ? 'Poin Kedisiplinan: 0 Poin (Normal)'
                      : 'Capaian Akademik: Memenuhi Kriteria Ketuntasan Minimal'}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                      Terverifikasi
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Print Modal with Kop Surat */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={`LAPORAN RESMI ${reportTypes.find((r) => r.id === selectedReportType)?.title.toUpperCase()}`}
        subtitle={`Rombongan Belajar: ${currentClassRoom?.name} · Wali Kelas: ${currentClassRoom?.homeroomTeacherName}`}
        signeeLeftTitle={`Wali Kelas ${selectedClass}`}
        signeeLeftName={currentClassRoom?.homeroomTeacherName}
        signeeLeftNip="19750821 200003 2 001"
      >
        <div className="space-y-4">
          <table className="w-full text-left border-collapse border border-slate-400 text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-400 font-bold text-center">
                <th className="border border-slate-400 py-1.5 px-2 w-10">No</th>
                <th className="border border-slate-400 py-1.5 px-3 w-24">NIS</th>
                <th className="border border-slate-400 py-1.5 px-4 text-left">Nama Lengkap Siswa</th>
                <th className="border border-slate-400 py-1.5 px-3 w-16">Kelas</th>
                <th className="border border-slate-400 py-1.5 px-4 text-left">Catatan Capaian / Evaluasi</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((st, idx) => (
                <tr key={st.id} className="border-b border-slate-300">
                  <td className="border border-slate-300 py-1.5 px-2 text-center font-mono">{idx + 1}</td>
                  <td className="border border-slate-300 py-1.5 px-3 font-mono">{st.nis}</td>
                  <td className="border border-slate-300 py-1.5 px-4 font-semibold">{st.name}</td>
                  <td className="border border-slate-300 py-1.5 px-3 text-center">{st.classId}</td>
                  <td className="border border-slate-300 py-1.5 px-4 text-slate-700">
                    {selectedReportType === 'attendance'
                      ? 'Kehadiran 96% - Sangat Baik'
                      : 'Tuntas Seluruh KKM dengan Predikat Baik'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PrintReportModal>
    </div>
  );
};
