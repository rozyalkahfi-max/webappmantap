import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, User, Sparkles, School, ArrowRight, CheckCircle2, Database, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { settings, teachers } = useSchool();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const result = login(username, password);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.message || 'Login gagal. Periksa kembali username dan password.');
      }
    }, 250);
  };

  const handleQuickLogin = (uname: string, pwd = 'admin123') => {
    setUsername(uname);
    setPassword(pwd);
    login(uname, pwd);
  };

  const otherTeachers = teachers.filter((t) => t.role !== 'admin_operator');

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700/60">
        {/* Left Side: School Branding & Info */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 p-8 sm:p-10 flex flex-col justify-between text-white border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg tracking-wider shadow-md">
                SMP
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">{settings.appName}</h1>
                <p className="text-xs text-blue-300 font-medium">Sistem Terpadu SMP</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-bold text-white leading-snug">
                {settings.schoolName}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {settings.appSubtitle}.
              </p>
              <div className="pt-2 flex flex-col gap-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300 font-semibold">Basis Data Bersih (Siap Import Demo)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Akun Utama: Admin Operator IT Aktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Format Import Excel: Siswa, Guru, Rombel, Jadwal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Deteksi Otomatis Multi-Role (Mapel, Walas, BK)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 text-[11px] text-slate-400">
            <p>Tahun Pelajaran: {settings.activeAcademicYear} ({settings.activeSemester})</p>
            <p className="mt-0.5">Kepala Sekolah: {settings.principalName}</p>
          </div>
        </div>

        {/* Right Side: Login Form & Quick Demo Logins */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white text-slate-900">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Masuk ke Portal</h3>
                <p className="text-xs text-slate-500 mt-0.5">Gunakan akun admin untuk mengelola dan import data</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            {/* Admin Testing Account Highlight Banner */}
            <div className="mt-4 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-700" />
                  <span className="text-xs font-bold text-blue-950">Akun Pengujian Admin:</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-300">
                  Siap Uji Import
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block font-medium">Username:</span>
                  <span className="font-mono font-bold text-blue-900 text-sm">admin</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block font-medium">Password:</span>
                  <span className="font-mono font-bold text-blue-900 text-sm">admin123</span>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <p className="text-[10px] text-slate-600">
                  Data selain admin telah dikosongkan untuk uji coba import data Excel Anda.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('admin123');
                  }}
                  className="text-[10px] font-bold text-blue-700 hover:text-blue-800 underline cursor-pointer shrink-0 ml-2"
                >
                  Isi Formulir
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username atau Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Masukkan username/email..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Masukkan password..."
                    className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Memproses...' : 'Masuk Aplikasi'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Demo Accounts Selection */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Login Cepat Pengujian:</span>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Admin Operator */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin', 'admin123')}
                  className="p-2.5 border border-purple-200 bg-purple-50/50 hover:bg-purple-100 hover:border-purple-400 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-950 group-hover:text-purple-700">
                      1. Admin Operator
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-200/80 text-purple-900 font-bold">
                      Aktif
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">admin / admin123 • Kelola & Import</p>
                </button>

                {/* 2. Kepala Sekolah */}
                <button
                  type="button"
                  onClick={() => {
                    const kepsekTeacher = teachers.find((t) => t.role === 'kepala_sekolah');
                    if (kepsekTeacher) {
                      handleQuickLogin(kepsekTeacher.username, 'admin123');
                    } else {
                      setErrorMessage('Data Kepala Sekolah belum diimpor. Silakan login sebagai Admin dan lakukan import Excel data guru.');
                    }
                  }}
                  className="p-2.5 border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-100 hover:border-emerald-400 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-950 group-hover:text-emerald-700">
                      2. Kepala Sekolah
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      teachers.some((t) => t.role === 'kepala_sekolah')
                        ? 'bg-emerald-200/80 text-emerald-900'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {teachers.some((t) => t.role === 'kepala_sekolah') ? 'Aktif' : 'Menunggu Import'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pemantauan & Laporan Realtime</p>
                </button>
              </div>

              {/* 3. Guru Container with Dynamic Roles (Guru Mapel, Wali Kelas, BK) */}
              <div className="p-3 border border-blue-200 bg-blue-50/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <span>3. Guru</span>
                    <span className="text-[10px] font-medium text-blue-700">
                      (Pilihan Hak Akses: Guru Mapel, Wali Kelas, & Guru BK)
                    </span>
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    otherTeachers.length > 0 ? 'bg-blue-200 text-blue-900' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {otherTeachers.length > 0 ? `${otherTeachers.length} Guru Terdeteksi` : 'Menunggu Import'}
                  </span>
                </div>

                {otherTeachers.length === 0 ? (
                  <div className="p-2.5 bg-white/80 rounded-lg border border-blue-100 text-[11px] text-slate-600 flex items-start gap-2">
                    <Upload className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p>
                      Seluruh data guru saat ini kosong untuk memberi ruang pengujian import data demo Anda. Setelah Anda mengimpor data guru di menu Admin, tombol login cepat untuk guru mapel, wali kelas, dan BK akan otomatis muncul di sini.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                    {otherTeachers.slice(0, 6).map((tch) => (
                      <button
                        key={tch.id}
                        type="button"
                        onClick={() => handleQuickLogin(tch.username, 'admin123')}
                        className="p-2 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/60 rounded-lg text-left transition-colors cursor-pointer group"
                      >
                        <p className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700 truncate">
                          {tch.name}
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono truncate">
                          {tch.classId ? `Wali ${tch.classId}` : tch.role === 'guru_bk' ? 'Guru BK' : 'Guru Mapel'}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
