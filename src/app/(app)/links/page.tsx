'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Link2,
  Plus,
  Sparkles,
  Search,
  Filter,
  Copy,
  QrCode,
  ArrowUpRight,
  Check,
  Trash2,
  Power,
  ExternalLink,
  MoreHorizontal,
  Calendar,
} from 'lucide-react';
import {
  getUserStoredLinks,
  deleteUserStoredLink,
  toggleUserStoredLinkStatus,
  getStoredUser,
} from '@/lib/storage';
import {
  fetchLinksFromFirestore,
  deleteLinkFromFirestore,
  subscribeLinksFromFirestore,
} from '@/lib/firebase/firestore';
import { getUserQuotaSummary } from '@/lib/quota';
import { ShortLink, User } from '@/types';
import { formatNumber, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { QRCodeModal } from '@/components/qr/QRCodeModal';
import { CreateLinkModal } from '@/components/dashboard/CreateLinkModal';

export default function LinksManagementPage() {
  const { showToast } = useToast();
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [qrLink, setQrLink] = useState<ShortLink | null>(null);

  const loadData = () => {
    const currentUser = getStoredUser();
    setUser(currentUser);
    setLinks(getUserStoredLinks(currentUser));
  };

  useEffect(() => {
    loadData();

    // Berlangganan real-time links dari Firestore
    const unsubscribe = subscribeLinksFromFirestore((liveLinks) => {
      const currentUser = getStoredUser();
      if (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') {
        setLinks(liveLinks);
      } else {
        setLinks(liveLinks.filter((l) => l.ownerId === currentUser?.uid));
      }
    });

    window.addEventListener('mfy_storage_update', loadData);
    return () => {
      window.removeEventListener('mfy_storage_update', loadData);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const quota = getUserQuotaSummary(user, links.length, 0);

  const handleOpenCreateModal = () => {
    if (!quota.canCreateLink) {
      showToast(`Batas kuota ${quota.maxLinks} tautan telah tercapai untuk akun Member. Hapus tautan lama untuk membuat baru.`, 'warning');
      return;
    }
    setShowCreateModal(true);
  };

  const handleCopy = (slug: string, id: string) => {
    navigator.clipboard.writeText(`https://event.mfytech.my.id/${slug}`);
    setCopiedId(id);
    showToast('Tautan berhasil disalin! 📋');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = (id: string) => {
    const success = toggleUserStoredLinkStatus(id, user);
    if (success) {
      showToast('Status link berhasil diperbarui');
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus short link "${title}"?`)) {
      const target = links.find((l) => l.id === id);
      const success = deleteUserStoredLink(id, user);
      if (success) {
        if (target) {
          deleteLinkFromFirestore(target.slug).catch(() => {});
        }
        setLinks((prev) => prev.filter((l) => l.id !== id));
        showToast('Short link berhasil dihapus');
      }
    }
  };

  const filteredLinks = links.filter((l) => {
    const matchSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.destinationUrl.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      statusFilter === 'ALL' ? true : l.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & New Link Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Short Links Anda
            </h1>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                quota.isAdmin
                  ? 'bg-amber-100 text-amber-800'
                  : quota.canCreateLink
                  ? 'bg-indigo-50 text-[#5B5BF7]'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {quota.isAdmin ? '👑 Unlimited' : `Kuota: ${quota.linksCount} / ${quota.maxLinks}`}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola, bagikan QR code, dan pantau performa seluruh tautan singkat Anda.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Buat Short Link</span>
        </button>
      </div>

      {/* Toolbar: Search & Filters (PRD Section 36) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul, slug, atau tujuan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="ALL">Semua Status ({links.length})</option>
            <option value="ACTIVE">Aktif ({links.filter((l) => l.status === 'ACTIVE').length})</option>
            <option value="DISABLED">Nonaktif ({links.filter((l) => l.status === 'DISABLED').length})</option>
          </select>
        </div>
      </div>

      {/* Links List (PRD Section 37) */}
      <div className="space-y-3">
        {filteredLinks.map((link) => (
          <div
            key={link.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
          >
            {/* Left: Info */}
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900 truncate">{link.title}</h3>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    link.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {link.status}
                </span>
                {link.expiresAt && (
                  <span className="text-[10px] text-amber-600 flex items-center gap-1 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                    <Calendar className="w-3 h-3" />
                    Exp: {formatDate(link.expiresAt)}
                  </span>
                )}
              </div>

              {/* URL Contract */}
              <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
                <a
                  href={`/${link.slug}`}
                  target="_blank"
                  className="font-semibold text-[#5B5BF7] hover:underline flex items-center gap-1"
                >
                  <span>event.mfytech.my.id/{link.slug}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
                <span className="text-slate-300 hidden sm:inline">→</span>
                <span className="text-slate-400 truncate max-w-sm sm:max-w-md font-sans">
                  {link.destinationUrl}
                </span>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                <span>Dibuat {formatDate(link.createdAt)}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">
                  {formatNumber(link.metrics?.totalClicks || 0)} Total Klik
                </span>
                <span>•</span>
                <span>{formatNumber(link.metrics?.uniqueVisitors || 0)} Visitors</span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 self-end md:self-center">
              {/* Copy */}
              <button
                onClick={() => handleCopy(link.slug, link.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              >
                {copiedId === link.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copiedId === link.id ? 'Tersalin' : 'Salin'}</span>
              </button>

              {/* QR Code */}
              <button
                onClick={() => setQrLink(link)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                title="Lihat & Download QR"
              >
                <QrCode className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">QR</span>
              </button>

              {/* Analytics */}
              <Link
                href={`/links/${link.id}`}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#5B5BF7] bg-indigo-50/70 hover:bg-indigo-50 rounded-xl border border-indigo-100 transition-colors"
                title="Analitik Lengkap"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Analitik</span>
              </Link>

              {/* Toggle Status */}
              <button
                onClick={() => handleToggleStatus(link.id)}
                className={`p-1.5 rounded-xl border transition-colors ${
                  link.status === 'ACTIVE'
                    ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    : 'border-slate-200 text-slate-400 hover:bg-slate-100'
                }`}
                title={link.status === 'ACTIVE' ? 'Nonaktifkan Tautan' : 'Aktifkan Tautan'}
              >
                <Power className="w-3.5 h-3.5" />
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(link.id, link.title)}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Hapus Link"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredLinks.length === 0 && (
          <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300">
            <Link2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Tidak ada tautan ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ada tautan yang cocok dengan "${searchQuery}".`
                : 'Mulai dengan membuat short link pertama Anda untuk dibagikan.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-semibold shadow-xs"
            >
              Buat Short Link Baru
            </button>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrLink && (
        <QRCodeModal
          isOpen={!!qrLink}
          onClose={() => setQrLink(null)}
          slug={qrLink.slug}
          title={qrLink.title}
        />
      )}

      {/* Create Modal */}
      <CreateLinkModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onLinkCreated={loadData}
      />
    </div>
  );
}
