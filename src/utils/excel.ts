import * as XLSX from 'xlsx';
import { Student, Teacher, Subject, UserRole } from '../types';

/**
 * Downloads a worksheet as a real .xlsx file
 */
export function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}

/**
 * Generates Template_Import_Siswa.xlsx
 */
export function generateStudentTemplate() {
  const headers = ['No', 'ID', 'NIS', 'NISN', 'Nama', 'Kelas'];
  const sampleData = [
    [1, 'STD001', '24001', '0081234567', 'Ahmad Rizky Pratama', '7A'],
    [2, 'STD002', '24002', '0081234568', 'Anindya Putri Kirana', '7A'],
    [3, 'STD003', '24003', '0081234569', 'Bagus Prasetyo', '7A'],
    [4, 'STD004', '24004', '0081234570', 'Cantika Dewi Lestari', '7B'],
    [5, 'STD005', '24005', '0081234571', 'Daffa Arya Nugraha', '7B'],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  // set column widths
  ws['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 10 },
    { wch: 14 },
    { wch: 28 },
    { wch: 10 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
  downloadWorkbook(wb, 'Template_Import_Siswa.xlsx');
}

/**
 * Generates Template_Import_Guru.xlsx
 * Columns: No, Username, Password, Nama, Jabatan, Kelas, Mata Pelajaran
 */
export function generateTeacherTemplate() {
  const headers = ['No', 'Username', 'Password', 'Nama', 'Jabatan', 'Kelas', 'Mata Pelajaran'];
  const sampleData = [
    [1, 'guru.sitirahmawati', 'Rahma2026!', 'Dra. Hj. Siti Rahmawati, M.Pd', 'Wali Kelas', '7A', 'Bahasa Indonesia'],
    [2, 'guru.budihermawan', 'Budi2026!', 'Budi Hermawan, S.Pd', 'Wali Kelas', '7B', 'Matematika'],
    [3, 'guru.nurulfaizah', 'Nurul2026!', 'Nurul Faizah, S.Pd., M.Si', 'Guru Mapel', '', 'Ilmu Pengetahuan Alam'],
    [4, 'guru.bambangbk', 'BK2026!Mantap', 'Drs. Bambang Irawan, M.Pd', 'Guru BK', '', 'Bimbingan Konseling'],
    [5, 'kepsek.mulyono', 'Kepsek2026!', 'Dr. H. Mulyono, M.Pd', 'Kepala Sekolah', '', 'Manajemen Sekolah'],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 14 },
    { wch: 32 },
    { wch: 16 },
    { wch: 10 },
    { wch: 26 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Guru & Akun');
  downloadWorkbook(wb, 'Template_Import_Guru.xlsx');
}

/**
 * Generates Template_Import_Jadwal.xlsx
 * Columns: No, Nama Guru, Kode Guru, Mata Pelajaran, Kelas, Hari, Jam Ke-, Pukul
 */
export function generateScheduleTemplate() {
  const headers = ['No', 'Nama Guru', 'Kode Guru', 'Mata Pelajaran', 'Kelas', 'Hari', 'Jam Ke-', 'Pukul'];
  const sampleData = [
    [1, 'Dra. Hj. Siti Rahmawati, M.Pd', 'G01', 'Bahasa Indonesia', '7A', 'Senin', 1, '07:00 - 08:30'],
    [2, 'Budi Hermawan, S.Pd', 'G02', 'Matematika', '7A', 'Senin', 4, '09:45 - 11:15'],
    [3, 'Nurul Faizah, S.Pd., M.Si', 'G03', 'Ilmu Pengetahuan Alam', '7B', 'Senin', 1, '07:00 - 08:30'],
    [4, 'Dra. Hj. Siti Rahmawati, M.Pd', 'G01', 'Bahasa Indonesia', '7B', 'Selasa', 1, '07:00 - 08:30'],
    [5, 'Dewi Lestari, S.Pd', 'G05', 'Bahasa Inggris', '7A', 'Rabu', 1, '07:00 - 08:30'],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 12 },
    { wch: 26 },
    { wch: 10 },
    { wch: 12 },
    { wch: 10 },
    { wch: 16 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Jadwal Pembelajaran');
  downloadWorkbook(wb, 'Template_Import_Jadwal.xlsx');
}

/**
 * Parse an uploaded file into raw rows
 */
export async function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}

export interface ValidationItemResult<T> {
  rowNumber: number;
  data: T;
  isValid: boolean;
  errors: string[];
  isDuplicate: boolean;
}

export interface ValidationSummary<T> {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  items: ValidationItemResult<T>[];
}

/**
 * Validates Student rows against constraints and current database
 */
export function validateStudentsImport(
  rawRows: any[],
  existingStudents: Student[],
  availableClasses: string[]
): ValidationSummary<Partial<Student>> {
  const seenIds = new Set<string>(existingStudents.map((s) => s.id.toLowerCase()));
  const seenNis = new Set<string>(existingStudents.map((s) => s.nis.toLowerCase()));
  const batchIds = new Set<string>();
  const batchNis = new Set<string>();

  const items: ValidationItemResult<Partial<Student>>[] = [];
  let validCount = 0;
  let invalidCount = 0;
  let dupCount = 0;

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2; // header is row 1
    const id = String(row['ID'] || row['id'] || '').trim();
    const nis = String(row['NIS'] || row['nis'] || '').trim();
    const nisn = String(row['NISN'] || row['nisn'] || '').trim();
    const name = String(row['Nama'] || row['nama'] || row['Name'] || '').trim();
    const classId = String(row['Kelas'] || row['kelas'] || row['Class'] || '').trim().toUpperCase();

    const errors: string[] = [];
    let isDuplicate = false;

    if (!id) errors.push('ID siswa wajib diisi');
    if (!nis) errors.push('NIS wajib diisi');
    if (!name) errors.push('Nama siswa wajib diisi');
    if (!classId) errors.push('Kelas wajib diisi');
    else if (!availableClasses.includes(classId)) {
      errors.push(`Kelas '${classId}' tidak terdaftar di sistem (Tersedia: 7A-7H, 8A-8H, 9A-9H)`);
    }

    if (id) {
      const lowerId = id.toLowerCase();
      if (seenIds.has(lowerId) || batchIds.has(lowerId)) {
        errors.push(`ID '${id}' sudah terdaftar (duplikasi)`);
        isDuplicate = true;
      } else {
        batchIds.add(lowerId);
      }
    }

    if (nis) {
      const lowerNis = nis.toLowerCase();
      if (seenNis.has(lowerNis) || batchNis.has(lowerNis)) {
        errors.push(`NIS '${nis}' sudah terdaftar (duplikasi)`);
        isDuplicate = true;
      } else {
        batchNis.add(lowerNis);
      }
    }

    const isValid = errors.length === 0;
    if (isValid) validCount++;
    else invalidCount++;
    if (isDuplicate) dupCount++;

    items.push({
      rowNumber: rowNum,
      data: {
        id,
        nis,
        nisn: nisn || '-',
        name,
        classId,
        gender: 'L',
        status: 'Aktif',
      },
      isValid,
      errors,
      isDuplicate,
    });
  });

  return {
    totalRows: rawRows.length,
    validRows: validCount,
    invalidRows: invalidCount,
    duplicateRows: dupCount,
    items,
  };
}

/**
 * Validates Teacher rows with revised columns:
 * No, Username, Password, Nama, Jabatan, Kelas, Mata Pelajaran
 */
export function validateTeachersImport(
  rawRows: any[],
  existingTeachers: Teacher[],
  availableClasses: string[],
  availableSubjects: Subject[]
): ValidationSummary<any> {
  const seenUsernames = new Set<string>(existingTeachers.map((t) => t.username.toLowerCase()));
  const batchUsernames = new Map<string, any>();

  const items: ValidationItemResult<any>[] = [];
  let validCount = 0;
  let invalidCount = 0;
  let dupCount = 0;

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const username = String(row['Username'] || row['username'] || '').trim().toLowerCase();
    const password = String(row['Password'] || row['password'] || '').trim();
    const name = String(row['Nama'] || row['nama'] || row['name'] || '').trim();
    const jabatanRaw = String(row['Jabatan'] || row['jabatan'] || row['role'] || '').trim();
    const classId = String(row['Kelas'] || row['kelas'] || row['classId'] || row['classid'] || '').trim().toUpperCase();
    const mapel = String(row['Mata Pelajaran'] || row['mata pelajaran'] || row['mata_pelajaran'] || '').trim();

    // Determine normalized role from Jabatan
    let role: UserRole = 'guru_mapel';
    const jLow = jabatanRaw.toLowerCase();
    if (jLow.includes('wali')) {
      role = 'wali_kelas';
    } else if (jLow.includes('kepala') || jLow.includes('kepsek')) {
      role = 'kepala_sekolah';
    } else if (jLow.includes('bk') || jLow.includes('konsel')) {
      role = 'guru_bk';
    } else if (jLow.includes('admin') || jLow.includes('operator')) {
      role = 'admin_operator';
    } else {
      role = 'guru_mapel';
    }

    const errors: string[] = [];
    let isDuplicate = false;

    if (!username) errors.push('Username wajib diisi');
    if (!password) errors.push('Password awal wajib diisi');
    if (!name) errors.push('Nama guru wajib diisi');
    if (!jabatanRaw) errors.push('Jabatan guru wajib diisi (Contoh: Guru Mapel, Wali Kelas, Kepala Sekolah, Guru BK)');

    if (role === 'wali_kelas') {
      if (!classId) {
        errors.push('Kolom Kelas wajib diisi untuk jabatan Wali Kelas (Contoh: 7A, 8B)');
      } else if (!availableClasses.includes(classId)) {
        errors.push(`Kelas '${classId}' tidak ditemukan dalam data kelas sekolah`);
      }
    }

    // Lookup existing teacher code or assign sequential code
    let teacherCode = 'G99';
    const matchExisting = existingTeachers.find((t) => t.username.toLowerCase() === username);
    if (matchExisting) {
      teacherCode = matchExisting.teacherCode;
    } else {
      teacherCode = `G${String(existingTeachers.length + idx + 1).padStart(2, '0')}`;
    }

    // Check duplicate username
    if (username) {
      if (batchUsernames.has(username)) {
        const prev = batchUsernames.get(username);
        if (prev.name !== name) {
          errors.push(`Username '${username}' berbeda identitas antardata (nama: '${name}' vs '${prev.name}'). Penggabungan ditolak.`);
          isDuplicate = true;
        }
      } else if (seenUsernames.has(username)) {
        isDuplicate = true;
      }
      batchUsernames.set(username, { name, password, role, classId, teacherCode, mapel });
    }

    const isValid = errors.length === 0;
    if (isValid) validCount++;
    else invalidCount++;
    if (isDuplicate) dupCount++;

    items.push({
      rowNumber: rowNum,
      data: {
        username,
        password,
        name,
        role,
        classId: classId || undefined,
        teacherCode,
        subject: mapel || 'Umum',
      },
      isValid,
      errors,
      isDuplicate,
    });
  });

  return {
    totalRows: rawRows.length,
    validRows: validCount,
    invalidRows: invalidCount,
    duplicateRows: dupCount,
    items,
  };
}

/**
 * Validates Schedule rows with columns:
 * No, Nama Guru, Kode Guru, Mata Pelajaran, Kelas, Hari, Jam Ke-, Pukul
 */
export function validateScheduleImport(
  rawRows: any[],
  existingTeachers: Teacher[],
  existingSubjects: Subject[],
  availableClasses: string[],
  existingSchedules: any[]
): ValidationSummary<any> {
  const validDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const items: ValidationItemResult<any>[] = [];
  let validCount = 0;
  let invalidCount = 0;
  let dupCount = 0;

  // Track conflicts in batch: (teacherCode + day + period) and (classId + day + period)
  const batchTeacherOccupied = new Set<string>();
  const batchClassOccupied = new Set<string>();

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const rawTeacherName = String(row['Nama Guru'] || row['nama_guru'] || row['Nama'] || '').trim();
    const rawTeacherCode = String(row['Kode Guru'] || row['kode_guru'] || row['Kode'] || '').trim().toUpperCase();
    const mapel = String(row['Mata Pelajaran'] || row['mata_pelajaran'] || row['Mapel'] || '').trim();
    const classId = String(row['Kelas'] || row['kelas'] || row['Class'] || '').trim().toUpperCase();
    const hariRaw = String(row['Hari'] || row['hari'] || '').trim();
    const jamKeRaw = Number(row['Jam Ke-'] || row['jam_ke'] || row['Jam'] || 1);
    const pukul = String(row['Pukul'] || row['pukul'] || row['Waktu'] || '07:00 - 08:30').trim();

    // Standardize capitalized day
    const hari = hariRaw.charAt(0).toUpperCase() + hariRaw.slice(1).toLowerCase();

    const errors: string[] = [];
    let isDuplicate = false;

    if (!mapel) errors.push('Mata Pelajaran wajib diisi');
    if (!classId) errors.push('Kelas wajib diisi');
    else if (!availableClasses.includes(classId)) {
      errors.push(`Kelas '${classId}' tidak terdaftar di sistem`);
    }

    if (!hari || !validDays.includes(hari)) {
      errors.push(`Hari '${hari}' tidak valid. Pilihan: ${validDays.join(', ')}`);
    }

    if (!jamKeRaw || jamKeRaw < 1 || jamKeRaw > 8) {
      errors.push(`Jam Ke- harus bernilai antara 1 sampai 8 (ditemukan: ${jamKeRaw})`);
    }

    // Resolve teacher
    let resolvedTeacher = existingTeachers.find(
      (t) => (rawTeacherCode && t.teacherCode === rawTeacherCode) || (rawTeacherName && t.name.toLowerCase().includes(rawTeacherName.toLowerCase()))
    );

    const teacherCode = resolvedTeacher ? resolvedTeacher.teacherCode : (rawTeacherCode || `G${String(idx + 1).padStart(2, '0')}`);
    const teacherName = resolvedTeacher ? resolvedTeacher.name : (rawTeacherName || `Guru ${teacherCode}`);

    // Resolve subject code
    let resolvedSubject = existingSubjects.find(
      (s) => s.name.toLowerCase() === mapel.toLowerCase() || s.code.toLowerCase() === mapel.toLowerCase()
    );
    const subjectCode = resolvedSubject ? resolvedSubject.code : mapel.substring(0, 3).toUpperCase();
    const subjectName = resolvedSubject ? resolvedSubject.name : mapel;

    // Parse start & end time from Pukul
    let startTime = '07:00';
    let endTime = '08:30';
    if (pukul.includes('-')) {
      const parts = pukul.split('-').map((p) => p.trim());
      if (parts[0]) startTime = parts[0];
      if (parts[1]) endTime = parts[1];
    } else if (jamKeRaw >= 4) {
      startTime = '09:45';
      endTime = '11:15';
    }

    // Conflict Check 1: Teacher conflict
    const teacherKey = `${teacherCode}_${hari}_${jamKeRaw}`;
    if (batchTeacherOccupied.has(teacherKey)) {
      errors.push(`Bentrok Guru: ${teacherName} (${teacherCode}) sudah dijadwalkan di kelas lain pada hari ${hari} Jam ke-${jamKeRaw}`);
      isDuplicate = true;
    } else {
      // Check against existing database schedules
      const conflictExisting = existingSchedules.find(
        (s) => s.teacherCode === teacherCode && s.day === hari && s.period === jamKeRaw
      );
      if (conflictExisting) {
        errors.push(`Bentrok Guru: ${teacherName} sedang mengajar di Kelas ${conflictExisting.classId} pada hari ${hari} Jam ke-${jamKeRaw}`);
        isDuplicate = true;
      } else {
        batchTeacherOccupied.add(teacherKey);
      }
    }

    // Conflict Check 2: Class conflict
    const classKey = `${classId}_${hari}_${jamKeRaw}`;
    if (batchClassOccupied.has(classKey)) {
      errors.push(`Bentrok Kelas: Kelas ${classId} sudah memiliki jadwal pada hari ${hari} Jam ke-${jamKeRaw}`);
      isDuplicate = true;
    } else {
      const conflictExistingClass = existingSchedules.find(
        (s) => s.classId === classId && s.day === hari && s.period === jamKeRaw
      );
      if (conflictExistingClass) {
        errors.push(`Bentrok Kelas: Kelas ${classId} sudah diisi oleh Guru ${conflictExistingClass.teacherName} pada hari ${hari} Jam ke-${jamKeRaw}`);
        isDuplicate = true;
      } else {
        batchClassOccupied.add(classKey);
      }
    }

    const isValid = errors.length === 0;
    if (isValid) validCount++;
    else invalidCount++;
    if (isDuplicate) dupCount++;

    items.push({
      rowNumber: rowNum,
      data: {
        day: hari,
        period: jamKeRaw,
        startTime,
        endTime,
        classId,
        teacherCode,
        teacherName,
        subjectCode,
        subjectName,
        pukulDisplay: pukul,
        academicYear: '2026/2027',
        semester: 'Ganjil',
      },
      isValid,
      errors,
      isDuplicate,
    });
  });

  return {
    totalRows: rawRows.length,
    validRows: validCount,
    invalidRows: invalidCount,
    duplicateRows: dupCount,
    items,
  };
}

/**
 * Downloads error report as an Excel file
 */
export function downloadErrorReport(errorsList: { row: number; identifier: string; errors: string[] }[]) {
  const headers = ['Baris Excel', 'Identitas / Data', 'Daftar Kesalahan'];
  const data = errorsList.map((e) => [e.row, e.identifier, e.errors.join('; ')]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  ws['!cols'] = [{ wch: 14 }, { wch: 30 }, { wch: 60 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Kesalahan');
  downloadWorkbook(wb, `Laporan_Kesalahan_Import_${Date.now()}.xlsx`);
}

/**
 * Export generic dataset to Excel file
 */
export function exportToExcel(data: any[], sheetName: string, fileName: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  downloadWorkbook(wb, `${fileName}.xlsx`);
}
