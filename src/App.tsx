import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LoginView } from './components/views/LoginView';
import { AdminDashboard } from './components/views/AdminDashboard';
import { KepsekDashboard } from './components/views/KepsekDashboard';
import { GuruDashboard } from './components/views/GuruDashboard';
import { WaliKelasDashboard } from './components/views/WaliKelasDashboard';
import { BKDashboard } from './components/views/BKDashboard';
import { StudentMasterView } from './components/views/StudentMasterView';
import { TeacherMasterView } from './components/views/TeacherMasterView';
import { ClassMasterView } from './components/views/ClassMasterView';
import { SubjectMasterView } from './components/views/SubjectMasterView';
import { ScheduleView } from './components/views/ScheduleView';
import { ExcelImportView } from './components/views/ExcelImportView';
import { AttendanceView } from './components/views/AttendanceView';
import { GradingView } from './components/views/GradingView';
import { LegerGradeView } from './components/views/LegerGradeView';
import { ViolationView } from './components/views/ViolationView';
import { CounselingView } from './components/views/CounselingView';
import { AttitudeView } from './components/views/AttitudeView';
import { MonitoringView } from './components/views/MonitoringView';
import { ReportsView } from './components/views/ReportsView';
import { UserManagementView } from './components/views/UserManagementView';
import { SchoolSettingsView } from './components/views/SchoolSettingsView';
import { ActivityLogView } from './components/views/ActivityLogView';

const MainLayout: React.FC = () => {
  const { currentUser, activeRole } = useAuth();

  // Pick default menu based on role
  const getDefaultMenuForRole = (role: string) => {
    switch (role) {
      case 'admin_operator':
        return 'admin_dash';
      case 'kepala_sekolah':
        return 'kepsek_dash';
      case 'guru_mapel':
        return 'guru_dash';
      case 'wali_kelas':
        return 'wali_dash';
      case 'guru_bk':
        return 'bk_dash';
      default:
        return 'admin_dash';
    }
  };

  const [currentMenu, setCurrentMenu] = useState<string>(() => getDefaultMenuForRole(activeRole));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // When active role changes, reset to that role's default dashboard
  useEffect(() => {
    setCurrentMenu(getDefaultMenuForRole(activeRole));
  }, [activeRole]);

  if (!currentUser) {
    return <LoginView />;
  }

  const getMenuTitle = (menu: string) => {
    const titles: Record<string, string> = {
      admin_dash: 'Dashboard Admin',
      kepsek_dash: 'Dashboard Eksekutif Kepala Sekolah',
      guru_dash: 'Dashboard Guru Mata Pelajaran',
      wali_dash: 'Dashboard Wali Kelas',
      bk_dash: 'Dashboard Bimbingan Konseling (BK)',
      students: 'Data Master Siswa',
      teachers: 'Data Master Guru & Penugasan',
      classes: 'Data Master Kelas',
      subjects: 'Data Master Mata Pelajaran',
      import_excel: 'Import Data Excel Massal',
      schedule: 'Jadwal Pembelajaran Terpadu',
      guru_schedule: 'Jadwal Mengajar Saya',
      attendance: 'Absensi Siswa (Presensi Sesi)',
      attendance_recap: 'Rekapitulasi Kehadiran Siswa',
      wali_attendance: 'Rekap Kehadiran Kelas',
      grading: 'Input Penilaian Siswa',
      grades_recap: 'Rekap Nilai Mapel',
      leger: 'Leger Nilai Hasil Belajar Terpadu',
      violations: 'Poin Pelanggaran Siswa',
      violations_monitor: 'Monitoring Pelanggaran Siswa',
      counseling: 'Penanganan Kasus & Konseling BK',
      counseling_monitor: 'Monitoring Pembinaan BK',
      bk_priority: 'Daftar Siswa Prioritas BK (>30 Poin)',
      bk_sessions: 'Catatan Konseling Rahasia',
      bk_monitoring: 'Monitoring Perkembangan BK',
      attitude: 'Penilaian Sikap & Budi Pekerti',
      monitoring: 'Monitoring Kelas Hari Ini',
      reports: 'Pusat Laporan & Ekspor Dokumen',
      users: 'Manajemen Akun Pengguna',
      settings: 'Identitas Sekolah & Sistem',
      activity: 'Riwayat Aktivitas & Audit Trail',
    };
    return titles[menu] || 'SI MANTAP LMS';
  };

  const renderContent = () => {
    switch (currentMenu) {
      case 'admin_dash':
        return <AdminDashboard onNavigate={setCurrentMenu} />;
      case 'kepsek_dash':
        return <KepsekDashboard onNavigate={setCurrentMenu} />;
      case 'guru_dash':
        return <GuruDashboard onNavigate={setCurrentMenu} />;
      case 'wali_dash':
        return <WaliKelasDashboard onNavigate={setCurrentMenu} />;
      case 'bk_dash':
        return <BKDashboard onNavigate={setCurrentMenu} />;

      // Master Data
      case 'students':
      case 'wali_students':
        return <StudentMasterView />;
      case 'teachers':
        return <TeacherMasterView />;
      case 'classes':
        return <ClassMasterView />;
      case 'subjects':
        return <SubjectMasterView />;

      // Excel Mass Import
      case 'import_excel':
        return <ExcelImportView />;

      // Schedules
      case 'schedule':
      case 'guru_schedule':
        return <ScheduleView onNavigate={setCurrentMenu} />;

      // Attendance
      case 'attendance':
      case 'attendance_recap':
      case 'wali_attendance':
        return <AttendanceView />;

      // Grading & Leger
      case 'grading':
      case 'grades_recap':
        return <GradingView />;
      case 'leger':
        return <LegerGradeView />;

      // Violations & BK Counseling
      case 'violations':
      case 'violations_monitor':
      case 'wali_violations':
        return <ViolationView />;
      case 'counseling':
      case 'counseling_monitor':
      case 'bk_priority':
      case 'bk_sessions':
      case 'bk_monitoring':
        return <CounselingView />;

      // Attitudes & Behaviors
      case 'attitude':
      case 'wali_attitude':
        return <AttitudeView />;

      // Monitoring & Reports
      case 'monitoring':
      case 'journal':
        return <MonitoringView />;
      case 'reports':
      case 'wali_reports':
      case 'wali_notes':
        return <ReportsView />;

      // System Administration
      case 'users':
        return <UserManagementView />;
      case 'settings':
      case 'settings_academic':
        return <SchoolSettingsView />;
      case 'activity':
        return <ActivityLogView />;

      default:
        return <AdminDashboard onNavigate={setCurrentMenu} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentMenu={currentMenu}
        onSelectMenu={(menuId) => setCurrentMenu(menuId)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentMenuTitle={getMenuTitle(currentMenu)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNavigateToMenu={(menuId) => setCurrentMenu(menuId)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SchoolProvider>
        <MainLayout />
      </SchoolProvider>
    </AuthProvider>
  );
}
