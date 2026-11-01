import * as XLSX from 'xlsx';
import { Student, Teacher, ClassRoom, Subject, ViolationRule, UserRole, WaliKelasImportRow } from '../types';
import { CLASS_IDS } from './storage';

/**
 * Downloads a worksheet as a real .xlsx file
 */
export function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}

/**
 * Generates Template_Import_Wali_Kelas.xlsx
 * Columns: No, Username, Password, Kelas ID, Tahun Ajaran
 */
export function generateWaliKelasTemplate() {
  const headers = ['No', 'Username', 'Password', 'Kelas ID', 'Tahun Ajaran'];
  const sampleData = [
    [1, 'guru.sitirahmawati', 'password123', '7A', '2026/2027'],
    [2, 'guru.budihermawan', 'password123', '7B', '2026/2027'],
    [3, 'guru.nurulfaizah', 'password123', '7C', '2026/2027'],
    [4, 'guru.ahmadfauzi', 'password123', '7D', '2026/2027'],
    [5, 'guru.dewilestari', 'password123', '7E', '2026/2027'],
    [6, 'guru.hendrowibowo', 'password123', '7F', '2026/2027'],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 18 },
    { wch: 12 },
    { wch: 16 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Wali Kelas');
  downloadWorkbook(wb, 'Template_Import_Wali_Kelas.xlsx');
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
 * Columns: No, Username, Password, NIP, Nama, Jabatan, Mata Pelajaran, Wali Kelas
 */
export function generateTeacherTemplate() {
  const headers = ['No', 'Username', 'Password', 'NIP', 'Nama', 'Jabatan', 'Mata Pelajaran', 'Wali Kelas'];
  const sampleData = [
    [1, 'guru.sitirahmawati', 'Rahma2026!', '19750821 200003 2 001', 'Dra. Hj. Siti Rahmawati, M.Pd', 'Wali Kelas', 'Bahasa Indonesia', '7A'],
    [2, 'guru.budihermawan', 'Budi2026!', '19810312 200604 1 008', 'Budi Hermawan, S.Pd', 'Wali Kelas', 'Matematika', '7B'],
    [3, 'guru.nurulfaizah', 'Nurul2026!', '19850614 200902 2 003', 'Nurul Faizah, S.Pd., M.Si', 'Guru Mapel', 'Ilmu Pengetahuan Alam', ''],
    [4, 'guru.bambangbk', 'BK2026!Mantap', '19740915 199903 1 003', 'Drs. Bambang Irawan, M.Pd', 'Guru BK', 'Bimbingan Konseling', ''],
    [5, 'kepsek.mulyono', 'Kepsek2026!', '19720415 199803 1 004', 'Dr. H. Mulyono, M.Pd', 'Kepala Sekolah', 'Manajemen Sekolah', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 14 },
    { wch: 24 },
    { wch: 32 },
    { wch: 16 },
    { wch: 26 },
    { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Guru & Akun');
  downloadWorkbook(wb, 'Template_Import_Guru.xlsx');
}

/**
 * Generates Template_Import_Kelas.xlsx
 * Columns: No, Kelas, Tingkat, Tahun Ajaran
 */
export function generateClassTemplate() {
  const headers = ['No', 'Kelas', 'Tingkat', 'Tahun Ajaran'];
  const sampleData = [
    [1, '7A', '7', '2026/2027'],
    [2, '7B', '7', '2026/2027'],
    [3, '7C', '7', '2026/2027'],
    [4, '8A', '8', '2026/2027'],
    [5, '8B', '8', '2026/2027'],
    [6, '9A', '9', '2026/2027'],
    [7, '9B', '9', '2026/2027'],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 10 },
    { wch: 16 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Kelas');
  downloadWorkbook(wb, 'Template_Import_Kelas.xlsx');
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
 * Generates Template_Import_Mapel.xlsx
 * Columns: Id Mapel, Nama Mapel, Jam Mapel Per Minggu
 */
export function generateSubjectTemplate() {
  const headers = ['No', 'Id Mapel', 'Nama Mapel', 'Jam Mapel Per Minggu'];
  const sampleData = [
    [1, 'PAI', 'Pendidikan Agama dan Budi Pekerti', 3],
    [2, 'PPKN', 'Pendidikan Pancasila dan Kewarganegaraan', 3],
    [3, 'BIN', 'Bahasa Indonesia', 6],
    [4, 'MAT', 'Matematika', 5],
    [5, 'IPA', 'Ilmu Pengetahuan Alam', 5],
    [6, 'IPS', 'Ilmu Pengetahuan Sosial', 4],
    [7, 'BIG', 'Bahasa Inggris', 4],
    [8, 'INF', 'Informatika', 2],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 36 },
    { wch: 22 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Mata Pelajaran');
  downloadWorkbook(wb, 'Template_Import_Mapel.xlsx');
}

/**
 * Generates Template_Import_Kategori_Pelanggaran.xlsx
 * Columns: No, Kode, Kategori, Nama Pelanggaran, Poin, Keterangan
 */
export function generateViolationRuleTemplate() {
  const headers = ['No', 'Kode', 'Kategori', 'Nama Pelanggaran', 'Poin', 'Keterangan'];
  const sampleData = [
    [1, 'PLG01', 'Ringan', 'Terlambat masuk sekolah > 15 menit', 5, 'Tiba setelah bel dibunyikan'],
    [2, 'PLG02', 'Ringan', 'Seragam tidak sesuai ketentuan atribut', 5, 'Tidak memakai atribut lengkap'],
    [3, 'PLG03', 'Ringan', 'Rambut panjang / tidak rapi (siswa putra)', 8, 'Melebihi kerah kemeja'],
    [4, 'PLG04', 'Sedang', 'Meninggalkan kelas saat jam pelajaran (Membolos Jam Pelajaran)', 15, 'Keluar kelas tanpa izin guru saat KBM'],
    [5, 'PLG05', 'Sedang', 'Membawa gawai tanpa izin saat ujian/KBM', 15, 'Mengaktifkan smartphone saat KBM'],
    [6, 'PLG06', 'Sedang', 'Merusak fasilitas / sarana prasarana sekolah', 20, 'Vandalisme sarpras sekolah'],
    [7, 'PLG07', 'Berat', 'Terlibat perkelahian / pertengkaran fisik', 25, 'Kontak fisik mengganggu ketertiban'],
    [8, 'PLG08', 'Berat', 'Melakukan tindakan perundungan (Bullying)', 35, 'Intimidasi fisik/psikis siswa lain'],
    [9, 'PLG09', 'Berat', 'Membawa barang terlarang ke lingkungan sekolah', 50, 'Membawa benda berbahaya/terlarang'],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 12 },
    { wch: 42 },
    { wch: 8 },
    { wch: 35 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Kategori Pelanggaran');
  downloadWorkbook(wb, 'Template_Import_Kategori_Pelanggaran.xlsx');
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

export type ValidationItem<T> = ValidationItemResult<T>;

export function findFieldValue(row: Record<string, any>, candidateKeys: string[]): any {
  if (!row || typeof row !== 'object') return undefined;
  const rowKeys = Object.keys(row);
  for (const candidate of candidateKeys) {
    const candidateNormalized = candidate.toLowerCase().replace(/[\s_-]+/g, '');
    for (const key of rowKeys) {
      const keyNormalized = key.toLowerCase().replace(/[\s_-]+/g, '');
      if (keyNormalized === candidateNormalized) {
        return row[key];
      }
    }
  }
  return undefined;
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
    else if (availableClasses.length > 0 && !availableClasses.includes(classId)) {
      errors.push(`Kelas '${classId}' belum terdaftar di master kelas (Tersedia: ${availableClasses.join(', ')})`);
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
 * Validates Class rows with format: Kelas, Tingkat, Tahun Ajaran
 */
export function validateClassesImport(
  rawRows: any[],
  existingClasses: ClassRoom[]
): ValidationSummary<Partial<ClassRoom>> {
  const seenClassIds = new Set<string>(existingClasses.map((c) => c.classId.toUpperCase()));
  const batchClassIds = new Set<string>();

  const items: ValidationItemResult<Partial<ClassRoom>>[] = [];
  let validCount = 0;
  let invalidCount = 0;
  let dupCount = 0;

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const kelas = String(row['Kelas'] || row['kelas'] || row['Nama Kelas'] || row['Rombel'] || '').trim().toUpperCase();
    const rawTingkat = String(row['Tingkat'] || row['tingkat'] || row['Grade'] || '').trim();
    const rawTahun = String(row['Tahun Ajaran'] || row['tahun ajaran'] || row['tahun_ajaran'] || row['TahunAjaran'] || '').trim();

    const errors: string[] = [];
    let isDuplicate = false;

    if (!kelas) {
      errors.push('Nama/Kode Kelas wajib diisi (Contoh: 7A, 8B, 9C)');
    }

    // Auto extract grade level if not provided (e.g. '7' from '7A')
    let gradeLevel: '7' | '8' | '9' = '7';
    if (rawTingkat === '7' || rawTingkat === '8' || rawTingkat === '9') {
      gradeLevel = rawTingkat;
    } else if (kelas && ['7', '8', '9'].includes(kelas.charAt(0))) {
      gradeLevel = kelas.charAt(0) as '7' | '8' | '9';
    } else if (rawTingkat) {
      errors.push(`Tingkat '${rawTingkat}' tidak valid (hanya mendukung jenjang SMP: 7, 8, atau 9)`);
    }

    const academicYear = rawTahun || '2026/2027';

    if (kelas) {
      if (batchClassIds.has(kelas)) {
        errors.push(`Kelas '${kelas}' tercatat lebih dari satu kali dalam file Excel (duplikasi batch)`);
        isDuplicate = true;
      } else {
        batchClassIds.add(kelas);
      }

      if (seenClassIds.has(kelas)) {
        // Warning or duplicate flag
        isDuplicate = true;
      }
    }

    const isValid = errors.length === 0;
    if (isValid) validCount++;
    else invalidCount++;
    if (isDuplicate) dupCount++;

    items.push({
      rowNumber: rowNum,
      data: {
        classId: kelas,
        name: `Kelas ${kelas}`,
        gradeLevel,
        academicYear,
        studentCount: 0,
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
 * Username, Password, NIP, Nama, Jabatan, Mata Pelajaran, Wali Kelas
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
    const nip = String(row['NIP'] || row['nip'] || row['Nip'] || '').trim();
    const name = String(row['Nama'] || row['nama'] || row['name'] || '').trim();
    const jabatanRaw = String(row['Jabatan'] || row['jabatan'] || row['role'] || '').trim();
    const mapel = String(row['Mata Pelajaran'] || row['mata pelajaran'] || row['mata_pelajaran'] || row['Mapel'] || '').trim();
    const waliKelas = String(
      row['Wali Kelas'] ||
      row['wali kelas'] ||
      row['wali_kelas'] ||
      row['WaliKelas'] ||
      row['Kelas'] ||
      row['kelas'] ||
      ''
    ).trim().toUpperCase();

    // Determine normalized role from Jabatan or Wali Kelas assignment
    let role: UserRole = 'guru_mapel';
    const jLow = jabatanRaw.toLowerCase();
    if (waliKelas || jLow.includes('wali')) {
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
    if (!jabatanRaw && !waliKelas) {
      errors.push('Jabatan guru wajib diisi (Contoh: Guru Mapel, Wali Kelas, Kepala Sekolah, Guru BK)');
    }

    if (role === 'wali_kelas' && !waliKelas) {
      errors.push('Kolom Wali Kelas wajib diisi untuk jabatan Wali Kelas (Contoh: 7A, 8B)');
    } else if (waliKelas && availableClasses.length > 0 && !availableClasses.includes(waliKelas)) {
      errors.push(`Wali Kelas '${waliKelas}' tidak terdaftar dalam data kelas sekolah (Tersedia: ${availableClasses.slice(0, 8).join(', ')}...)`);
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
      batchUsernames.set(username, { name, password, nip, role, classId: waliKelas, teacherCode, mapel });
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
        nip: nip || undefined,
        name,
        role,
        classId: waliKelas || undefined,
        teacherCode,
        subject: mapel || (role === 'guru_bk' ? 'Bimbingan Konseling' : 'Umum'),
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

/**
 * Validates Subject rows with columns:
 * Id Mapel, Nama Mapel, Jam Mapel Per Minggu
 */
export function validateSubjectsImport(
  rawRows: any[],
  existingSubjects: Subject[]
): ValidationSummary<Subject> {
  const seenCodes = new Set<string>(existingSubjects.map((s) => s.code.toUpperCase()));
  const batchCodes = new Set<string>();

  const items: ValidationItemResult<Subject>[] = [];
  let validCount = 0;
  let invalidCount = 0;
  let dupCount = 0;

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const code = String(row['Id Mapel'] || row['id_mapel'] || row['ID Mapel'] || row['Kode'] || row['Code'] || '').trim().toUpperCase();
    const name = String(row['Nama Mapel'] || row['nama_mapel'] || row['Nama'] || row['Mata Pelajaran'] || '').trim();
    const rawHours = row['Jam Mapel Per Minggu'] || row['jam_mapel_per_minggu'] || row['Jam Mapel'] || row['Jam'] || row['JP'] || 2;
    const weeklyHours = Number(rawHours) || 2;

    const errors: string[] = [];
    let isDuplicate = false;

    if (!code) errors.push('Id Mapel / Kode wajib diisi');
    if (!name) errors.push('Nama Mapel wajib diisi');
    if (weeklyHours <= 0) errors.push('Jam Mapel Per Minggu harus bernilai lebih dari 0');

    if (code) {
      if (batchCodes.has(code)) {
        errors.push(`Id Mapel '${code}' tercatat duplikat di dalam berkas Excel`);
        isDuplicate = true;
      } else {
        batchCodes.add(code);
      }

      if (seenCodes.has(code)) {
        isDuplicate = true;
      }
    }

    const isValid = errors.length === 0;
    if (isValid) validCount++;
    else invalidCount++;
    if (isDuplicate) dupCount++;

    items.push({
      rowNumber: rowNum,
      data: {
        code,
        name,
        hoursPerWeek: weeklyHours,
        weeklyHours,
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
 * Validates Violation Rule rows with columns:
 * Kode, Kategori, Nama Pelanggaran, Poin, Keterangan
 */
export function validateViolationRulesImport(
  rawRows: any[],
  existingRules: ViolationRule[]
): ValidationSummary<ViolationRule> {
  const seenCodes = new Set<string>(existingRules.map((r) => r.code.toUpperCase()));
  const batchCodes = new Set<string>();

  const items: ValidationItemResult<ViolationRule>[] = [];
  let validCount = 0;
  let invalidCount = 0;
  let dupCount = 0;

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const code = String(row['Kode'] || row['kode'] || row['Kode Pelanggaran'] || '').trim().toUpperCase();
    const categoryRaw = String(row['Kategori'] || row['kategori'] || '').trim().toLowerCase();
    const name = String(row['Nama Pelanggaran'] || row['nama_pelanggaran'] || row['Pelanggaran'] || row['Nama'] || '').trim();
    const rawPoints = row['Poin'] || row['poin'] || row['Point'] || row['Bobot'] || 5;
    const points = Number(rawPoints) || 5;
    const description = String(row['Keterangan'] || row['keterangan'] || row['Deskripsi'] || '').trim();

    let category: 'Ringan' | 'Sedang' | 'Berat' = 'Ringan';
    if (categoryRaw.includes('berat')) {
      category = 'Berat';
    } else if (categoryRaw.includes('sedang')) {
      category = 'Sedang';
    } else {
      category = 'Ringan';
    }

    const errors: string[] = [];
    let isDuplicate = false;

    if (!code) errors.push('Kode Pelanggaran wajib diisi');
    if (!name) errors.push('Nama Pelanggaran wajib diisi');
    if (points <= 0) errors.push('Poin pelanggaran harus lebih dari 0');

    if (code) {
      if (batchCodes.has(code)) {
        errors.push(`Kode '${code}' tercatat duplikat di dalam berkas Excel`);
        isDuplicate = true;
      } else {
        batchCodes.add(code);
      }

      if (seenCodes.has(code)) {
        isDuplicate = true;
      }
    }

    const isValid = errors.length === 0;
    if (isValid) validCount++;
    else invalidCount++;
    if (isDuplicate) dupCount++;

    items.push({
      rowNumber: rowNum,
      data: {
        id: `rule_${Date.now()}_${idx}`,
        code,
        category,
        name,
        points,
        description: description || name,
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
 * Validates Excel rows for Wali Kelas import
 * Columns: Username, Password, Kelas ID, Tahun Ajaran
 */
export function validateWaliKelasImport(
  rawRows: Record<string, any>[],
  existingTeachers: Teacher[],
  availableClasses: ClassRoom[]
): ValidationSummary<WaliKelasImportRow> {
  const items: ValidationItem<WaliKelasImportRow>[] = [];
  const validClassSet = new Set(availableClasses.map((c) => c.classId.toUpperCase()));
  const batchUsers = new Set<string>();
  const batchClasses = new Set<string>();

  let validCount = 0;
  let invalidCount = 0;
  let dupCount = 0;

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const username = String(
      findFieldValue(row, ['username', 'user', 'nama pengguna', 'akun']) || ''
    ).trim();

    const password = String(
      findFieldValue(row, ['password', 'sandi', 'pass', 'kata sandi']) || 'password123'
    ).trim();

    const classIdRaw = String(
      findFieldValue(row, ['kelas id', 'kelas_id', 'kelas', 'rombel', 'id kelas']) || ''
    ).trim();
    const classId = classIdRaw.toUpperCase();

    const academicYear = String(
      findFieldValue(row, ['tahun ajaran', 'tahun_ajaran', 'ta', 'tp', 'periode']) || '2026/2027'
    ).trim();

    const errors: string[] = [];
    let isDuplicate = false;

    if (!username) errors.push('Username wali kelas wajib diisi');
    if (!classId) errors.push('Kelas ID wajib diisi');
    else if (!validClassSet.has(classId) && !CLASS_IDS.includes(classId)) {
      errors.push(`Kelas ID '${classId}' tidak terdaftar dalam rombel sekolah (7A–9H)`);
    }

    if (username) {
      const lower = username.toLowerCase();
      if (batchUsers.has(lower)) {
        errors.push(`Username '${username}' duplikat di dalam berkas Excel ini`);
        isDuplicate = true;
      } else {
        batchUsers.add(lower);
      }
    }

    if (classId) {
      if (batchClasses.has(classId)) {
        errors.push(`Kelas ID '${classId}' ditugaskan ke lebih dari satu wali kelas di berkas Excel ini`);
        isDuplicate = true;
      } else {
        batchClasses.add(classId);
      }
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
        classId,
        academicYear,
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
