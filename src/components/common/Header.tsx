import React, { useState } from 'react';
import {
  Bell,
  User,
  LogOut,
  ChevronDown,
  Layers,
  Sparkles,
  School,
  Menu,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';

interface HeaderProps {
  currentMenuTitle: string;
  onToggleSidebar: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToMenu: (menuId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMenuTitle,
  onToggleSidebar,
  onNavigateToMenu,
}) => {
  const { currentUser, activeRole, switchRole, logout, allUsers, login } = useAuth();
  const { settings, notifications, unreadNotificationCount, markNotificationRead } = useSchool();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showDemoSwitcher, setShowDemoSwitcher] = useState(false);

  const roleLabels: Record<UserRole, string> = {
    admin_operator: 'Admin Operator',
    kepala_sekolah: 'Kepala Sekolah',
    guru_mapel: 'Guru Mata Pelajaran',
    wali_kelas: 'Wali Kelas',
    guru_bk: 'Guru BK (Konselor)',
  };

  const roleColors: Record<UserRole, string> = {
    admin_operator: 'bg-purple-100 text-purple-800 border-purple-200',
    kepala_sekolah: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    guru_mapel: 'bg-blue-100 text-blue-800 border-blue-200',
    wali_kelas: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    guru_bk: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  const handleSwitchDemoAccount = (username: string) => {
    login(username);
    setShowDemoSwitcher(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shadow-2xs no-print">
      {/* Zone 1: Brand & Sidebar Toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center text-white font-bold text-sm tracking-wider">
            SMP
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-slate-900 text-sm tracking-tight whitespace-nowrap block">
              {settings.appName}
            </span>
            <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap block -mt-0.5">
              {settings.schoolName}
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center text-xs text-slate-400 pl-4 border-l border-slate-200">
          <span className="font-semibold text-slate-700">{currentMenuTitle}</span>
        </div>
      </div>

      {/* Zone 2: Academic Period Indicator */}
      <div className="hidden xl:flex items-center gap-2 text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200 px-3 py-1 rounded-md">
        <span className="text-slate-400">Tahun:</span>
        <span className="font-mono font-semibold text-slate-900">{settings.activeAcademicYear}</span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-400">Semester:</span>
        <span className="font-semibold text-blue-700">{settings.activeSemester}</span>
      </div>

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Quick Demo Switcher Button for Instant Verification */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDemoSwitcher(!showDemoSwitcher);
              setShowRoleMenu(false);
              setShowNotifMenu(false);
              setShowUserMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="Ganti Akun Peran Demo"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Uji Peran Akun</span>
            <ChevronDown className="w-3 h-3 text-blue-600" />
          </button>

          {showDemoSwitcher && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
              <div className="px-2 py-1.5 border-b border-slate-100 font-bold text-slate-700">
                Pilih Akun Role Demo:
              </div>
              <div className="space-y-1 mt-1">
                {[
                  { user: 'admin', label: 'Admin Operator', sub: 'Kelola master, import & konfigurasi' },
                  { user: 'kepsek', label: 'Dr. H. Mulyono (Kepsek)', sub: 'Dashboard eksekutif & monitoring' },
                  { user: 'guru.sitirahmawati', label: 'Dra. Hj. Siti Rahmawati', sub: 'Multi-Role: Guru BIN & Wali Kelas 7A' },
                  { user: 'guru.budihermawan', label: 'Budi Hermawan (Wali 7B)', sub: 'Multi-Role: Guru MAT & Wali 7B' },
                  { user: 'guru.nurulfaizah', label: 'Nurul Faizah (Guru IPA)', sub: 'Guru Mata Pelajaran Murni' },
                  { user: 'guru.bambangbk', label: 'Drs. Bambang Irawan (BK)', sub: 'Konselor BK - Penanganan Kasus' },
                ].map((item) => (
                  <button
                    key={item.user}
                    onClick={() => handleSwitchDemoAccount(item.user)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-start gap-2 ${
                      currentUser?.username === item.user
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        currentUser?.username === item.user ? 'text-blue-600' : 'text-slate-300'
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-slate-900">{item.label}</div>
                      <div className="text-[10px] text-slate-500">{item.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Multi-Role Switcher (if current user has >= 2 available roles) */}
        {currentUser && currentUser.availableRoles.length > 1 && (
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowDemoSwitcher(false);
                setShowNotifMenu(false);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
              title="Beralih peran tugas (Multi-Role)"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-700" />
              <span>{roleLabels[activeRole]}</span>
              <ChevronDown className="w-3 h-3 text-indigo-600" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Beralih Hak Akses
                </div>
                {currentUser.availableRoles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                      activeRole === r
                        ? 'bg-indigo-50 text-indigo-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{roleLabels[r]}</span>
                    {activeRole === r && <CheckCircle2 className="w-4 h-4 text-indigo-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowDemoSwitcher(false);
              setShowRoleMenu(false);
              setShowUserMenu(false);
            }}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors cursor-pointer"
            title="Notifikasi Sistem"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-bold text-slate-900">Notifikasi Sistem</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {unreadNotificationCount} belum dibaca
                </span>
              </div>

              {notifications.length === 0 ? (
                <p className="text-center py-6 text-slate-400">Tidak ada notifikasi saat ini.</p>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.actionLink) {
                          onNavigateToMenu(n.actionLink);
                          setShowNotifMenu(false);
                        }
                      }}
                      className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                        !n.read
                          ? 'bg-blue-50/60 border-blue-200'
                          : 'bg-white border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowDemoSwitcher(false);
              setShowRoleMenu(false);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2 p-1 pl-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[140px]">
                {currentUser?.name || 'Pengguna'}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                {roleLabels[activeRole]}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900 truncate">{currentUser?.name}</p>
                <p className="text-slate-500 font-mono text-[11px] truncate">{currentUser?.username}</p>
                <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded border font-semibold ${roleColors[activeRole]}`}>
                  {roleLabels[activeRole]}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigateToMenu('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-slate-700 flex items-center gap-2"
                >
                  <School className="w-4 h-4 text-slate-400" />
                  <span>Identitas & Pengaturan</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateToMenu('activity');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-slate-700 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Riwayat Aktivitas</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 hover:bg-rose-50 rounded text-rose-600 font-semibold flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
