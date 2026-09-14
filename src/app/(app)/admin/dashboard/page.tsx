'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  Link2,
  LayoutTemplate,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  Ban,
  Clock,
  ArrowRight,
  Lock,
  Plus,
  Trash2,
  UserCheck,
  UserX,
  UserPlus,
  LogIn,
  Activity,
  RefreshCw,
  Cloud,
  Flame,
} from 'lucide-react';
import { TrafficTrendChart } from '@/components/dashboard/TrafficTrendChart';
import {
  getStoredUser,
  saveStoredUser,
  getStoredUsers,
  addStoredUser,
  updateStoredUser,
  deleteStoredUser,
  switchActiveUser,
  getStoredReports,
  saveStoredReports,
  getStoredAuditLogs,
  addAuditLog,
  getStoredLinks,
  getStoredMicrosites,
  isUserLoggedIn,
} from '@/lib/storage';
import { isUserAdmin } from '@/lib/quota';
import {
  syncUserToFirestore,
  fetchUsersFromFirestore,
  subscribeUsersFromFirestore,
  deleteUserFromFirestore,
} from '@/lib/firebase/firestore';
import { AbuseReport, AuditLog, User, ShortLink, Microsite } from '@/types';
import { formatDate, formatNumber } from '@/lib/utils';
import { INITIAL_USER } from '@/lib/mockData';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<AbuseReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [microsites, setMicrosites] = useState<Microsite[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'audit'>('users');

  // Search & Filter state for Users
  const [searchQuery, setSearchQuery] = useState('');

  // Suspend modal state
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [targetUserToSuspend, setTargetUserToSuspend] = useState<User | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  // Add User modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState<{
    displayName: string;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    status: 'ACTIVE' | 'SUSPENDED';
  }>({
    displayName: '',
    username: '',
    email: '',
    role: 'USER',
    status: 'ACTIVE',
  });

  // Cloud Sync state
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const loadAdminData = () => {
    const user = getStoredUser();
    setCurrentUser(user);
    setAllUsers(getStoredUsers());
    setReports(getStoredReports());
    setAuditLogs(getStoredAuditLogs());
    setLinks(getStoredLinks());
    setMicrosites(getStoredMicrosites());
  };

  useEffect(() => {
    // 0. Strict RBAC Guard: Hanya Admin / Super Admin yang berhak melihat halaman ini
    if (!isUserLoggedIn()) {
      router.replace('/login');
      return;
    }
    const user = getStoredUser();
    if (!isUserAdmin(user)) {
      showToast('Akses ditolak: Anda tidak memiliki izin Administrator.', 'error');
      router.replace('/member/dashboard');
      return;
    }

    loadAdminData();

    // 1. Ambil data pengguna terbaru langsung dari Cloud Firestore
    fetchUsersFromFirestore().then((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setAllUsers(cloudUsers);
      }
    });

    // 2. Berlangganan (subscribe) real-time event pengguna baru dari Firestore
    const unsubscribe = subscribeUsersFromFirestore((liveUsers) => {
      if (liveUsers && liveUsers.length > 0) {
        setAllUsers(liveUsers);
      }
    });

    window.addEventListener('mfy_storage_update', loadAdminData);
    return () => {
      window.removeEventListener('mfy_storage_update', loadAdminData);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Manual Refresh & Cloud Sync
  const handleManualCloudSync = async () => {
    setIsSyncingCloud(true);
    try {
      const cloudUsers = await fetchUsersFromFirestore();
      if (cloudUsers && cloudUsers.length > 0) {
        setAllUsers(cloudUsers);
        showToast(`✅ Data Cloud Firestore tersinkronkan (${cloudUsers.length} pengguna)`, 'success');
      } else {
        showToast('Sinkronisasi selesai (menggunakan data lokal)', 'info');
      }
    } catch {
      showToast('Gagal menyinkronkan data dari cloud', 'error');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Handle manual user creation by admin
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.displayName.trim() || !newUserData.username.trim() || !newUserData.email.trim()) {
      showToast('Mohon lengkapi semua bidang yang wajib diisi', 'error');
      return;
    }

    try {
      const created = addStoredUser(newUserData);
      await syncUserToFirestore(created);
      addAuditLog('CREATE_USER_MANUAL', 'USER', created.uid, `Pengguna dibuat manual oleh Admin: ${created.displayName} (${created.role})`);
      setShowAddUserModal(false);
      setNewUserData({
        displayName: '',
        username: '',
        email: '',
        role: 'USER',
        status: 'ACTIVE',
      });
      showToast(`Pengguna ${created.displayName} berhasil ditambahkan! 🎉`);
    } catch {
      showToast('Gagal menambahkan pengguna', 'error');
    }
  };

  // Handle user suspension toggle
  const handleToggleUserSuspend = async () => {
    if (!targetUserToSuspend) return;

    if (targetUserToSuspend.status === 'ACTIVE') {
      if (!suspendReason.trim()) {
        showToast('Wajib mengisi alasan penangguhan akun', 'error');
        return;
      }
      const updated = updateStoredUser(targetUserToSuspend.uid, { status: 'SUSPENDED' });
      if (updated) await syncUserToFirestore(updated);
      addAuditLog('SUSPEND_USER', 'USER', targetUserToSuspend.uid, suspendReason);
      setShowSuspendModal(false);
      setSuspendReason('');
      setTargetUserToSuspend(null);
      showToast(`Akun ${targetUserToSuspend.displayName} ditangguhkan`);
    } else {
      const updated = updateStoredUser(targetUserToSuspend.uid, { status: 'ACTIVE' });
      if (updated) await syncUserToFirestore(updated);
      addAuditLog('REACTIVATE_USER', 'USER', targetUserToSuspend.uid, 'Reaktivasi akun oleh Admin');
      setShowSuspendModal(false);
      setTargetUserToSuspend(null);
      showToast(`Akun ${targetUserToSuspend.displayName} diaktifkan kembali`);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (user: User) => {
    if (user.uid === currentUser.uid) {
      showToast('Tidak dapat menghapus akun admin yang sedang aktif', 'error');
      return;
    }
    if (confirm(`Yakin ingin menghapus akun ${user.displayName}? Tindakan ini tidak dapat dibatalkan.`)) {
      deleteStoredUser(user.uid);
      await deleteUserFromFirestore(user.uid);
      addAuditLog('DELETE_USER', 'USER', user.uid, `Akun ${user.displayName} (@${user.username}) dihapus oleh Admin`);
      showToast(`Akun ${user.displayName} berhasil dihapus`);
    }
  };

  // Handle Impersonate / Switch to User
  const handleImpersonate = (user: User) => {
    switchActiveUser(user.uid);
    showToast(`Beralih aktif sebagai: ${user.displayName} (${user.role})`);
    if (user.role === 'USER') {
      window.location.href = '/member/dashboard';
    } else {
      window.location.href = '/admin/dashboard';
    }
  };

  // Handle Resolve Report
  const handleResolveReport = (id: string) => {
    const updated = reports.map((r) =>
      r.id === id
        ? {
            ...r,
            status: 'RESOLVED' as const,
            reviewedBy: `${currentUser.displayName} (${currentUser.role})`,
            reviewedAt: new Date().toISOString(),
          }
        : r
    );
    saveStoredReports(updated);
    addAuditLog('RESOLVE_REPORT', 'REPORT', id, 'Laporan ditangani dan dinetralkan');
    showToast('Laporan berhasil diselesaikan');
  };

  // Filtered users
  const filteredUsers = allUsers.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query)
    );
  });

  if (currentUser.role === 'USER') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
          Akses Terbatas
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3 tracking-tight">
          Halaman Khusus Administrator
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
          Akun Anda saat ini terdaftar sebagai <span className="font-bold text-slate-900 dark:text-white">Member Komunitas</span>. Anda tidak memiliki hak akses untuk membuka Dasbor Administrasi.
        </p>

        <div className="mt-8 flex items-center justify-center">
          <Link
            href="/member/dashboard"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors shadow-xs"
          >
            Kembali ke Dasbor Member
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Portal Administrasi & Moderasi
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 text-[#5B5BF7] dark:text-indigo-400 text-xs font-bold font-mono">
              SUPER_ADMIN
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau akun pengguna, tambahkan user secara manual, tangani laporan pelanggaran, dan audit sistem.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/settings?tab=firebase"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="Kelola Kredensial Firebase & Google Auth"
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Integrasi Firebase</span>
          </Link>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Pengguna Baru</span>
          </button>
        </div>
      </div>

      {/* Top Admin KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pengguna</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{allUsers.length}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            {allUsers.filter((u) => u.status === 'ACTIVE').length} Akun Aktif
          </span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Short Links</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{links.length}</p>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 block">
            Sistem Aktif
          </span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Microsites Diterbitkan</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {microsites.filter((m) => m.status === 'PUBLISHED').length}
          </p>
          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1 block">
            {microsites.length} Total dibuat
          </span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Laporan Terbuka</span>
          <p className="text-2xl font-black text-rose-600 mt-2">
            {reports.filter((r) => r.status === 'OPEN').length}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Perlu ditindaklanjuti</span>
        </div>
      </div>

      {/* Interactive Platform Traffic Trend Chart */}
      <TrafficTrendChart
        title="Tren Lalu Lintas Harian (Platform)"
        subtitle="Grafik interaktif klik tautan & pageviews seluruh sistem pengguna"
        platformLevel={true}
      />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-indigo-50 dark:bg-indigo-950/70 text-[#5B5BF7] dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Pengguna Terdaftar ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-indigo-50 dark:bg-indigo-950/70 text-[#5B5BF7] dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Laporan Pelanggaran ({reports.filter((r) => r.status === 'OPEN').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-indigo-50 dark:bg-indigo-950/70 text-[#5B5BF7] dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: USERS MANAGEMENT ================= */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daftar Akun Pengguna</h3>
              <span className="text-xs text-slate-400">
                Kelola akun pengguna, peran, penangguhan, atau tambahkan secara manual.
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari user, email, username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7] w-48 sm:w-60"
                />
              </div>

              <button
                onClick={handleManualCloudSync}
                disabled={isSyncingCloud}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0 disabled:opacity-60"
                title="Sinkronkan data pengguna secara langsung dari Cloud Firestore"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#5B5BF7] ${isSyncingCloud ? 'animate-spin' : ''}`} />
                <span>{isSyncingCloud ? 'Sinkronisasi...' : 'Sinkronkan Cloud'}</span>
              </button>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#5B5BF7] text-white text-xs font-semibold shadow-2xs hover:bg-[#4848E8] transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah User</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">Pengguna</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Peran (Role)</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Terdaftar</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredUsers.map((u) => {
                  const isCurrent = u.uid === currentUser.uid;

                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={u.photoURL}
                          alt={u.displayName}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="truncate max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{u.displayName}</p>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded-sm bg-indigo-100 dark:bg-indigo-950 text-[#5B5BF7] text-[9px] font-bold">
                                Anda
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono truncate">@{u.username}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] font-mono ${
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                              : u.role === 'ADMIN'
                              ? 'bg-indigo-100 dark:bg-indigo-950/80 text-[#5B5BF7] dark:text-indigo-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Impersonate / switch to user */}
                          {!isCurrent && (
                            <button
                              onClick={() => handleImpersonate(u)}
                              className="p-1.5 text-slate-400 hover:text-[#5B5BF7] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Masuk sebagai Pengguna Ini (Login As)"
                            >
                              <LogIn className="w-4 h-4" />
                            </button>
                          )}

                          {/* Suspend / Activate */}
                          <button
                            onClick={() => {
                              setTargetUserToSuspend(u);
                              if (u.status === 'ACTIVE') {
                                setShowSuspendModal(true);
                              } else {
                                handleToggleUserSuspend();
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              u.status === 'ACTIVE'
                                ? 'border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                                : 'border border-emerald-200 dark:border-emerald-900 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Aktifkan'}
                          </button>

                          {/* Delete user */}
                          {!isCurrent && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Akun Pengguna"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ABUSE REPORTS ================= */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length > 0 ? (
            reports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 border border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-[10px] uppercase">
                      {report.reason}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">
                      Target: {report.targetSlug}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        report.status === 'OPEN'
                          ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{report.description}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Dilaporkan pada {formatDate(report.createdAt)}
                    {report.reviewedBy && ` • Ditinjau oleh ${report.reviewedBy}`}
                  </p>
                </div>

                {report.status === 'OPEN' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolveReport(report.id)}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tandai Selesai</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-[#0F172A] p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tidak ada laporan pelanggaran aktif</h3>
              <p className="text-xs text-slate-400 mt-1">Platform berjalan aman dan bersih dari pelanggaran konten.</p>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: AUDIT LOGS ================= */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Riwayat Audit Aktivitas Administratif</h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{log.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Target: {log.targetType} ({log.targetId})
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 text-xs">
                      <span className="font-medium text-slate-800 dark:text-white">Alasan:</span> {log.reason}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Oleh: {log.actorEmail} ({log.actorRole})
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 font-mono shrink-0">
                    {formatDate(log.createdAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Belum ada riwayat audit log</h3>
                <p className="text-xs text-slate-400 mt-1">Aktivitas administratif akan otomatis tercatat di sini.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 1: ADD USER MANUALLY BY ADMIN ================= */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Tambah Pengguna Baru Secara Manual"
        description="Admin dapat membuat akun baru secara manual untuk anggota tim, staf, atau member komunitas."
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Sarah Angelina"
              value={newUserData.displayName}
              onChange={(e) => setNewUserData({ ...newUserData, displayName: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">@</span>
                <input
                  type="text"
                  required
                  placeholder="sarahangelina"
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') })}
                  className="w-full pl-7 pr-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="sarah@example.com"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Peran Pengguna (Role)
              </label>
              <select
                value={newUserData.role}
                onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7]"
              >
                <option value="USER">USER (Member Biasa)</option>
                <option value="ADMIN">ADMIN (Staf Pengelola)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Hak Akses Penuh)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Akun Awal
              </label>
              <select
                value={newUserData.status}
                onChange={(e) => setNewUserData({ ...newUserData, status: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7]"
              >
                <option value="ACTIVE">ACTIVE (Langsung Aktif)</option>
                <option value="SUSPENDED">SUSPENDED (Ditangguhkan)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddUserModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] hover:opacity-95 rounded-xl shadow-xs cursor-pointer"
            >
              Simpan & Daftarkan Pengguna
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL 2: SUSPEND CONFIRMATION ================= */}
      <Modal
        isOpen={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false);
          setTargetUserToSuspend(null);
        }}
        title={`Tangguhkan Akun ${targetUserToSuspend?.displayName || ''}?`}
        description="Pengguna tidak akan dapat membuat atau mengelola tautan dan microsite hingga diaktifkan kembali."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alasan Penangguhan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Contoh: Terdeteksi membuat link phishing secara berulang..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                setShowSuspendModal(false);
                setTargetUserToSuspend(null);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleToggleUserSuspend}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-xs cursor-pointer"
            >
              Tangguhkan Akun
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
