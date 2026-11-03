import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  HeartHandshake,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  FileSpreadsheet,
  Users,
  Search,
  Filter,
  Layers,
  UserCheck,
  BookOpen
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import { DonutChart } from '../common/InteractiveCharts';

export const BKDashboard: React.FC<{ onNavigate: (menuId: string) => void }> = ({ onNavigate }) => {
  const {
    priorityBkStudents,
    counselingRecords,
    violations,
    getBKAssignedClasses,
    getBKAssignedStudents,
    teachers
  } = useSchool();
  const { currentUser } = useAuth();

  const [studentSearch, setStudentSearch] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  // Identify current counselor
  const currentCounselor = useMemo(() => {
    return teachers.find(
      (t) =>
        t.name.toLowerCase() === currentUser?.name.toLowerCase() ||
        t.username === currentUser?.username ||
        t.id === currentUser?.id ||
        ((t.role === 'guru_bk' || t.isBK) && (t.teacherCode === currentUser?.teacherCode || t.code === currentUser?.teacherCode))
    );
  }, [teachers, currentUser]);

  const identifier = currentCounselor?.id || currentUser?.name || '';
  const myBkClasses = useMemo(() => getBKAssignedClasses(identifier), [getBKAssignedClasses, identifier]);
  const myBkStudents = useMemo(() => getBKAssignedStudents(identifier), [getBKAssignedStudents, identifier]);

  // Priority cases within assigned students
  const myPriorityStudents = useMemo(() => {
    if (myBkStudents.length === 0) return priorityBkStudents;
    const studentIdSet = new Set(myBkStudents.map((s) => s.id));
    return priorityBkStudents.filter((p) => studentIdSet.has(p.student.id));
  }, [priorityBkStudents, myBkStudents]);

  // Counseling records within assigned students
  const myCounselingRecords = useMemo(() => {
    if (myBkStudents.length === 0) return counselingRecords;
    const studentIdSet = new Set(myBkStudents.map((s) => s.id));
    return counselingRecords.filter((c) => studentIdSet.has(c.studentId));
  }, [counselingRecords, myBkStudents]);

  const totalPriority = myPriorityStudents.length;
  const inProgressCount = myCounselingRecords.filter((c) => c.status === 'Sedang Dalam Pembinaan').length;
  const monitoringCount = myCounselingRecords.filter((c) => c.status === 'Monitoring').length;
  const completedCount = myCounselingRecords.filter((c) => c.status === 'Selesai').length;
  const pendingCount = Math.max(0, totalPriority - (inProgressCount + monitoringCount + completedCount));

  const statusDonut = [
    { label: 'Dalam Pembinaan', value: inProgressCount, color: '#f59e0b' },
    { label: 'Monitoring', value: monitoringCount, color: '#3b82f6' },
    { label: 'Selesai', value: completedCount, color: '#10b981' },
    { label: 'Belum Ditangani', value: pendingCount, color: '#ef4444' },
  ];

  // Filtered binaan students list
  const filteredBinaanStudents = useMemo(() => {
    return myBkStudents.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.nis.toLowerCase().includes(studentSearch.toLowerCase());
      const matchClass = selectedClassFilter === 'ALL' || s.classId === selectedClassFilter;
      return matchSearch && matchClass;
    });
  }, [myBkStudents, studentSearch, selectedClassFilter]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 rounded-2xl p-6 text-white shadow-lg border border-rose-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-2 backdrop-blur-sm border border-rose-400/20">
            <HeartHandshake className="w-3.5 h-3.5" />
            Portal Bimbingan Konseling (BK)
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
            Dashboard Guru BK: {currentUser?.name}
          </h2>
          <p className="text-xs text-rose-200 mt-1 max-w-2xl leading-relaxed">
            Menampilkan data siswa dan rombel binaan khusus Anda. Laporan pelanggaran dari guru mapel dan wali kelas untuk siswa binaan Anda akan langsung terhubung secara realtime ke portal ini.
          </p>

          {/* Rombel tags */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-rose-300 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Rombel Binaan:
            </span>
            {myBkClasses.length > 0 ? (
              myBkClasses.map((cid) => (
                <span
                  key={cid}
                  className="px-2.5 py-0.5 bg-rose-500/20 border border-rose-400/30 text-white rounded-lg text-xs font-bold font-mono"
                >
                  Kelas {cid}
                </span>
              ))
            ) : (
              <span className="text-xs text-rose-300 italic">Seluruh rombel (Default)</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => onNavigate('counseling')}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg transition-colors cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Tangani Kasus BK</span>
          </button>
        </div>
      </div>

      {/* Automatic Red Warning Banner for BK Priority Cases (>30-50+ points) */}
      {totalPriority > 0 && (
        <div className="p-4 bg-gradient-to-r from-red-700 via-rose-600 to-red-800 text-white rounded-2xl shadow-lg border-2 border-red-500 animate-in fade-in space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white px-2 py-0.5 rounded">
                  Peringatan Merah Otomatis Sistem BK
                </span>
                <span className="text-xs text-rose-200 font-mono">Ambang Batas: 30–50+ Poin</span>
              </div>
              <h3 className="font-bold text-sm tracking-tight text-white mt-0.5">
                🚨 Perhatian: {totalPriority} Siswa Binaan Anda Mencapai Akumulasi Poin Di Atas 30–50 Poin
              </h3>
              <p className="text-xs text-rose-100 mt-1 leading-relaxed">
                Pelanggaran di bawah 30 poin telah dibimbing oleh Wali Kelas. Siswa dengan akumulasi &gt;30 poin di bawah ini memerlukan tindak lanjut langsung dari Guru BK (Konseling individual, mediasi, surat pemanggilan orang tua, dan kontrak perilaku).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-500/60">
            <div className="flex flex-wrap gap-2">
              {myPriorityStudents.map((item) => (
                <div
                  key={item.student.id}
                  className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs"
                >
                  <span className="font-bold">{item.student.name}</span>
                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                    Kelas {item.student.classId}
                  </span>
                  <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {item.totalPoints} Poin
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('counseling')}
              className="px-3.5 py-1.5 bg-white text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer shrink-0"
            >
              Buka Form Penanganan Kasus →
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Siswa Binaan"
          value={`${myBkStudents.length} Siswa`}
          subtitle={myBkClasses.length > 0 ? `Rombel: ${myBkClasses.join(', ')}` : 'Seluruh Siswa'}
          icon={Users}
          accentColor="indigo"
        />
        <StatCard
          title="Siswa Prioritas BK"
          value={`${totalPriority} Siswa`}
          subtitle="Akumulasi > 30 Poin"
          icon={ShieldAlert}
          accentColor="rose"
        />
        <StatCard
          title="Sedang Dibina"
          value={`${inProgressCount} Kasus`}
          subtitle="Proses Konseling Aktif"
          icon={Clock}
          accentColor="amber"
        />
        <StatCard
          title="Kasus Selesai"
          value={`${completedCount} Siswa`}
          subtitle="Komitmen Terpenuhi"
          icon={CheckCircle2}
          accentColor="emerald"
        />
      </div>

      {/* 2-Columns: Priority Queue Table & Donut Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Antrean Siswa Binaan Prioritas Bimbingan (&gt;30 Poin)</span>
              </h3>
              <p className="text-xs text-slate-500">Siswa binaan yang terdeteksi otomatis oleh sistem tata tertib</p>
            </div>
            <button
              onClick={() => onNavigate('counseling')}
              className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Seluruh Kasus</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {myPriorityStudents.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  Semua Siswa Binaan Dalam Kondisi Tertib
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tidak ada siswa binaan yang melebihi batas 30 poin pelanggaran saat ini.
                </p>
              </div>
            ) : (
              myPriorityStudents.map((item) => (
                <div
                  key={item.student.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 text-xs hover:border-rose-400 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.student.name}</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 rounded">
                        Kelas {item.student.classId}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                      NIS: {item.student.nis} · {item.violations.length} Pelanggaran Tercatat
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Status:{' '}
                      <strong className="text-slate-700">
                        {item.latestCounseling?.status || 'Belum Ditangani'}
                      </strong>
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 tabular-nums">
                      {item.totalPoints} Poin
                    </span>
                    <button
                      onClick={() => onNavigate('counseling')}
                      className="text-[11px] text-rose-600 hover:underline font-bold"
                    >
                      Buka Kasus →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <DonutChart
            title="Status Penanganan Kasus Siswa Binaan"
            subtitle="Pemantauan alur penanganan bimbingan konseling"
            data={statusDonut}
            centerLabel="Kasus Binaan"
            centerValue={totalPriority}
          />
        </div>
      </div>

      {/* Roster of Assigned Students */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Daftar Seluruh Siswa Binaan Anda ({myBkStudents.length} Siswa)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar siswa dari kelas binaan Anda: {myBkClasses.join(', ') || 'Seluruh Kelas'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Cari siswa binaan..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {myBkClasses.length > 0 && (
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="ALL">Semua Kelas Binaan ({myBkClasses.length})</option>
                {myBkClasses.map((cid) => (
                  <option key={cid} value={cid}>
                    Kelas {cid}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">NIS</th>
                <th className="px-4 py-3">Nama Siswa</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Total Poin</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBinaanStudents.slice(0, 30).map((st, idx) => {
                const points = violations
                  .filter((v) => v.studentId === st.id)
                  .reduce((sum, v) => sum + v.points, 0);

                return (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{st.nis}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{st.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold">
                        {st.classId}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          points >= 30
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : points >= 25
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : points >= 15
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {points} Poin
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {points >= 30 ? (
                        <span className="text-rose-700 font-bold">Kasus Khusus BK</span>
                      ) : points >= 25 ? (
                        <span className="text-orange-700 font-semibold">Perhatian BK</span>
                      ) : points >= 15 ? (
                        <span className="text-amber-700 font-medium">Bimbingan Walas</span>
                      ) : (
                        <span className="text-emerald-700">Tertib / Normal</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => onNavigate('counseling')}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                      >
                        Catat Konseling
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredBinaanStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 italic">
                    Belum ada siswa yang cocok dengan filter atau belum ada pembagian siswa binaan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredBinaanStudents.length > 30 && (
          <p className="text-xs text-slate-400 text-right mt-2">
            Menampilkan 30 dari {filteredBinaanStudents.length} siswa binaan.
          </p>
        )}
      </div>
    </div>
  );
};
