'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  MousePointerClick,
  Eye,
  Smartphone,
  Globe,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { MOCK_DEVICES, MOCK_REFERRERS } from '@/lib/mockData';
import {
  getUserStoredLinks,
  getUserStoredMicrosites,
  getStoredUser,
} from '@/lib/storage';
import { isUserAdmin } from '@/lib/quota';
import { formatNumber } from '@/lib/utils';
import { ShortLink, Microsite, User } from '@/types';
import { TrafficTrendChart } from '@/components/dashboard/TrafficTrendChart';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [microsites, setMicrosites] = useState<Microsite[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const loadData = () => {
    const currentUser = getStoredUser();
    setUser(currentUser);
    setLinks(getUserStoredLinks(currentUser));
    setMicrosites(getUserStoredMicrosites(currentUser));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('mfy_storage_update', loadData);
    return () => window.removeEventListener('mfy_storage_update', loadData);
  }, []);

  const totalClicks = links.reduce((sum, l) => sum + l.metrics.totalClicks, 0);
  const totalViews = microsites.reduce((sum, m) => sum + m.views, 0);
  const isAdmin = isUserAdmin(user);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Analitik Akun & Lalu Lintas
            </h1>
            {isAdmin && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-[#5B5BF7] dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Mode Admin
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Data statistik komprehensif performa klik short link dan keterlibatan pengunjung microsite.
          </p>
        </div>
      </div>

      {/* Top 3 KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Total Klik Short Link</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#5B5BF7] dark:text-indigo-400">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-3">{formatNumber(totalClicks)}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% dibanding periode sebelumnya</span>
          </p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Total Microsite Views</span>
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-[#06B6D4] dark:text-cyan-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-3">{formatNumber(totalViews)}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+28.5% peningkatan visitor</span>
          </p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Rata-rata CTR (Click-Through)</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-3">48.6%</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">
            Konversi tinggi pada materi edukasi & promo
          </p>
        </div>
      </div>

      {/* ================= STATE-OF-THE-ART TRAFFIC TREND CHART ================= */}
      <TrafficTrendChart
        title="Tren Lalu Lintas Harian"
        subtitle="Grafik interaktif klik tautan & pageviews"
        platformLevel={isAdmin}
      />

      {/* Devices & Referrers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#5B5BF7] dark:text-indigo-400" />
            <span>Kategori Perangkat Pengunjung</span>
          </h3>

          {MOCK_DEVICES.length > 0 ? (
            <div className="space-y-4">
              {MOCK_DEVICES.map((dev) => (
                <div key={dev.device}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span>{dev.device}</span>
                    <span className="text-slate-900 dark:text-white font-bold">{dev.percentage}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
              <Smartphone className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Belum ada data perangkat</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Statistik perangkat mobile/desktop akan otomatis terekam saat tautan dikunjungi.</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#06B6D4] dark:text-cyan-400" />
            <span>Platform Rujukan Terpopuler</span>
          </h3>

          {MOCK_REFERRERS.length > 0 ? (
            <div className="space-y-3">
              {MOCK_REFERRERS.map((ref) => (
                <div
                  key={ref.source}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs transition-colors"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{ref.source}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 dark:text-slate-500">{formatNumber(ref.count)} klik</span>
                    <span className="font-bold text-[#5B5BF7] dark:text-indigo-400">{ref.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Globe className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Belum ada data rujukan</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Sumber traffic (WhatsApp, Instagram, Search) akan otomatis tercatat di sini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
