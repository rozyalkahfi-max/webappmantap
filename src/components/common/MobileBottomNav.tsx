import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Award,
  Menu,
  GraduationCap,
  FileSpreadsheet,
  Activity,
  FileText,
  Users,
  ShieldAlert,
  HeartHandshake,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface MobileBottomNavProps {
  currentMenu: string;
  onSelectMenu: (menuId: string) => void;
  onOpenSidebar: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentMenu,
  onSelectMenu,
  onOpenSidebar,
}) => {
  const { activeRole, currentUser, setShowPortalSelector } = useAuth();

  const isDualTeacher =
    currentUser?.availableRoles?.includes('guru_mapel') &&
    currentUser?.availableRoles?.includes('wali_kelas');

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    isAction?: boolean;
    action?: () => void;
  }

  const getNavItems = (): NavItem[] => {
    switch (activeRole) {
      case 'guru_mapel':
        return [
          { id: 'guru_dash', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'guru_schedule', label: 'Jadwal', icon: CalendarDays },
          { id: 'attendance', label: 'Presensi', icon: CheckSquare },
          { id: 'grading', label: 'Nilai', icon: Award },
          { id: 'sidebar', label: 'Menu', icon: Menu, isAction: true, action: onOpenSidebar },
        ];

      case 'wali_kelas':
        return [
          { id: 'wali_dash', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'wali_students', label: 'Siswa', icon: GraduationCap },
          { id: 'wali_attendance', label: 'Presensi', icon: CheckSquare },
          { id: 'leger', label: 'Leger', icon: FileSpreadsheet },
          { id: 'sidebar', label: 'Menu', icon: Menu, isAction: true, action: onOpenSidebar },
        ];

      case 'kepala_sekolah':
        return [
          { id: 'kepsek_dash', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'monitoring', label: 'Monitoring', icon: Activity },
          { id: 'attendance_recap', label: 'Kehadiran', icon: CheckSquare },
          { id: 'reports', label: 'Laporan', icon: FileText },
          { id: 'sidebar', label: 'Menu', icon: Menu, isAction: true, action: onOpenSidebar },
        ];

      case 'admin_operator':
        return [
          { id: 'admin_dash', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'students', label: 'Siswa', icon: GraduationCap },
          { id: 'teachers', label: 'Guru', icon: Users },
          { id: 'import_excel', label: 'Import', icon: FileSpreadsheet },
          { id: 'sidebar', label: 'Menu', icon: Menu, isAction: true, action: onOpenSidebar },
        ];

      case 'guru_bk':
        return [
          { id: 'bk_dash', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'bk_priority', label: '>30 Poin', icon: ShieldAlert },
          { id: 'violations', label: 'Pelanggaran', icon: ShieldAlert },
          { id: 'counseling', label: 'Konseling', icon: HeartHandshake },
          { id: 'sidebar', label: 'Menu', icon: Menu, isAction: true, action: onOpenSidebar },
        ];

      default:
        return [
          { id: 'admin_dash', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'sidebar', label: 'Menu', icon: Menu, isAction: true, action: onOpenSidebar },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg lg:hidden px-2 py-1">
      {/* If dual teacher, quick switch pill */}
      {isDualTeacher && (
        <div className="flex justify-center -mt-4 mb-1">
          <button
            onClick={() => setShowPortalSelector(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[10px] font-bold shadow-md cursor-pointer tracking-wide"
          >
            <Layers className="w-3 h-3 text-indigo-200" />
            <span>Ganti Portal: {activeRole === 'guru_mapel' ? 'Ke Wali Kelas' : 'Ke Guru Mapel'}</span>
          </button>
        </div>
      )}

      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = !item.isAction && currentMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isAction && item.action) {
                  item.action();
                } else {
                  onSelectMenu(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] rounded-lg transition-colors cursor-pointer ${
                isActive ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-md ${isActive ? 'bg-blue-50 text-blue-700' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] leading-tight mt-0.5 truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
