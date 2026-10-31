export type UserRole = 'admin_operator' | 'kepala_sekolah' | 'guru_mapel' | 'wali_kelas' | 'guru_bk';

export interface UserAccount {
  id: string;
  username: string;
  email?: string;
  name: string;
  role: UserRole; // primary role
  availableRoles: UserRole[]; // for multi-role guru (e.g. ['guru_mapel', 'wali_kelas'])
  classId?: string; // assigned homeroom if wali_kelas
  teacherCode?: string; // kode guru mapel (e.g. G01)
  subject?: string; // mata pelajaran utama
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
}

export interface Student {
  id: string; // Unique student ID, e.g. STD001
  nis: string; // Nomor Induk Siswa (e.g. 24001)
  nisn: string; // 10-digit national student ID
  name: string;
  classId: string; // e.g. '7A', '8B', '9C'
  gender: 'L' | 'P';
  status: 'Aktif' | 'Mutasi' | 'Lulus' | 'Nonaktif';
}

export interface Teacher {
  id: string;
  username: string;
  name: string;
  nip?: string;
  role: UserRole;
  classId?: string; // assigned homeroom if wali kelas
  teacherCode: string; // Kode Guru Mapel, e.g. "G01", "G02"
  subject: string; // Mata pelajaran yang diampu
  status: 'Aktif' | 'Cuti' | 'Nonaktif';
  phone?: string;
  email?: string;
}

export interface ClassRoom {
  classId: string; // e.g. "7A", "7B", ..., "9H"
  name: string; // e.g. "Kelas 7A"
  gradeLevel: '7' | '8' | '9';
  homeroomTeacherId?: string; // teacherCode or username of wali kelas
  homeroomTeacherName?: string;
  studentCount: number;
  academicYear: string;
  status: 'Aktif' | 'Nonaktif';
}

export interface Subject {
  code: string; // Kode Mapel, e.g. "BIN", "MAT", "IPA"
  name: string; // e.g. "Bahasa Indonesia"
  group: 'Muatan Nasional' | 'Muatan Kewilayahan' | 'Muatan Lokal';
  hoursPerWeek: number;
  passingGrade: number; // KKM, e.g. 75
  status: 'Aktif' | 'Nonaktif';
}

export interface ScheduleItem {
  id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  period: number; // Jam ke 1 - 8
  startTime: string; // e.g. "07:30"
  endTime: string; // e.g. "08:50"
  classId: string; // e.g. "7A"
  teacherCode: string; // e.g. "G01"
  teacherName: string;
  subjectCode: string; // e.g. "BIN"
  subjectName: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
}

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

export interface AttendanceRecord {
  id: string;
  scheduleId?: string;
  date: string; // YYYY-MM-DD
  classId: string;
  subjectCode: string;
  teacherCode: string;
  period: number;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceSession {
  id: string;
  scheduleId: string;
  date: string; // YYYY-MM-DD
  classId: string;
  subjectCode: string;
  subjectName: string;
  teacherCode: string;
  teacherName: string;
  period: number;
  topic: string;
  submittedAt: string;
  records: Record<string, AttendanceStatus>; // studentId -> status
  notes?: string;
}

export interface GradeComponent {
  id: string;
  name: string;
  code: 'Tugas' | 'Kuis' | 'Praktik' | 'Proyek' | 'PH' | 'PTS' | 'PAS';
  weight: number; // percentage (e.g. 15, 10, etc. sum = 100)
}

export interface StudentGrade {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  subjectCode: string;
  subjectName: string;
  teacherCode: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  scores: {
    tugas: number;
    kuis: number;
    praktik: number;
    proyek: number;
    ph: number;
    pts: number;
    pas: number;
  };
  finalScore: number;
  letterGrade: 'A' | 'B' | 'C' | 'D';
  status: 'Tuntas' | 'Belum Tuntas';
}

export interface AttitudeAssessment {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: 'Guru Mapel' | 'Wali Kelas';
  date: string;
  discipline: 'A' | 'B' | 'C' | 'D';
  responsibility: 'A' | 'B' | 'C' | 'D';
  honesty: 'A' | 'B' | 'C' | 'D';
  cooperation: 'A' | 'B' | 'C' | 'D';
  politeness: 'A' | 'B' | 'C' | 'D';
  care: 'A' | 'B' | 'C' | 'D';
  activeness: 'A' | 'B' | 'C' | 'D';
  notes: string;
  recommendation?: string;
}

export interface ViolationRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  date: string;
  category: 'Kedisiplinan' | 'Ketertiban' | 'Kerapian' | 'Sikap & Etika' | 'Berat';
  violationType: string;
  description: string;
  points: number;
  reporterCode: string;
  reporterName: string;
  notes?: string;
}

export type CounselingStatus = 'Belum Ditangani' | 'Sedang Dalam Pembinaan' | 'Monitoring' | 'Selesai';

export interface CounselingRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  counselorId: string;
  counselorName: string;
  date: string;
  totalPoints: number;
  identifiedProblem: string;
  counselingMethod: string; // e.g. "Wawancara Konseling Individu & Pemanggilan Orang Tua"
  counselingResult: string;
  actionPlan: string;
  progressNotes: string;
  status: CounselingStatus;
  confidential: boolean; // default true (hanya BK & Kepsek)
}

export interface SchoolSettings {
  schoolName: string;
  npsn: string;
  accreditation: string;
  appName: string;
  appSubtitle: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  activeAcademicYear: string; // e.g. "2026/2027"
  activeSemester: 'Ganjil' | 'Genap';
  principalName: string;
  principalNip: string;
  logoSchoolUrl: string;
  logoAppUrl: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  targetRoles: UserRole[];
  targetClassId?: string;
  targetTeacherCode?: string;
  createdAt: string;
  read: boolean;
  actionLink?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category: 'Absensi' | 'Nilai' | 'Pelanggaran' | 'BK' | 'Master' | 'Import' | 'Pengaturan';
  details: string;
}
