import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';
import { SchoolStorage, ADMIN_USER } from '../utils/storage';

interface AuthContextType {
  currentUser: UserAccount | null;
  activeRole: UserRole;
  allUsers: UserAccount[];
  login: (username: string, password?: string) => { success: boolean; message?: string };
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUser: (id: string, updates: Partial<UserAccount>) => void;
  createUser: (user: Omit<UserAccount, 'id'>) => void;
  deleteUser: (id: string) => void;
  resetPassword: (id: string) => string;
  showPortalSelector: boolean;
  setShowPortalSelector: (val: boolean) => void;
  selectPortalRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('SIMANTAP_LMS_users');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [ADMIN_USER];
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const savedUser = localStorage.getItem('SIMANTAP_LMS_currentUser');
      if (savedUser) return JSON.parse(savedUser);
    } catch {}
    return ADMIN_USER;
  });

  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    if (currentUser) {
      return currentUser.role;
    }
    return 'admin_operator';
  });

  const [showPortalSelector, setShowPortalSelector] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('SIMANTAP_LMS_users', JSON.stringify(allUsers));
    } catch (e) {
      console.error(e);
    }
  }, [allUsers]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('SIMANTAP_LMS_currentUser', JSON.stringify(currentUser));
        if (!currentUser.availableRoles.includes(activeRole)) {
          setActiveRole(currentUser.role || currentUser.availableRoles[0]);
        }
      } else {
        localStorage.removeItem('SIMANTAP_LMS_currentUser');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser, activeRole]);

  const login = (username: string, _password?: string) => {
    const trimmed = username.trim().toLowerCase();

    // Dedicated handler for Admin Operator testing account
    if (trimmed === 'admin') {
      if (_password && _password !== 'admin123') {
        return { success: false, message: 'Password salah untuk akun admin. Password yang benar: admin123' };
      }
      const adminAcc: UserAccount = {
        ...ADMIN_USER,
        lastLogin: new Date().toISOString(),
      };
      setCurrentUser(adminAcc);
      setActiveRole('admin_operator');
      setShowPortalSelector(false);
      localStorage.setItem('SIMANTAP_LMS_currentUser', JSON.stringify(adminAcc));
      SchoolStorage.logActivity(
        adminAcc.name,
        adminAcc.role,
        'Login Berhasil',
        'Master',
        'Admin berhasil masuk ke sistem dengan password admin123.'
      );
      return { success: true };
    }

    let user = allUsers.find(
      (u) => u.username.toLowerCase() === trimmed || (u.email && u.email.toLowerCase() === trimmed)
    );

    // If not found in allUsers, check if exists in teachers master
    const teachers = SchoolStorage.getTeachers();
    const matchedTeacher = teachers.find(
      (t) => t.username.toLowerCase() === trimmed || (t.email && t.email.toLowerCase() === trimmed)
    );

    if (!user && !matchedTeacher) {
      return { success: false, message: 'Username atau email tidak terdaftar dalam sistem.' };
    }

    // Dynamic role calculation based on master teacher data per rules:
    // - BK who also teaches -> has guru_mapel and guru_bk
    // - Pure BK without teaching data -> strictly guru_bk only (no guru_mapel option, direct to BK portal)
    // - Pure subject teacher -> only guru_mapel
    // - Teacher + Wali kelas -> has guru_mapel and wali_kelas
    // - Teacher + Wali kelas + BK -> has all three!
    let detectedRoles: UserRole[] = [];
    let detectedClassId: string | undefined = undefined;
    let detectedTeacherCode: string | undefined = undefined;
    let detectedSubject: string | undefined = undefined;

    if (matchedTeacher) {
      detectedClassId = matchedTeacher.classId;
      detectedTeacherCode = matchedTeacher.teacherCode;
      detectedSubject = matchedTeacher.subject;

      const isBk =
        matchedTeacher.role === 'guru_bk' ||
        matchedTeacher.subject.toLowerCase().includes('konseling') ||
        matchedTeacher.subject.toLowerCase().includes('bk');
      if (isBk) detectedRoles.push('guru_bk');

      const isWalas = !!matchedTeacher.classId || matchedTeacher.role === 'wali_kelas';
      if (isWalas) detectedRoles.push('wali_kelas');

      // Check whether teacher actually has teaching schedules or additional non-BK teaching subjects
      const allSchedules = SchoolStorage.getSchedules();
      const hasTeachingSchedules = allSchedules.some(
        (s) =>
          (matchedTeacher.teacherCode && s.teacherCode.toLowerCase() === matchedTeacher.teacherCode.toLowerCase()) ||
          s.teacherName.toLowerCase().includes(matchedTeacher.name.toLowerCase())
      );

      const cleanSub = (matchedTeacher.subject || '').toLowerCase().trim();
      const isPureBkSubject =
        cleanSub === 'bimbingan konseling' ||
        cleanSub === 'bimbingan & konseling' ||
        cleanSub === 'bk' ||
        cleanSub === 'konseling' ||
        cleanSub === 'konselor' ||
        cleanSub === 'guru bk';

      const hasAdditionalTeachingSubject =
        matchedTeacher.subject &&
        !isPureBkSubject &&
        !cleanSub.startsWith('operator') &&
        !cleanSub.startsWith('manajemen') &&
        (cleanSub.includes('&') ||
          cleanSub.includes('prakarya') ||
          cleanSub.includes('ipa') ||
          cleanSub.includes('ips') ||
          cleanSub.includes('matematika') ||
          cleanSub.includes('bahasa') ||
          cleanSub.includes('informatika') ||
          cleanSub.includes('seni') ||
          cleanSub.includes('pjok') ||
          cleanSub.includes('penjas') ||
          cleanSub.includes('agama') ||
          cleanSub.includes('ppkn'));

      if (isBk) {
        // Requirement 4: only add guru_mapel if they have teaching data or additional subjects
        if (hasTeachingSchedules || hasAdditionalTeachingSubject || matchedTeacher.role === 'guru_mapel') {
          if (!detectedRoles.includes('guru_mapel')) {
            detectedRoles.push('guru_mapel');
          }
        }
      } else {
        const isMapel =
          matchedTeacher.role === 'guru_mapel' ||
          (matchedTeacher.subject &&
            !cleanSub.startsWith('operator') &&
            !cleanSub.startsWith('manajemen'));
        if (isMapel && !detectedRoles.includes('guru_mapel')) {
          detectedRoles.push('guru_mapel');
        }
      }

      if (matchedTeacher.role === 'admin_operator') detectedRoles = ['admin_operator'];
      if (matchedTeacher.role === 'kepala_sekolah') detectedRoles = ['kepala_sekolah'];
    }

    if (!user && matchedTeacher) {
      user = {
        id: `USR_${matchedTeacher.id}`,
        username: matchedTeacher.username,
        name: matchedTeacher.name,
        role: detectedRoles[0] || matchedTeacher.role,
        availableRoles: detectedRoles.length > 0 ? detectedRoles : [matchedTeacher.role],
        classId: detectedClassId,
        teacherCode: detectedTeacherCode,
        subject: detectedSubject,
        isActive: matchedTeacher.status === 'Aktif',
        email: matchedTeacher.email,
      };
    } else if (user && matchedTeacher) {
      // Synchronize availableRoles with freshly detected roles based on actual master & schedule data
      user = {
        ...user,
        role: detectedRoles.includes(user.role) ? user.role : (detectedRoles[0] || matchedTeacher.role),
        availableRoles: detectedRoles,
        classId: detectedClassId || user.classId,
        teacherCode: detectedTeacherCode || user.teacherCode,
        subject: detectedSubject || user.subject,
      };
    }

    if (!user) {
      return { success: false, message: 'Username tidak ditemukan.' };
    }

    if (!user.isActive) {
      return { success: false, message: 'Akun Anda berstatus Nonaktif. Hubungi Admin Operator.' };
    }

    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString(),
    };

    const hasMultiRole = updatedUser.availableRoles.length > 1;

    setCurrentUser(updatedUser);
    setAllUsers((prev) => {
      const exists = prev.some((u) => u.id === updatedUser.id);
      return exists ? prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)) : [...prev, updatedUser];
    });

    SchoolStorage.logActivity(
      updatedUser.name,
      updatedUser.role,
      'Login Berhasil',
      'Master',
      `Pengguna ${updatedUser.username} berhasil masuk ke aplikasi (${updatedUser.availableRoles.join(', ')}).`
    );

    if (hasMultiRole) {
      setShowPortalSelector(true);
      setActiveRole(updatedUser.availableRoles[0]);
    } else {
      setShowPortalSelector(false);
      setActiveRole(updatedUser.availableRoles[0] || updatedUser.role);
    }

    return { success: true };
  };

  const selectPortalRole = (role: UserRole) => {
    setActiveRole(role);
    setShowPortalSelector(false);
    if (currentUser) {
      const roleText =
        role === 'guru_mapel'
          ? 'Guru Mata Pelajaran'
          : role === 'wali_kelas'
          ? `Wali Kelas (${currentUser.classId || ''})`
          : role === 'guru_bk'
          ? 'Guru Bimbingan Konseling (BK)'
          : role;
      SchoolStorage.logActivity(
        currentUser.name,
        role,
        'Pilih Portal Masuk',
        'Master',
        `Memilih masuk sebagai ${roleText}.`
      );
    }
  };

  const logout = () => {
    if (currentUser) {
      SchoolStorage.logActivity(currentUser.name, activeRole, 'Logout', 'Master', `Pengguna ${currentUser.username} keluar dari aplikasi.`);
    }
    setShowPortalSelector(false);
    setCurrentUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (currentUser && currentUser.availableRoles.includes(role)) {
      setActiveRole(role);
      SchoolStorage.logActivity(currentUser.name, role, 'Ganti Peran Aktif', 'Master', `Beralih peran aktif menjadi ${role}.`);
    }
  };

  const updateUser = (id: string, updates: Partial<UserAccount>) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser?.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const createUser = (userData: Omit<UserAccount, 'id'>) => {
    const newUser: UserAccount = {
      ...userData,
      id: `USR${Date.now()}`,
    };
    setAllUsers((prev) => [...prev, newUser]);
    SchoolStorage.logActivity(currentUser?.name || 'Admin', 'admin_operator', 'Tambah Pengguna Baru', 'Master', `Membuat akun ${newUser.username} dengan peran ${newUser.role}.`);
  };

  const deleteUser = (id: string) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const resetPassword = (id: string): string => {
    const tempPass = `Mantap@${Math.floor(1000 + Math.random() * 9000)}`;
    const user = allUsers.find((u) => u.id === id);
    if (user) {
      SchoolStorage.logActivity(currentUser?.name || 'Admin', 'admin_operator', 'Reset Password Pengguna', 'Master', `Mereset password pengguna ${user.username}.`);
    }
    return tempPass;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        allUsers,
        login,
        logout,
        switchRole,
        updateUser,
        createUser,
        deleteUser,
        resetPassword,
        showPortalSelector,
        setShowPortalSelector,
        selectPortalRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
