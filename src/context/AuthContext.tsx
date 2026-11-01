import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';
import { SchoolStorage } from '../utils/storage';

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
  selectPortalRole: (role: 'guru_mapel' | 'wali_kelas') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('SIMANTAP_LMS_users');
      if (saved) return JSON.parse(saved);
    } catch {}
    return SchoolStorage.getDefaultUsers();
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const savedUser = localStorage.getItem('SIMANTAP_LMS_currentUser');
      if (savedUser) return JSON.parse(savedUser);
    } catch {}
    // Default to admin or multi-role guru for immediate demo ease
    return SchoolStorage.getDefaultUsers()[0];
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
          setActiveRole(currentUser.role);
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
    const user = allUsers.find(
      (u) => u.username.toLowerCase() === trimmed || (u.email && u.email.toLowerCase() === trimmed)
    );

    if (!user) {
      return { success: false, message: 'Username atau email tidak terdaftar dalam sistem.' };
    }
    if (!user.isActive) {
      return { success: false, message: 'Akun Anda berstatus Nonaktif. Hubungi Admin Operator.' };
    }

    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString(),
    };

    const isDualTeacher =
      updatedUser.availableRoles.includes('guru_mapel') &&
      updatedUser.availableRoles.includes('wali_kelas');

    setCurrentUser(updatedUser);
    setAllUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    SchoolStorage.logActivity(updatedUser.name, updatedUser.role, 'Login Berhasil', 'Master', `Pengguna ${updatedUser.username} berhasil masuk ke aplikasi.`);

    if (isDualTeacher) {
      setShowPortalSelector(true);
      setActiveRole(updatedUser.role || 'guru_mapel');
    } else {
      setShowPortalSelector(false);
      setActiveRole(updatedUser.role);
    }

    return { success: true };
  };

  const selectPortalRole = (role: 'guru_mapel' | 'wali_kelas') => {
    setActiveRole(role);
    setShowPortalSelector(false);
    if (currentUser) {
      SchoolStorage.logActivity(
        currentUser.name,
        role,
        'Pilih Portal Masuk',
        'Master',
        `Memilih masuk sebagai ${role === 'guru_mapel' ? 'Guru Mata Pelajaran' : `Wali Kelas (${currentUser.classId || ''})`}.`
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
