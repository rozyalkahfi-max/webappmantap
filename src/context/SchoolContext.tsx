import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Student,
  Teacher,
  ClassRoom,
  Subject,
  ScheduleItem,
  AttendanceSession,
  StudentGrade,
  AttitudeAssessment,
  ViolationRecord,
  CounselingRecord,
  SchoolSettings,
  SystemNotification,
  ActivityLog,
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

  classes: ClassRoom[];
  addClass: (c: ClassRoom) => void;
  updateClass: (classId: string, updates: Partial<ClassRoom>) => void;
  deleteClass: (classId: string) => void;
  resetDefaultClasses: () => void;

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
  checkScheduleConflict: (item: Omit<ScheduleItem, 'id'>, excludeId?: string) => ScheduleConflict;
  importSchedulesBatch: (newSchedules: any[]) => { added: number };

  attendanceSessions: AttendanceSession[];
  saveAttendanceSession: (session: Omit<AttendanceSession, 'id' | 'submittedAt'>) => void;
  getAttendanceForSchedule: (scheduleId: string, date: string) => AttendanceSession | undefined;

  grades: StudentGrade[];
  saveStudentGrade: (grade: Omit<StudentGrade, 'id' | 'finalScore' | 'letterGrade' | 'status'>) => void;
  saveBatchGrades: (gradesList: Partial<StudentGrade>[]) => void;

  violations: ViolationRecord[];
  addViolation: (record: Omit<ViolationRecord, 'id'>) => void;
  deleteViolation: (id: string) => void;
  getStudentPoints: (studentId: string) => number;
  getStudentViolationCategory: (points: number) => { label: string; color: string; badge: string };

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
  const { currentUser, activeRole, createUser, allUsers } = useAuth();

  const [settings, setSettings] = useState<SchoolSettings>(() => SchoolStorage.getSettings());
  const [students, setStudents] = useState<Student[]>(() => SchoolStorage.getStudents());
  const [teachers, setTeachers] = useState<Teacher[]>(() => SchoolStorage.getTeachers());
  const [classes, setClasses] = useState<ClassRoom[]>(() => SchoolStorage.getClasses());
  const [subjects, setSubjects] = useState<Subject[]>(() => SchoolStorage.getSubjects());
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => SchoolStorage.getSchedules());
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => SchoolStorage.getAttendanceSessions());
  const [grades, setGrades] = useState<StudentGrade[]>(() => SchoolStorage.getGrades());
  const [violations, setViolations] = useState<ViolationRecord[]>(() => SchoolStorage.getViolations());
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

    logAction('Tambah Data Guru', 'Master', `Menambahkan guru baru ${newTeacher.name} (Kode: ${newTeacher.teacherCode})`);
    return newTeacher;
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
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

    newTeachers.forEach((row) => {
      const lowerUser = row.username.toLowerCase();
      if (existingMap.has(lowerUser)) {
        // Multi-assignment merge:
        const t = existingMap.get(lowerUser)!;
        if (row.classId && !t.classId) t.classId = row.classId;
        if (row.role === 'wali_kelas') t.role = 'wali_kelas';
        merged++;
      } else {
        const newT: Teacher = {
          id: `TCH${String(updatedList.length + 1).padStart(3, '0')}`,
          username: row.username,
          name: row.name,
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
    logAction('Import Guru Excel Massal', 'Import', `Import guru selesai: ${added} akun baru dibuat, ${merged} penugasan digabungkan.`);
    return { added, merged };
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

  // Violations & Automatic BK Trigger (> 30 Points)
  const getStudentPoints = (studentId: string): number => {
    return violations
      .filter((v) => v.studentId === studentId)
      .reduce((sum, v) => sum + v.points, 0);
  };

  const getStudentViolationCategory = (points: number) => {
    if (points <= 10) return { label: 'Normal (0–10 Poin)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', badge: 'Normal' };
    if (points <= 20) return { label: 'Perhatian (11–20 Poin)', color: 'text-amber-700 bg-amber-50 border-amber-200', badge: 'Perhatian' };
    if (points <= 30) return { label: 'Peringatan (21–30 Poin)', color: 'text-orange-700 bg-orange-50 border-orange-200', badge: 'Peringatan' };
    return { label: 'Pembinaan BK (> 30 Poin)', color: 'text-rose-700 bg-rose-50 border-rose-200 font-semibold', badge: 'Prioritas BK' };
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

    // Automatic BK Detection Trigger if > 30 points
    if (newTotal > 30) {
      // Check if alert notification already sent
      const notifId = `NOTIF_BK_${recordData.studentId}`;
      const existingNotif = notifications.find((n) => n.id === notifId);
      if (!existingNotif) {
        const bkAlert: SystemNotification = {
          id: notifId,
          title: `Deteksi Otomatis BK: ${recordData.studentName}`,
          message: `Siswa ${recordData.studentName} (Kelas ${recordData.classId}) mencapai ${newTotal} poin pelanggaran (>30 poin). Otomatis masuk ke daftar Prioritas Pembinaan BK.`,
          type: 'alert',
          targetRoles: ['guru_bk', 'wali_kelas', 'kepala_sekolah'],
          targetClassId: recordData.classId,
          createdAt: new Date().toISOString(),
          read: false,
          actionLink: 'counseling',
        };
        setNotifications((prev) => [bkAlert, ...prev]);
      }
    }
  };

  const deleteViolation = (id: string) => {
    const target = violations.find((v) => v.id === id);
    setViolations((prev) => prev.filter((v) => v.id !== id));
    logAction('Hapus Data Pelanggaran', 'Pelanggaran', `Menghapus pelanggaran ID ${id} (${target?.studentName})`);
  };

  // Counseling BK records
  const addCounselingRecord = (recordData: Omit<CounselingRecord, 'id'>) => {
    const newId = `CSL${Date.now()}`;
    const newRecord: CounselingRecord = { ...recordData, id: newId };
    setCounselingRecords((prev) => [newRecord, ...prev]);
    logAction('Catat Pembinaan BK', 'BK', `Pencatatan pembinaan siswa ${recordData.studentName} status: ${recordData.status}`);
  };

  const updateCounselingRecord = (id: string, updates: Partial<CounselingRecord>) => {
    setCounselingRecords((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    logAction('Perbarui Pembinaan BK', 'BK', `Memperbarui tindak lanjut konseling BK ID ${id}`);
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
        classes: classes.map((c) => ({
          ...c,
          studentCount: students.filter((s) => s.classId === c.classId).length,
        })),
        addClass,
        updateClass,
        deleteClass,
        resetDefaultClasses,
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
        checkScheduleConflict,
        importSchedulesBatch,
        attendanceSessions,
        saveAttendanceSession,
        getAttendanceForSchedule,
        grades,
        saveStudentGrade,
        saveBatchGrades,
        violations,
        addViolation,
        deleteViolation,
        getStudentPoints,
        getStudentViolationCategory,
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
