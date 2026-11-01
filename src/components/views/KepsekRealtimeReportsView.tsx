import React, { useState, useMemo } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  BookOpen,
  GraduationCap,
  Users,
  Search,
  Filter,
  Eye,
  X,
  MessageSquare,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

interface RealtimeReportItem {
  id: string;
  sourceType: 'guru_mapel' | 'wali_kelas' | 'guru_bk' | 'pelanggaran';
  senderName: string;
  senderRoleTitle: string;
  senderCode?: string;
  targetClass?: string;
  targetStudent?: string;
  timestamp: string;
  title: string;
  summary: string;
  details: string;
  points?: number;
  status: 'Baru Masuk' | 'Terpantau Kepsek' | 'Ditindaklanjuti';
  urgency: 'Normal' | 'Perhatian' | 'Prioritas Tinggi';
}

export const KepsekRealtimeReportsView: React.FC = () => {
  const {
    attendanceSessions,
    violations,
    counselingRecords,
    classes,
    teachers,
    settings,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<
    'all' | 'guru_mapel' | 'wali_kelas' | 'guru_bk'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<RealtimeReportItem | null>(null);

  // Compile real-time incoming reports from attendance, violations, and counseling
  const incomingReports = useMemo(() => {
    const list: RealtimeReportItem[] = [];

    // 1. Reports from Guru Mapel (Presensi & KBM sessions)
    attendanceSessions.forEach((ses, idx) => {
      let hadir = 0;
      let sakit = 0;
      let izin = 0;
      let alpa = 0;
      Object.values(ses.records).forEach((st) => {
        if (st === 'Hadir') hadir++;
        else if (st === 'Sakit') sakit++;
        else if (st === 'Izin') izin++;
        else if (st === 'Alpa') alpa++;
      });

      list.push({
        id: `REP_KBM_${ses.id}`,
        sourceType: 'guru_mapel',
        senderName: ses.teacherName,
        senderRoleTitle: 'Guru Mata Pelajaran',
        senderCode: ses.teacherCode,
        targetClass: ses.classId,
        timestamp: `${ses.date} 0${(idx % 4) + 7}:30 WIB`,
        title: `Laporan Presensi KBM: ${ses.subjectName} (Kelas ${ses.classId})`,
        summary: `Sesi Jam Ke-${ses.period} selesai dilaksanakan. ${hadir} Hadir, ${sakit} Sakit, ${izin} Izin, ${alpa} Alpa.`,
        details: `Guru pengampu ${ses.teacherName} telah menyelesaikan administrasi presensi dan materi: "${ses.topic || 'Pembelajaran reguler'}" di Kelas ${ses.classId}. Jurnal harian terisi lengkap.`,
        status: 'Terpantau Kepsek',
        urgency: alpa > 0 ? 'Perhatian' : 'Normal',
      });
    });

    // 2. Reports from Guru Pencatat Pelanggaran (Kedisiplinan)
    violations.forEach((v) => {
      const isHighPriority = v.points >= 25;
      list.push({
        id: `REP_VIO_${v.id}`,
        sourceType: 'pelanggaran',
        senderName: v.reporterName,
        senderRoleTitle: 'Guru Pencatat Pelanggaran',
        senderCode: v.reporterCode,
        targetClass: v.classId,
        targetStudent: v.studentName,
        timestamp: `${v.date} 10:15 WIB`,
        title: `Laporan Pelanggaran Tata Tertib: ${v.studentName} (Kelas ${v.classId})`,
        summary: `${v.violationType} (${v.category}) · Bobot Sanksi +${v.points} Poin.`,
        details: `Insiden dilaporkan oleh ${v.reporterName}. Kronologi: ${v.description || v.violationType}. Catatan: ${v.notes || 'Telah dicatat dalam sistem kedisiplinan dan diteruskan ke Walas & BK.'}`,
        points: v.points,
        status: 'Terpantau Kepsek',
        urgency: isHighPriority ? 'Prioritas Tinggi' : 'Perhatian',
      });
    });

    // 3. Reports from Wali Kelas (Pembinaan Khusus Walas < 30 Poin)
    classes.slice(0, 8).forEach((cls, idx) => {
      list.push({
        id: `REP_WALAS_${cls.classId}`,
        sourceType: 'wali_kelas',
        senderName: cls.homeroomTeacherName || 'Wali Kelas',
        senderRoleTitle: `Wali Kelas ${cls.classId}`,
        targetClass: cls.classId,
        timestamp: `2026-10-31 09:${20 + idx} WIB`,
        title: `Laporan Pembinaan Budi Pekerti & Disiplin Kelas ${cls.classId}`,
        summary: `Wali kelas melaksanakan evaluasi berkala dan bimbingan moral peserta didik binaan.`,
        details: `Wali kelas ${cls.homeroomTeacherName} memantau perkembangan budi pekerti, memeriksa kerapian seragam, dan membina siswa yang memiliki catatan pelanggaran ringan (<30 poin) agar tidak tereskalasi ke BK.`,
        status: 'Terpantau Kepsek',
        urgency: 'Normal',
      });
    });

    // 4. Reports from Guru BK (Penanganan Kasus & Konseling >30-50 Poin)
    counselingRecords.forEach((c) => {
      list.push({
        id: `REP_BK_${c.id}`,
        sourceType: 'guru_bk',
        senderName: c.counselorName,
        senderRoleTitle: 'Guru Bimbingan Konseling (BK)',
        targetClass: c.classId,
        targetStudent: c.studentName,
        timestamp: `${c.date} 14:00 WIB`,
        title: `Laporan Penanganan Kasus Konseling BK: ${c.studentName} (Kelas ${c.classId})`,
        summary: `Kasus Prioritas BK (${c.totalPoints} Poin). Metode: ${c.counselingMethod}. Status: ${c.status}.`,
        details: `Konselor BK ${c.counselorName} telah menindaklanjuti eskalasi pelanggaran di atas 30 poin. Masalah teridentifikasi: "${c.identifiedProblem}". Hasil konseling: "${c.counselingResult}". Rencana aksi: "${c.actionPlan}".`,
        points: c.totalPoints,
        status: 'Terpantau Kepsek',
        urgency: 'Prioritas Tinggi',
      });
    });

    return list;
  }, [attendanceSessions, violations, counselingRecords, classes]);

  const filteredReports = useMemo(() => {
    return incomingReports.filter((rep) => {
      if (activeTab === 'guru_mapel' && rep.sourceType !== 'guru_mapel') return false;
      if (activeTab === 'wali_kelas' && rep.sourceType !== 'wali_kelas') return false;
      if (activeTab === 'guru_bk' && rep.sourceType !== 'guru_bk') return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          rep.title.toLowerCase().includes(term) ||
          rep.senderName.toLowerCase().includes(term) ||
          (rep.targetStudent && rep.targetStudent.toLowerCase().includes(term)) ||
          (rep.targetClass && rep.targetClass.toLowerCase().includes(term)) ||
          rep.summary.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [incomingReports, activeTab, searchTerm]);

  const countMapel = incomingReports.filter((r) => r.sourceType === 'guru_mapel').length;
  const countWalas = incomingReports.filter((r) => r.sourceType === 'wali_kelas').length;
  const countBK = incomingReports.filter((r) => r.sourceType === 'guru_bk').length;
  const countHighPriority = incomingReports.filter((r) => r.urgency === 'Prioritas Tinggi').length;

  return (
    <div className="space-y-5">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Layanan Pemantauan Realtime
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Laporan Realtime Masuk dari Guru, Walas & Guru BK
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Pusat penerimaan laporan langsung dari seluruh tenaga pendidik. Tugas Kepala Sekolah adalah memantau kelancaran KBM, bimbingan khusus walas, dan penanganan kasus konseling BK.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 font-mono text-slate-200 shrink-0">
          <span>Total Laporan: <strong className="text-white font-bold">{incomingReports.length} Laporan</strong></span>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">KBM Guru Mapel</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{countMapel}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Presensi & Administrasi</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Binaan Wali Kelas</span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{countWalas}</p>
          <span className="text-[10px] text-indigo-600 font-medium">Pembinaan Disiplin &lt;30 Poin</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kasus Guru BK</span>
            <HeartHandshake className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{countBK}</p>
          <span className="text-[10px] text-rose-600 font-medium">Konseling Khusus &gt;30 Poin</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Prioritas Tinggi</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-700 mt-1">{countHighPriority}</p>
          <span className="text-[10px] text-amber-600 font-medium">Perlu Pengawasan Langsung</span>
        </div>
      </div>

      {/* Tabs Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Source Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Laporan ({incomingReports.length})
          </button>

          <button
            onClick={() => setActiveTab('guru_mapel')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'guru_mapel'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guru Mapel ({countMapel})</span>
          </button>

          <button
            onClick={() => setActiveTab('wali_kelas')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'wali_kelas'
                ? 'bg-indigo-700 text-white shadow-2xs'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Wali Kelas ({countWalas})</span>
          </button>

          <button
            onClick={() => setActiveTab('guru_bk')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'guru_bk'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Guru BK ({countBK})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari guru, siswa, kelas, isi..."
            className="w-full text-xs px-2 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Reports Feed List */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">Tidak ada laporan yang sesuai kriteria pencarian</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Silakan ganti kata kunci atau pilih tab lainnya.</p>
          </div>
        ) : (
          filteredReports.map((item) => {
            let badgeBg = 'bg-blue-50 text-blue-800 border-blue-200';
            if (item.sourceType === 'wali_kelas') badgeBg = 'bg-indigo-50 text-indigo-800 border-indigo-200';
            if (item.sourceType === 'guru_bk') badgeBg = 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
            if (item.sourceType === 'pelanggaran') badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeBg}`}>
                      {item.senderRoleTitle}
                    </span>
                    {item.targetClass && (
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                        Kelas {item.targetClass}
                      </span>
                    )}
                    {item.urgency === 'Prioritas Tinggi' && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider">
                        Prioritas BK
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 ml-auto sm:ml-0">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{item.timestamp}</span>
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>

                  <p className="text-slate-600 leading-relaxed text-xs">
                    {item.summary}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                    <span>
                      Pelapor: <strong className="text-slate-700">{item.senderName}</strong>
                    </span>
                    {item.targetStudent && (
                      <>
                        <span>·</span>
                        <span>
                          Siswa: <strong className="text-blue-700">{item.targetStudent}</strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Terpantau Kepsek</span>
                  </span>

                  <button
                    onClick={() => setSelectedReport(item)}
                    className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 hover:underline font-semibold cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail Laporan</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Detail Laporan Realtime
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">{selectedReport.timestamp}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Judul Laporan
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedReport.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-500 block">Guru Pelapor</span>
                  <p className="font-semibold text-slate-800">{selectedReport.senderName}</p>
                  <p className="text-[10px] text-blue-700 font-medium">{selectedReport.senderRoleTitle}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Target / Kelas</span>
                  <p className="font-semibold text-slate-800">
                    {selectedReport.targetClass ? `Kelas ${selectedReport.targetClass}` : '-'}
                  </p>
                  {selectedReport.targetStudent && (
                    <p className="text-[10px] text-slate-600 font-medium">{selectedReport.targetStudent}</p>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Uraian Lengkap Laporan
                </span>
                <p className="text-slate-700 leading-relaxed mt-1 text-xs whitespace-pre-line bg-slate-50/60 p-3 rounded-lg border border-slate-200">
                  {selectedReport.details}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-900">
                    Status: Laporan Telah Diterima & Terpantau Kepala Sekolah
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
