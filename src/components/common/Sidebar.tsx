import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  DoorClosed,
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  UserCog,
  Settings,
  History,
  Activity,
  BarChart3,
  CheckSquare,
  AlertTriangle,
  HeartHandshake,
  FileText,
  Clock,
  Award,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  X,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';

interface SidebarProps {
  currentMenu: string;
  onSelectMenu: (menuId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: number | string;
  badgeColor?: string;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMenu,
  onSelectMenu,
  isOpen,
  onClose,
}) => {
  const { currentUser, activeRole, switchRole } = useAuth();
  const { priorityBkStudents, unreadNotificationCount, students, teachers, classes, subjects } = useSchool();

  const getMenuSections = (): MenuSection[] => {
    switch (activeRole) {
      case 'admin_operator':
        return [
          {
            items: [
              { id: 'admin_dash', label: 'Dashboard Admin', icon: LayoutDashboard },
            ],
          },
          {
            title: 'Data Master',
            items: [
              { id: 'students', label: `Data Siswa (${students.length})`, icon: GraduationCap },
              { id: 'teachers', label: `Data Guru (${teachers.length})`, icon: Users },
              { id: 'classes', label: `Data Kelas (${classes.length} Rombel)`, icon: DoorClosed },
              { id: 'subjects', label: `Mata Pelajaran (${subjects.length})`, icon: BookOpen },
            ],
          },
          {
            title: 'Pengelolaan',
            items: [
              { id: 'import_excel', label: 'Import Excel Massal', icon: FileSpreadsheet },
              { id: 'schedule', label: 'Jadwal Pembelajaran', icon: CalendarDays },
              { id: 'users', label: 'Manajemen Pengguna', icon: UserCog },
            ],
          },
          {
            title: 'Sistem & Konfigurasi',
            items: [
              { id: 'settings', label: 'Identitas Sekolah', icon: Settings },
              { id: 'activity', label: 'Riwayat Aktivitas', icon: History },
            ],
          },
        ];

      case 'kepala_sekolah':
        return [
          {
            items: [
              { id: 'kepsek_dash', label: 'Dashboard Eksekutif', icon: LayoutDashboard },
            ],
          },
          {
            title: 'Monitoring Eksekutif',
            items: [
              { id: 'monitoring', label: 'Monitoring Kelas Hari Ini', icon: Activity },
              { id: 'attendance_recap', label: 'Analisis Kehadiran Siswa', icon: CheckSquare },
              { id: 'academic_analytics', label: 'Analisis Hasil Belajar', icon: BarChart3 },
              { id: 'violations_monitor', label: 'Monitoring Pelanggaran', icon: AlertTriangle },
              {
                id: 'counseling_monitor',
                label: 'Monitoring Pembinaan BK',
                icon: HeartHandshake,
                badge: priorityBkStudents.length,
                badgeColor: 'bg-rose-100 text-rose-800',
              },
            ],
          },
          {
            title: 'Laporan & Audit',
            items: [
              { id: 'leger', label: 'Leger Nilai Sekolah', icon: FileSpreadsheet },
              { id: 'reports', label: 'Pusat Laporan & Cetak', icon: FileText },
              { id: 'activity', label: 'Riwayat Aktivitas Guru', icon: History },
            ],
          },
        ];

      case 'guru_mapel':
        return [
          {
            items: [
              { id: 'guru_dash', label: 'Dashboard Guru', icon: LayoutDashboard },
              { id: 'guru_schedule', label: 'Jadwal Mengajar Saya', icon: CalendarDays },
            ],
          },
          {
            title: 'Administrasi Pembelajaran',
            items: [
              { id: 'attendance', label: 'Absensi Siswa (Presensi)', icon: CheckSquare },
              { id: 'grading', label: 'Input Penilaian Siswa', icon: Award },
              { id: 'grades_recap', label: 'Rekap Nilai Mapel', icon: BarChart3 },
              { id: 'attitude', label: 'Penilaian Sikap', icon: Sparkles },
            ],
          },
          {
            title: 'Ketertiban & Bimbingan',
            items: [
              { id: 'violations', label: 'Poin Pelanggaran Siswa', icon: AlertTriangle },
              { id: 'journal', label: 'Riwayat Pembelajaran', icon: Clock },
            ],
          },
        ];

      case 'wali_kelas':
        return [
          {
            items: [
              { id: 'wali_dash', label: 'Dashboard Wali Kelas', icon: LayoutDashboard },
              { id: 'wali_students', label: `Data Siswa Kelas ${currentUser?.classId || ''}`, icon: GraduationCap },
            ],
          },
          {
            title: 'Evaluasi & Nilai',
            items: [
              { id: 'leger', label: 'Leger Nilai Terpadu', icon: FileSpreadsheet },
              { id: 'attendance_recap', label: 'Rekap Kehadiran Kelas', icon: CheckSquare },
              { id: 'attitude', label: 'Perkembangan Sikap', icon: Sparkles },
            ],
          },
          {
            title: 'Kedisiplinan & Binaan',
            items: [
              {
                id: 'violations',
                label: 'Rekap Pelanggaran Kelas',
                icon: AlertTriangle,
                badge: priorityBkStudents.filter((p) => p.student.classId === currentUser?.classId).length || undefined,
                badgeColor: 'bg-rose-100 text-rose-800',
              },
              { id: 'wali_notes', label: 'Catatan Siswa & Tindak Lanjut', icon: FileText },
              { id: 'reports', label: 'Cetak Rapor & Laporan Kelas', icon: FileText },
            ],
          },
        ];

      case 'guru_bk':
        return [
          {
            items: [
              { id: 'bk_dash', label: 'Dashboard BK', icon: LayoutDashboard },
              {
                id: 'bk_priority',
                label: 'Siswa Prioritas (>30 Poin)',
                icon: ShieldAlert,
                badge: priorityBkStudents.length,
                badgeColor: 'bg-rose-600 text-white font-bold',
              },
            ],
          },
          {
            title: 'Layanan Bimbingan Konseling',
            items: [
              { id: 'violations', label: 'Riwayat Pelanggaran Siswa', icon: AlertTriangle },
              { id: 'counseling', label: 'Penanganan Kasus & Konseling', icon: HeartHandshake },
              { id: 'bk_sessions', label: 'Catatan Konseling Rahasia', icon: FileText },
              { id: 'bk_monitoring', label: 'Monitoring Perkembangan', icon: Clock },
            ],
          },
          {
            title: 'Laporan Bimbingan',
            items: [
              { id: 'reports', label: 'Laporan Konseling BK', icon: FileSpreadsheet },
            ],
          },
        ];

      default:
        return [];
    }
  };

  const sections = getMenuSections();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out border-r border-slate-800 no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: School Badge & Close Button on Mobile */}
        <div>
          <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs tracking-wider shadow-sm">
                SMP
              </div>
              <div>
                <h1 className="text-xs font-bold text-white tracking-wide uppercase leading-tight">
                  SI MANTAP LMS
                </h1>
                <p className="text-[10px] text-slate-400 font-mono leading-tight">
                  SMPN 1 Mantap Unggulan
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Indicator Banner */}
          <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-800 text-[11px] flex items-center justify-between">
            <div>
              <span className="text-slate-400">Akses: </span>
              <span className="font-bold text-blue-400 uppercase tracking-wider">
                {activeRole.replace('_', ' ')}
              </span>
              {currentUser?.classId && activeRole === 'wali_kelas' && (
                <span className="text-slate-300 ml-1 font-mono">({currentUser.classId})</span>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-3 overflow-y-auto max-h-[calc(100vh-160px)] space-y-4">
            {sections.map((sec, secIdx) => (
              <div key={secIdx}>
                {sec.title && (
                  <div className="px-3 pb-1.5 pt-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {sec.title}
                  </div>
                )}
                <div className="space-y-0.5">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentMenu === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectMenu(item.id);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge !== undefined && Number(item.badge) > 0 && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums shrink-0 ${
                              item.badgeColor || 'bg-blue-500 text-white'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer: User Quick Status */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="font-semibold text-white truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser?.username}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
