'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LayoutTemplate, Plus } from 'lucide-react';
import { MicrositeStudio } from '@/components/builder/MicrositeStudio';
import { getStoredMicrosites } from '@/lib/storage';
import { Microsite } from '@/types';

export default function EditMicrositeStudioPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;
  const [site, setSite] = useState<Microsite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allSites = getStoredMicrosites();
    const found = allSites.find((s) => s.id === siteId);
    if (found) {
      setSite(found);
    } else if (allSites.length > 0) {
      setSite(allSites[0]);
    }
    setLoading(false);
  }, [siteId]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-xs text-slate-400">
        Menyiapkan Studio Builder...
      </div>
    );
  }

  if (!site) {
    return (
      <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 max-w-lg mx-auto my-12">
        <LayoutTemplate className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h2 className="text-sm font-bold text-slate-800">Microsite tidak ditemukan</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">Microsite yang ingin Anda edit belum dibuat atau telah dihapus.</p>
        <Link
          href="/microsites"
          className="px-4 py-2 rounded-xl bg-[#5B5BF7] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Microsite</span>
        </Link>
      </div>
    );
  }

  return <MicrositeStudio initialMicrosite={site} />;
}
