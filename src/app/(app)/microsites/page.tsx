'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  getUserStoredMicrosites,
  deleteUserStoredMicrosite,
  getStoredUser,
} from '@/lib/storage';
import {
  fetchMicrositesFromFirestore,
  deleteMicrositeFromFirestore,
  syncLocalMicrositesToCloud,
} from '@/lib/firebase/firestore';
import { getUserQuotaSummary } from '@/lib/quota';
import { Microsite, User } from '@/types';
import { formatNumber, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { CreateMicrositeModal } from '@/components/dashboard/CreateMicrositeModal';

export default function MicrositesListPage() {
  const { showToast } = useToast();
  const [microsites, setMicrosites] = useState<Microsite[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [syncingCloud, setSyncingCloud] = useState(false);

  const loadData = () => {
    const currentUser = getStoredUser();
    setUser(currentUser);
    setMicrosites(getUserStoredMicrosites(currentUser));
  };

  const handleManualSync = async () => {
    setSyncingCloud(true);
    try {
      const res = await syncLocalMicrositesToCloud(user);
      if (res.synced > 0) {
        showToast(`Berhasil menyinkronkan ${res.synced} microsite ke Cloud Firestore! ☁️🎉`, 'success');
      } else if (res.failed > 0) {
        showToast(`Gagal sinkron: ${res.errors[0] || 'Periksa Firebase Rules'}`, 'error');
      } else {
        showToast('Semua microsite lokal sudah tersimpan di Cloud Firestore! ✨', 'info');
      }
      await fetchMicrositesFromFirestore();
    } catch (err: any) {
      showToast('Gagal sinkronisasi: ' + err.message, 'error');
    } finally {
      setSyncingCloud(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchMicrositesFromFirestore().catch(() => {});
    window.addEventListener('mfy_storage_update', loadData);
    return () => window.removeEventListener('mfy_storage_update', loadData);
  }, []);

  const quota = getUserQuotaSummary(user, 0, microsites.length);

  const handleOpenCreateModal = () => {
    if (!quota.canCreateMicrosite) {
      showToast(`Batas kuota ${quota.maxMicrosites} microsite telah tercapai untuk akun Member. Hapus microsite lama untuk membuat baru.`, 'warning');
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

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus microsite "${title}"?`)) {
      const targetSite = microsites.find((m) => m.id === id);
      const success = deleteUserStoredMicrosite(id, user);
      if (success) {
        if (targetSite) {
          deleteMicrositeFromFirestore(targetSite.slug).catch(() => {});
        }
        showToast('Microsite berhasil dihapus');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Microsites Anda
            </h1>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                quota.isAdmin
                  ? 'bg-amber-100 text-amber-800'
                  : quota.canCreateMicrosite
                  ? 'bg-cyan-50 text-[#06B6D4]'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {quota.isAdmin ? '👑 Unlimited' : `Kuota: ${quota.micrositesCount} / ${quota.maxMicrosites}`}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Halaman profil dan kumpulan tautan mobile-first dengan alamat resmi{' '}
            <span className="font-mono text-[#06B6D4]">/@handle</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={syncingCloud}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-60"
            title="Unggah seluruh microsite lokal ke Cloud Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${syncingCloud ? 'animate-spin' : ''}`} />
            <span>{syncingCloud ? 'Menyinkronkan...' : 'Sinkron Cloud'}</span>
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

      {/* Grid of Microsite Cards (PRD Section 39) */}
      {microsites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {microsites.map((site) => (
            <div
              key={site.id}
              className="bg-white rounded-3xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
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

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    {formatNumber(site.views)} views
                  </span>
                  <span>{site.blocks.length} blocks</span>
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
                    onClick={() => handleDelete(site.id, site.title)}
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
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300">
          <LayoutTemplate className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Belum ada microsite</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Mulai bangun halaman profil mobile-first pertama Anda untuk membagikan tautan, media sosial, dan materi acara.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-semibold shadow-xs hover:opacity-95 transition-all cursor-pointer"
          >
            Buat Microsite Sekarang
          </button>
        </div>
      )}

      <CreateMicrositeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={loadData}
      />
    </div>
  );
}
