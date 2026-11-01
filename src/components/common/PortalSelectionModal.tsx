import React from 'react';
import {
  BookOpen,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Award,
  Users,
  FileSpreadsheet,
  AlertTriangle,
  Sparkles,
  School,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';

interface PortalSelectionModalProps {
  onClose?: () => void;
  canDismiss?: boolean;
}

export const PortalSelectionModal: React.FC<PortalSelectionModalProps> = ({
  onClose,
  canDismiss = false,
}) => {
  const { currentUser, selectPortalRole, setShowPortalSelector } = useAuth();
  const { settings } = useSchool();

  if (!currentUser) return null;

  const handleSelect = (role: 'guru_mapel' | 'wali_kelas') => {
    selectPortalRole(role);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 relative">
          {canDismiss && (
            <button
              onClick={() => {
                setShowPortalSelector(false);
                if (onClose) onClose();
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-base shadow-sm">
              SMP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  {settings.appName}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 font-medium border border-blue-400/30">
                  Akses Ganda Terdeteksi
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Selamat Datang, {currentUser.name}
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            Akun Anda memiliki <span className="font-semibold text-white">2 tugas pengabdian aktif</span> di {settings.schoolName}. Silakan tentukan menu portal kerja yang ingin Anda buka saat ini:
          </p>
        </div>

        {/* Portals Grid */}
        <div className="p-4 sm:p-6 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Guru Mata Pelajaran */}
          <div className="bg-white rounded-xl border-2 border-blue-200 hover:border-blue-600 transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                  KBM & Nilai Mapel
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Masuk Sebagai Guru Mapel
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Mata Pelajaran: <span className="font-semibold text-slate-800">{currentUser.subject || 'Pengampu'}</span>
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Isi absensi harian KBM & catatan bolos siswa</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Input nilai harian per tanggal (PH, PTS, PAS)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Jadwal mengajar harian saya (Mode Read-Only)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Catat poin pelanggaran kedisiplinan siswa</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3">
              <button
                type="button"
                onClick={() => handleSelect('guru_mapel')}
                className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Buka Portal Guru Mapel</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Wali Kelas */}
          <div className="bg-white rounded-xl border-2 border-indigo-200 hover:border-indigo-600 transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-mono">
                  Kelas {currentUser.classId || 'Binaan'}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Masuk Sebagai Wali Kelas
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Rombongan Belajar: <span className="font-semibold text-slate-800">Kelas {currentUser.classId || 'Binaan'}</span>
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Data lengkap siswa binaan Kelas {currentUser.classId || ''}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Leger nilai hasil belajar terpadu seluruh mapel</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Rekapitulasi persentase kehadiran bulanan kelas</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Bimbingan awal poin siswa (Tahap 15 Poin Walas)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3">
              <button
                type="button"
                onClick={() => handleSelect('wali_kelas')}
                className="w-full py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Buka Portal Wali Kelas {currentUser.classId || ''}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Guidance */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
          <p>
            💡 <span className="font-medium">Catatan:</span> Anda dapat beralih peran kapan saja dengan mengklik tombol <span className="font-semibold text-slate-800">"Beralih Peran"</span> di bilah atas aplikasi.
          </p>
        </div>
      </div>
    </div>
  );
};
