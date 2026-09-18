'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LayoutTemplate, ShieldAlert } from 'lucide-react';
import { MicrositeStudio } from '@/components/builder/MicrositeStudio';
import { getStoredMicrosites, getStoredUser } from '@/lib/storage';
import { fetchMicrositesFromFirestore } from '@/lib/firebase/firestore';
import { isUserAdmin } from '@/lib/quota';
import { Microsite } from '@/types';

export default function EditMicrositeStudioPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;
  const [site, setSite] = useState<Microsite | null>(null);
  const [loading, setLoading] = useState(true);
  const [notAuthorized, setNotAuthorized] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    const isAdmin = isUserAdmin(user);
    const allSites = getStoredMicrosites();
    const found = allSites.find((s) => s.id === siteId || s.slug === siteId);

    if (!found) {
      fetchMicrositesFromFirestore()
        .then((cloudSites) => {
          const cloudFound = cloudSites.find((s) => s.id === siteId || s.slug === siteId);
          if (cloudFound) {
            if (!isAdmin && cloudFound.ownerId !== user.uid) {
              setNotAuthorized(true);
            } else {
              setSite(cloudFound);
            }
          } else {
            setSite(null);
          }
        })
        .catch(() => {
          setSite(null);
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }

    // Security Authorization Check (BOLA Protection)
    if (!isAdmin && found.ownerId !== user.uid) {
      setNotAuthorized(true);
      setLoading(false);
      return;
    }

    setSite(found);
    setLoading(false);
  }, [siteId]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-xs text-slate-400">
        Menyiapkan Studio Builder...
      </div>
    );
  }

  if (notAuthorized) {
    return (
      <div className="p-16 text-center bg-white dark:bg-[#0F172A] rounded-3xl border border-dashed border-rose-300 dark:border-rose-900/60 max-w-lg mx-auto my-12 shadow-xs">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Akses Ditolak</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Anda tidak memiliki izin untuk mengedit microsite milik pengguna lain.
        </p>
        <Link
          href="/microsites"
          className="px-4 py-2 rounded-xl bg-[#5B5BF7] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs hover:opacity-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Microsite</span>
        </Link>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="p-16 text-center bg-white dark:bg-[#0F172A] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 max-w-lg mx-auto my-12">
        <LayoutTemplate className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h2 className="text-sm font-bold text-slate-800 dark:text-white">Microsite tidak ditemukan</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Microsite yang ingin Anda edit belum dibuat atau telah dihapus.</p>
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
