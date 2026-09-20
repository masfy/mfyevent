'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PublicMicrositeView } from '@/components/microsite/PublicMicrositeView';
import { subscribeMicrositeBySlug } from '@/lib/firebase/firestore';
import { Microsite } from '@/types';
import Link from 'next/link';

export default function PublicMicrositePage() {
  const params = useParams();
  const rawSlug = params.slug as string;
  const [microsite, setMicrosite] = useState<Microsite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rawSlug) return;
    const cleanSlug = decodeURIComponent(rawSlug).toLowerCase().replace(/^@/, '');

    setLoading(true);

    // Langganan pembaruan real-time langsung dari Cloud Firestore
    const unsubscribe = subscribeMicrositeBySlug(cleanSlug, (liveSite) => {
      setMicrosite(liveSite);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [rawSlug]);

  // Update Dynamic Document Title
  useEffect(() => {
    if (microsite) {
      document.title = microsite.seo?.metaTitle || `${microsite.title} | MfyEvent`;
    }
  }, [microsite]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#5B5BF7] border-t-transparent animate-spin" />
      </div>
    );
  }

  // PRD Section 120: Custom Error Experiences
  if (!microsite) {
    const cleanSlug = rawSlug ? decodeURIComponent(rawSlug).replace(/^@/, '') : '';
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#5B5BF7] flex items-center justify-center text-xl font-bold mb-4 shadow-xs">
          @
        </div>
        <h1 className="text-xl font-bold text-slate-900">Halaman Tidak Ditemukan</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
          Microsite <span className="font-mono font-semibold text-[#5B5BF7]">/@{cleanSlug}</span> belum dibuat, belum dipublikasikan, atau alamat penulisan salah.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
          >
            Buka Beranda MfyEvent
          </Link>
        </div>

        <footer className="mt-12 text-[11px] text-slate-400">
          MfyEvent · A service by MfyTech · event.mfytech.my.id
        </footer>
      </div>
    );
  }

  if (microsite.status === 'SUSPENDED') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">Halaman Ini Sedang Ditangguhkan</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Konten pada halaman ini sedang dalam pemeriksaan tim moderasi MfyTech.
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <PublicMicrositeView microsite={microsite} previewMode={false} />
    </div>
  );
}

