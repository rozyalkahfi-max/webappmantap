import React, { useState } from 'react';
import { School, Save, Upload, CheckCircle2, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { SchoolSettings } from '../../types';

export const SchoolSettingsView: React.FC = () => {
  const { settings, updateSettings } = useSchool();

  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (field: keyof SchoolSettings, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoSchoolUrl' | 'logoAppUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData((prev) => ({ ...prev, [field]: result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pengaturan Identitas Sekolah & Sistem
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi profil institusi, tahun pelajaran aktif, semester, kop surat resmi, dan kepala sekolah
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan identitas sekolah berhasil diperbarui di seluruh modul aplikasi.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Academic Period Settings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Periode Akademik Aktif
          </h3>
          <p className="text-xs text-slate-500 -mt-2">
            Seluruh data absensi, penilaian, dan jadwal terhubung langsung dengan tahun pelajaran dan semester ini.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahun Pelajaran Aktif
              </label>
              <input
                type="text"
                value={formData.activeAcademicYear}
                onChange={(e) => handleChange('activeAcademicYear', e.target.value)}
                required
                placeholder="2026/2027"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester Berjalan
              </label>
              <select
                value={formData.activeSemester}
                onChange={(e) => handleChange('activeSemester', e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white font-semibold text-slate-900"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>
          </div>
        </div>

        {/* School Identity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Identitas Resmi Satuan Pendidikan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Sekolah
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => handleChange('schoolName', e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NPSN</label>
              <input
                type="text"
                value={formData.npsn}
                onChange={(e) => handleChange('npsn', e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Akreditasi</label>
              <input
                type="text"
                value={formData.accreditation}
                onChange={(e) => handleChange('accreditation', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Telepon</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Resmi</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Principal Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Identitas Kepala Sekolah
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap & Gelar Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.principalName}
                onChange={(e) => handleChange('principalName', e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.principalNip}
                onChange={(e) => handleChange('principalNip', e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Logo Settings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Logo Sekolah & Logo Aplikasi
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl text-center space-y-2">
              <span className="text-xs font-semibold text-slate-800 block">Logo Resmi Sekolah</span>
              {formData.logoSchoolUrl ? (
                <img
                  src={formData.logoSchoolUrl}
                  alt="Logo Sekolah"
                  className="w-20 h-20 object-contain mx-auto rounded border"
                />
              ) : (
                <div className="w-20 h-20 bg-slate-100 rounded flex items-center justify-center mx-auto text-slate-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium cursor-pointer text-slate-700">
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Logo Sekolah</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, 'logoSchoolUrl')}
                  className="hidden"
                />
              </label>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl text-center space-y-2">
              <span className="text-xs font-semibold text-slate-800 block">Logo Aplikasi LMS</span>
              {formData.logoAppUrl ? (
                <img
                  src={formData.logoAppUrl}
                  alt="Logo Aplikasi"
                  className="w-20 h-20 object-contain mx-auto rounded border"
                />
              ) : (
                <div className="w-20 h-20 bg-blue-900 text-white font-bold text-xl rounded-xl flex items-center justify-center mx-auto shadow-md">
                  SMP
                </div>
              )}
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium cursor-pointer text-slate-700">
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Logo Aplikasi</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, 'logoAppUrl')}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
