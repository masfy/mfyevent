'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Copy,
  QrCode,
  ExternalLink,
  Check,
  Calendar,
  MousePointerClick,
  Users,
  Smartphone,
  Globe,
  Share2,
  Link2,
} from 'lucide-react';
import { getStoredLinks } from '@/lib/storage';
import { fetchLinksFromFirestore, subscribeLinksFromFirestore } from '@/lib/firebase/firestore';
import { ShortLink } from '@/types';
import { formatNumber, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { QRCodeModal } from '@/components/qr/QRCodeModal';
import { MOCK_TRAFFIC_DATA, MOCK_DEVICES, MOCK_REFERRERS } from '@/lib/mockData';

export default function LinkDetailPage() {
  const params = useParams();
  const linkId = params.id as string;
  const { showToast } = useToast();

  const [link, setLink] = useState<ShortLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const findLinkInList = (list: ShortLink[]) => {
    return list.find((l) => l.id === linkId || l.slug === linkId);
  };

  useEffect(() => {
    // 1. Check local storage first
    const allLinks = getStoredLinks();
    const found = findLinkInList(allLinks);
    if (found) {
      setLink(found);
    }

    // 2. Fetch from Firestore initially
    fetchLinksFromFirestore().then((cloudLinks) => {
      const cloudFound = findLinkInList(cloudLinks);
      if (cloudFound) {
        setLink(cloudFound);
      }
    });

    // 3. Realtime subscribe to Firestore
    const unsubscribe = subscribeLinksFromFirestore((liveLinks) => {
      const liveFound = findLinkInList(liveLinks);
      if (liveFound) {
        setLink(liveFound);
      }
    });

    const handleStorageUpdate = () => {
      const updated = getStoredLinks();
      const updatedFound = findLinkInList(updated);
      if (updatedFound) {
        setLink(updatedFound);
      }
    };

    window.addEventListener('mfy_storage_update', handleStorageUpdate);

    return () => {
      window.removeEventListener('mfy_storage_update', handleStorageUpdate);
      if (unsubscribe) unsubscribe();
    };
  }, [linkId]);

  if (!link) {
    return (
      <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 max-w-lg mx-auto my-12">
        <Link2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h2 className="text-sm font-bold text-slate-800">Tautan tidak ditemukan</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">Tautan ini belum dibuat atau telah dihapus dari sistem.</p>
        <Link
          href="/links"
          className="px-4 py-2 rounded-xl bg-[#5B5BF7] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Tautan</span>
        </Link>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://event.mfytech.my.id/${link.slug}`);
    setCopied(true);
    showToast('Tautan berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <Link
          href="/links"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Tautan</span>
        </Link>
      </div>

      {/* Header Banner (PRD Section 38) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">{link.title}</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
              {link.status}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 font-mono text-xs">
            <a
              href={`/${link.slug}`}
              target="_blank"
              className="text-[#5B5BF7] font-semibold hover:underline flex items-center gap-1"
            >
              <span>event.mfytech.my.id/{link.slug}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <span className="text-slate-300">→</span>
            <span className="text-slate-500 truncate max-w-sm font-sans">{link.destinationUrl}</span>
          </div>

          <p className="text-[11px] text-slate-400 mt-1">
            Dibuat pada {formatDate(link.createdAt)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin' : 'Salin Tautan'}</span>
          </button>

          <button
            onClick={() => setShowQr(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-[#5B5BF7]" />
            <span>QR Code</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics (PRD Section 38) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Clicks</span>
            <MousePointerClick className="w-4 h-4 text-[#5B5BF7]" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">
            {formatNumber(link.metrics?.totalClicks ?? 0)}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Akumulasi seluruh klik</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Unique Visitors</span>
            <Users className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">
            {formatNumber(link.metrics?.uniqueVisitors ?? 0)}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Pengunjung unik terverifikasi</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Estimasi Hari Ini</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">
            +{formatNumber(Math.round((link.metrics?.totalClicks ?? 0) * 0.12))}
          </p>
          <span className="text-[11px] text-emerald-600 mt-0.5 block font-medium">
            Aktivitas stabil
          </span>
        </div>
      </div>

      {/* Traffic Trend Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Performa Klik Harian</h3>
            <p className="text-xs text-slate-400">Tren pengunjung yang mengakses tautan ini</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeRange === '7d' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeRange === '30d' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              30 Hari
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeRange === '90d' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              90 Hari
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3 items-end h-44 pt-4">
          {MOCK_TRAFFIC_DATA.map((item, idx) => {
            const height = Math.min(100, Math.round((item.clicks / 1200) * 100));
            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                <div
                  style={{ height: `${height}%` }}
                  className="w-full max-w-[42px] bg-gradient-to-t from-[#5B5BF7] to-[#06B6D4] rounded-t-lg group-hover:brightness-110 transition-all relative flex items-center justify-center"
                >
                  <span className="text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.clicks}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-medium">{item.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdowns: Devices & Referrers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#5B5BF7]" />
            <span>Perangkat Pengunjung</span>
          </h3>

          {MOCK_DEVICES.length > 0 ? (
            <div className="space-y-4">
              {MOCK_DEVICES.map((dev) => (
                <div key={dev.device}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{dev.device}</span>
                    <span>{dev.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${dev.percentage}%` }}
                      className="h-full bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Smartphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Belum ada data perangkat</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Statistik perangkat mobile/desktop akan otomatis terekam saat tautan ini dikunjungi.</p>
            </div>
          )}
        </div>

        {/* Top Referrers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#06B6D4]" />
            <span>Sumber Rujukan Teratas</span>
          </h3>

          {MOCK_REFERRERS.length > 0 ? (
            <div className="space-y-3">
              {MOCK_REFERRERS.map((ref) => (
                <div
                  key={ref.source}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <span className="font-semibold text-slate-800">{ref.source}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{formatNumber(ref.count)} klik</span>
                    <span className="font-bold text-[#5B5BF7]">{ref.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Belum ada data rujukan</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Sumber traffic (WhatsApp, Instagram, Search) akan otomatis tercatat saat tautan ini diklik.</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQr && (
        <QRCodeModal
          isOpen={showQr}
          onClose={() => setShowQr(false)}
          slug={link.slug}
          title={link.title}
        />
      )}
    </div>
  );
}
