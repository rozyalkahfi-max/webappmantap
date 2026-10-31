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
              <span>Login Cepat Pengujian (5 Role):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { user: 'admin', role: 'Admin Operator', tag: 'Master Data' },
                { user: 'kepsek', role: 'Kepala Sekolah', tag: 'Eksekutif' },
                { user: 'guru.sitirahmawati', role: 'Guru & Wali 7A', tag: 'Multi-Role' },
                { user: 'guru.budihermawan', role: 'Guru & Wali 7B', tag: 'Multi-Role' },
                { user: 'guru.nurulfaizah', role: 'Guru Mapel IPA', tag: 'Guru Mapel' },
                { user: 'guru.bambangbk', role: 'Guru BK', tag: 'Konselor' },
              ].map((acc) => (
                <button
                  key={acc.user}
                  type="button"
                  onClick={() => handleQuickLogin(acc.user)}
                  className="p-2 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 rounded-lg text-left transition-colors cursor-pointer group"
                >
                  <p className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700 truncate">
                    {acc.role}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{acc.tag}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
