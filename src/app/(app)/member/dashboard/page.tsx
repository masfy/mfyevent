'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Link2,
  LayoutTemplate,
  MousePointerClick,
  Eye,
  TrendingUp,
  Plus,
  Copy,
  QrCode,
  ExternalLink,
  Check,
  ArrowUpRight,
  Sparkles,
  Activity,
} from 'lucide-react';
import {
  getUserStoredLinks,
  getUserStoredMicrosites,
  getStoredUser,
  getStoredLinks,
  getStoredMicrosites,
  isUserLoggedIn,
} from '@/lib/storage';
import {
  subscribeMicrositesFromFirestore,
  subscribeLinksFromFirestore,
} from '@/lib/firebase/firestore';
import { ShortLink, Microsite, User } from '@/types';
import { formatNumber, formatDate } from '@/lib/utils';
import { MOCK_TRAFFIC_DATA, INITIAL_USER } from '@/lib/mockData';
import { useToast } from '@/components/ui/Toast';
import { QRCodeModal } from '@/components/qr/QRCodeModal';
import { CreateLinkModal } from '@/components/dashboard/CreateLinkModal';
import { CreateMicrositeModal } from '@/components/dashboard/CreateMicrositeModal';
import { TrafficLineChart } from '@/components/dashboard/TrafficLineChart';
import { getUserQuotaSummary } from '@/lib/quota';

export default function MemberDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [microsites, setMicrosites] = useState<Microsite[]>([]);
  const [user, setUser] = useState<User>(INITIAL_USER);

  // Modals
  const [selectedQrLink, setSelectedQrLink] = useState<ShortLink | null>(null);
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [showCreateMicrosite, setShowCreateMicrosite] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = () => {
    const currentUser = getStoredUser();
    setUser(currentUser);
    const userLinks = (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN')
      ? getStoredLinks().filter((l) => l.ownerId === currentUser.uid)
      : getUserStoredLinks(currentUser);
    const userSites = (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN')
      ? getStoredMicrosites().filter((m) => m.ownerId === currentUser.uid)
      : getUserStoredMicrosites(currentUser);
    setLinks(userLinks);
    setMicrosites(userSites);
  };

  useEffect(() => {
    if (!isUserLoggedIn()) {
      router.replace('/login');
      return;
    }
    loadData();

    // Berlangganan real-time links dari Firestore
    const unsubLinks = subscribeLinksFromFirestore((liveLinks) => {
      const currentUser = getStoredUser();
      const userLinks = (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN')
        ? liveLinks.filter((l) => l.ownerId === currentUser.uid)
        : liveLinks.filter((l) => l.ownerId === currentUser.uid);
      setLinks(userLinks);
    });

    // Berlangganan real-time microsites dari Firestore
    const unsubSites = subscribeMicrositesFromFirestore((liveSites) => {
      const currentUser = getStoredUser();
      const userSites = (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN')
        ? liveSites.filter((m) => m.ownerId === currentUser.uid)
        : liveSites.filter((m) => m.ownerId === currentUser.uid);
      setMicrosites(userSites);
    });

    window.addEventListener('mfy_storage_update', loadData);
    return () => {
      window.removeEventListener('mfy_storage_update', loadData);
      if (unsubLinks) unsubLinks();
      if (unsubSites) unsubSites();
    };
  }, [router]);

  const totalClicks = links.reduce((sum, l) => sum + (l.metrics?.totalClicks || 0), 0);
  const totalViews = microsites.reduce((sum, m) => sum + (m.views || 0), 0);
  const quota = getUserQuotaSummary(user, links.length, microsites.length);

  const handleOpenCreateLink = () => {
    if (!quota.canCreateLink) {
      showToast(`Batas kuota ${quota.maxLinks} tautan telah tercapai untuk akun Member. Hapus tautan lama untuk membuat baru.`, 'warning');
      return;
    }
    setShowCreateLink(true);
  };

  const handleOpenCreateMicrosite = () => {
    if (!quota.canCreateMicrosite) {
      showToast(`Batas kuota ${quota.maxMicrosites} microsite telah tercapai untuk akun Member. Hapus microsite lama untuk membuat baru.`, 'warning');
      return;
    }
    setShowCreateMicrosite(true);
  };

  const handleCopy = (slug: string, id: string) => {
    const url = `https://event.mfytech.my.id/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Tautan disalin ke clipboard! 📋');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  return (
    <div className="relative space-y-8 animate-in fade-in duration-300">
      {/* ================= DARK MODE AMBIENT GLOWING BACKDROP ================= */}
      <div className="absolute -top-12 left-1/4 w-[420px] h-[320px] bg-gradient-to-br from-[#5B5BF7]/15 to-[#06B6D4]/10 rounded-full blur-[110px] pointer-events-none -z-10 animate-pulse hidden dark:block" />
      <div className="absolute top-48 right-10 w-[380px] h-[280px] bg-gradient-to-bl from-[#06B6D4]/12 to-[#818CF8]/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse [animation-delay:2s] hidden dark:block" />

      {/* ================= GREETING & HERO BANNER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{getGreeting()}, {user.displayName}</span>
            <span className="text-xl inline-block hover:animate-bounce cursor-default">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dasbor Member MfyEvent — Ringkasan performa seluruh tautan singkat & halaman microsite aktif Anda.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenCreateLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xs cursor-pointer dark:hover:border-indigo-500/40"
          >
            <Link2 className="w-3.5 h-3.5 text-[#5B5BF7]" />
            <span>+ Short Link</span>
          </button>

          <button
            onClick={handleOpenCreateMicrosite}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-bold shadow-xs hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer dark:shadow-[0_0_20px_rgba(91,91,247,0.35)]"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>+ Microsite</span>
          </button>
        </div>
      </div>

      {/* ================= MEMBER WELCOME & STATUS BANNER (ANIMATED IN DARK MODE) ================= */}
      <div className="relative group overflow-hidden bg-gradient-to-r from-indigo-50/90 via-cyan-50/50 to-white dark:from-[#0F172A] dark:via-[#1E1B4B]/50 dark:to-[#0B0F19] p-5 sm:p-6 rounded-3xl border border-indigo-100/90 dark:border-indigo-500/25 shadow-xs dark:shadow-[0_0_35px_rgba(91,91,247,0.12)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300">
        {/* Animated ambient shimmer line on dark mode */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-[#5B5BF7]/20 to-[#06B6D4]/20 rounded-full blur-2xl pointer-events-none opacity-0 dark:opacity-100 animate-pulse" />

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-[#5B5BF7] text-white shadow-2xs">
              {quota.isAdmin ? '👑 Paket Administrator (Unlimited)' : '👤 Paket Member Komunitas'}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Status Aktif & Terverifikasi
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            Selamat datang di Dasbor Member MfyEvent
            <Sparkles className="w-4 h-4 text-[#818CF8] hidden dark:inline-block animate-pulse" />
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
            {quota.isAdmin
              ? 'Akun Administrator — Nikmati akses tanpa batas (unlimited) untuk seluruh tautan dan microsite tanpa batas kuota.'
              : 'Buat shortlink berkecepatan tinggi (hingga 127 tautan) dan publikasikan 11 microsite resmi Anda tanpa batasan masa aktif.'}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 text-xs font-medium w-full md:w-auto">
          <div className="bg-white dark:bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs hover:border-[#5B5BF7]/50 transition-colors">
            <span className="text-slate-400 dark:text-slate-400 block text-[10px]">Tautan Digunakan</span>
            <span className="font-bold text-slate-900 dark:text-white">{quota.linksUsageLabel}</span>
          </div>
          <div className="bg-white dark:bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs hover:border-[#06B6D4]/50 transition-colors">
            <span className="text-slate-400 dark:text-slate-400 block text-[10px]">Microsite Digunakan</span>
            <span className="font-bold text-slate-900 dark:text-white">{quota.micrositesUsageLabel}</span>
          </div>
          <Link
            href="/settings"
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-indigo-500 hover:shadow-[0_0_15px_rgba(91,91,247,0.4)] transition-all shrink-0"
          >
            Info Akun
          </Link>
        </div>
      </div>

      {/* ================= 4 PRIMARY METRIC CARDS WITH DARK MODE HOVER GLOW ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 shadow-xs flex flex-col justify-between hover:border-[#5B5BF7] dark:hover:border-[#5B5BF7]/60 dark:hover:shadow-[0_0_24px_rgba(91,91,247,0.18)] hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Short Links</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-[#5B5BF7] flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatNumber(links.length)}
            </span>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>Semua aktif</span>
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 shadow-xs flex flex-col justify-between hover:border-emerald-500 dark:hover:border-emerald-500/60 dark:hover:shadow-[0_0_24px_rgba(16,185,129,0.18)] hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Clicks</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatNumber(totalClicks)}
            </span>
            {totalClicks > 0 ? (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+18.4% minggu ini</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                <Activity className="w-3 h-3 text-slate-400" />
                <span>0% minggu ini</span>
              </p>
            )}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 shadow-xs flex flex-col justify-between hover:border-[#06B6D4] dark:hover:border-[#06B6D4]/60 dark:hover:shadow-[0_0_24px_rgba(6,182,212,0.18)] hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Microsites</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950 text-[#06B6D4] flex items-center justify-center">
              <LayoutTemplate className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatNumber(microsites.length)}
            </span>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              {microsites.filter((m) => m.status === 'PUBLISHED').length} Published
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 shadow-xs flex flex-col justify-between hover:border-indigo-500 dark:hover:border-indigo-500/60 dark:hover:shadow-[0_0_24px_rgba(91,91,247,0.18)] hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Page Views</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-[#5B5BF7] flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatNumber(totalViews)}
            </span>
            {totalViews > 0 ? (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+24.1% pengunjung baru</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                <Activity className="w-3 h-3 text-slate-400" />
                <span>0% pengunjung baru</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ================= TRAFFIC OVERVIEW RESPONSIVE LINE CHART ================= */}
      <div className="bg-white dark:bg-[#0F172A] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800/90 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Aktivitas & Tren Lalu Lintas
              </h3>
              <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Data
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Analisis perbandingan performa klik tautan dan lonjakan pengunjung unik dengan opsi rentang waktu dinamis
            </p>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold self-start sm:self-auto">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#5B5BF7] to-[#818CF8] shadow-[0_0_8px_#5B5BF7]" />
              Klik Tautan
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] shadow-[0_0_8px_#06B6D4]" />
              Unique Visitors
            </span>
          </div>
        </div>

        {/* Pure Responsive SVG Dual-Line Chart */}
        <TrafficLineChart data={MOCK_TRAFFIC_DATA} />
      </div>

      {/* ================= DUAL SECTION: TOP LINKS & MICROSITES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Top Links */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tautan Terpopuler</h3>
              <p className="text-xs text-slate-400 mt-0.5">Short link dengan performa klik tertinggi</p>
            </div>
            <Link
              href="/links"
              className="text-xs font-semibold text-[#5B5BF7] hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {links.length > 0 ? (
              links.slice(0, 4).map((link) => (
                <div
                  key={link.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="truncate pr-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{link.title}</h4>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-sm font-semibold uppercase ${
                          link.status === 'ACTIVE'
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {link.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 font-mono text-xs">
                      <span className="font-semibold text-[#5B5BF7]">
                        event.mfytech.my.id/{link.slug}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">→</span>
                      <span className="text-slate-400 truncate max-w-xs">{link.destinationUrl}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="text-right mr-1">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                        {formatNumber(link.metrics?.totalClicks || 0)}
                      </span>
                      <span className="text-[10px] text-slate-400">klik</span>
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(link.slug, link.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Salin Tautan"
                    >
                      {copiedId === link.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* QR Code Button */}
                    <button
                      onClick={() => setSelectedQrLink(link)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Lihat QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    {/* Link Details */}
                    <Link
                      href={`/links/${link.id}`}
                      className="p-1.5 text-slate-400 hover:text-[#5B5BF7] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Buka Analitik Detail"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <Link2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Belum ada short link</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Buat tautan singkat pertama Anda untuk memulai.</p>
                <button
                  onClick={() => setShowCreateLink(true)}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-semibold shadow-xs hover:opacity-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Short Link Baru</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Active Microsites Cards */}
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Microsite Anda</h3>
                <p className="text-xs text-slate-400 mt-0.5">Halaman publik @handle</p>
              </div>
              <Link
                href="/microsites"
                className="text-xs font-semibold text-[#06B6D4] hover:underline flex items-center gap-1"
              >
                <span>Kelola</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {microsites.length > 0 ? (
                microsites.slice(0, 3).map((site) => (
                  <div
                    key={site.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#06B6D4] transition-all bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <img
                        src={site.profile.avatarUrl}
                        alt={site.title}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{site.title}</p>
                        <span className="text-[11px] font-mono text-[#06B6D4] block truncate">
                          @{site.slug}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/@${site.slug}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                        title="Lihat Live"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href={`/microsites/${site.id}/edit`}
                        className="px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 dark:bg-indigo-600 rounded-lg hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <LayoutTemplate className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Belum ada microsite</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Buat halaman profil link in bio pertama Anda.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowCreateMicrosite(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-[#06B6D4] hover:text-[#06B6D4] hover:bg-cyan-50/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Microsite Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {selectedQrLink && (
        <QRCodeModal
          isOpen={!!selectedQrLink}
          onClose={() => setSelectedQrLink(null)}
          slug={selectedQrLink.slug}
          title={selectedQrLink.title}
        />
      )}

      {/* Quick creation modals */}
      <CreateLinkModal
        isOpen={showCreateLink}
        onClose={() => setShowCreateLink(false)}
        onLinkCreated={loadData}
      />

      <CreateMicrositeModal
        isOpen={showCreateMicrosite}
        onClose={() => setShowCreateMicrosite(false)}
        onCreated={loadData}
      />
    </div>
  );
}
