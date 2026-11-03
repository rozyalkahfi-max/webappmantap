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
  ViolationRule,
  DailyScoreRecord,
  CounselingRecord,
  SchoolSettings,
  SystemNotification,
  ActivityLog,
  UserAccount,
  BKAssignment,
} from '../types';

const STORAGE_KEY_PREFIX = 'SIMANTAP_LMS_';

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'SMP Negeri 1 Mantap Unggulan',
  npsn: '20261945',
  accreditation: 'A (Unggul)',
  appName: 'SI MANTAP LMS',
  appSubtitle: 'Sistem Informasi Manajemen Absensi & Nilai Pembelajaran Terintegrasi Antar Pelajar',
  address: 'Jl. Pendidikan Karakter Bangsa No. 45, Kompleks Pendidikan Terpadu, Jakarta',
  phone: '(021) 7890-1234',
  email: 'info@smpn1mantap.sch.id',
  website: 'https://smpn1mantap.sch.id',
  activeAcademicYear: '2026/2027',
  activeSemester: 'Ganjil',
  principalName: 'Dr. H. Mulyono, M.Pd',
  principalNip: '19720415 199803 1 004',
  logoSchoolUrl: '',
  logoAppUrl: '',
};

export const DEFAULT_SUBJECTS: Subject[] = [
  { code: 'PAI', name: 'Pendidikan Agama dan Budi Pekerti', group: 'Muatan Nasional', hoursPerWeek: 3, passingGrade: 75, status: 'Aktif' },
  { code: 'PPKN', name: 'Pendidikan Pancasila dan Kewarganegaraan', group: 'Muatan Nasional', hoursPerWeek: 3, passingGrade: 75, status: 'Aktif' },
  { code: 'BIN', name: 'Bahasa Indonesia', group: 'Muatan Nasional', hoursPerWeek: 6, passingGrade: 75, status: 'Aktif' },
  { code: 'MAT', name: 'Matematika', group: 'Muatan Nasional', hoursPerWeek: 5, passingGrade: 75, status: 'Aktif' },
  { code: 'IPA', name: 'Ilmu Pengetahuan Alam', group: 'Muatan Nasional', hoursPerWeek: 5, passingGrade: 75, status: 'Aktif' },
  { code: 'IPS', name: 'Ilmu Pengetahuan Sosial', group: 'Muatan Nasional', hoursPerWeek: 4, passingGrade: 75, status: 'Aktif' },
  { code: 'BIG', name: 'Bahasa Inggris', group: 'Muatan Nasional', hoursPerWeek: 4, passingGrade: 75, status: 'Aktif' },
  { code: 'SEN', name: 'Seni Budaya', group: 'Muatan Kewilayahan', hoursPerWeek: 3, passingGrade: 75, status: 'Aktif' },
  { code: 'PJK', name: 'Pendidikan Jasmani, Olahraga & Kesehatan', group: 'Muatan Kewilayahan', hoursPerWeek: 3, passingGrade: 75, status: 'Aktif' },
  { code: 'INF', name: 'Informatika', group: 'Muatan Nasional', hoursPerWeek: 2, passingGrade: 75, status: 'Aktif' },
  { code: 'PRA', name: 'Prakarya', group: 'Muatan Kewilayahan', hoursPerWeek: 2, passingGrade: 75, status: 'Aktif' },
  { code: 'BDA', name: 'Bahasa Daerah', group: 'Muatan Lokal', hoursPerWeek: 2, passingGrade: 75, status: 'Aktif' },
];

export const DEFAULT_VIOLATION_RULES: ViolationRule[] = [
  { id: 'VR001', code: 'PLG01', category: 'Ringan', name: 'Terlambat masuk sekolah > 15 menit', points: 5, description: 'Tiba di gerbang sekolah setelah bel masuk dibunyikan.' },
  { id: 'VR002', code: 'PLG02', category: 'Ringan', name: 'Seragam tidak sesuai ketentuan atribut', points: 5, description: 'Tidak mengenakan atribut lengkap seperti dasi, sabuk, atau kaos kaki.' },
  { id: 'VR003', code: 'PLG03', category: 'Ringan', name: 'Rambut panjang / tidak rapi (siswa putra)', points: 8, description: 'Panjang rambut melebihi kerah kemeja seragam sekolah.' },
  { id: 'VR004', code: 'PLG04', category: 'Sedang', name: 'Meninggalkan kelas saat jam pelajaran (Membolos Jam Pelajaran)', points: 15, description: 'Keluar kelas tanpa izin guru pengampu saat KBM berlangsung.' },
  { id: 'VR005', code: 'PLG05', category: 'Sedang', name: 'Membawa gawai tanpa izin saat ujian/KBM', points: 15, description: 'Mengaktifkan smartphone di dalam kelas saat jam belajar.' },
  { id: 'VR006', code: 'PLG06', category: 'Sedang', name: 'Merusak fasilitas / sarana prasarana sekolah', points: 20, description: 'Melakukan vandalisme atau mencoret meja/kursi/dinding sekolah.' },
  { id: 'VR007', code: 'PLG07', category: 'Berat', name: 'Terlibat perkelahian / pertengkaran fisik', points: 25, description: 'Terlibat kontak fisik yang mengganggu ketertiban umum sekolah.' },
  { id: 'VR008', code: 'PLG08', category: 'Berat', name: 'Melakukan tindakan perundungan (Bullying)', points: 35, description: 'Tindakan intimidasi fisik atau psikis berulang terhadap peserta didik lain.' },
  { id: 'VR009', code: 'PLG09', category: 'Berat', name: 'Membawa barang terlarang ke lingkungan sekolah', points: 50, description: 'Membawa benda berbahaya atau materi terlarang ke sekolah.' },
];

// 24 Classes: 7A - 7H, 8A - 8H, 9A - 9H
export const CLASS_IDS: string[] = [
  '7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H',
  '8A', '8B', '8C', '8D', '8E', '8F', '8G', '8H',
  '9A', '9B', '9C', '9D', '9E', '9F', '9G', '9H',
];

export const ADMIN_TEACHER: Teacher = {
  id: 'TCH_ADM',
  username: 'admin',
  name: 'Admin Operator IT',
  nip: '19900101 201501 1 001',
  role: 'admin_operator',
  teacherCode: 'ADM',
  subject: 'Operator IT & Administrator',
  status: 'Aktif',
  email: 'admin@smpn1mantap.sch.id',
  phone: '08123456000',
};

export const ADMIN_USER: UserAccount = {
  id: 'USR001',
  username: 'admin',
  name: 'Admin Operator IT',
  role: 'admin_operator',
  availableRoles: ['admin_operator'],
  isActive: true,
  email: 'admin@smpn1mantap.sch.id',
};

// Generator for 50 teachers (preserved as reference / optional sample data)
function generateDefaultTeachers(): Teacher[] {
  const teacherData = [
    { name: 'Dr. H. Mulyono, M.Pd', nip: '19720415 199803 1 004', subject: 'Manajemen Sekolah', code: 'G00', role: 'kepala_sekolah' as const, username: 'kepsek.mulyono' },
    { name: 'Dra. Hj. Siti Rahmawati, M.Pd', nip: '19750821 200003 2 001', subject: 'Bahasa Indonesia', code: 'G01', role: 'wali_kelas' as const, classId: '7A', username: 'guru.sitirahmawati' },
    { name: 'Budi Hermawan, S.Pd', nip: '19810312 200604 1 008', subject: 'Matematika', code: 'G02', role: 'wali_kelas' as const, classId: '7B', username: 'guru.budihermawan' },
    { name: 'Nurul Faizah, S.Pd., M.Si', nip: '19850614 200902 2 003', subject: 'Ilmu Pengetahuan Alam', code: 'G03', role: 'wali_kelas' as const, classId: '7C', username: 'guru.nurulfaizah' },
    { name: 'H. Ahmad Fauzi, S.Ag., M.Pd.I', nip: '19780105 200312 1 002', subject: 'Pendidikan Agama dan Budi Pekerti', code: 'G04', role: 'wali_kelas' as const, classId: '7D', username: 'guru.ahmadfauzi' },
    { name: 'Dewi Lestari, S.Pd', nip: '19871110 201001 2 009', subject: 'Bahasa Inggris', code: 'G05', role: 'wali_kelas' as const, classId: '7E', username: 'guru.dewilestari' },
    { name: 'Hendro Wibowo, S.Pd., M.Pd', nip: '19830522 200801 1 007', subject: 'Ilmu Pengetahuan Sosial', code: 'G06', role: 'wali_kelas' as const, classId: '7F', username: 'guru.hendrowibowo' },
    { name: 'Rina Kusuma Astuti, S.Pd', nip: '19890218 201403 2 005', subject: 'Pendidikan Pancasila dan Kewarganegaraan', code: 'G07', role: 'wali_kelas' as const, classId: '7G', username: 'guru.rinakusuma' },
    { name: 'Agus Salim, S.Pd', nip: '19820930 200701 1 012', subject: 'Pendidikan Jasmani, Olahraga & Kesehatan', code: 'G08', role: 'wali_kelas' as const, classId: '7H', username: 'guru.agussalim' },
    { name: 'Sri Wahyuni, S.Pd., M.Hum', nip: '19760719 200112 2 002', subject: 'Bahasa Indonesia', code: 'G09', role: 'wali_kelas' as const, classId: '8A', username: 'guru.sriwahyuni' },
    { name: 'Didik Prasetyo, M.Kom', nip: '19860408 201001 1 015', subject: 'Informatika', code: 'G10', role: 'wali_kelas' as const, classId: '8B', username: 'guru.didikprasetyo' },
    { name: 'Eka Putri Handayani, S.Pd', nip: '19900825 201502 2 004', subject: 'Matematika', code: 'G11', role: 'wali_kelas' as const, classId: '8C', username: 'guru.ekaputri' },
    { name: 'Fajar Nugroho, S.Pd', nip: '19841203 200901 1 009', subject: 'Ilmu Pengetahuan Alam', code: 'G12', role: 'wali_kelas' as const, classId: '8D', username: 'guru.fajarnugroho' },
    { name: 'Ratna Sari Dewi, S.Pd', nip: '19880517 201101 2 011', subject: 'Seni Budaya', code: 'G13', role: 'wali_kelas' as const, classId: '8E', username: 'guru.ratnasari' },
    { name: 'Tri Gunawan, S.Pd', nip: '19800624 200501 1 006', subject: 'Bahasa Daerah', code: 'G14', role: 'wali_kelas' as const, classId: '8F', username: 'guru.trigunawan' },
    { name: 'Drs. Bambang Irawan, M.Pd', nip: '19740915 199903 1 003', subject: 'Bimbingan Konseling', code: 'G15', role: 'guru_bk' as const, username: 'guru.bambangbk' },
    { name: 'Siti Aminah, S.Pd', nip: '19861012 201001 2 018', subject: 'Bimbingan Konseling', code: 'G16', role: 'guru_bk' as const, username: 'guru.sitiaminahbk' },
    { name: 'Drs. Sugeng Riyadi, M.Pd', nip: '19730214 199802 1 005', subject: 'Ilmu Pengetahuan Sosial', code: 'G17', role: 'wali_kelas' as const, classId: '8G', username: 'guru.sugengriyadi' },
    { name: 'Endang Sulistiyani, S.Pd', nip: '19790411 200312 2 006', subject: 'Prakarya', code: 'G18', role: 'wali_kelas' as const, classId: '8H', username: 'guru.endangsulistiyani' },
    { name: 'Wahyu Triyono, S.Pd', nip: '19820120 200604 1 011', subject: 'Matematika', code: 'G19', role: 'wali_kelas' as const, classId: '9A', username: 'guru.wahyutriyono' },
    { name: 'Indah Permatasari, S.Pd', nip: '19870914 201101 2 014', subject: 'Bahasa Inggris', code: 'G20', role: 'wali_kelas' as const, classId: '9B', username: 'guru.indahpermatasari' },
    { name: 'H. Joko Susilo, M.Pd', nip: '19770809 200212 1 007', subject: 'Ilmu Pengetahuan Alam', code: 'G21', role: 'wali_kelas' as const, classId: '9C', username: 'guru.jokosusilo' },
    { name: 'Maya Anggraini, S.Pd', nip: '19910304 201602 2 008', subject: 'Bahasa Indonesia', code: 'G22', role: 'wali_kelas' as const, classId: '9D', username: 'guru.mayaanggraini' },
    { name: 'Kurniawan, S.Or', nip: '19851128 200903 1 005', subject: 'Pendidikan Jasmani, Olahraga & Kesehatan', code: 'G23', role: 'wali_kelas' as const, classId: '9E', username: 'guru.kurniawan' },
    { name: 'Dra. Retno Palupi', nip: '19710526 199703 2 004', subject: 'Pendidikan Pancasila dan Kewarganegaraan', code: 'G24', role: 'wali_kelas' as const, classId: '9F', username: 'guru.retnopalupi' },
    { name: 'Lukman Hakim, M.Pd.I', nip: '19830716 200801 1 013', subject: 'Pendidikan Agama dan Budi Pekerti', code: 'G25', role: 'wali_kelas' as const, classId: '9G', username: 'guru.lukmanhakim' },
    { name: 'Yunita Sari, S.Pd', nip: '19891209 201402 2 010', subject: 'Ilmu Pengetahuan Sosial', code: 'G26', role: 'wali_kelas' as const, classId: '9H', username: 'guru.yunitasari' },
    { name: 'Admin Operator IT', nip: '19900101 201501 1 001', subject: 'Operator IT', code: 'ADM', role: 'admin_operator' as const, username: 'admin' },
  ];

  return teacherData.map((t, idx) => ({
    id: `TCH${String(idx + 1).padStart(3, '0')}`,
    username: t.username,
    name: t.name,
    nip: t.nip,
    role: t.role,
    classId: (t as any).classId,
    teacherCode: t.code,
    subject: t.subject,
    status: 'Aktif',
    email: `${t.username}@smpn1mantap.sch.id`,
    phone: `08123456${String(100 + idx)}`,
  }));
}

// 708 Students generator (24 classes x 29.5 average ~ 708 total)
const FIRST_NAMES_MALE = [
  'Ahmad', 'Bagus', 'Candra', 'Daffa', 'Dimas', 'Eko', 'Fajar', 'Galih', 'Hafiz', 'Ihsan',
  'Joko', 'Kevin', 'Lutfi', 'Muhammad', 'Naufal', 'Oki', 'Panji', 'Rafi', 'Rizky', 'Satria',
  'Tegar', 'Wahyu', 'Yoga', 'Zidan', 'Arif', 'Bayu', 'Danu', 'Faris', 'Gibran', 'Ilham'
];
const FIRST_NAMES_FEMALE = [
  'Anindya', 'Alya', 'Bella', 'Cantika', 'Citra', 'Dina', 'Erina', 'Farah', 'Gita', 'Hana',
  'Indah', 'Intan', 'Jessica', 'Kayla', 'Lestari', 'Melati', 'Nabila', 'Putri', 'Rania', 'Salma',
  'Tania', 'Tiara', 'Vania', 'Wulan', 'Zahra', 'Adelia', 'Bunga', 'Clarissa', 'Felia', 'Ghaida'
];
const LAST_NAMES = [
  'Pratama', 'Nugraha', 'Wijaya', 'Kusuma', 'Saputra', 'Lestari', 'Putri', 'Santoso', 'Ramadhan',
  'Hidayat', 'Firmansyah', 'Wibowo', 'Prasetyo', 'Siregar', 'Harahap', 'Nasution', 'Suryani',
  'Wulandari', 'Utami', 'Setiawan', 'Kurniawan', 'Mahendra', 'Suharto', 'Yuliana', 'Permadi'
];

function generate708Students(): Student[] {
  const students: Student[] = [];
  let currentId = 1;

  // Target exactly 708 students across 24 classes:
  // 12 classes with 30 students (360) + 12 classes with 29 students (348) = 708 students!
  CLASS_IDS.forEach((cId, classIndex) => {
    const countForClass = classIndex % 2 === 0 ? 30 : 29;
    for (let i = 1; i <= countForClass; i++) {
      const isMale = (currentId + i) % 2 === 0;
      const firstNames = isMale ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE;
      const firstName = firstNames[(currentId * 7 + i * 3) % firstNames.length];
      const lastName = LAST_NAMES[(currentId * 11 + i * 5) % LAST_NAMES.length];
      const fullName = `${firstName} ${lastName}`;

      const nisNum = 24000 + currentId;
      const nisnNum = `008${String(1000000 + currentId).slice(1)}`;

      students.push({
        id: `STD${String(currentId).padStart(4, '0')}`,
        nis: String(nisNum),
        nisn: nisnNum,
        name: fullName,
        classId: cId,
        gender: isMale ? 'L' : 'P',
        status: 'Aktif',
      });

      currentId++;
    }
  });

  return students;
}

// Generate Schedule for 24 classes
function generateDefaultSchedule(teachers: Teacher[]): ScheduleItem[] {
  const schedule: ScheduleItem[] = [];
  const days: ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat')[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  const periods = [
    { period: 1, start: '07:00', end: '07:45' },
    { period: 2, start: '07:45', end: '08:30' },
    { period: 3, start: '08:30', end: '09:15' },
    { period: 4, start: '09:45', end: '10:30' },
    { period: 5, start: '10:30', end: '11:15' },
    { period: 6, start: '11:15', end: '12:00' },
  ];

  const mapelCodes = ['BIN', 'MAT', 'IPA', 'IPS', 'BIG', 'PPKN', 'PAI', 'SEN', 'PJK', 'INF'];
  let schedId = 1;

  CLASS_IDS.forEach((classId, cIdx) => {
    days.forEach((day, dIdx) => {
      // Pick 2 main subjects per day, 3 periods each
      const sub1 = mapelCodes[(cIdx + dIdx) % mapelCodes.length];
      const sub2 = mapelCodes[(cIdx + dIdx + 3) % mapelCodes.length];

      const teacher1 = teachers.find((t) => t.subject.toLowerCase().includes(sub1.toLowerCase())) || teachers[1];
      const teacher2 = teachers.find((t) => t.subject.toLowerCase().includes(sub2.toLowerCase())) || teachers[2];

      // Session 1: periods 1-3
      schedule.push({
        id: `SCH${String(schedId++).padStart(4, '0')}`,
        day,
        period: 1,
        startTime: periods[0].start,
        endTime: periods[2].end,
        classId,
        teacherCode: teacher1.teacherCode,
        teacherName: teacher1.name,
        subjectCode: sub1,
        subjectName: DEFAULT_SUBJECTS.find((s) => s.code === sub1)?.name || sub1,
        academicYear: '2026/2027',
        semester: 'Ganjil',
      });

      // Session 2: periods 4-6
      schedule.push({
        id: `SCH${String(schedId++).padStart(4, '0')}`,
        day,
        period: 4,
        startTime: periods[3].start,
        endTime: periods[5].end,
        classId,
        teacherCode: teacher2.teacherCode,
        teacherName: teacher2.name,
        subjectCode: sub2,
        subjectName: DEFAULT_SUBJECTS.find((s) => s.code === sub2)?.name || sub2,
        academicYear: '2026/2027',
        semester: 'Ganjil',
      });
    });
  });

  return schedule;
}

// Generate Default Attendance Sessions
function generateDefaultAttendance(students: Student[], schedule: ScheduleItem[]): AttendanceSession[] {
  const sessions: AttendanceSession[] = [];
  const today = '2026-10-31';

  // Create completed sessions for today's classes
  const todaysSchedule = schedule.filter((s) => s.day === 'Senin' || s.day === 'Jumat').slice(0, 16);

  todaysSchedule.forEach((sch, sIdx) => {
    const classStudents = students.filter((s) => s.classId === sch.classId);
    const records: Record<string, 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'> = {};

    classStudents.forEach((st, idx) => {
      // realistic 96% attendance, occasional S/I/A
      if ((idx + sIdx) % 27 === 0) {
        records[st.id] = 'Sakit';
      } else if ((idx + sIdx) % 37 === 0) {
        records[st.id] = 'Izin';
      } else if ((idx + sIdx) % 49 === 0) {
        records[st.id] = 'Alpa';
      } else {
        records[st.id] = 'Hadir';
      }
    });

    sessions.push({
      id: `ATT_SES_${String(sIdx + 1).padStart(3, '0')}`,
      scheduleId: sch.id,
      date: today,
      classId: sch.classId,
      subjectCode: sch.subjectCode,
      subjectName: sch.subjectName,
      teacherCode: sch.teacherCode,
      teacherName: sch.teacherName,
      period: sch.period,
      topic: `Pembelajaran Bab ${sIdx + 1}: Konsep dan Pendalaman Materi`,
      submittedAt: `${today}T08:45:00`,
      records,
      notes: 'Pembelajaran berjalan kondusif, siswa antusias mengikuti diskusi.',
    });
  });

  return sessions;
}

// Generate realistic default grades
function generateDefaultGrades(students: Student[]): StudentGrade[] {
  const grades: StudentGrade[] = [];
  const sampleSubjects = [
    { code: 'BIN', name: 'Bahasa Indonesia', teacherCode: 'G01' },
    { code: 'MAT', name: 'Matematika', teacherCode: 'G02' },
    { code: 'IPA', name: 'Ilmu Pengetahuan Alam', teacherCode: 'G03' },
    { code: 'BIG', name: 'Bahasa Inggris', teacherCode: 'G05' },
    { code: 'IPS', name: 'Ilmu Pengetahuan Sosial', teacherCode: 'G06' },
  ];

  // Populate for class 7A, 7B, 8A, 9A
  const focusedStudents = students.filter((s) => ['7A', '7B', '8A', '9A'].includes(s.classId));

  let gradeId = 1;
  focusedStudents.forEach((st, stIdx) => {
    sampleSubjects.forEach((sub, subIdx) => {
      // Deterministic realistic scores 70 - 95
      const base = 75 + ((stIdx * 3 + subIdx * 5) % 22);
      const tugas = Math.min(98, Math.max(68, base + ((stIdx + subIdx) % 5) - 2));
      const kuis = Math.min(98, Math.max(65, base - 2 + (stIdx % 6)));
      const praktik = Math.min(98, Math.max(70, base + 3));
      const proyek = Math.min(98, Math.max(72, base + 2));
      const ph = Math.min(98, Math.max(67, base - 1));
      const pts = Math.min(98, Math.max(65, base - 3 + (subIdx % 4)));
      const pas = Math.min(98, Math.max(68, base + (stIdx % 4)));

      // Weights: Tugas 15%, Kuis 10%, Praktik 15%, Proyek 15%, PH 15%, PTS 15%, PAS 15%
      const finalScore = Math.round(
        tugas * 0.15 +
        kuis * 0.10 +
        praktik * 0.15 +
        proyek * 0.15 +
        ph * 0.15 +
        pts * 0.15 +
        pas * 0.15
      );

      let letterGrade: 'A' | 'B' | 'C' | 'D' = 'B';
      if (finalScore >= 90) letterGrade = 'A';
      else if (finalScore >= 80) letterGrade = 'B';
      else if (finalScore >= 70) letterGrade = 'C';
      else letterGrade = 'D';

      grades.push({
        id: `GRD${String(gradeId++).padStart(5, '0')}`,
        studentId: st.id,
        studentName: st.name,
        classId: st.classId,
        subjectCode: sub.code,
        subjectName: sub.name,
        teacherCode: sub.teacherCode,
        academicYear: '2026/2027',
        semester: 'Ganjil',
        scores: { tugas, kuis, praktik, proyek, ph, pts, pas },
        finalScore,
        letterGrade,
        status: finalScore >= 75 ? 'Tuntas' : 'Belum Tuntas',
      });
    });
  });

  return grades;
}

// Generate Violations with realistic point system and BK triggers (> 30 pts)
function generateDefaultViolations(students: Student[], teachers: Teacher[]): ViolationRecord[] {
  const violations: ViolationRecord[] = [];
  const s7A = students.filter((s) => s.classId === '7A');
  const s8A = students.filter((s) => s.classId === '8A');
  const s9A = students.filter((s) => s.classId === '9A');

  // Student 1 in 7A gets 38 points (Triggers BK!)
  if (s7A[0]) {
    violations.push({
      id: 'VIO001',
      studentId: s7A[0].id,
      studentName: s7A[0].name,
      classId: '7A',
      date: '2026-10-10',
      category: 'Kedisiplinan',
      violationType: 'Terlambat masuk sekolah > 15 menit',
      description: 'Terlambat tiba di gerbang sekolah tanpa surat keterangan dari orang tua.',
      points: 5,
      reporterCode: 'G08',
      reporterName: 'Agus Salim, S.Pd',
      notes: 'Sudah diperingatkan secara lisan oleh piket.',
    });
    violations.push({
      id: 'VIO002',
      studentId: s7A[0].id,
      studentName: s7A[0].name,
      classId: '7A',
      date: '2026-10-18',
      category: 'Kerapian',
      violationType: 'Seragam tidak sesuai ketentuan atribut',
      description: 'Tidak memakai dasi dan badge lokasi SMPN 1 Mantap pada hari upacara.',
      points: 5,
      reporterCode: 'G01',
      reporterName: 'Dra. Hj. Siti Rahmawati, M.Pd',
      notes: 'Diberikan teguran tertulis di buku saku.',
    });
    violations.push({
      id: 'VIO003',
      studentId: s7A[0].id,
      studentName: s7A[0].name,
      classId: '7A',
      date: '2026-10-25',
      category: 'Ketertiban',
      violationType: 'Meninggalkan kelas saat jam pelajaran (Bolos Mapel)',
      description: 'Ditemukan di area kantin belakang saat jam pelajaran Matematika berlangsung.',
      points: 15,
      reporterCode: 'G02',
      reporterName: 'Budi Hermawan, S.Pd',
      notes: 'Wali kelas dipanggil dan orang tua dihubungi.',
    });
    violations.push({
      id: 'VIO004',
      studentId: s7A[0].id,
      studentName: s7A[0].name,
      classId: '7A',
      date: '2026-10-29',
      category: 'Sikap & Etika',
      violationType: 'Membawa gawai saat ujian tanpa izin pengawas',
      description: 'Mengaktifkan smartphone di laci meja ketika asesmen tengah semester.',
      points: 15,
      reporterCode: 'G03',
      reporterName: 'Nurul Faizah, S.Pd., M.Si',
      notes: 'Ponsel disita oleh pengawas dan diserahkan ke ruang BK.',
    }); // Total = 5 + 5 + 15 + 15 = 40 pts (>30) -> BK Priority!
  }

  // Student 2 in 8A gets 35 points (Triggers BK!)
  if (s8A[1]) {
    violations.push({
      id: 'VIO005',
      studentId: s8A[1].id,
      studentName: s8A[1].name,
      classId: '8A',
      date: '2026-10-14',
      category: 'Ketertiban',
      violationType: 'Terlibat perkelahian / perselisihan fisik di lingkungan sekolah',
      description: 'Perselisihan dengan siswa kelas lain di area parkir sepeda saat jam istirahat.',
      points: 25,
      reporterCode: 'G08',
      reporterName: 'Agus Salim, S.Pd',
      notes: 'Dilerai guru piket dan dibawa ke ruang BK.',
    });
    violations.push({
      id: 'VIO006',
      studentId: s8A[1].id,
      studentName: s8A[1].name,
      classId: '8A',
      date: '2026-10-26',
      category: 'Kedisiplinan',
      violationType: 'Tidak masuk sekolah tanpa keterangan (Alpa) 2 hari berturut-turut',
      description: 'Tidak hadir tanpa kabar izin maupun surat dokter selama 2 hari.',
      points: 10,
      reporterCode: 'G09',
      reporterName: 'Sri Wahyuni, S.Pd., M.Hum',
      notes: 'Wali kelas melakukan home visit.',
    }); // Total = 35 pts (>30) -> BK Priority!
  }

  // Student in 9A gets 18 points (Perhatian)
  if (s9A[2]) {
    violations.push({
      id: 'VIO007',
      studentId: s9A[2].id,
      studentName: s9A[2].name,
      classId: '9A',
      date: '2026-10-20',
      category: 'Kerapian',
      violationType: 'Rambut panjang melebihi batas kerah seragam',
      description: 'Peringatan kedua mengenai kerapian rambut bagi siswa putra.',
      points: 8,
      reporterCode: 'G19',
      reporterName: 'Wahyu Triyono, S.Pd',
      notes: 'Diminta merapikan dalam waktu 2x24 jam.',
    });
    violations.push({
      id: 'VIO008',
      studentId: s9A[2].id,
      studentName: s9A[2].name,
      classId: '9A',
      date: '2026-10-28',
      category: 'Kedisiplinan',
      violationType: 'Terlambat mengumpulkan tugas proyek lebih dari 3 kali',
      description: 'Tidak menyerahkan tugas praktikum IPA sesuai tenggat yang disepakati.',
      points: 10,
      reporterCode: 'G21',
      reporterName: 'H. Joko Susilo, M.Pd',
      notes: 'Diberikan bimbingan akademik tambahan.',
    }); // Total = 18 pts (Kategori Perhatian)
  }

  // Normal minor infraction (5 pts)
  if (s7A[3]) {
    violations.push({
      id: 'VIO009',
      studentId: s7A[3].id,
      studentName: s7A[3].name,
      classId: '7A',
      date: '2026-10-22',
      category: 'Kerapian',
      violationType: 'Sepatu tidak sesuai ketentuan (berwarna selain hitam)',
      description: 'Menggunakan sepatu sneakers bermotif putih bukan hitam polos.',
      points: 5,
      reporterCode: 'G01',
      reporterName: 'Dra. Hj. Siti Rahmawati, M.Pd',
      notes: 'Diberikan tenggang waktu pergantian.',
    });
  }

  return violations;
}

// Generate BK Counseling records for students with >30 pts
function generateDefaultCounseling(students: Student[]): CounselingRecord[] {
  const s7A = students.filter((s) => s.classId === '7A');
  const s8A = students.filter((s) => s.classId === '8A');

  const records: CounselingRecord[] = [];

  if (s7A[0]) {
    records.push({
      id: 'CSL001',
      studentId: s7A[0].id,
      studentName: s7A[0].name,
      classId: '7A',
      counselorId: 'G15',
      counselorName: 'Drs. Bambang Irawan, M.Pd',
      date: '2026-10-30',
      totalPoints: 40,
      identifiedProblem: 'Penurunan motivasi belajar, pengaruh pergaulan luar sekolah, dan ketergantungan gawai saat jam pelajaran.',
      counselingMethod: 'Konseling individual, mediasi bersama orang tua, dan penyusunan Kontrak Perilaku Positif (Behavioral Contract).',
      counselingResult: 'Siswa mengakui kesalahan, menandatangani surat komitmen perbaikan sikap, dan orang tua bersedia mengawasi penggunaan gawai di rumah.',
      actionPlan: 'Pemantauan presensi dan kehadiran harian oleh guru piket dan wali kelas selama 14 hari kerja ke depan.',
      progressNotes: 'Pada hari pertama pemantauan siswa hadir tepat waktu pukul 06.45 WIB dan berpakaian rapi lengkap atribut.',
      status: 'Sedang Dalam Pembinaan',
      confidential: true,
    });
  }

  if (s8A[1]) {
    records.push({
      id: 'CSL002',
      studentId: s8A[1].id,
      studentName: s8A[1].name,
      classId: '8A',
      counselorId: 'G15',
      counselorName: 'Drs. Bambang Irawan, M.Pd',
      date: '2026-10-27',
      totalPoints: 35,
      identifiedProblem: 'Ketidakmampuan mengelola emosi dan miskomunikasi antarsiswa di media sosial yang terbawa ke sekolah.',
      counselingMethod: 'Restorative Justice, mediasi antarsiswa yang bertikai disaksikan kedua orang tua.',
      counselingResult: 'Kedua belah pihak saling meminta maaf, saling memaafkan, dan berjanji tidak mengulangi tindakan kekerasan verbal maupun fisik.',
      actionPlan: 'Pendampingan pengelolaan kemarahan (Anger Management) oleh Konselor BK setiap Jumat sore.',
      progressNotes: 'Siswa menunjukkan sikap kooperatif dan aktif dalam kegiatan ekstrakurikuler Pramuka.',
      status: 'Monitoring',
      confidential: true,
    });
  }

  return records;
}

// Generate Default Attitude Assessments
function generateDefaultAttitudes(students: Student[]): AttitudeAssessment[] {
  const attitudes: AttitudeAssessment[] = [];
  const s7A = students.filter((s) => s.classId === '7A').slice(0, 10);

  s7A.forEach((st, idx) => {
    attitudes.push({
      id: `ATT_ASS_${String(idx + 1).padStart(3, '0')}`,
      studentId: st.id,
      studentName: st.name,
      classId: '7A',
      evaluatorId: 'G01',
      evaluatorName: 'Dra. Hj. Siti Rahmawati, M.Pd',
      evaluatorRole: 'Wali Kelas',
      date: '2026-10-28',
      discipline: idx === 0 ? 'C' : 'A',
      responsibility: idx === 0 ? 'C' : 'A',
      honesty: 'A',
      cooperation: 'B',
      politeness: 'A',
      care: 'A',
      activeness: idx % 2 === 0 ? 'A' : 'B',
      notes: idx === 0
        ? 'Perlu peningkatan disiplin waktu dan pematuhan tata tertib seragam sekolah.'
        : 'Sangat baik dalam ketertiban kelas, aktif berpendapat dalam diskusi kelompok, dan santun kepada guru.',
      recommendation: idx === 0
        ? 'Diusulkan pendampingan intensif oleh wali kelas dan bimbingan konseling.'
        : 'Pertahankan prestasi akademik dan keteladanan budi pekerti.',
    });
  });

  return attitudes;
}

// Generate initial system notifications
function generateDefaultNotifications(): SystemNotification[] {
  return [
    {
      id: 'NOTIF001',
      title: 'Prioritas Pembinaan BK: Akumulasi > 30 Poin',
      message: 'Siswa Ahmad Rizky Pratama (Kelas 7A) telah mencapai akumulasi 40 poin pelanggaran. Sistem otomatis merekomendasikan penanganan BK.',
      type: 'alert',
      targetRoles: ['guru_bk', 'wali_kelas', 'kepala_sekolah'],
      targetClassId: '7A',
      createdAt: '2026-10-29T10:30:00',
      read: false,
      actionLink: 'counseling',
    },
    {
      id: 'NOTIF002',
      title: 'Peringatan Absensi Pembelajaran Hari Ini',
      message: 'Terdapat 2 kelas yang belum menyelesaikan administrasi absensi sesi pembelajaran jam ke-4.',
      type: 'warning',
      targetRoles: ['kepala_sekolah', 'admin_operator'],
      createdAt: '2026-10-31T09:15:00',
      read: false,
      actionLink: 'monitoring',
    },
    {
      id: 'NOTIF003',
      title: 'Batas Pengisian Penilaian Tengah Semester (PTS)',
      message: 'Batas akhir unggah nilai PTS Ganjil 2026/2027 adalah 5 November 2026. Harap segera menyelesaikan input nilai.',
      type: 'info',
      targetRoles: ['guru_mapel', 'wali_kelas'],
      createdAt: '2026-10-30T08:00:00',
      read: true,
      actionLink: 'grading',
    },
  ];
}

// Generate Activity Logs
function generateDefaultActivityLogs(): ActivityLog[] {
  return [
    {
      id: 'LOG001',
      timestamp: '2026-10-31 09:30:15',
      userName: 'Dra. Hj. Siti Rahmawati, M.Pd',
      userRole: 'guru_mapel',
      action: 'Simpan Absensi Siswa',
      category: 'Absensi',
      details: 'Pengisian presensi Kelas 7A Mata Pelajaran Bahasa Indonesia Jam 1-3.',
    },
    {
      id: 'LOG002',
      timestamp: '2026-10-31 09:12:44',
      userName: 'Budi Hermawan, S.Pd',
      userRole: 'guru_mapel',
      action: 'Input Nilai Tugas',
      category: 'Nilai',
      details: 'Menyimpan nilai Tugas 2 Matematika untuk 30 siswa Kelas 7B.',
    },
    {
      id: 'LOG003',
      timestamp: '2026-10-30 14:20:00',
      userName: 'Drs. Bambang Irawan, M.Pd',
      userRole: 'guru_bk',
      action: 'Catat Hasil Konseling BK',
      category: 'BK',
      details: 'Pencatatan sesi bimbingan individual siswa Ahmad Rizky Pratama (Kelas 7A).',
    },
    {
      id: 'LOG004',
      timestamp: '2026-10-29 11:05:18',
      userName: 'Nurul Faizah, S.Pd., M.Si',
      userRole: 'guru_mapel',
      action: 'Catat Poin Pelanggaran',
      category: 'Pelanggaran',
      details: 'Mencatat pelanggaran 15 poin atas nama Ahmad Rizky Pratama.',
    },
    {
      id: 'LOG005',
      timestamp: '2026-10-28 08:00:00',
      userName: 'Admin Operator Sekolah',
      userRole: 'admin_operator',
      action: 'Sinkronisasi Jadwal Pembelajaran',
      category: 'Master',
      details: 'Memperbarui matriks alokasi jadwal mengajar semester ganjil 2026/2027.',
    },
  ];
}

/**
 * Storage Engine that handles local storage with robust seed fallback
 */
export class SchoolStorage {
  private static getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      if (!data) return fallback;
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  // Settings
  static getSettings(): SchoolSettings {
    return this.getItem<SchoolSettings>('settings', DEFAULT_SCHOOL_SETTINGS);
  }
  static saveSettings(settings: SchoolSettings): void {
    this.setItem('settings', settings);
  }

  // Master Subjects
  static getSubjects(): Subject[] {
    return this.getItem<Subject[]>('subjects', []);
  }
  static saveSubjects(subjects: Subject[]): void {
    this.setItem('subjects', subjects);
  }

  // Teachers (Only Admin by default)
  static getTeachers(): Teacher[] {
    const existing = this.getItem<Teacher[] | null>('teachers', null);
    if (existing && existing.length > 0) return existing;
    const initial = [ADMIN_TEACHER];
    this.saveTeachers(initial);
    return initial;
  }
  static saveTeachers(teachers: Teacher[]): void {
    this.setItem('teachers', teachers);
  }

  // Classes
  static getClasses(): ClassRoom[] {
    const existing = this.getItem<ClassRoom[] | null>('classes', null);
    if (existing) return existing;
    return [];
  }
  static getFreshDefaultClasses(): ClassRoom[] {
    const teachers = generateDefaultTeachers();
    return CLASS_IDS.map((cId, idx) => {
      const homeroom = teachers.find((t) => t.classId === cId);
      const grade = cId.charAt(0) as '7' | '8' | '9';
      return {
        classId: cId,
        name: cId,
        gradeLevel: grade,
        homeroomTeacherId: homeroom?.teacherCode || homeroom?.username || `G${String(idx + 1).padStart(2, '0')}`,
        homeroomTeacherName: homeroom?.name || `Wali Kelas ${cId}`,
        studentCount: idx % 2 === 0 ? 30 : 29,
        academicYear: '2026/2027',
        status: 'Aktif',
      };
    });
  }
  static getFreshDefaultStudents(): Student[] {
    return generate708Students();
  }
  static getFreshDefaultTeachers(): Teacher[] {
    return generateDefaultTeachers();
  }
  static getFreshDefaultSubjects(): Subject[] {
    return [...DEFAULT_SUBJECTS];
  }
  static saveClasses(classes: ClassRoom[]): void {
    this.setItem('classes', classes);
  }

  // Students
  static getStudents(): Student[] {
    const existing = this.getItem<Student[] | null>('students', null);
    if (existing) return existing;
    return [];
  }
  static saveStudents(students: Student[]): void {
    this.setItem('students', students);
  }

  // Schedules
  static getSchedules(): ScheduleItem[] {
    const existing = this.getItem<ScheduleItem[] | null>('schedules', null);
    if (existing) return existing;
    return [];
  }
  static getFreshDefaultSchedules(): ScheduleItem[] {
    const teachers = this.getTeachers();
    return generateDefaultSchedule(teachers);
  }
  static saveSchedules(schedules: ScheduleItem[]): void {
    this.setItem('schedules', schedules);
  }

  // Attendance Sessions
  static getAttendanceSessions(): AttendanceSession[] {
    const existing = this.getItem<AttendanceSession[] | null>('attendance_sessions', null);
    if (existing) return existing;
    return [];
  }
  static saveAttendanceSessions(sessions: AttendanceSession[]): void {
    this.setItem('attendance_sessions', sessions);
  }

  // Grades
  static getGrades(): StudentGrade[] {
    const existing = this.getItem<StudentGrade[] | null>('grades', null);
    if (existing) return existing;
    return [];
  }
  static saveGrades(grades: StudentGrade[]): void {
    this.setItem('grades', grades);
  }

  // Violations
  static getViolations(): ViolationRecord[] {
    const existing = this.getItem<ViolationRecord[] | null>('violations', null);
    if (existing) return existing;
    return [];
  }
  static saveViolations(violations: ViolationRecord[]): void {
    this.setItem('violations', violations);
  }

  // Violation Rules (Kategori Poin Pelanggaran)
  static getViolationRules(): ViolationRule[] {
    const existing = this.getItem<ViolationRule[] | null>('violation_rules', null);
    if (existing && existing.length > 0) return existing;
    this.saveViolationRules(DEFAULT_VIOLATION_RULES);
    return DEFAULT_VIOLATION_RULES;
  }
  static saveViolationRules(rules: ViolationRule[]): void {
    this.setItem('violation_rules', rules);
  }
  static getFreshDefaultViolationRules(): ViolationRule[] {
    return [...DEFAULT_VIOLATION_RULES];
  }

  // Daily Score Records
  static getDailyScores(): DailyScoreRecord[] {
    return this.getItem<DailyScoreRecord[]>('daily_scores', []);
  }
  static saveDailyScores(records: DailyScoreRecord[]): void {
    this.setItem('daily_scores', records);
  }

  // BK Counseling Records
  static getCounselingRecords(): CounselingRecord[] {
    const existing = this.getItem<CounselingRecord[] | null>('counseling', null);
    if (existing) return existing;
    return [];
  }
  static saveCounselingRecords(records: CounselingRecord[]): void {
    this.setItem('counseling', records);
  }

  // Attitudes
  static getAttitudes(): AttitudeAssessment[] {
    const existing = this.getItem<AttitudeAssessment[] | null>('attitudes', null);
    if (existing) return existing;
    return [];
  }
  static saveAttitudes(attitudes: AttitudeAssessment[]): void {
    this.setItem('attitudes', attitudes);
  }

  // Notifications
  static getNotifications(): SystemNotification[] {
    return this.getItem<SystemNotification[]>('notifications', []);
  }
  static saveNotifications(notifications: SystemNotification[]): void {
    this.setItem('notifications', notifications);
  }

  // BK Assignments (Siswa & Rombel Binaan Guru BK)
  static getBKAssignments(): BKAssignment[] {
    return this.getItem<BKAssignment[]>('bk_assignments', []);
  }
  static saveBKAssignments(assignments: BKAssignment[]): void {
    this.setItem('bk_assignments', assignments);
  }

  // Activity Logs
  static getActivityLogs(): ActivityLog[] {
    return this.getItem<ActivityLog[]>('activity_logs', [
      {
        id: 'LOG001',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        userName: 'Admin Operator IT',
        userRole: 'admin_operator',
        action: 'Inisialisasi Sistem Bersih',
        category: 'Master',
        details: 'Basis data disiapkan dalam keadaan bersih tanpa data dummy, siap untuk import data demo pengguna.',
      },
    ]);
  }
  static saveActivityLogs(logs: ActivityLog[]): void {
    this.setItem('activity_logs', logs);
  }
  static logActivity(userName: string, userRole: any, action: string, category: any, details: string): void {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      id: `LOG${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userName,
      userRole,
      action,
      category,
      details,
    };
    logs.unshift(newLog);
    if (logs.length > 100) logs.pop();
    this.saveActivityLogs(logs);
  }

  // Pre-configured User Accounts (Only Admin by default)
  static getDefaultUsers(): UserAccount[] {
    return [ADMIN_USER];
  }

  // Clear all operational data except Admin user
  static clearAllDataExceptAdmin(): void {
    try {
      this.setItem('teachers', [ADMIN_TEACHER]);
      this.setItem('students', []);
      this.setItem('classes', []);
      this.setItem('subjects', []);
      this.setItem('schedules', []);
      this.setItem('attendance_sessions', []);
      this.setItem('grades', []);
      this.setItem('violations', []);
      this.setItem('counseling', []);
      this.setItem('attitudes', []);
      this.setItem('daily_scores', []);
      this.setItem('notifications', []);
      this.setItem('bk_assignments', []);
      this.setItem('activity_logs', [
        {
          id: `LOG_${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          userName: 'Admin Operator IT',
          userRole: 'admin_operator',
          action: 'Pengosongan Data',
          category: 'Master',
          details: 'Seluruh data operasional dikosongkan. Hanya akun admin yang dipertahankan untuk uji coba import.',
        },
      ]);
      localStorage.setItem('SIMANTAP_LMS_users', JSON.stringify([ADMIN_USER]));
      localStorage.setItem('SIMANTAP_LMS_currentUser', JSON.stringify(ADMIN_USER));
      localStorage.setItem('SIMANTAP_DATA_CLEARED_V2', 'true');
    } catch (e) {
      console.error('Error clearing data:', e);
    }
  }
}

// Auto purge previous dummy data on client startup to ensure clean slate for user import
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    if (localStorage.getItem('SIMANTAP_DATA_CLEARED_V2') !== 'true') {
      SchoolStorage.clearAllDataExceptAdmin();
    }
  } catch (err) {
    console.error('Initial clean storage purge error:', err);
  }
}
