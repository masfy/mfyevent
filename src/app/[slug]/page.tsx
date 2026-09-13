'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStoredLinks, saveStoredLinks, getStoredMicrosites } from '@/lib/storage';
import { INITIAL_LINKS, INITIAL_MICROSITES } from '@/lib/mockData';
import { ShortLink, Microsite } from '@/types';
import Link from 'next/link';
import { ExternalLink, AlertCircle, Clock, Ban, ArrowRight } from 'lucide-react';
import { PublicMicrositeView } from '@/components/microsite/PublicMicrositeView';

export default function ShortLinkRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params.slug as string;

  const [link, setLink] = useState<ShortLink | null>(null);
  const [microsite, setMicrosite] = useState<Microsite | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!rawSlug) return;
    const decoded = decodeURIComponent(rawSlug).toLowerCase();

    // Check if it's a microsite handle request (e.g. @masalfy)
    if (decoded.startsWith('@')) {
      const msSlug = decoded.substring(1);
      const allSites = getStoredMicrosites();
      const foundSite =
        allSites.find((s) => s.slug.toLowerCase() === msSlug) ||
        INITIAL_MICROSITES.find((s) => s.slug.toLowerCase() === msSlug);

      if (foundSite) {
        setMicrosite(foundSite);
      }
      setLoading(false);
      return;
    }

    const cleanSlug = decoded;
    const allLinks = getStoredLinks();
    const found =
      allLinks.find((l) => l.slug.toLowerCase() === cleanSlug) ||
      INITIAL_LINKS.find((l) => l.slug.toLowerCase() === cleanSlug);

    if (found) {
      setLink(found);

      // Check active and not expired
      if (found.status === 'ACTIVE') {
        const isExpired = found.expiresAt && new Date(found.expiresAt).getTime() < Date.now();
        if (!isExpired) {
          try {
            if (!found.metrics) found.metrics = { totalClicks: 0, uniqueVisitors: 0 };
            found.metrics.totalClicks = (found.metrics.totalClicks || 0) + 1;
            const updated = allLinks.map((l) => (l.id === found.id ? found : l));
            saveStoredLinks(updated);
          } catch {
            // ignore
          }

          setRedirecting(true);
          // Redirect visitor immediately
          const timer = setTimeout(() => {
            window.location.href = found.destinationUrl;
          }, 800);
          return () => clearTimeout(timer);
        }
      }
    }
    setLoading(false);
  }, [rawSlug]);

  if (redirecting && link) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#5B5BF7] flex items-center justify-center mb-4">
          <div className="w-6 h-6 border-2 border-[#5B5BF7] border-t-transparent rounded-full animate-spin" />
        </div>
        <h1 className="text-base font-bold text-slate-900">Mengalihkan ke tautan tujuan...</h1>
        <p className="text-xs font-mono text-slate-500 mt-1 max-w-sm truncate">
          {link.destinationUrl}
        </p>
        <a
          href={link.destinationUrl}
          className="mt-4 text-xs font-semibold text-[#5B5BF7] hover:underline flex items-center gap-1"
        >
          <span>Klik di sini jika tidak beralih otomatis</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#5B5BF7] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (microsite) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <PublicMicrositeView microsite={microsite} previewMode={false} />
      </div>
    );
  }

  // PRD Section 120: Custom Error Experiences
  if (!link) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Tautan Ini Tidak Ditemukan</h1>
        <p className="text-xs text-slate-500 mt-1.5 max-w-sm">
          Tautan <span className="font-mono text-[#5B5BF7]">/{rawSlug}</span> mungkin telah dihapus atau penulisan alamat URL tidak tepat.
        </p>

        <Link
          href="/"
          className="mt-6 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Buka Halaman Utama MfyEvent
        </Link>
        <footer className="mt-12 text-[11px] text-slate-400">
          MfyEvent · A service by MfyTech · www.mfytech.my.id
        </footer>
      </div>
    );
  }

  if (link.status === 'DISABLED') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <Ban className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Tautan Sedang Dinonaktifkan</h1>
        <p className="text-xs text-slate-500 mt-1.5 max-w-sm">
          Pemilik tautan sedang menonaktifkan akses sementara untuk alamat ini.
        </p>
        <Link
          href="/"
          className="mt-6 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          Buka MfyEvent
        </Link>
        <footer className="mt-12 text-[11px] text-slate-400">
          MfyEvent · by MfyTech
        </footer>
      </div>
    );
  }

  if (link.status === 'SUSPENDED') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <Ban className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Tautan Ini Ditangguhkan</h1>
        <p className="text-xs text-slate-500 mt-1.5 max-w-sm">
          Tautan ini ditangguhkan oleh sistem moderasi karena dugaan pelanggaran ketentuan layanan.
        </p>
        <Link
          href="/"
          className="mt-6 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          Kembali ke MfyEvent
        </Link>
      </div>
    );
  }

  const isExpired =
    link.status === 'EXPIRED' ||
    Boolean(link.expiresAt && new Date(link.expiresAt).getTime() < Date.now());

  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4 shadow-xs">
          <Clock className="w-7 h-7" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100/80 text-amber-800 mb-3 border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          <span>Masa Aktif Tautan Telah Berakhir</span>
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Tautan Uji Coba Telah Kedaluwarsa
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
          Tautan <span className="font-mono font-semibold text-[#5B5BF7]">/{rawSlug}</span> dibuat melalui fitur uji coba gratis 24 jam MfyEvent dan kini masa aktifnya telah selesai.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-bold hover:opacity-95 shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Daftar & Buat Tautan Permanen</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>

        <footer className="mt-12 text-[11px] text-slate-400">
          MfyEvent · A service by MfyTech · event.mfytech.my.id
        </footer>
      </div>
    );
  }

  return null;
}
