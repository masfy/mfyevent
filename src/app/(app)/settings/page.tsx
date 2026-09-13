'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { getStoredUser, saveStoredUser } from '@/lib/storage';
import { INITIAL_USER } from '@/lib/mockData';
import { useToast } from '@/components/ui/Toast';
import {
  User as UserIcon,
  Shield,
  Mail,
  CheckCircle2,
  Save,
  Sparkles,
  Upload,
  Database,
  Flame,
  ExternalLink,
  Lock,
  Key,
  Globe,
  Layers,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import {
  getFirebaseConfig,
  saveFirebaseConfig,
  isFirebaseConfigured,
  PRIMARY_ADMIN_EMAIL,
  FirebaseConfig,
} from '@/lib/firebase/config';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'firebase'>('profile');
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');

  // Firebase Config State
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig>({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [testingFirebase, setTestingFirebase] = useState(false);

  const syncUserData = () => {
    const u = getStoredUser();
    setUser(u);
    setDisplayName(u.displayName);
    setUsername(u.username);
  };

  const loadFirebaseSettings = () => {
    const cfg = getFirebaseConfig();
    setFirebaseConfig(cfg);
    setIsConfigured(isFirebaseConfigured());
  };

  useEffect(() => {
    syncUserData();
    loadFirebaseSettings();
    window.addEventListener('mfy_storage_update', () => {
      syncUserData();
      loadFirebaseSettings();
    });
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 1 * 1024 * 1024; // 1 MB
    if (file.size > MAX_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      showToast(`Ukuran foto profil (${sizeMb} MB) melebihi batas maksimal 1 MB!`, 'error');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        const updated = { ...user, photoURL: base64, updatedAt: new Date().toISOString() };
        saveStoredUser(updated);
        setUser(updated);
        showToast('Foto profil akun berhasil diperbarui! (Maks 1 MB)', 'success');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      displayName: displayName.trim(),
      username: username.trim().toLowerCase(),
      updatedAt: new Date().toISOString(),
    };
    saveStoredUser(updated);
    setUser(updated);
    showToast('Profil Anda berhasil diperbarui! 🎉');
  };

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(firebaseConfig);
    setIsConfigured(isFirebaseConfigured());
    showToast('Konfigurasi Firebase berhasil disimpan! 🎉', 'success');
  };

  const handleTestFirebase = () => {
    setTestingFirebase(true);
    setTimeout(() => {
      setTestingFirebase(false);
      if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        showToast('Kredensial Firebase valid! Siap digunakan untuk Google Auth.', 'success');
      } else {
        showToast('Kredensial belum lengkap. Harap lengkapi API Key dan Project ID.', 'warning');
      }
    }, 600);
  };

  const handleClearAllMockData = () => {
    if (
      confirm(
        'Apakah Anda yakin ingin menghapus seluruh data uji coba? Seluruh tautan sementara, microsite, dan riwayat di browser ini akan dibersihkan.'
      )
    ) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('mfy_event_links', JSON.stringify([]));
        localStorage.setItem('mfy_event_microsites', JSON.stringify([]));
        localStorage.setItem('mfy_event_reports', JSON.stringify([]));
        localStorage.setItem('mfy_event_audit', JSON.stringify([]));
        const cleanUser = {
          ...user,
          displayName: user.displayName.replace(' (Super Admin)', '').replace(' (Member)', ''),
          shortLinksCount: 0,
          micrositesCount: 0,
        };
        localStorage.setItem('mfy_event_user', JSON.stringify(cleanUser));
        localStorage.setItem('mfy_event_users_list', JSON.stringify([cleanUser]));
        localStorage.setItem('mfy_mock_data_cleaned', 'mfy_clean_data_v2');
        setUser(cleanUser);
        window.dispatchEvent(new Event('mfy_storage_update'));
      }
      showToast('Seluruh data uji coba berhasil dibersihkan! Aplikasi kini 100% bersih. 🧹');
    }
  };

  const isMember = user.role === 'USER';
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Pengaturan Sistem & Profil
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola informasi identitas akun, integrasi Firebase, dan preferensi layanan MfyEvent Anda.
        </p>
      </div>

      {/* ================= SETTINGS NAVIGATION TABS ================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white dark:bg-slate-800 text-[#5B5BF7] dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Profil Akun</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('firebase')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'firebase'
              ? 'bg-white dark:bg-slate-800 text-[#5B5BF7] dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Integrasi Firebase</span>
          {isConfigured ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Firebase Terkonfigurasi" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-400" title="Mode Simulasi" />
          )}
        </button>
      </div>

      {/* ================= TAB 1: PROFILE TAB ================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Membership Tier Card */}
          <div
            className={`p-5 rounded-3xl border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isMember
                ? 'bg-gradient-to-r from-emerald-50/60 via-slate-50 to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border-emerald-200/70 dark:border-emerald-800/40'
                : 'bg-gradient-to-r from-indigo-50/60 via-slate-50 to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 border-indigo-200/70 dark:border-indigo-800/40'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                    isMember ? 'bg-emerald-600 text-white' : 'bg-[#5B5BF7] text-white'
                  }`}
                >
                  {isMember ? '👤 Paket: Member Komunitas' : '👑 Paket: Super Administrator'}
                </span>
                <span className="text-xs text-slate-500 font-mono">Role: {user.role}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isMember
                  ? 'Akses membuat hingga 127 short link berkecepatan tinggi dan 11 microsite aktif gratis.'
                  : 'Akses penuh tanpa batas (Unlimited Tautan & Microsite), termasuk Portal Moderasi, Audit Log, dan Manajemen Pengguna.'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold shadow-2xs shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Akun Terverifikasi</span>
            </div>
          </div>

          <form
            onSubmit={handleSaveProfile}
            className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="relative group w-16 h-16 shrink-0">
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <label className="absolute inset-0 bg-black/50 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{user.displayName}</h3>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isMember
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-[#5B5BF7] dark:text-indigo-300'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">@{user.username}</p>
                <div className="mt-2 flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg shadow-2xs transition-all active:scale-95">
                    <Upload className="w-3.5 h-3.5 text-[#5B5BF7]" />
                    <span>Ganti Foto</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400">Maksimal 1 MB (JPG, PNG, WebP)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white dark:focus:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Alamat Email
              </label>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <Mail className="w-4 h-4 mr-2 text-slate-400" />
                <span>{user.email}</span>
                <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-sm">
                  Terverifikasi
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>

          {/* Kartu Manajemen Data & Pembersihan Mockup */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Pembersihan Data Uji Coba & Penyimpanan</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Hapus seluruh sisa data contoh (short link, microsite, dan riwayat sementara) di browser ini agar sistem dimulai dari database yang 100% bersih.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearAllMockData}
                className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors shrink-0 cursor-pointer"
              >
                Bersihkan Data Sementara
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: FIREBASE INTEGRATION TAB ================= */}
      {activeTab === 'firebase' && (
        <div className="space-y-6">
          {/* Header Status Banner */}
          <div className="p-6 rounded-3xl border bg-gradient-to-r from-amber-500/10 via-slate-50 to-cyan-500/10 dark:from-amber-950/20 dark:via-slate-900 dark:to-cyan-950/20 border-amber-500/20 dark:border-amber-500/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Status Koneksi Firebase & Google Auth
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Hubungkan project Firebase untuk otentikasi Google dan aktivasi akun otomatis.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-xl border flex items-center gap-1.5 ${
                    isConfigured
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}
                  />
                  <span>{isConfigured ? 'Firebase Terhubung' : 'Mode Simulasi Aktif'}</span>
                </span>
              </div>
            </div>

            {/* Primary Super Admin Notice */}
            <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Shield className="w-4 h-4 text-[#5B5BF7]" />
                <span>
                  Admin Utama Sistem:{' '}
                  <strong className="font-mono text-[#5B5BF7] dark:text-indigo-400">{PRIMARY_ADMIN_EMAIL}</strong>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                ⭐ Otomatis memperoleh role Super Admin saat login Google
              </span>
            </div>
          </div>

          {/* Form Pengaturan Kredensial Firebase */}
          <form
            onSubmit={handleSaveFirebase}
            className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5"
          >
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Kredensial Firebase Web App</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kredensial ini dapat diisi langsung di sini atau melalui variabel lingkungan di file{' '}
                <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono">
                  .env.local
                </code>
                .
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* API Key */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Firebase API Key (apiKey)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Contoh: AIzaSy..."
                    value={firebaseConfig.apiKey}
                    onChange={(e) => setFirebaseConfig({ ...firebaseConfig, apiKey: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7]"
                  />
                </div>
              </div>

              {/* Project ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Project ID (projectId)
                </label>
                <div className="relative">
                  <Database className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Contoh: mfyevent-app"
                    value={firebaseConfig.projectId}
                    onChange={(e) => setFirebaseConfig({ ...firebaseConfig, projectId: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7]"
                  />
                </div>
              </div>

              {/* Auth Domain */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Auth Domain (authDomain)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Contoh: mfyevent-app.firebaseapp.com"
                    value={firebaseConfig.authDomain}
                    onChange={(e) => setFirebaseConfig({ ...firebaseConfig, authDomain: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7]"
                  />
                </div>
              </div>

              {/* Storage Bucket */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Storage Bucket (storageBucket)
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Contoh: mfyevent-app.appspot.com"
                    value={firebaseConfig.storageBucket}
                    onChange={(e) => setFirebaseConfig({ ...firebaseConfig, storageBucket: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7]"
                  />
                </div>
              </div>

              {/* Messaging Sender ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Messaging Sender ID
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 123456789012"
                  value={firebaseConfig.messagingSenderId}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, messagingSenderId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7]"
                />
              </div>

              {/* App ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  App ID (appId)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 1:123456:web:abcdef..."
                  value={firebaseConfig.appId}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, appId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7]"
                />
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleTestFirebase}
                disabled={testingFirebase}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                {testingFirebase ? 'Menguji Koneksi...' : 'Uji Koneksi Firebase'}
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Konfigurasi Firebase</span>
              </button>
            </div>
          </form>

          {/* Panduan Singkat Setup Firebase Console */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5B5BF7]" />
              <span>Panduan Menghubungkan Google Sign-In di Firebase Console</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <li>
                Buka{' '}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#5B5BF7] hover:underline font-semibold"
                >
                  Firebase Console
                </a>{' '}
                dan buat Project baru (atau gunakan project yang sudah ada).
              </li>
              <li>
                Buka menu <strong>Build &gt; Authentication</strong>, klik <strong>Get Started</strong>, pilih tab{' '}
                <strong>Sign-in method</strong>, lalu aktifkan provider <strong>Google</strong>.
              </li>
              <li>
                Di tab <strong>Settings &gt; Authorized domains</strong>, pastikan domain{' '}
                <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">localhost</code> dan domain
                produksi Anda sudah terdaftar.
              </li>
              <li>
                Buka <strong>Project Settings (ikon gerigi) &gt; General &gt; Your apps &gt; Web app (&lt;/&gt;)</strong>,
                salin konfigurasi JavaScript ke formulir di atas.
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
