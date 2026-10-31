import React from 'react';
import { Printer, X, Download } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  signeeLeftTitle?: string;
  signeeLeftName?: string;
  signeeLeftNip?: string;
  signeeRightTitle?: string;
  signeeRightName?: string;
  signeeRightNip?: string;
  children: React.ReactNode;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  signeeLeftTitle = 'Wali Kelas / Guru Pengampu',
  signeeLeftName,
  signeeLeftNip,
  signeeRightTitle = 'Kepala Sekolah',
  signeeRightName,
  signeeRightNip,
  children,
}) => {
  const { settings } = useSchool();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const rName = signeeRightName || settings.principalName;
  const rNip = signeeRightNip || settings.principalNip;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Controls Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-700" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pratinjau Dokumen Cetak / Unduh PDF</h2>
              <p className="text-xs text-slate-500">Format resmi lengkap dengan Kop Surat Sekolah & Lembar Tanda Tangan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-slate-100 flex justify-center">
          <div id="printable-area" className="bg-white w-full max-w-[210mm] p-10 sm:p-14 shadow-lg border border-slate-300 text-slate-900 print:shadow-none print:border-none print:p-0">
            {/* Kop Surat Resmi */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-6 relative">
              <div className="w-16 h-16 shrink-0 flex items-center justify-center bg-blue-900 text-white rounded-lg font-bold text-xl tracking-wider">
                SMP
              </div>
              <div className="text-center flex-1 px-4">
                <p className="text-xs uppercase tracking-widest font-semibold text-slate-600">
                  PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA
                </p>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-600">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </p>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight uppercase mt-0.5">
                  {settings.schoolName}
                </h1>
                <p className="text-[11px] text-slate-600 mt-1">
                  {settings.address} · Telp: {settings.phone}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  NPSN: {settings.npsn} · Akreditasi: {settings.accreditation} · Email: {settings.email}
                </p>
              </div>
              <div className="w-16 h-16 shrink-0 flex items-center justify-center border border-slate-300 rounded-lg text-slate-400 text-[10px] text-center font-medium">
                Logo Sekolah
              </div>
            </div>

            {/* Garis Ganda Kop Surat */}
            <div className="border-b border-slate-900 -mt-5 mb-6" />

            {/* Judul Laporan */}
            <div className="text-center mb-6">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-900 underline decoration-slate-400 underline-offset-4">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs font-medium text-slate-600 mt-1">
                  {subtitle}
                </p>
              )}
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                Tahun Pelajaran: {settings.activeAcademicYear} · Semester: {settings.activeSemester}
              </p>
            </div>

            {/* Document Content */}
            <div className="mb-10 text-xs">
              {children}
            </div>

            {/* Lembar Tanda Tangan Resmi */}
            <div className="grid grid-cols-2 gap-8 text-xs pt-8 border-t border-slate-200 mt-12 page-break-inside-avoid">
              <div className="text-left space-y-1">
                <p className="text-slate-500">Mengetahui,</p>
                <p className="font-semibold text-slate-800">{signeeLeftTitle}</p>
                <div className="h-20" />
                <p className="font-bold text-slate-900 underline">{signeeLeftName || 'Guru Pengampu / Wali Kelas'}</p>
                <p className="text-[11px] text-slate-500 font-mono">NIP. {signeeLeftNip || '-'}</p>
              </div>

              <div className="text-right space-y-1">
                <p className="text-slate-500">Jakarta, {todayStr}</p>
                <p className="font-semibold text-slate-800">{signeeRightTitle}</p>
                <div className="h-20" />
                <p className="font-bold text-slate-900 underline">{rName}</p>
                <p className="text-[11px] text-slate-500 font-mono">NIP. {rNip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
