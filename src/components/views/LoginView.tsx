import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, User, Sparkles, School, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { settings } = useSchool();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
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

  const handleQuickLogin = (uname: string) => {
    setUsername(uname);
    setPassword('password123');
    login(uname, 'password123');
  };

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
              <div className="pt-2 flex flex-col gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>24 Rombongan Belajar (7A–9H)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Kapasitas 708 Siswa Terintegrasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>50 Tenaga Pendidik & Multi-Role Guru</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Deteksi Otomatis Pembinaan BK &gt;30 Poin</span>
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
                <p className="text-xs text-slate-500 mt-0.5">Gunakan akun pengguna terdaftar Anda</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
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
                    className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Login Cepat Pengujian:</span>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Admin Operator */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className="p-2.5 border border-purple-200 bg-purple-50/40 hover:bg-purple-100/70 hover:border-purple-400 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-950 group-hover:text-purple-700">
                      1. Admin Operator
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-200/80 text-purple-900 font-bold">
                      Master & Import
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Kelola data master & import Excel</p>
                </button>

                {/* 2. Kepala Sekolah */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('kepsek')}
                  className="p-2.5 border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-100/70 hover:border-emerald-400 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-950 group-hover:text-emerald-700">
                      2. Kepala Sekolah
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-200/80 text-emerald-900 font-bold">
                      Eksekutif
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pemantau laporan realtime sekolah</p>
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
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Hak akses otomatis terdeteksi dari data master: merangkap 2 atau 3 jabatan menampilkan portal sesuai jabatannya.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('guru.nurulfaizah')}
                    className="p-2 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/60 rounded-lg text-left transition-colors cursor-pointer group"
                  >
                    <p className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700 truncate">
                      Guru Mapel Murni
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono truncate">1 Peran: Mapel IPA</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('guru.sitirahmawati')}
                    className="p-2 bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/60 rounded-lg text-left transition-colors cursor-pointer group"
                  >
                    <p className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-700 truncate">
                      Guru Mapel + Walas
                    </p>
                    <p className="text-[9px] text-indigo-600 font-mono truncate">2 Peran: Mapel & Wali 7A</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('guru.bambangbk')}
                    className="p-2 bg-white border border-slate-200 hover:border-rose-500 hover:bg-rose-50/60 rounded-lg text-left transition-colors cursor-pointer group"
                  >
                    <p className="text-[11px] font-bold text-slate-800 group-hover:text-rose-700 truncate">
                      Guru BK (Konselor)
                    </p>
                    <p className="text-[9px] text-rose-600 font-mono truncate">1 Peran: Guru BK Murni</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('guru.sitiaminahbk')}
                    className="p-2 bg-white border border-slate-200 hover:border-amber-500 hover:bg-amber-50/60 rounded-lg text-left transition-colors cursor-pointer group"
                  >
                    <p className="text-[11px] font-bold text-slate-800 group-hover:text-amber-700 truncate">
                      Guru BK & Mengajar
                    </p>
                    <p className="text-[9px] text-amber-600 font-mono truncate">2 Peran: BK + Mapel</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('guru.multiperan')}
                    className="p-2 bg-white border border-indigo-300 hover:border-indigo-600 hover:bg-indigo-50 rounded-lg text-left transition-colors cursor-pointer group col-span-2 sm:col-span-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-indigo-900 group-hover:text-indigo-700 truncate">
                        Guru Merangkap 3 Jabatan
                      </p>
                      <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 rounded">
                        Lengkap
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-600 font-mono truncate">
                      3 Peran Terdeteksi: Guru Mapel, Wali Kelas (9F), & Guru BK
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
