'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { normalizeSlug, isSlugReserved } from '@/lib/utils';
import { getStoredMicrosites, saveStoredMicrosites, getStoredUser } from '@/lib/storage';
import { getUserQuotaSummary } from '@/lib/quota';
import { Microsite } from '@/types';
import { PREBUILT_THEMES } from '@/lib/mockData';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { LayoutTemplate, ArrowRight, Sparkles, Check } from 'lucide-react';

interface CreateMicrositeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newSite: Microsite) => void;
}

export const CreateMicrositeModal: React.FC<CreateMicrositeModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const currentUser = getStoredUser();
  const existingMicrosites = getStoredMicrosites();
  const quota = getUserQuotaSummary(currentUser, 0, existingMicrosites.length);

  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState(PREBUILT_THEMES[0].id);
  const [modalThemeFilter, setModalThemeFilter] = useState<'all' | 'pastel' | 'gradient'>('all');
  const [slugStatus, setSlugStatus] = useState<'IDLE' | 'AVAILABLE' | 'TAKEN' | 'RESERVED' | 'INVALID'>('IDLE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) {
      setSlugStatus('IDLE');
      return;
    }
    const clean = normalizeSlug(slug);
    if (clean.length < 3) {
      setSlugStatus('INVALID');
      return;
    }
    if (isSlugReserved(clean)) {
      setSlugStatus('RESERVED');
      return;
    }
    const existing = getStoredMicrosites();
    if (existing.some((m) => m.slug.toLowerCase() === clean.toLowerCase())) {
      setSlugStatus('TAKEN');
    } else {
      setSlugStatus('AVAILABLE');
    }
  }, [slug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanSlug = normalizeSlug(slug);
    if (!quota.canCreateMicrosite) {
      showToast(`Batas kuota ${quota.maxMicrosites} microsite telah tercapai untuk akun Member.`, 'error');
      return;
    }

    if (slugStatus === 'TAKEN' || slugStatus === 'RESERVED') {
      showToast('Slug username tidak tersedia. Silakan ganti.', 'error');
      return;
    }

    setIsSubmitting(true);
    const chosenTheme = PREBUILT_THEMES.find((t) => t.id === selectedThemeId) || PREBUILT_THEMES[0];

    const newSite: Microsite = {
      id: `ms_${cleanSlug}_${Date.now()}`,
      ownerId: currentUser.uid || 'usr_masalfy_01',
      slug: cleanSlug,
      title: title.trim() || `@${cleanSlug}`,
      status: 'PUBLISHED',
      profile: {
        name: title.trim() || cleanSlug,
        bio: 'Selamat datang di microsite resmi saya di MfyEvent.',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        verified: false,
      },
      theme: chosenTheme,
      seo: {
        metaTitle: `${title.trim() || cleanSlug} | MfyEvent`,
        metaDescription: `Temukan kumpulan link dan informasi resmi ${title.trim() || cleanSlug}.`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      views: 0,
      uniqueVisitors: 0,
      blocks: [
        {
          id: `blk_${Date.now()}_1`,
          type: 'LINK',
          order: 1000,
          visible: true,
          content: {
            title: '🌐 Kunjungi Website Utama Kami',
            url: 'https://www.mfytech.my.id',
            description: 'Platform inovasi edutech & digitalisasi',
          },
        },
        {
          id: `blk_${Date.now()}_2`,
          type: 'WHATSAPP',
          order: 2000,
          visible: true,
          content: {
            title: 'Hubungi via WhatsApp',
            phoneNumber: '6281234567890',
            prefilledText: 'Halo, saya menghubungi melalui microsite Anda di MfyEvent...',
          },
        },
      ],
    };

    const existing = getStoredMicrosites();
    saveStoredMicrosites([newSite, ...existing]);

    setIsSubmitting(false);
    showToast('Microsite berhasil dibuat! Membuka Studio Builder...', 'success');
    if (onCreated) onCreated(newSite);
    onClose();
    router.push(`/microsites/${newSite.id}/edit`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Microsite Baru"
      description="Tentukan alamat microsite @handle dan tema visual pilihan Anda"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quota Status Indicator */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Batas Kuota Microsite:</span>
          <span className={`font-bold font-mono ${quota.isAdmin ? 'text-amber-500 dark:text-amber-400' : quota.canCreateMicrosite ? 'text-slate-800 dark:text-slate-200' : 'text-rose-600 dark:text-rose-400'}`}>
            {quota.isAdmin ? '👑 Unlimited (Admin)' : `${quota.micrositesCount} / ${quota.maxMicrosites}`}
          </span>
        </div>

        {!quota.canCreateMicrosite && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>Batas kuota 11 microsite telah tercapai untuk akun Member Komunitas. Hapus beberapa microsite lama untuk membuat baru.</span>
          </div>
        )}
        {/* Username / Slug */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Alamat Microsite (@slug) <span className="text-rose-500">*</span>
            </label>
            {slugStatus === 'AVAILABLE' && (
              <span className="text-[11px] font-medium text-emerald-600">
                ✓ @{normalizeSlug(slug)} tersedia
              </span>
            )}
            {slugStatus === 'TAKEN' && (
              <span className="text-[11px] font-medium text-rose-500">
                ✕ Sudah digunakan
              </span>
            )}
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#06B6D4] focus-within:bg-white transition-colors">
            <span className="px-3 py-2.5 text-xs text-slate-500 font-mono select-none bg-slate-100/60 border-r border-slate-200 shrink-0">
              event.mfytech.my.id/@
            </span>
            <input
              type="text"
              required
              placeholder="namaanda"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2.5 text-xs text-slate-900 font-mono bg-transparent focus:outline-hidden"
            />
          </div>
        </div>

        {/* Title / Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nama Profil / Halaman <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Mas Alfy atau KKG Coding 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#06B6D4] focus:bg-white transition-colors"
          />
        </div>

        {/* Starting Theme Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-700">
              Pilih Tema Awal
            </label>
            <div className="flex gap-1">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'pastel', label: 'Pastel' },
                { id: 'gradient', label: 'Gradasi' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setModalThemeFilter(f.id as any)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                    modalThemeFilter === f.id
                      ? 'bg-[#5B5BF7] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-0.5">
            {PREBUILT_THEMES.filter((t) => {
              if (modalThemeFilter === 'pastel') return t.id.startsWith('pastel-');
              if (modalThemeFilter === 'gradient') return t.id.startsWith('grad-');
              return true;
            }).map((theme) => {
              const isSelected = theme.id === selectedThemeId;
              const isGrad = theme.id.startsWith('grad-');
              const isPastel = theme.id.startsWith('pastel-');

              return (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => setSelectedThemeId(theme.id)}
                  style={{ background: theme.background }}
                  className={`relative p-2.5 rounded-xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#5B5BF7] ring-2 ring-[#5B5BF7]/30 shadow-xs scale-[1.02]'
                      : 'border-slate-200 opacity-90 hover:opacity-100'
                  }`}
                >
                  <span
                    style={{ color: theme.textColor }}
                    className="text-[11px] font-bold truncate block"
                  >
                    {theme.name}
                  </span>

                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        background: theme.buttonVariant === 'liquidglass' ? 'rgba(255, 255, 255, 0.7)' : theme.buttonBg,
                        color: theme.buttonVariant === 'liquidglass' ? theme.textColor : theme.buttonTextColor,
                        border: theme.buttonVariant === 'liquidglass' ? '1px solid rgba(255, 255, 255, 0.8)' : 'none',
                      }}
                      className="text-[8px] px-1.5 py-0.5 rounded font-semibold truncate max-w-[65px]"
                    >
                      {isPastel ? 'Pastel' : isGrad ? 'Gradasi' : 'Klasik'}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white bg-[#5B5BF7] rounded-full p-0.5 shadow-xs" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || slugStatus === 'TAKEN' || slugStatus === 'RESERVED' || !quota.canCreateMicrosite}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] hover:opacity-95 rounded-xl shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isSubmitting ? 'Menyiapkan...' : 'Mulai Mendesain di Studio'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </Modal>
  );
};
