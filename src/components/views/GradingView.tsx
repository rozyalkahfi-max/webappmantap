import React, { useState, useEffect } from 'react';
import { Award, Save, Download, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { StudentGrade } from '../../types';
import { exportToExcel } from '../../utils/excel';

export const GradingView: React.FC = () => {
  const { students, classes, subjects, grades, saveBatchGrades, settings } = useSchool();
  const { currentUser, activeRole } = useAuth();

  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.classId || '7A');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>(subjects[0]?.code || 'BIN');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable scores state: studentId -> scores object
  const [localScores, setLocalScores] = useState<Record<string, {
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
  const kkm = currentSubject?.passingGrade || 75;

  // Initialize or load grades
  useEffect(() => {
    const map: Record<string, any> = {};
    classStudents.forEach((st) => {
      const existing = grades.find(
        (g) => g.studentId === st.id && g.subjectCode === selectedSubjectCode
      );
      if (existing) {
        map[st.id] = { ...existing.scores };
      } else {
        // Default template scores 75
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
    setLocalScores(map);
    setSaveSuccess(false);
  }, [selectedClass, selectedSubjectCode, grades]);

  const handleScoreChange = (studentId: string, field: string, val: string) => {
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    setLocalScores((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { tugas: 0, kuis: 0, praktik: 0, proyek: 0, ph: 0, pts: 0, pas: 0 }),
        [field]: num,
      },
    }));
  };

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

  const handleSaveAll = () => {
    const batchList: Partial<StudentGrade>[] = classStudents.map((st) => {
      const sc = localScores[st.id] || { tugas: 0, kuis: 0, praktik: 0, proyek: 0, ph: 0, pts: 0, pas: 0 };
      return {
        studentId: st.id,
        studentName: st.name,
        classId: selectedClass,
        subjectCode: selectedSubjectCode,
        subjectName: currentSubject?.name || selectedSubjectCode,
        teacherCode: currentUser?.teacherCode || 'G01',
        academicYear: settings.activeAcademicYear,
        semester: settings.activeSemester,
        scores: sc,
      };
    });

    saveBatchGrades(batchList);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExport = () => {
    const data = classStudents.map((st, idx) => {
      const sc = localScores[st.id] || { tugas: 0, kuis: 0, praktik: 0, proyek: 0, ph: 0, pts: 0, pas: 0 };
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

    exportToExcel(data, `Nilai_${selectedSubjectCode}`, `Nilai_${selectedClass}_${selectedSubjectCode}_${Date.now()}`);
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
            Pengelolaan 7 komponen penilaian (Tugas, Kuis, Praktik, Proyek, PH, PTS, PAS) dengan kalkulasi otomatis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor Excel</span>
          </button>
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Seluruh Nilai</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon & Weights Legend */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  {s.name} ({s.code}) · KKM {s.passingGrade}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Weights indicator */}
        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-800">Bobot Penilaian:</span>
          <span className="font-mono text-[11px] text-slate-600">Tugas 15% · Kuis 10% · Praktik 15% · Proyek 15% · PH 15% · PTS 15% · PAS 15%</span>
          <span className="text-blue-700 font-bold ml-auto font-mono">KKM: {kkm}</span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Seluruh data nilai kelas {selectedClass} mata pelajaran {currentSubject?.name} berhasil disimpan.</span>
        </div>
      )}

      {/* Grade Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            Form Nilai {currentSubject?.name} · Kelas {selectedClass} ({classStudents.length} Siswa)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Nilai Akhir dan Predikat terhitung secara real-time
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3 w-20">NIS</th>
                <th className="py-2.5 px-3 min-w-[160px]">Nama Siswa</th>
                <th className="py-2.5 px-2 text-center w-16">Tugas (15%)</th>
                <th className="py-2.5 px-2 text-center w-16">Kuis (10%)</th>
                <th className="py-2.5 px-2 text-center w-16">Praktik (15%)</th>
                <th className="py-2.5 px-2 text-center w-16">Proyek (15%)</th>
                <th className="py-2.5 px-2 text-center w-16">PH (15%)</th>
                <th className="py-2.5 px-2 text-center w-16">PTS (15%)</th>
                <th className="py-2.5 px-2 text-center w-16">PAS (15%)</th>
                <th className="py-2.5 px-3 text-center w-20 bg-blue-50/60 text-blue-900">Nilai Akhir</th>
                <th className="py-2.5 px-3 text-center w-16 bg-blue-50/60 text-blue-900">Predikat</th>
                <th className="py-2.5 px-3 text-center w-24">Status KKM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((st, idx) => {
                const sc = localScores[st.id] || { tugas: 0, kuis: 0, praktik: 0, proyek: 0, ph: 0, pts: 0, pas: 0 };
                const finalScore = calculateFinal(sc);
                let letter: 'A' | 'B' | 'C' | 'D' = 'C';
                if (finalScore >= 90) letter = 'A';
                else if (finalScore >= 80) letter = 'B';
                else if (finalScore >= 70) letter = 'C';
                else letter = 'D';

                const isPass = finalScore >= kkm;

                return (
                  <tr key={st.id} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-600">{st.nis}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900 truncate max-w-[180px]">{st.name}</td>

                    {/* Inputs */}
                    <td className="py-1.5 px-1 text-center">
                      <input
                        type="number"
                        value={sc.tugas}
                        onChange={(e) => handleScoreChange(st.id, 'tugas', e.target.value)}
                        min="0"
                        max="100"
                        className="w-14 text-center font-mono py-1 px-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-1 text-center">
                      <input
                        type="number"
                        value={sc.kuis}
                        onChange={(e) => handleScoreChange(st.id, 'kuis', e.target.value)}
                        min="0"
                        max="100"
                        className="w-14 text-center font-mono py-1 px-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-1 text-center">
                      <input
                        type="number"
                        value={sc.praktik}
                        onChange={(e) => handleScoreChange(st.id, 'praktik', e.target.value)}
                        min="0"
                        max="100"
                        className="w-14 text-center font-mono py-1 px-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-1 text-center">
                      <input
                        type="number"
                        value={sc.proyek}
                        onChange={(e) => handleScoreChange(st.id, 'proyek', e.target.value)}
                        min="0"
                        max="100"
                        className="w-14 text-center font-mono py-1 px-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-1 text-center">
                      <input
                        type="number"
                        value={sc.ph}
                        onChange={(e) => handleScoreChange(st.id, 'ph', e.target.value)}
                        min="0"
                        max="100"
                        className="w-14 text-center font-mono py-1 px-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-1 text-center">
                      <input
                        type="number"
                        value={sc.pts}
                        onChange={(e) => handleScoreChange(st.id, 'pts', e.target.value)}
                        min="0"
                        max="100"
                        className="w-14 text-center font-mono py-1 px-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-1 text-center">
                      <input
                        type="number"
                        value={sc.pas}
                        onChange={(e) => handleScoreChange(st.id, 'pas', e.target.value)}
                        min="0"
                        max="100"
                        className="w-14 text-center font-mono py-1 px-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                      />
                    </td>

                    {/* Calculated Final Score */}
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-900 bg-blue-50/40 tabular-nums">
                      {finalScore}
                    </td>
                    <td className="py-2 px-3 text-center font-bold bg-blue-50/40 text-blue-700">
                      {letter}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`text-[11px] font-semibold ${
                          isPass ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {isPass ? 'Tuntas' : 'Remedial'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
