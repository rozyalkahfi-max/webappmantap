import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Student,
  Teacher,
  ClassRoom,
  Subject,
  ScheduleItem,
  AttendanceSession,
  StudentGrade,
  DailyScoreRecord,
  AttitudeAssessment,
  ViolationRecord,
  ViolationRule,
  CounselingRecord,
  SchoolSettings,
  SystemNotification,
  ActivityLog,
  WaliKelasImportRow,
  UserRole,
} from '../types';
import { SchoolStorage, CLASS_IDS } from '../utils/storage';
import { useAuth } from './AuthContext';

interface ScheduleConflict {
  hasConflict: boolean;
  message?: string;
  conflictType?: 'class_conflict' | 'teacher_conflict' | 'time_conflict';
}

interface SchoolContextType {
  settings: SchoolSettings;
  updateSettings: (newSettings: Partial<SchoolSettings>) => void;

  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  deleteStudentsBatch: (ids: string[]) => void;
  deleteStudentsByGrade: (grade: string) => number;
  deleteAllStudents: () => void;
  resetDefaultStudents: () => void;
  importStudentsBatch: (newStudents: Partial<Student>[]) => { added: number; skipped: number };

  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => Teacher;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  deleteTeachersBatch: (ids: string[]) => void;
  deleteAllTeachers: () => void;
  resetDefaultTeachers: () => void;
  importTeachersBatch: (newTeachers: any[]) => { added: number; merged: number };
  importWaliKelasBatch: (rows: WaliKelasImportRow[]) => { added: number; updated: number; total: number };

  classes: ClassRoom[];
  addClass: (c: ClassRoom) => void;
  updateClass: (classId: string, updates: Partial<ClassRoom>) => void;
  deleteClass: (classId: string) => void;
  resetDefaultClasses: () => void;
  importClassesBatch: (newClasses: Partial<ClassRoom>[]) => { added: number; updated: number };

  subjects: Subject[];
  addSubject: (subject: Subject) => void;
  updateSubject: (code: string, updates: Partial<Subject>) => void;
  deleteSubject: (code: string) => void;
  deleteSubjectsBatch: (codes: string[]) => void;
  deleteAllSubjects: () => void;
  resetDefaultSubjects: () => void;
  importSubjectsBatch: (newSubjects: Subject[]) => { added: number };

  schedules: ScheduleItem[];
  addSchedule: (item: Omit<ScheduleItem, 'id'>) => { success: boolean; conflict?: string };
  updateSchedule: (id: string, updates: Partial<ScheduleItem>) => { success: boolean; conflict?: string };
  deleteSchedule: (id: string) => void;
  deleteSchedulesByClass: (classId: string) => number;
  deleteAllSchedules: () => void;
  resetDefaultSchedules: () => void;
  checkScheduleConflict: (item: Omit<ScheduleItem, 'id'>, excludeId?: string) => ScheduleConflict;
  importSchedulesBatch: (newSchedules: any[]) => { added: number };

  attendanceSessions: AttendanceSession[];
  saveAttendanceSession: (session: Omit<AttendanceSession, 'id' | 'submittedAt'>) => void;
  getAttendanceForSchedule: (scheduleId: string, date: string) => AttendanceSession | undefined;

  grades: StudentGrade[];
  saveStudentGrade: (grade: Omit<StudentGrade, 'id' | 'finalScore' | 'letterGrade' | 'status'>) => void;
  saveBatchGrades: (gradesList: Partial<StudentGrade>[]) => void;
  dailyScores: DailyScoreRecord[];
  saveDailyScoreBatch: (scores: DailyScoreRecord[]) => void;

  violations: ViolationRecord[];
  addViolation: (record: Omit<ViolationRecord, 'id'>) => void;
  deleteViolation: (id: string) => void;
  getStudentPoints: (studentId: string) => number;
  getStudentViolationCategory: (points: number) => { label: string; color: string; badge: string };

  violationRules: ViolationRule[];
  addViolationRule: (rule: ViolationRule) => void;
  updateViolationRule: (id: string, updates: Partial<ViolationRule>) => void;
  deleteViolationRule: (id: string) => void;
  resetDefaultViolationRules: () => void;
  importViolationRulesBatch: (rules: ViolationRule[]) => { added: number };

  counselingRecords: CounselingRecord[];
  addCounselingRecord: (record: Omit<CounselingRecord, 'id'>) => void;
  updateCounselingRecord: (id: string, updates: Partial<CounselingRecord>) => void;
  priorityBkStudents: { student: Student; totalPoints: number; violations: ViolationRecord[]; latestCounseling?: CounselingRecord }[];

  attitudes: AttitudeAssessment[];
  saveAttitude: (attitude: Omit<AttitudeAssessment, 'id'>) => void;

  notifications: SystemNotification[];
  markNotificationRead: (id: string) => void;
  unreadNotificationCount: number;

  activityLogs: ActivityLog[];
  logAction: (action: string, category: any, details: string) => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, activeRole, createUser, allUsers, updateUser } = useAuth();

  const [settings, setSettings] = useState<SchoolSettings>(() => SchoolStorage.getSettings());
  const [students, setStudents] = useState<Student[]>(() => SchoolStorage.getStudents());
  const [teachers, setTeachers] = useState<Teacher[]>(() => SchoolStorage.getTeachers());
  const [classes, setClasses] = useState<ClassRoom[]>(() => SchoolStorage.getClasses());
  const [subjects, setSubjects] = useState<Subject[]>(() => SchoolStorage.getSubjects());
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => SchoolStorage.getSchedules());
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => SchoolStorage.getAttendanceSessions());
  const [grades, setGrades] = useState<StudentGrade[]>(() => SchoolStorage.getGrades());
  const [violations, setViolations] = useState<ViolationRecord[]>(() => SchoolStorage.getViolations());
  const [violationRules, setViolationRules] = useState<ViolationRule[]>(() => SchoolStorage.getViolationRules());
  const [dailyScores, setDailyScores] = useState<DailyScoreRecord[]>(() => SchoolStorage.getDailyScores());
  const [counselingRecords, setCounselingRecords] = useState<CounselingRecord[]>(() => SchoolStorage.getCounselingRecords());
  const [attitudes, setAttitudes] = useState<AttitudeAssessment[]>(() => SchoolStorage.getAttitudes());
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => SchoolStorage.getNotifications());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => SchoolStorage.getActivityLogs());

  // Keep classes student counts synced with actual students state
  useEffect(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      counts[s.classId] = (counts[s.classId] || 0) + 1;
    });

    setClasses((prev) =>
      prev.map((c) => ({
        ...c,
        studentCount: counts[c.classId] || 0,
      }))
    );
  }, [students]);

  // Sync to localStorage
  useEffect(() => { SchoolStorage.saveSettings(settings); }, [settings]);
  useEffect(() => { SchoolStorage.saveStudents(students); }, [students]);
  useEffect(() => { SchoolStorage.saveTeachers(teachers); }, [teachers]);
  useEffect(() => { SchoolStorage.saveClasses(classes); }, [classes]);
  useEffect(() => { SchoolStorage.saveSubjects(subjects); }, [subjects]);
  useEffect(() => { SchoolStorage.saveSchedules(schedules); }, [schedules]);
  useEffect(() => { SchoolStorage.saveAttendanceSessions(attendanceSessions); }, [attendanceSessions]);
  useEffect(() => { SchoolStorage.saveGrades(grades); }, [grades]);
  useEffect(() => { SchoolStorage.saveViolations(violations); }, [violations]);
  useEffect(() => { SchoolStorage.saveViolationRules(violationRules); }, [violationRules]);
  useEffect(() => { SchoolStorage.saveDailyScores(dailyScores); }, [dailyScores]);
  useEffect(() => { SchoolStorage.saveCounselingRecords(counselingRecords); }, [counselingRecords]);
  useEffect(() => { SchoolStorage.saveAttitudes(attitudes); }, [attitudes]);
  useEffect(() => { SchoolStorage.saveNotifications(notifications); }, [notifications]);
  useEffect(() => { SchoolStorage.saveActivityLogs(activityLogs); }, [activityLogs]);

  const logAction = (action: string, category: any, details: string) => {
    const userName = currentUser?.name || 'Sistem';
    const userRole = activeRole || 'admin_operator';
    const newLog: ActivityLog = {
      id: `LOG${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userName,
      userRole,
      action,
      category,
      details,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  const updateSettings = (newSettings: Partial<SchoolSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      logAction('Perbarui Pengaturan Sekolah', 'Pengaturan', `Memperbarui identitas sekolah: ${updated.schoolName}`);
      return updated;
    });
  };

  // Student methods
  const addStudent = (studentData: Omit<Student, 'id'>): Student => {
    const newId = `STD${String(students.length + 1).padStart(4, '0')}`;
    const newStudent: Student = { ...studentData, id: newId };
    setStudents((prev) => [...prev, newStudent]);
    logAction('Tambah Siswa', 'Master', `Menambahkan siswa baru ${newStudent.name} (NIS: ${newStudent.nis}) ke kelas ${newStudent.classId}`);
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    logAction('Ubah Data Siswa', 'Master', `Memperbarui data siswa ID ${id}`);
  };

  const deleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    logAction('Hapus Siswa', 'Master', `Menghapus siswa ${target?.name || id}`);
  };

  const deleteStudentsBatch = (ids: string[]) => {
    const idSet = new Set(ids);
    setStudents((prev) => prev.filter((s) => !idSet.has(s.id)));
    logAction('Hapus Siswa Terpilih', 'Master', `Menghapus massal ${ids.length} data siswa terpilih.`);
  };

  const deleteStudentsByGrade = (grade: string) => {
    const toDelete = students.filter((s) => s.classId.startsWith(grade));
    setStudents((prev) => prev.filter((s) => !s.classId.startsWith(grade)));
    logAction(`Hapus Siswa Tingkat ${grade}`, 'Master', `Menghapus seluruh siswa kelas ${grade} (${toDelete.length} siswa).`);
    return toDelete.length;
  };

  const deleteAllStudents = () => {
    const total = students.length;
    setStudents([]);
    logAction('Hapus Seluruh Data Siswa', 'Master', `Mengosongkan seluruh basis data siswa (${total} siswa dihapus).`);
  };

  const resetDefaultStudents = () => {
    const fresh = SchoolStorage.getFreshDefaultStudents();
    setStudents(fresh);
    SchoolStorage.saveStudents(fresh);
    logAction('Reset Siswa Default', 'Master', `Memulihkan kembali 708 data siswa awal sistem.`);
  };

  const importStudentsBatch = (newStudents: Partial<Student>[]) => {
    let added = 0;
    const existingIds = new Set(students.map((s) => s.id));
    const toAdd: Student[] = [];

    newStudents.forEach((st) => {
      if (st.id && !existingIds.has(st.id) && st.name && st.nis && st.classId) {
        toAdd.push({
          id: st.id,
          nis: st.nis,
          nisn: st.nisn || '-',
          name: st.name,
          classId: st.classId,
          gender: st.gender || 'L',
          status: 'Aktif',
        });
        existingIds.add(st.id);
        added++;
      }
    });

    if (toAdd.length > 0) {
      setStudents((prev) => [...prev, ...toAdd]);
      logAction('Import Siswa Excel Massal', 'Import', `Berhasil mengimpor ${added} data siswa baru.`);
    }
    return { added, skipped: newStudents.length - added };
  };

  // Teacher methods
  const addTeacher = (teacherData: Omit<Teacher, 'id'>): Teacher => {
    const newId = `TCH${String(teachers.length + 1).padStart(3, '0')}`;
    const newTeacher: Teacher = { ...teacherData, id: newId };
    setTeachers((prev) => [...prev, newTeacher]);

    // Check if user account already exists, if not create user
    const existingUser = allUsers.find((u) => u.username === newTeacher.username);
    if (!existingUser) {
      createUser({
        username: newTeacher.username,
        name: newTeacher.name,
        role: newTeacher.role,
        availableRoles: newTeacher.role === 'wali_kelas' ? ['guru_mapel', 'wali_kelas'] : [newTeacher.role],
        classId: newTeacher.classId,
        teacherCode: newTeacher.teacherCode,
        subject: newTeacher.subject,
        isActive: true,
        email: newTeacher.email,
      });
    }

    // Automatically sync wali kelas to class if assigned
    if (newTeacher.classId) {
      setClasses((prev) =>
        prev.map((c) =>
          c.classId.toUpperCase() === newTeacher.classId?.toUpperCase()
            ? {
                ...c,
                homeroomTeacherName: newTeacher.name,
                homeroomTeacherId: newTeacher.teacherCode || newTeacher.username,
              }
            : c
        )
      );
    }

    logAction('Tambah Data Guru', 'Master', `Menambahkan guru baru ${newTeacher.name} (Kode: ${newTeacher.teacherCode})`);
    return newTeacher;
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    // Sync wali kelas if updated
    if (updates.classId || updates.name) {
      const current = teachers.find((t) => t.id === id);
      const targetClass = updates.classId || current?.classId;
      const targetName = updates.name || current?.name;
      if (targetClass && targetName) {
        setClasses((prev) =>
          prev.map((c) =>
            c.classId.toUpperCase() === targetClass.toUpperCase()
              ? {
                  ...c,
                  homeroomTeacherName: targetName,
                  homeroomTeacherId: updates.teacherCode || current?.teacherCode || current?.username,
                }
              : c
          )
        );
      }
    }

    logAction('Ubah Data Guru', 'Master', `Memperbarui data guru ID ${id}`);
  };

  const deleteTeacher = (id: string) => {
    const target = teachers.find((t) => t.id === id);
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    logAction('Hapus Data Guru', 'Master', `Menghapus guru ${target?.name || id}`);
  };

  const deleteTeachersBatch = (ids: string[]) => {
    const idSet = new Set(ids);
    setTeachers((prev) => prev.filter((t) => !idSet.has(t.id)));
    logAction('Hapus Guru Terpilih', 'Master', `Menghapus massal ${ids.length} data guru terpilih.`);
  };

  const deleteAllTeachers = () => {
    const total = teachers.length;
    setTeachers([]);
    logAction('Hapus Seluruh Data Guru', 'Master', `Menghapus seluruh data guru (${total} tenaga pendidik).`);
  };

  const resetDefaultTeachers = () => {
    const fresh = SchoolStorage.getFreshDefaultTeachers();
    setTeachers(fresh);
    SchoolStorage.saveTeachers(fresh);
    logAction('Reset Guru Default', 'Master', `Memulihkan kembali 50 data guru awal.`);
  };

  const importTeachersBatch = (newTeachers: any[]) => {
    let added = 0;
    let merged = 0;
    const existingMap = new Map<string, Teacher>();
    teachers.forEach((t) => existingMap.set(t.username.toLowerCase(), t));

    const updatedList = [...teachers];
    const homeroomUpdates = new Map<string, { name: string; teacherCode: string }>();

    newTeachers.forEach((row) => {
      const lowerUser = row.username.toLowerCase();
      if (row.classId) {
        homeroomUpdates.set(row.classId.toUpperCase(), {
          name: row.name,
          teacherCode: row.teacherCode || row.username,
        });
      }

      if (existingMap.has(lowerUser)) {
        // Multi-assignment merge:
        const t = existingMap.get(lowerUser)!;
        if (row.classId && !t.classId) t.classId = row.classId;
        if (row.nip && !t.nip) t.nip = row.nip;
        if (row.role === 'wali_kelas') t.role = 'wali_kelas';
        merged++;
      } else {
        const newT: Teacher = {
          id: `TCH${String(updatedList.length + 1).padStart(3, '0')}`,
          username: row.username,
          name: row.name,
          nip: row.nip || undefined,
          role: row.role,
          classId: row.classId || undefined,
          teacherCode: row.teacherCode,
          subject: row.subject,
          status: 'Aktif',
          email: `${row.username}@smpn1mantap.sch.id`,
        };
        updatedList.push(newT);
        existingMap.set(lowerUser, newT);
        added++;

        // Auto-create user account
        createUser({
          username: newT.username,
          name: newT.name,
          role: newT.role,
          availableRoles: newT.role === 'wali_kelas' ? ['guru_mapel', 'wali_kelas'] : [newT.role],
          classId: newT.classId,
          teacherCode: newT.teacherCode,
          subject: newT.subject,
          isActive: true,
          email: newT.email,
        });
      }
    });

    setTeachers(updatedList);

    // Sync wali kelas automatically into classes so it shows in data kelas
    if (homeroomUpdates.size > 0) {
      setClasses((prev) =>
        prev.map((c) => {
          const match = homeroomUpdates.get(c.classId.toUpperCase());
          if (match) {
            return {
              ...c,
              homeroomTeacherName: match.name,
              homeroomTeacherId: match.teacherCode,
            };
          }
          return c;
        })
      );
    }

    logAction('Import Guru Excel Massal', 'Import', `Import guru selesai: ${added} akun baru dibuat, ${merged} penugasan digabungkan, wali kelas disinkronkan ke rombel.`);
    return { added, merged };
  };

  const importWaliKelasBatch = (rows: WaliKelasImportRow[]) => {
    let added = 0;
    let updated = 0;

    const classUpdates = new Map<string, { homeroomTeacherName: string; homeroomTeacherId: string; academicYear?: string }>();
    const updatedTeachers = [...teachers];

    rows.forEach((row) => {
      const uname = row.username.trim().toLowerCase();
      const targetClass = row.classId.trim().toUpperCase();
      const academicYear = row.academicYear?.trim() || settings.activeAcademicYear;

      // 1. Find teacher or user
      const existingTeacher = updatedTeachers.find((t) => t.username.toLowerCase() === uname);
      const existingUser = allUsers.find((u) => u.username.toLowerCase() === uname);

      const teacherName = existingTeacher?.name || existingUser?.name || row.username;
      const teacherCode = existingTeacher?.teacherCode || existingTeacher?.username || row.username;

      // Record for updating class
      classUpdates.set(targetClass, {
        homeroomTeacherName: teacherName,
        homeroomTeacherId: teacherCode,
        academicYear,
      });

      // 2. Update Teacher record
      if (existingTeacher) {
        existingTeacher.classId = targetClass;
        existingTeacher.role = 'wali_kelas';
        updated++;
      }

      // 3. Update or Create User Account
      if (existingUser) {
        const roles = new Set(existingUser.availableRoles);
        roles.add('guru_mapel');
        roles.add('wali_kelas');
        updateUser(existingUser.id, {
          classId: targetClass,
          role: 'wali_kelas',
          availableRoles: Array.from(roles) as UserRole[],
          ...(row.password ? { password: row.password } : {}),
        });
      } else {
        // Create new account if didn't exist
        createUser({
          username: row.username,
          name: teacherName,
          role: 'wali_kelas',
          availableRoles: ['guru_mapel', 'wali_kelas'],
          classId: targetClass,
          teacherCode: targetClass ? `W_${targetClass}` : undefined,
          isActive: true,
          email: `${row.username}@smpn1mantap.sch.id`,
        });
        added++;
      }
    });

    setTeachers(updatedTeachers);

    // 4. Update Classes homeroom teacher
    if (classUpdates.size > 0) {
      setClasses((prev) =>
        prev.map((c) => {
          const match = classUpdates.get(c.classId.toUpperCase());
          if (match) {
            return {
              ...c,
              homeroomTeacherName: match.homeroomTeacherName,
              homeroomTeacherId: match.homeroomTeacherId,
              academicYear: match.academicYear || c.academicYear,
            };
          }
          return c;
        })
      );
    }

    logAction(
      'Import Wali Kelas Excel Massal',
      'Import',
      `Berhasil mengimpor penugasan Wali Kelas: ${rows.length} rombel terhubung dengan akun guru & wali kelas.`
    );

    return { added, updated, total: rows.length };
  };

  // Class methods
  const addClass = (c: ClassRoom) => {
    setClasses((prev) => [...prev, c]);
    logAction('Tambah Kelas Baru', 'Master', `Menambahkan rombel kelas ${c.classId}`);
  };

  const updateClass = (classId: string, updates: Partial<ClassRoom>) => {
    setClasses((prev) =>
      prev.map((c) => (c.classId === classId ? { ...c, ...updates } : c))
    );
    logAction('Ubah Data Kelas', 'Master', `Memperbarui konfigurasi kelas ${classId}`);
  };

  const deleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.classId !== classId));
    logAction('Hapus Kelas', 'Master', `Menghapus rombel kelas ${classId}`);
  };

  const resetDefaultClasses = () => {
    const fresh = SchoolStorage.getFreshDefaultClasses();
    setClasses(fresh);
    SchoolStorage.saveClasses(fresh);
    logAction('Reset Kelas Default', 'Master', `Memulihkan kembali 24 rombel kelas standar 7A-9H.`);
  };

  const importClassesBatch = (newClasses: Partial<ClassRoom>[]) => {
    let added = 0;
    let updated = 0;
    const existingMap = new Map<string, ClassRoom>();
    classes.forEach((c) => existingMap.set(c.classId.toUpperCase(), c));

    const updatedClasses = [...classes];

    newClasses.forEach((row) => {
      if (!row.classId) return;
      const key = row.classId.toUpperCase();
      if (existingMap.has(key)) {
        const existing = existingMap.get(key)!;
        if (row.gradeLevel) existing.gradeLevel = row.gradeLevel;
        if (row.academicYear) existing.academicYear = row.academicYear;
        updated++;
      } else {
        const gradeLevel = (row.gradeLevel || (['7', '8', '9'].includes(key.charAt(0)) ? key.charAt(0) : '7')) as '7' | '8' | '9';
        const matchedTeacher = teachers.find((t) => t.classId?.toUpperCase() === key);
        const newClass: ClassRoom = {
          classId: key,
          name: row.name || `Kelas ${key}`,
          gradeLevel,
          academicYear: row.academicYear || settings.activeAcademicYear,
          studentCount: 0,
          status: 'Aktif',
          homeroomTeacherName: row.homeroomTeacherName || matchedTeacher?.name,
          homeroomTeacherId: row.homeroomTeacherId || matchedTeacher?.teacherCode || matchedTeacher?.username,
        };
        updatedClasses.push(newClass);
        existingMap.set(key, newClass);
        added++;
      }
    });

    setClasses(updatedClasses);
    logAction('Import Kelas Excel Massal', 'Import', `Import kelas selesai: ${added} rombel baru, ${updated} rombel diperbarui.`);
    return { added, updated };
  };

  // Subject methods
  const addSubject = (subject: Subject) => {
    setSubjects((prev) => [...prev, subject]);
    logAction('Tambah Mata Pelajaran', 'Master', `Menambahkan mata pelajaran ${subject.name} (${subject.code})`);
  };

  const updateSubject = (code: string, updates: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.code === code ? { ...s, ...updates } : s))
    );
    logAction('Ubah Mata Pelajaran', 'Master', `Memperbarui mata pelajaran ${code}`);
  };

  const deleteSubject = (code: string) => {
    setSubjects((prev) => prev.filter((s) => s.code !== code));
    logAction('Hapus Mata Pelajaran', 'Master', `Menghapus mata pelajaran ${code}`);
  };

  const deleteSubjectsBatch = (codes: string[]) => {
    const codeSet = new Set(codes.map((c) => c.toLowerCase()));
    setSubjects((prev) => prev.filter((s) => !codeSet.has(s.code.toLowerCase())));
    logAction('Hapus Mapel Terpilih', 'Master', `Menghapus ${codes.length} mata pelajaran.`);
  };

  const deleteAllSubjects = () => {
    const total = subjects.length;
    setSubjects([]);
    logAction('Hapus Seluruh Mata Pelajaran', 'Master', `Menghapus seluruh ${total} mata pelajaran.`);
  };

  const resetDefaultSubjects = () => {
    const fresh = SchoolStorage.getFreshDefaultSubjects();
    setSubjects(fresh);
    SchoolStorage.saveSubjects(fresh);
    logAction('Reset Mapel Default', 'Master', `Memulihkan kembali 12 mata pelajaran standar.`);
  };

  const importSubjectsBatch = (newSubjects: Subject[]) => {
    let added = 0;
    const existingCodes = new Set(subjects.map((s) => s.code.toLowerCase()));
    const toAdd: Subject[] = [];

    newSubjects.forEach((sub) => {
      if (!existingCodes.has(sub.code.toLowerCase())) {
        toAdd.push(sub);
        existingCodes.add(sub.code.toLowerCase());
        added++;
      }
    });

    if (toAdd.length > 0) {
      setSubjects((prev) => [...prev, ...toAdd]);
      logAction('Import Mata Pelajaran Excel', 'Import', `Berhasil menambahkan ${added} mata pelajaran.`);
    }
    return { added };
  };

  // Schedule conflict checking
  const checkScheduleConflict = (item: Omit<ScheduleItem, 'id'>, excludeId?: string): ScheduleConflict => {
    for (const s of schedules) {
      if (excludeId && s.id === excludeId) continue;
      if (s.day !== item.day) continue;
      if (s.semester !== item.semester || s.academicYear !== item.academicYear) continue;

      // Check period overlap
      if (s.period === item.period) {
        // 1. Same class already has a schedule in this period
        if (s.classId === item.classId) {
          return {
            hasConflict: true,
            conflictType: 'class_conflict',
            message: `Bentrok: Kelas ${item.classId} pada hari ${item.day} Jam ke-${item.period} sudah diisi oleh Guru ${s.teacherName} (${s.subjectName}).`,
          };
        }
        // 2. Same teacher cannot teach 2 classes simultaneously
        if (s.teacherCode === item.teacherCode) {
          return {
            hasConflict: true,
            conflictType: 'teacher_conflict',
            message: `Bentrok: Guru ${item.teacherName} pada hari ${item.day} Jam ke-${item.period} sedang mengajar di Kelas ${s.classId}.`,
          };
        }
      }
    }
    return { hasConflict: false };
  };

  const addSchedule = (item: Omit<ScheduleItem, 'id'>) => {
    const conflict = checkScheduleConflict(item);
    if (conflict.hasConflict) {
      return { success: false, conflict: conflict.message };
    }
    const newId = `SCH${String(schedules.length + 1).padStart(4, '0')}`;
    const newSchedule: ScheduleItem = { ...item, id: newId };
    setSchedules((prev) => [...prev, newSchedule]);
    logAction('Tambah Jadwal Pembelajaran', 'Master', `Jadwal baru Kelas ${item.classId} - ${item.subjectName} (${item.day} Jam ${item.period})`);
    return { success: true };
  };

  const updateSchedule = (id: string, updates: Partial<ScheduleItem>) => {
    const current = schedules.find((s) => s.id === id);
    if (!current) return { success: false, conflict: 'Jadwal tidak ditemukan' };
    const merged = { ...current, ...updates };
    const conflict = checkScheduleConflict(merged, id);
    if (conflict.hasConflict) {
      return { success: false, conflict: conflict.message };
    }
    setSchedules((prev) => prev.map((s) => (s.id === id ? merged : s)));
    logAction('Ubah Jadwal Pembelajaran', 'Master', `Memperbarui jadwal ID ${id}`);
    return { success: true };
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    logAction('Hapus Jadwal Pembelajaran', 'Master', `Menghapus jadwal ID ${id}`);
  };

  const deleteSchedulesByClass = (classId: string) => {
    const targetClass = classId.toUpperCase();
    const countBefore = schedules.length;
    const remaining = schedules.filter((s) => s.classId.toUpperCase() !== targetClass);
    const deletedCount = countBefore - remaining.length;
    setSchedules(remaining);
    logAction('Hapus Jadwal per Kelas', 'Master', `Menghapus seluruh jadwal (${deletedCount} sesi) untuk kelas ${classId}.`);
    return deletedCount;
  };

  const deleteAllSchedules = () => {
    const total = schedules.length;
    setSchedules([]);
    logAction('Hapus Seluruh Jadwal', 'Master', `Menghapus seluruh jadwal pembelajaran (${total} sesi).`);
  };

  const resetDefaultSchedules = () => {
    const fresh = SchoolStorage.getFreshDefaultSchedules();
    setSchedules(fresh);
    SchoolStorage.saveSchedules(fresh);
    logAction('Reset Jadwal Default', 'Master', `Memulihkan jadwal pembelajaran standar (${fresh.length} sesi).`);
  };

  const importSchedulesBatch = (newSchedules: any[]) => {
    let added = 0;
    const toAdd: ScheduleItem[] = [];
    newSchedules.forEach((sch, idx) => {
      toAdd.push({
        id: `SCH_IMP_${Date.now()}_${idx}`,
        day: sch.day,
        period: sch.period,
        startTime: sch.startTime,
        endTime: sch.endTime,
        classId: sch.classId,
        teacherCode: sch.teacherCode,
        teacherName: sch.teacherName,
        subjectCode: sch.subjectCode,
        subjectName: sch.subjectName,
        academicYear: sch.academicYear || settings.activeAcademicYear,
        semester: sch.semester || settings.activeSemester,
      });
      added++;
    });
    if (toAdd.length > 0) {
      setSchedules((prev) => [...prev, ...toAdd]);
      logAction('Import Jadwal Excel Massal', 'Import', `Berhasil mengimpor ${added} jadwal pembelajaran ke sistem.`);
    }
    return { added };
  };

  // Attendance
  const saveAttendanceSession = (sessionData: Omit<AttendanceSession, 'id' | 'submittedAt'>) => {
    const existingIdx = attendanceSessions.findIndex(
      (a) => a.scheduleId === sessionData.scheduleId && a.date === sessionData.date
    );

    const now = new Date().toISOString();
    let updatedSessions: AttendanceSession[];

    if (existingIdx >= 0) {
      const updated = {
        ...attendanceSessions[existingIdx],
        ...sessionData,
        submittedAt: now,
      };
      updatedSessions = [...attendanceSessions];
      updatedSessions[existingIdx] = updated;
    } else {
      const newSession: AttendanceSession = {
        ...sessionData,
        id: `ATT_SES_${Date.now()}`,
        submittedAt: now,
      };
      updatedSessions = [newSession, ...attendanceSessions];
    }

    setAttendanceSessions(updatedSessions);
    logAction('Simpan Presensi Kelas', 'Absensi', `Presensi Kelas ${sessionData.classId} (${sessionData.subjectName}) tanggal ${sessionData.date} berhasil disimpan.`);
  };

  const getAttendanceForSchedule = (scheduleId: string, date: string) => {
    return attendanceSessions.find((s) => s.scheduleId === scheduleId && s.date === date);
  };

  // Grades
  const saveStudentGrade = (gradeData: Omit<StudentGrade, 'id' | 'finalScore' | 'letterGrade' | 'status'>) => {
    const sc = gradeData.scores;
    // Default standard weights: Tugas 15%, Kuis 10%, Praktik 15%, Proyek 15%, PH 15%, PTS 15%, PAS 15% = 100%
    const finalScore = Math.round(
      sc.tugas * 0.15 +
      sc.kuis * 0.10 +
      sc.praktik * 0.15 +
      sc.proyek * 0.15 +
      sc.ph * 0.15 +
      sc.pts * 0.15 +
      sc.pas * 0.15
    );

    let letterGrade: 'A' | 'B' | 'C' | 'D' = 'B';
    if (finalScore >= 90) letterGrade = 'A';
    else if (finalScore >= 80) letterGrade = 'B';
    else if (finalScore >= 70) letterGrade = 'C';
    else letterGrade = 'D';

    const status: 'Tuntas' | 'Belum Tuntas' = finalScore >= 75 ? 'Tuntas' : 'Belum Tuntas';

    const existingIdx = grades.findIndex(
      (g) => g.studentId === gradeData.studentId && g.subjectCode === gradeData.subjectCode && g.semester === gradeData.semester
    );

    if (existingIdx >= 0) {
      setGrades((prev) => {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          ...gradeData,
          finalScore,
          letterGrade,
          status,
        };
        return next;
      });
    } else {
      const newGrade: StudentGrade = {
        ...gradeData,
        id: `GRD${Date.now()}`,
        finalScore,
        letterGrade,
        status,
      };
      setGrades((prev) => [...prev, newGrade]);
    }

    logAction('Simpan Nilai Siswa', 'Nilai', `Nilai ${gradeData.studentName} Mapel ${gradeData.subjectCode}: Akhir ${finalScore} (${letterGrade})`);
  };

  const saveBatchGrades = (gradesList: Partial<StudentGrade>[]) => {
    setGrades((prev) => {
      const next = [...prev];
      gradesList.forEach((g) => {
        if (!g.studentId || !g.subjectCode || !g.scores) return;
        const sc = g.scores;
        const finalScore = Math.round(
          (sc.tugas || 0) * 0.15 +
          (sc.kuis || 0) * 0.10 +
          (sc.praktik || 0) * 0.15 +
          (sc.proyek || 0) * 0.15 +
          (sc.ph || 0) * 0.15 +
          (sc.pts || 0) * 0.15 +
          (sc.pas || 0) * 0.15
        );
        let letterGrade: 'A' | 'B' | 'C' | 'D' = 'B';
        if (finalScore >= 90) letterGrade = 'A';
        else if (finalScore >= 80) letterGrade = 'B';
        else if (finalScore >= 70) letterGrade = 'C';
        else letterGrade = 'D';

        const status: 'Tuntas' | 'Belum Tuntas' = finalScore >= 75 ? 'Tuntas' : 'Belum Tuntas';

        const idx = next.findIndex(
          (item) => item.studentId === g.studentId && item.subjectCode === g.subjectCode
        );

        if (idx >= 0) {
          next[idx] = { ...next[idx], ...g, finalScore, letterGrade, status } as StudentGrade;
        } else {
          next.push({
            id: `GRD${Date.now()}_${Math.random()}`,
            studentId: g.studentId,
            studentName: g.studentName || '',
            classId: g.classId || '',
            subjectCode: g.subjectCode,
            subjectName: g.subjectName || '',
            teacherCode: g.teacherCode || '',
            academicYear: g.academicYear || settings.activeAcademicYear,
            semester: g.semester || settings.activeSemester,
            scores: sc,
            finalScore,
            letterGrade,
            status,
          });
        }
      });
      return next;
    });

    logAction('Simpan Nilai Massal', 'Nilai', `Memperbarui nilai massal untuk ${gradesList.length} entri siswa.`);
  };

  // Daily Scores per date tracking
  const saveDailyScoreBatch = (newScores: DailyScoreRecord[]) => {
    setDailyScores((prev) => {
      const next = [...prev];
      newScores.forEach((item) => {
        const idx = next.findIndex(
          (d) =>
            d.studentId === item.studentId &&
            d.subjectCode === item.subjectCode &&
            d.date === item.date &&
            d.assessmentType === item.assessmentType
        );
        if (idx >= 0) {
          next[idx] = item;
        } else {
          next.push(item);
        }
      });
      return next;
    });
  };

  // Violations & Tiered Guidance/Notification Flow:
  // - 15 points: Early guidance by Wali Kelas
  // - 25 points: System notification to assigned Guru BK
  // - > 30 points: Severe violation alert to Kepala Sekolah (and BK/Walas)
  const getStudentPoints = (studentId: string): number => {
    return violations
      .filter((v) => v.studentId === studentId)
      .reduce((sum, v) => sum + v.points, 0);
  };

  const getStudentViolationCategory = (points: number) => {
    if (points < 15) return { label: 'Normal (0–14 Poin)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', badge: 'Normal' };
    if (points < 25) return { label: 'Bimbingan Wali Kelas (15–24 Poin)', color: 'text-amber-700 bg-amber-50 border-amber-200 font-medium', badge: 'Bimbingan Walas' };
    if (points <= 30) return { label: 'Peringatan Guru BK (25–30 Poin)', color: 'text-orange-700 bg-orange-50 border-orange-200 font-semibold', badge: 'Perhatian BK' };
    return { label: 'Pelanggaran Parah / Kasus Khusus (> 30 Poin)', color: 'text-rose-700 bg-rose-50 border-rose-200 font-bold', badge: 'Kasus Parah' };
  };

  const addViolation = (recordData: Omit<ViolationRecord, 'id'>) => {
    const newId = `VIO${Date.now()}`;
    const newViolation: ViolationRecord = { ...recordData, id: newId };
    const updatedViolations = [newViolation, ...violations];
    setViolations(updatedViolations);

    // Calculate new total points for this student
    const newTotal = updatedViolations
      .filter((v) => v.studentId === recordData.studentId)
      .reduce((sum, v) => sum + v.points, 0);

    logAction(
      'Catat Pelanggaran Siswa',
      'Pelanggaran',
      `Pelanggaran dicatat: ${recordData.studentName} (${recordData.points} poin) - Total akumulasi: ${newTotal} poin.`
    );

    // Tier 1: Walas guidance alert (>= 15 points)
    if (newTotal >= 15 && newTotal < 25) {
      const notifId = `NOTIF_WALAS_${recordData.studentId}_15`;
      if (!notifications.some((n) => n.id === notifId)) {
        const walasNotif: SystemNotification = {
          id: notifId,
          title: `Bimbingan Awal Wali Kelas: ${recordData.studentName}`,
          message: `Siswa ${recordData.studentName} (Kelas ${recordData.classId}) mencapai ${newTotal} poin pelanggaran (>= 15 poin). Mohon dilakukan pembimbingan tahap awal oleh Wali Kelas.`,
          type: 'alert',
          targetRoles: ['wali_kelas'],
          targetClassId: recordData.classId,
          createdAt: new Date().toISOString(),
          read: false,
          actionLink: 'counseling',
        };
        setNotifications((prev) => [walasNotif, ...prev]);
      }
    }

    // Tier 2: Guru BK critical intervention alert (>= 25 points)
    if (newTotal >= 25 && newTotal <= 30) {
      const notifId = `NOTIF_BK_${recordData.studentId}_25`;
      if (!notifications.some((n) => n.id === notifId)) {
        const bkNotif: SystemNotification = {
          id: notifId,
          title: `Peringatan Kritis Guru BK: ${recordData.studentName}`,
          message: `Siswa ${recordData.studentName} (Kelas ${recordData.classId}) mendekati ambang batas kritis dengan ${newTotal} poin pelanggaran (>= 25 poin). Diperlukan pendampingan dan pembinaan konseling Guru BK.`,
          type: 'warning',
          targetRoles: ['guru_bk', 'wali_kelas'],
          targetClassId: recordData.classId,
          createdAt: new Date().toISOString(),
          read: false,
          actionLink: 'counseling',
        };
        setNotifications((prev) => [bkNotif, ...prev]);
      }
    }

    // Tier 3: Pelanggaran Parah (> 30 points) -> Automatic Kepsek notification!
    if (newTotal > 30) {
      const notifId = `NOTIF_KEPSEK_SEVERE_${recordData.studentId}`;
      if (!notifications.some((n) => n.id === notifId)) {
        const severeAlert: SystemNotification = {
          id: notifId,
          title: `Pelanggaran Parah (> 30 Poin): ${recordData.studentName}`,
          message: `Siswa ${recordData.studentName} (Kelas ${recordData.classId}) mencapai ${newTotal} poin pelanggaran. Sistem mengirim laporan prioritas tinggi ke Kepala Sekolah untuk tindak lanjut koordinasi pimpinan.`,
          type: 'alert',
          targetRoles: ['kepala_sekolah', 'guru_bk', 'wali_kelas'],
          targetClassId: recordData.classId,
          createdAt: new Date().toISOString(),
          read: false,
          actionLink: 'counseling',
        };
        setNotifications((prev) => [severeAlert, ...prev]);
      }
    }
  };

  const deleteViolation = (id: string) => {
    const target = violations.find((v) => v.id === id);
    setViolations((prev) => prev.filter((v) => v.id !== id));
    logAction('Hapus Data Pelanggaran', 'Pelanggaran', `Menghapus pelanggaran ID ${id} (${target?.studentName})`);
  };

  // Master Violation Rules (Kategori Poin Pelanggaran)
  const addViolationRule = (rule: ViolationRule) => {
    setViolationRules((prev) => [...prev, rule]);
    logAction('Tambah Master Pelanggaran', 'Pelanggaran', `Menambahkan master aturan: ${rule.code} - ${rule.name} (${rule.points} poin)`);
  };

  const updateViolationRule = (id: string, updates: Partial<ViolationRule>) => {
    setViolationRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    logAction('Ubah Master Pelanggaran', 'Pelanggaran', `Memperbarui master aturan ID ${id}`);
  };

  const deleteViolationRule = (id: string) => {
    const target = violationRules.find((r) => r.id === id);
    setViolationRules((prev) => prev.filter((r) => r.id !== id));
    logAction('Hapus Master Pelanggaran', 'Pelanggaran', `Menghapus master aturan ${target?.name || id}`);
  };

  const resetDefaultViolationRules = () => {
    const fresh = SchoolStorage.getFreshDefaultViolationRules();
    setViolationRules(fresh);
    SchoolStorage.saveViolationRules(fresh);
    logAction('Reset Master Pelanggaran', 'Pelanggaran', 'Memulihkan 10 master aturan pelanggaran standar.');
  };

  const importViolationRulesBatch = (rules: ViolationRule[]) => {
    let added = 0;
    const existingCodes = new Set(violationRules.map((r) => r.code.toUpperCase()));
    const toAdd: ViolationRule[] = [];
    rules.forEach((r) => {
      if (!existingCodes.has(r.code.toUpperCase())) {
        toAdd.push(r);
        existingCodes.add(r.code.toUpperCase());
        added++;
      }
    });
    if (toAdd.length > 0) {
      setViolationRules((prev) => [...prev, ...toAdd]);
      logAction('Import Master Pelanggaran Excel', 'Import', `Berhasil menambahkan ${added} master aturan pelanggaran.`);
    }
    return { added };
  };

  // Counseling BK records
  // When counseling is completed ('Selesai'), automatic notification sent to Kepala Sekolah
  const addCounselingRecord = (recordData: Omit<CounselingRecord, 'id'>) => {
    const newId = `CSL${Date.now()}`;
    const newRecord: CounselingRecord = { ...recordData, id: newId };
    setCounselingRecords((prev) => [newRecord, ...prev]);
    logAction('Catat Pembinaan BK', 'BK', `Pencatatan pembinaan siswa ${recordData.studentName} status: ${recordData.status}`);

    if (recordData.status === 'Selesai') {
      const kepsekNotif: SystemNotification = {
        id: `NOTIF_KEPSEK_RESOLVED_${Date.now()}`,
        title: `Laporan Bimbingan Selesai: ${recordData.studentName}`,
        message: `Pembinaan siswa ${recordData.studentName} (Kelas ${recordData.classId}) telah diselesaikan oleh ${recordData.counselorName}. Tindak lanjut: ${recordData.followUp || 'Pemantauan berkala'}.`,
        type: 'info',
        targetRoles: ['kepala_sekolah'],
        targetClassId: recordData.classId,
        createdAt: new Date().toISOString(),
        read: false,
        actionLink: 'counseling',
      };
      setNotifications((prev) => [kepsekNotif, ...prev]);
    }
  };

  const updateCounselingRecord = (id: string, updates: Partial<CounselingRecord>) => {
    const current = counselingRecords.find((c) => c.id === id);
    setCounselingRecords((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    logAction('Perbarui Pembinaan BK', 'BK', `Memperbarui tindak lanjut konseling BK ID ${id}`);

    if (updates.status === 'Selesai' && current) {
      const kepsekNotif: SystemNotification = {
        id: `NOTIF_KEPSEK_RESOLVED_${Date.now()}`,
        title: `Laporan Bimbingan Selesai: ${current.studentName}`,
        message: `Pembinaan siswa ${current.studentName} (Kelas ${current.classId}) telah diselesaikan oleh ${current.counselorName}. Tindak lanjut: ${updates.followUp || current.followUp || 'Selesai dan tertib'}.`,
        type: 'info',
        targetRoles: ['kepala_sekolah'],
        targetClassId: current.classId,
        createdAt: new Date().toISOString(),
        read: false,
        actionLink: 'counseling',
      };
      setNotifications((prev) => [kepsekNotif, ...prev]);
    }
  };

  // Priority BK Students list (> 30 points)
  const priorityBkStudents = useMemo(() => {
    const pointsMap = new Map<string, { total: number; list: ViolationRecord[] }>();
    violations.forEach((v) => {
      const cur = pointsMap.get(v.studentId) || { total: 0, list: [] };
      cur.total += v.points;
      cur.list.push(v);
      pointsMap.set(v.studentId, cur);
    });

    const result: { student: Student; totalPoints: number; violations: ViolationRecord[]; latestCounseling?: CounselingRecord }[] = [];

    pointsMap.forEach((val, studentId) => {
      if (val.total > 30) {
        const student = students.find((s) => s.id === studentId);
        if (student) {
          const latestCounseling = counselingRecords.find((c) => c.studentId === studentId);
          result.push({
            student,
            totalPoints: val.total,
            violations: val.list,
            latestCounseling,
          });
        }
      }
    });

    // Sort descending by total points
    return result.sort((a, b) => b.totalPoints - a.totalPoints);
  }, [violations, students, counselingRecords]);

  // Attitudes
  const saveAttitude = (data: Omit<AttitudeAssessment, 'id'>) => {
    const newRecord: AttitudeAssessment = {
      ...data,
      id: `ATT_${Date.now()}`,
    };
    setAttitudes((prev) => [newRecord, ...prev]);
    logAction('Penilaian Sikap Siswa', 'Master', `Mencatat evaluasi perkembangan sikap siswa ${data.studentName}`);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(
      (n) => !n.read && (n.targetRoles.includes(activeRole) || activeRole === 'admin_operator')
    ).length;
  }, [notifications, activeRole]);

  return (
    <SchoolContext.Provider
      value={{
        settings,
        updateSettings,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        deleteStudentsBatch,
        deleteStudentsByGrade,
        deleteAllStudents,
        resetDefaultStudents,
        importStudentsBatch,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        deleteTeachersBatch,
        deleteAllTeachers,
        resetDefaultTeachers,
        importTeachersBatch,
        importWaliKelasBatch,
        classes: classes.map((c) => ({
          ...c,
          studentCount: students.filter((s) => s.classId === c.classId).length,
        })),
        addClass,
        updateClass,
        deleteClass,
        resetDefaultClasses,
        importClassesBatch,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        deleteSubjectsBatch,
        deleteAllSubjects,
        resetDefaultSubjects,
        importSubjectsBatch,
        schedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        deleteSchedulesByClass,
        deleteAllSchedules,
        resetDefaultSchedules,
        checkScheduleConflict,
        importSchedulesBatch,
        attendanceSessions,
        saveAttendanceSession,
        getAttendanceForSchedule,
        grades,
        saveStudentGrade,
        saveBatchGrades,
        dailyScores,
        saveDailyScoreBatch,
        violations,
        addViolation,
        deleteViolation,
        getStudentPoints,
        getStudentViolationCategory,
        violationRules,
        addViolationRule,
        updateViolationRule,
        deleteViolationRule,
        resetDefaultViolationRules,
        importViolationRulesBatch,
        counselingRecords,
        addCounselingRecord,
        updateCounselingRecord,
        priorityBkStudents,
        attitudes,
        saveAttitude,
        notifications,
        markNotificationRead,
        unreadNotificationCount,
        activityLogs,
        logAction,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) throw new Error('useSchool must be used within a SchoolProvider');
  return context;
};
