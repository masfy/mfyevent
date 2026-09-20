'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  LayoutTemplate,
  Plus,
  ExternalLink,
  Eye,
  Trash2,
  Sparkles,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Search,
  Crown,
  ShieldCheck,
  User as UserIcon,
  Users,
} from 'lucide-react';
import {
  getUserStoredMicrosites,
  deleteUserStoredMicrosite,
  getStoredUser,
  getStoredUsers,
} from '@/lib/storage';
import {
  fetchMicrositesFromFirestore,
  deleteMicrositeFromFirestore,
  subscribeMicrositesFromFirestore,
  fetchUsersFromFirestore,
} from '@/lib/firebase/firestore';
import { getUserQuotaSummary } from '@/lib/quota';
import { Microsite, User } from '@/types';
import { formatNumber, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { CreateMicrositeModal } from '@/components/dashboard/CreateMicrositeModal';

export default function MicrositesListPage() {
  const { showToast } = useToast();
  const [microsites, setMicrosites] = useState<Microsite[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [syncingCloud, setSyncingCloud] = useState(false);

  // Admin filter states
  const [creatorFilter, setCreatorFilter] = useState<'ALL' | 'ADMIN' | 'MEMBER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadLocalData = () => {
    const currentUser = getStoredUser();
    setUser(currentUser);
    setUsersList(getStoredUsers());
    setMicrosites(getUserStoredMicrosites(currentUser));
  };

  const handleManualSync = async () => {
    setSyncingCloud(true);
    try {
      const cloudSites = await fetchMicrositesFromFirestore();
      const currentUser = getStoredUser();
      const filtered = (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN')
        ? cloudSites
        : cloudSites.filter((s) => s.ownerId === currentUser?.uid);
      setMicrosites(filtered);
      showToast(`Data tersinkronkan dengan Cloud Firestore! (${cloudSites.length} total microsite) ✨`, 'success');
    } catch (err: any) {
      showToast('Gagal sinkronisasi: ' + err.message, 'error');
    } finally {
      setSyncingCloud(false);
    }
  };

  useEffect(() => {
    loadLocalData();

    // 1. Ambil data users dari cloud untuk pemetaan informasi pembuat
    fetchUsersFromFirestore()
      .then((cloudUsers) => {
        if (cloudUsers && cloudUsers.length > 0) setUsersList(cloudUsers);
      })
      .catch(() => {});

    // 2. Berlangganan (subscribe) real-time pembaruan microsite dari Firestore
    const unsubscribe = subscribeMicrositesFromFirestore((liveSites) => {
      const currentUser = getStoredUser();
      if (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') {
        setMicrosites(liveSites);
      } else {
        setMicrosites(liveSites.filter((s) => s.ownerId === currentUser?.uid));
      }
    });

    window.addEventListener('mfy_storage_update', loadLocalData);
    return () => {
      window.removeEventListener('mfy_storage_update', loadLocalData);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const quota = getUserQuotaSummary(user, 0, microsites.length);

  // Helper untuk menentukan apakah microsite dibuat oleh Admin / Super Admin
  const isCreatedByAdmin = (site: Microsite): boolean => {
    if (site.ownerRole === 'ADMIN' || site.ownerRole === 'SUPER_ADMIN') return true;
    if (site.ownerEmail?.toLowerCase() === 'alfyarnaim@gmail.com') return true;
    if (user && site.ownerId === user.uid && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) return true;

    // Cross reference dengan daftar user
    const matched = usersList.find(
      (u) => u.uid === site.ownerId || (site.ownerEmail && u.email.toLowerCase() === site.ownerEmail.toLowerCase())
    );
    if (matched && (matched.role === 'ADMIN' || matched.role === 'SUPER_ADMIN')) return true;

    return false;
  };

  // Helper untuk mendapatkan informasi profil pembuat microsite
  const getCreatorInfo = (site: Microsite) => {
    const isCurrent = Boolean(user && site.ownerId === user.uid);
    const isAdmin = isCreatedByAdmin(site);
    const matched = usersList.find(
      (u) => u.uid === site.ownerId || (site.ownerEmail && u.email.toLowerCase() === site.ownerEmail.toLowerCase())
    );
    const name = site.ownerName || matched?.displayName || (isCurrent ? (user?.displayName || 'Anda') : 'Pengguna Member');
    const email = site.ownerEmail || matched?.email || '';

    return {
      isCurrent,
      isAdmin,
      name,
      email,
    };
  };

  // Hitungan kuota / metrik pembagian Admin vs Member
  const counts = useMemo(() => {
    const adminCount = microsites.filter(isCreatedByAdmin).length;
    const memberCount = microsites.filter((s) => !isCreatedByAdmin(s)).length;
    return {
      all: microsites.length,
      admin: adminCount,
      member: memberCount,
    };
  }, [microsites, usersList, user]);

  // Filter microsites berdasarkan tab dan pencarian
  const filteredMicrosites = useMemo(() => {
    return microsites.filter((site) => {
      const isAdminSite = isCreatedByAdmin(site);
      if (creatorFilter === 'ADMIN' && !isAdminSite) return false;
      if (creatorFilter === 'MEMBER' && isAdminSite) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const creator = getCreatorInfo(site);
        const matchTitle = site.title.toLowerCase().includes(q);
        const matchSlug = site.slug.toLowerCase().includes(q);
        const matchBio = (site.profile?.bio || '').toLowerCase().includes(q);
        const matchCreatorName = creator.name.toLowerCase().includes(q);
        const matchCreatorEmail = creator.email.toLowerCase().includes(q);
        return matchTitle || matchSlug || matchBio || matchCreatorName || matchCreatorEmail;
      }

      return true;
    });
  }, [microsites, creatorFilter, searchQuery, usersList, user]);

  const handleOpenCreateModal = () => {
    if (!quota.canCreateMicrosite) {
      showToast(
        `Batas kuota ${quota.maxMicrosites} microsite telah tercapai untuk akun Member. Hapus microsite lama untuk membuat baru.`,
        'warning'
      );
      return;
    }
    setShowCreateModal(true);
  };

  const handleCopy = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://event.mfytech.my.id';
    navigator.clipboard.writeText(`${origin}/@${slug}`);
    setCopiedSlug(slug);
    showToast('Tautan publik microsite disalin! 📋');
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleDelete = (id: string, title: string, slug: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus microsite "${title}"? Tindakan ini permanen di Cloud Firestore.`)) {
      const success = deleteUserStoredMicrosite(id, user);
      if (success) {
        deleteMicrositeFromFirestore(slug).catch(() => {});
        setMicrosites((prev) => prev.filter((m) => m.id !== id));
        showToast('Microsite berhasil dihapus');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {quota.isAdmin ? 'Kelola Seluruh Microsites' : 'Microsites Anda'}
            </h1>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                quota.isAdmin
                  ? 'bg-amber-100 text-amber-800 border border-amber-200/60'
                  : quota.canCreateMicrosite
                  ? 'bg-cyan-50 text-[#06B6D4] border border-cyan-100'
                  : 'bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              {quota.isAdmin ? '👑 Mode Admin (Akses Penuh)' : `Kuota: ${quota.micrositesCount} / ${quota.maxMicrosites}`}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {quota.isAdmin
              ? 'Memantau dan mengelola microsite yang dibuat oleh Admin serta seluruh Member terdaftar.'
              : 'Halaman profil dan kumpulan tautan mobile-first Anda dengan alamat resmi'}
            {!quota.isAdmin && <span className="font-mono text-[#06B6D4] ml-1">/@handle</span>}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={syncingCloud}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-60"
            title="Muat ulang data terbaru dari Cloud Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${syncingCloud ? 'animate-spin' : ''}`} />
            <span>{syncingCloud ? 'Menyinkronkan...' : 'Refresh Cloud'}</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Buat Microsite Baru</span>
          </button>
        </div>
      </div>

      {/* ================= ADMIN FILTER CONTROLS & TABS ================= */}
      {quota.isAdmin && (
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => setCreatorFilter('ALL')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  creatorFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Semua Microsite</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    creatorFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {counts.all}
                </span>
              </button>

              <button
                onClick={() => setCreatorFilter('ADMIN')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  creatorFilter === 'ADMIN'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/50'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Dibuat Admin</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    creatorFilter === 'ADMIN' ? 'bg-white/20 text-white' : 'bg-amber-200/60 text-amber-900'
                  }`}
                >
                  {counts.admin}
                </span>
              </button>

              <button
                onClick={() => setCreatorFilter('MEMBER')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  creatorFilter === 'MEMBER'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200/50'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>Dibuat Member</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    creatorFilter === 'MEMBER' ? 'bg-white/20 text-white' : 'bg-blue-200/60 text-blue-900'
                  }`}
                >
                  {counts.member}
                </span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul, slug, nama pembuat..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5BF7]/20 focus:border-[#5B5BF7] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid of Microsite Cards */}
      {filteredMicrosites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMicrosites.map((site) => {
            const creator = getCreatorInfo(site);

            return (
              <div
                key={site.id}
                className={`bg-white rounded-3xl border shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group ${
                  creator.isAdmin
                    ? 'border-amber-200/80 hover:border-amber-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Preview Banner with theme background */}
                <div
                  style={{ background: site.theme.background }}
                  className="h-32 p-4 flex items-center justify-center relative overflow-hidden transition-colors"
                >
                  {/* Mini Pill Mockup */}
                  <div
                    style={{
                      backgroundColor: site.theme.cardBg,
                      color: site.theme.textColor,
                    }}
                    className="px-4 py-2 rounded-xl shadow-md border border-white/20 flex items-center gap-2.5 backdrop-blur-xs max-w-[200px] truncate"
                  >
                    <img
                      src={site.profile.avatarUrl}
                      alt={site.title}
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                    <span className="text-xs font-bold truncate">{site.profile.name}</span>
                  </div>

                  {/* Creator Badge (Khusus Admin View) */}
                  {quota.isAdmin && (
                    <div className="absolute top-3 left-3">
                      {creator.isCurrent ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-xs flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-200" />
                          <span>Dibuat oleh Anda</span>
                        </span>
                      ) : creator.isAdmin ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-600 text-white shadow-xs flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-purple-200" />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-xs flex items-center gap-1">
                          <UserIcon className="w-3 h-3 text-blue-200" />
                          <span>Member</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-xs ${
                        site.status === 'PUBLISHED'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      {site.status}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#5B5BF7] transition-colors truncate">
                      {site.title}
                    </h3>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-[#06B6D4] mt-0.5">
                      <span>/@{site.slug}</span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {site.profile.bio || 'Tidak ada bio deskripsi.'}
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    {/* Baris identitas pembuat (untuk akun admin) */}
                    {quota.isAdmin && (
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Pembuat:</span>
                        <span
                          className={`font-semibold truncate max-w-[170px] ${
                            creator.isAdmin ? 'text-amber-700 font-bold' : 'text-slate-700'
                          }`}
                          title={creator.email ? `${creator.name} (${creator.email})` : creator.name}
                        >
                          {creator.isCurrent
                            ? '👑 Anda (Admin)'
                            : `${creator.name} ${creator.isAdmin ? '👑' : ''}`}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {formatNumber(site.views)} views
                      </span>
                      <span>{site.blocks.length} blocks</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(site.slug)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-white transition-colors cursor-pointer"
                      title="Salin Link Publik"
                    >
                      {copiedSlug === site.slug ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <Link
                      href={`/@${site.slug}`}
                      target="_blank"
                      className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-white transition-colors"
                      title="Buka Halaman Live"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => handleDelete(site.id, site.title, site.slug)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                      title="Hapus Microsite"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Edit in studio button */}
                  <Link
                    href={`/microsites/${site.id}/edit`}
                    className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>Edit di Studio</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300">
          <LayoutTemplate className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">
            {searchQuery || creatorFilter !== 'ALL'
              ? 'Tidak ada microsite yang sesuai dengan filter'
              : 'Belum ada microsite'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || creatorFilter !== 'ALL'
              ? 'Coba ganti filter tab atau kata kunci pencarian Anda.'
              : 'Mulai bangun halaman profil mobile-first pertama Anda untuk membagikan tautan, media sosial, dan materi acara.'}
          </p>
          {searchQuery || creatorFilter !== 'ALL' ? (
            <button
              onClick={() => {
                setCreatorFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
            >
              Reset Filter & Pencarian
            </button>
          ) : (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-semibold shadow-xs hover:opacity-95 transition-all cursor-pointer"
            >
              Buat Microsite Sekarang
            </button>
          )}
        </div>
      )}

      <CreateMicrositeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={loadLocalData}
      />
    </div>
  );
}
