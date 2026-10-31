import React, { useState } from 'react';
import { UserCog, Plus, KeyRound, Shield, CheckCircle2, XCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { UserAccount, UserRole } from '../../types';
import { DataTable, ColumnDef } from '../common/DataTable';

export const UserManagementView: React.FC = () => {
  const { allUsers, createUser, updateUser, resetPassword } = useAuth();
  const { teachers, classes } = useSchool();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'guru_mapel' as UserRole,
    classId: '',
    teacherCode: '',
    subject: 'Bahasa Indonesia',
    isActive: true,
  });

  const handleOpenAdd = () => {
    setFormData({
      username: '',
      name: '',
      email: '',
      role: 'guru_mapel',
      classId: '',
      teacherCode: '',
      subject: 'Bahasa Indonesia',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleReset = (id: string, username: string) => {
    const tempPass = resetPassword(id);
    setResetMessage(`Password untuk akun '${username}' berhasil diatur ulang menjadi: ${tempPass}`);
    setTimeout(() => setResetMessage(null), 8000);
  };

  const handleToggleStatus = (u: UserAccount) => {
    updateUser(u.id, { isActive: !u.isActive });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.name.trim()) {
      alert('Username dan Nama Lengkap wajib diisi.');
      return;
    }

    createUser({
      username: formData.username.toLowerCase(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      availableRoles: formData.role === 'wali_kelas' ? ['guru_mapel', 'wali_kelas'] : [formData.role],
      classId: formData.classId || undefined,
      teacherCode: formData.teacherCode || undefined,
      subject: formData.subject || undefined,
      isActive: formData.isActive,
    });

    setIsModalOpen(false);
  };

  const columns: ColumnDef<UserAccount>[] = [
    {
      key: 'username',
      header: 'Username Akun',
      sortable: true,
      render: (u) => <span className="font-mono font-bold text-slate-900">{u.username}</span>,
    },
    {
      key: 'name',
      header: 'Nama Pengguna',
      sortable: true,
      render: (u) => (
        <div>
          <span className="font-semibold text-slate-900 block">{u.name}</span>
          <span className="text-[10px] text-slate-400 font-mono">{u.email || '-'}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Hak Akses Utama',
      sortable: true,
      render: (u) => (
        <span className="inline-block text-[11px] px-2 py-0.5 rounded font-semibold text-purple-800 bg-purple-50 border border-purple-200">
          {u.role.replace('_', ' ').toUpperCase()}
        </span>
      ),
    },
    {
      key: 'availableRoles',
      header: 'Multi-Role Tugas',
      sortable: false,
      render: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.availableRoles.map((r) => (
            <span key={r} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
              {r.replace('_', ' ')}
            </span>
          ))}
          {u.classId && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">
              Wali {u.classId}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status Akun',
      sortable: true,
      align: 'center',
      width: '100px',
      render: (u) => (
        <button
          onClick={() => handleToggleStatus(u)}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
            u.isActive
              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
              : 'text-slate-500 bg-slate-100 border border-slate-200 hover:bg-slate-200'
          }`}
          title="Klik untuk ubah status"
        >
          {u.isActive ? 'Aktif' : 'Nonaktif'}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      sortable: false,
      align: 'right',
      width: '120px',
      render: (u) => (
        <button
          onClick={() => handleReset(u.id, u.username)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 rounded text-xs transition-colors cursor-pointer"
          title="Reset Password Pengguna"
        >
          <KeyRound className="w-3 h-3 text-slate-400" />
          <span>Reset Pass</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Manajemen Akun Pengguna & Hak Akses (RBAC)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan autentikasi akun 5 role (Admin, Kepsek, Guru Mapel, Wali Kelas, Guru BK) serta dukungan multi-role
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Akun Baru</span>
        </button>
      </div>

      {resetMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-medium font-mono">{resetMessage}</span>
        </div>
      )}

      <DataTable
        data={allUsers}
        columns={columns}
        searchPlaceholder="Cari username, nama, atau email..."
        searchKeys={['username', 'name', 'email', 'role']}
        exportFilename={`Data_Akun_Pengguna_${Date.now()}`}
        sheetName="Akun Pengguna"
      />

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Buat Akun Pengguna Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username Login</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  placeholder="guru.nama"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Nama Lengkap dengan Gelar"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email (Opsional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@smpn1mantap.sch.id"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peran Utama (Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold text-purple-700"
                  >
                    <option value="guru_mapel">Guru Mapel</option>
                    <option value="wali_kelas">Wali Kelas</option>
                    <option value="guru_bk">Guru BK</option>
                    <option value="kepala_sekolah">Kepala Sekolah</option>
                    <option value="admin_operator">Admin Operator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tugas Wali Kelas (ClassId)</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                  >
                    <option value="">-- Bukan Wali Kelas --</option>
                    {classes.map((c) => (
                      <option key={c.classId} value={c.classId}>
                        {c.classId}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors shadow-2xs"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
