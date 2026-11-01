import React, { useState, useEffect } from 'react';
import {
  Award,
  Save,
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { StudentGrade, DailyScoreRecord } from '../../types';
import { exportToExcel } from '../../utils/excel';

export const GradingView: React.FC = () => {
  const {
    students,
    classes,
    subjects,
    grades,
    saveBatchGrades,
    dailyScores,
    saveDailyScoreBatch,
    settings,
  } = useSchool();
  const { currentUser, activeRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'per_date' | 'rekap'>('per_date');
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.classId || '7A');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>(subjects[0]?.code || 'BIN');

  // Network/Local Timezone Date
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  type AssessmentType = 'ph' | 'pts' | 'pas' | 'tugas' | 'kuis' | 'praktik' | 'proyek';
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('ph');
  const [assessmentTitle, setAssessmentTitle] = useState('Asesmen Formatif Lingkup Materi');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Daily scores input map: studentId -> number
  const [dateScores, setDateScores] = useState<Record<string, number>>({});

  // Rekap cumulative scores map: studentId -> scores object
  const [rekapScores, setRekapScores] = useState<Record<string, {
    tugas: number;
    kuis: number;
    praktik: number;
    proyek: number;
    ph: number;
    pts: number;
    pas: number;
  }>>({});

  const classStudents = students.filter((s) => s.classId === selectedClass);
  const currentSubject = subjects.find((s) => s.code === selectedSubjectCode);
  const kkm = 75; // Standar ketuntasan SMP

  const assessmentLabels: Record<AssessmentType, string> = {
    ph: 'Penilaian Harian (PH) / Formatif',
    pts: 'Penilaian Tengah Semester (PTS)',
    pas: 'Penilaian Akhir Semester (PAS / PAT)',
    tugas: 'Tugas Terstruktur / Mandiri',
    kuis: 'Kuis & Evaluasi Cepat',
    praktik: 'Unjuk Kerja / Praktik',
    proyek: 'Tugas Proyek / Portofolio',
  };

  // Sync date-based score inputs whenever class, subject, date, or assessmentType changes
  useEffect(() => {
    const scoresMap: Record<string, number> = {};

    classStudents.forEach((st) => {
      // Look for a recorded daily score on this specific date & assessmentType
      const match = dailyScores.find(
        (d) =>
          d.studentId === st.id &&
          d.subjectCode === selectedSubjectCode &&
          d.date === selectedDate &&
          d.assessmentType === assessmentType
      );

      if (match) {
        scoresMap[st.id] = match.score;
      } else {
        // Requirement 6: "pada saat tanggal di klik sesuai zona waktu maka nilai tersebut 0 namun sudah tersimpan di sistem nilai nilai sebelumnya di rekap nilai mapel"
        scoresMap[st.id] = 0;
      }
    });

    setDateScores(scoresMap);
    setSaveSuccess(false);
  }, [selectedClass, selectedSubjectCode, selectedDate, assessmentType, dailyScores]);

  // Sync cumulative rekap scores from stored grades
  useEffect(() => {
    const map: Record<string, any> = {};
    classStudents.forEach((st) => {
      const existing = grades.find(
        (g) => g.studentId === st.id && g.subjectCode === selectedSubjectCode
      );
      if (existing) {
        map[st.id] = { ...existing.scores };
      } else {
        map[st.id] = {
          tugas: 80,
          kuis: 78,
          praktik: 82,
          proyek: 80,
          ph: 79,
          pts: 77,
          pas: 80,
        };
      }
    });
    setRekapScores(map);
  }, [selectedClass, selectedSubjectCode, grades]);

  const handleDateScoreChange = (studentId: string, val: string) => {
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    setDateScores((prev) => ({
      ...prev,
      [studentId]: num,
    }));
  };

  const handleQuickFillDateScores = (scoreValue: number) => {
    const updated: Record<string, number> = {};
    classStudents.forEach((st) => {
      updated[st.id] = scoreValue;
    });
    setDateScores(updated);
  };

  // Save per-date assessments into dailyScores AND update cumulative subject recap
  const handleSaveDateAssessment = () => {
    const dateRecordsToSave: DailyScoreRecord[] = classStudents.map((st) => ({
      id: `DSC_${st.id}_${selectedSubjectCode}_${selectedDate}_${assessmentType}`,
      studentId: st.id,
      studentName: st.name,
      classId: selectedClass,
      subjectCode: selectedSubjectCode,
      assessmentType,
      date: selectedDate,
      score: dateScores[st.id] || 0,
      title: assessmentTitle,
    }));

    // 1. Save to dailyScores
    saveDailyScoreBatch(dateRecordsToSave);

    // 2. Update cumulative subject grade recap
    const batchList: Partial<StudentGrade>[] = classStudents.map((st) => {
      const existingGrade = grades.find(
        (g) => g.studentId === st.id && g.subjectCode === selectedSubjectCode
      );
      const currentScores = existingGrade?.scores || {
        tugas: 75,
        kuis: 75,
        praktik: 75,
        proyek: 75,
        ph: 75,
        pts: 75,
        pas: 75,
      };

      const updatedScores = {
        ...currentScores,
        [assessmentType]: dateScores[st.id] || 0,
      };

      return {
        studentId: st.id,
        studentName: st.name,
        classId: selectedClass,
        subjectCode: selectedSubjectCode,
        subjectName: currentSubject?.name || selectedSubjectCode,
        teacherCode: currentUser?.teacherCode || 'G01',
        academicYear: settings.activeAcademicYear,
        semester: settings.activeSemester,
        scores: updatedScores,
      };
    });

    saveBatchGrades(batchList);

    setSaveMessage(
      `Nilai ${assessmentLabels[assessmentType]} tanggal ${selectedDate} berhasil disimpan dan otomatis disinkronkan ke Rekap Nilai Mapel!`
    );
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4500);
  };

  // Calculate final score
  const calculateFinal = (sc: any) => {
    if (!sc) return 0;
    return Math.round(
      (sc.tugas || 0) * 0.15 +
      (sc.kuis || 0) * 0.10 +
      (sc.praktik || 0) * 0.15 +
      (sc.proyek || 0) * 0.15 +
      (sc.ph || 0) * 0.15 +
      (sc.pts || 0) * 0.15 +
      (sc.pas || 0) * 0.15
    );
  };

  const handleExport = () => {
    const data = classStudents.map((st, idx) => {
      const sc = rekapScores[st.id] || { tugas: 0, kuis: 0, praktik: 0, proyek: 0, ph: 0, pts: 0, pas: 0 };
      const finalScore = calculateFinal(sc);
      let letter = 'C';
      if (finalScore >= 90) letter = 'A';
      else if (finalScore >= 80) letter = 'B';
      else if (finalScore >= 70) letter = 'C';
      else letter = 'D';

      return {
        No: idx + 1,
        NIS: st.nis,
        NISN: st.nisn,
        'Nama Siswa': st.name,
        Kelas: st.classId,
        'Mata Pelajaran': currentSubject?.name || selectedSubjectCode,
        'Tugas (15%)': sc.tugas,
        'Kuis (10%)': sc.kuis,
        'Praktik (15%)': sc.praktik,
        'Proyek (15%)': sc.proyek,
        'PH (15%)': sc.ph,
        'PTS (15%)': sc.pts,
        'PAS (15%)': sc.pas,
        'Nilai Akhir': finalScore,
        Predikat: letter,
        Ketuntasan: finalScore >= kkm ? 'Tuntas' : 'Belum Tuntas',
      };
    });

    exportToExcel(data, `Rekap_Nilai_${selectedSubjectCode}`, `Rekap_Nilai_${selectedClass}_${selectedSubjectCode}_${Date.now()}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Penilaian Hasil Belajar Peserta Didik
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Input asesmen berbasis tanggal pelaksanaan KBM dengan sinkronisasi otomatis ke rekap leger nilai
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('per_date')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'per_date'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Input Nilai Per Tanggal</span>
          </button>

          <button
            onClick={() => setActiveTab('rekap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'rekap'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Rekap Nilai Mapel</span>
          </button>
        </div>
      </div>

      {/* Global Filter: Rombel & Mapel */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Rombel / Kelas</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-bold text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {classes.map((c) => (
                <option key={c.classId} value={c.classId}>
                  {c.classId} ({c.studentCount} Siswa)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mata Pelajaran</label>
            <select
              value={selectedSubjectCode}
              onChange={(e) => setSelectedSubjectCode(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {subjects.map((s) => (
                <option key={s.code} value={s.code}>
                  [{s.code}] {s.name} · {s.hoursPerWeek} JP/Minggu
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeTab === 'rekap' && (
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Ekspor Rekap Excel</span>
          </button>
        )}
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-semibold shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* TAB 1: INPUT NILAI PER TANGGAL */}
      {activeTab === 'per_date' && (
        <div className="space-y-4">
          {/* Date & Assessment Type Configuration Card */}
          <div className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-blue-50/40 border border-blue-200/80 rounded-xl p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tanggal Penilaian (Sesuai Zona Jaringan)</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white font-mono font-semibold text-slate-900"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jenis Asesmen
                </label>
                <select
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white font-semibold text-slate-900"
                >
                  <option value="ph">Penilaian Harian (PH) / Formatif</option>
                  <option value="pts">Penilaian Tengah Semester (PTS)</option>
                  <option value="pas">Penilaian Akhir Semester (PAS / PAT)</option>
                  <option value="tugas">Tugas Terstruktur / Mandiri</option>
                  <option value="kuis">Kuis / Evaluasi Singkat</option>
                  <option value="praktik">Unjuk Kerja / Praktik</option>
                  <option value="proyek">Tugas Proyek / Portofolio</option>
                </select>
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul / Lingkup Materi
                </label>
                <input
                  type="text"
                  value={assessmentTitle}
                  onChange={(e) => setAssessmentTitle(e.target.value)}
                  placeholder="Contoh: PH 1 Teks Deskripsi atau PTS Ganjil"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white text-slate-900"
                />
              </div>
            </div>

            {/* Explanatory Notice */}
            <div className="p-2.5 bg-white/90 border border-blue-200/60 rounded-lg flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Aturan Nilai Per Tanggal:</strong> Ketika tanggal diklik/diubah, nilai pada formulir ini dimulai dari <strong>0</strong> jika belum pernah diinput pada tanggal tersebut. Seluruh akumulasi nilai yang diinput sebelumnya <strong>tetap tersimpan aman di Rekap Nilai Mapel</strong>.
              </div>
            </div>

            {/* Quick Actions & Save Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-blue-100">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600 mr-1">Isi Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleQuickFillDateScores(85)}
                  className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors"
                >
                  Semua 85
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFillDateScores(80)}
                  className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors"
                >
                  Semua 80
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFillDateScores(75)}
                  className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors"
                >
                  Semua 75 (KKM)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFillDateScores(0)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 underline"
                >
                  Reset ke 0
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveDateAssessment}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Nilai Tanggal {selectedDate}</span>
              </button>
            </div>
          </div>

          {/* Student Scores Table for this Date */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Input Nilai: {assessmentLabels[assessmentType]} · Tanggal {selectedDate} ({classStudents.length} Siswa)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Rentang nilai 0–100
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="py-2.5 px-3 w-12 text-center">No</th>
                    <th className="py-2.5 px-3 w-28">NIS</th>
                    <th className="py-2.5 px-4">Nama Peserta Didik</th>
                    <th className="py-2.5 px-3 w-24 text-center">Gender</th>
                    <th className="py-2.5 px-4 w-40 text-center font-bold text-blue-900 bg-blue-50/50">
                      Nilai ({assessmentType.toUpperCase()})
                    </th>
                    <th className="py-2.5 px-4 w-32 text-center">Predikat</th>
                    <th className="py-2.5 px-4 text-slate-500">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((st, idx) => {
                    const score = dateScores[st.id] ?? 0;
                    let badge = 'C';
                    if (score >= 90) badge = 'A (Sangat Baik)';
                    else if (score >= 80) badge = 'B (Baik)';
                    else if (score >= 75) badge = 'C (Cukup)';
                    else if (score > 0) badge = 'D (Kurang)';
                    else badge = '-';

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-slate-700">
                          {st.nis}
                        </td>
                        <td className="py-2 px-4 font-semibold text-slate-900">
                          {st.name}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-500 font-mono">
                          {st.gender}
                        </td>
                        <td className="py-2 px-4 text-center bg-blue-50/20">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={score === 0 ? '' : score}
                            placeholder="0"
                            onChange={(e) => handleDateScoreChange(st.id, e.target.value)}
                            className="w-24 text-center py-1 font-mono font-bold text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-slate-900"
                          />
                        </td>
                        <td className="py-2 px-4 text-center">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                              score >= 75
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : score > 0
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'text-slate-400'
                            }`}
                          >
                            {badge}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-slate-500 text-[11px]">
                          {score === 0 ? 'Belum dimasukkan / nilai 0' : score >= 75 ? 'Tuntas' : 'Perlu Remedial'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REKAP NILAI AKUMULATIF MAPEL */}
      {activeTab === 'rekap' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-4 p-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Rekapitulasi Nilai Kumulatif Kelas {selectedClass} - {currentSubject?.name}
            </h3>
            <p className="text-xs text-slate-500">
              Seluruh asesmen (Tugas, Kuis, Praktik, Proyek, PH, PTS, PAS) yang tersimpan permanen di sistem
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <th className="py-2.5 px-2 w-10 text-center">No</th>
                  <th className="py-2.5 px-3 w-20">NIS</th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-2 text-center">Tugas (15%)</th>
                  <th className="py-2.5 px-2 text-center">Kuis (10%)</th>
                  <th className="py-2.5 px-2 text-center">Praktik (15%)</th>
                  <th className="py-2.5 px-2 text-center">Proyek (15%)</th>
                  <th className="py-2.5 px-2 text-center">PH (15%)</th>
                  <th className="py-2.5 px-2 text-center">PTS (15%)</th>
                  <th className="py-2.5 px-2 text-center">PAS (15%)</th>
                  <th className="py-2.5 px-2 text-center bg-blue-50 font-bold text-blue-900">Nilai Akhir</th>
                  <th className="py-2.5 px-2 text-center">Predikat</th>
                  <th className="py-2.5 px-2 text-center">Ketuntasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((st, idx) => {
                  const sc = rekapScores[st.id] || { tugas: 0, kuis: 0, praktik: 0, proyek: 0, ph: 0, pts: 0, pas: 0 };
                  const finalScore = calculateFinal(sc);
                  let letter = 'C';
                  if (finalScore >= 90) letter = 'A';
                  else if (finalScore >= 80) letter = 'B';
                  else if (finalScore >= 70) letter = 'C';
                  else letter = 'D';

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80">
                      <td className="py-2 px-2 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700">
                        {st.nis}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {st.name}
                      </td>
                      <td className="py-2 px-2 text-center font-mono">{sc.tugas}</td>
                      <td className="py-2 px-2 text-center font-mono">{sc.kuis}</td>
                      <td className="py-2 px-2 text-center font-mono">{sc.praktik}</td>
                      <td className="py-2 px-2 text-center font-mono">{sc.proyek}</td>
                      <td className="py-2 px-2 text-center font-mono font-semibold text-blue-700">{sc.ph}</td>
                      <td className="py-2 px-2 text-center font-mono font-semibold text-indigo-700">{sc.pts}</td>
                      <td className="py-2 px-2 text-center font-mono font-semibold text-purple-700">{sc.pas}</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-blue-950 bg-blue-50/50">
                        {finalScore}
                      </td>
                      <td className="py-2 px-2 text-center font-bold">
                        {letter}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            finalScore >= kkm
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {finalScore >= kkm ? 'Tuntas' : 'Belum Tuntas'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
