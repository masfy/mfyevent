'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { cleanShortSlug, generateRandomSlug, isSlugReserved } from '@/lib/utils';
import { getStoredLinks, saveStoredLinks, getStoredUser, getUserStoredLinks } from '@/lib/storage';
import { getUserQuotaSummary } from '@/lib/quota';
import { ShortLink } from '@/types';
import { useToast } from '@/components/ui/Toast';
import confetti from 'canvas-confetti';
import { Link2, Check, Copy, QrCode, ArrowRight, ExternalLink, Calendar, RefreshCw } from 'lucide-react';
import { QRCodeModal } from '@/components/qr/QRCodeModal';

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkCreated?: (newLink: ShortLink) => void;
}

export const CreateLinkModal: React.FC<CreateLinkModalProps> = ({
  isOpen,
  onClose,
  onLinkCreated,
}) => {
  const { showToast } = useToast();
  const currentUser = getStoredUser();
  const currentLinks = getStoredLinks();
  const userLinks = getUserStoredLinks(currentUser);
  const quota = getUserQuotaSummary(currentUser, userLinks.length, 0);

  const [destinationUrl, setDestinationUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Validation state
  const [slugStatus, setSlugStatus] = useState<'IDLE' | 'AVAILABLE' | 'TAKEN' | 'RESERVED' | 'INVALID'>('IDLE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success view state
  const [createdLink, setCreatedLink] = useState<ShortLink | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-generate random slug (letters upper/lower + numbers)
  const generateNewSlug = () => {
    const currentLinks = getStoredLinks();
    let candidate = '';
    let attempts = 0;
    do {
      candidate = generateRandomSlug(6);
      attempts++;
    } while (
      attempts < 25 &&
      currentLinks.some((l) => l.status === 'ACTIVE' && l.slug.toLowerCase() === candidate.toLowerCase())
    );
    setSlug(candidate);
  };

  // Automatically pre-fill with generated slug when modal opens
  useEffect(() => {
    if (isOpen && !createdLink && !slug) {
      generateNewSlug();
    }
  }, [isOpen, createdLink]);

  // Live availability check against ACTIVE slugs
  useEffect(() => {
    if (!slug) {
      setSlugStatus('IDLE');
      return;
    }

    const clean = cleanShortSlug(slug);
    if (clean.length < 3) {
      setSlugStatus('INVALID');
      return;
    }

    if (isSlugReserved(clean)) {
      setSlugStatus('RESERVED');
      return;
    }

    const currentLinks = getStoredLinks();
    // A slug is taken ONLY if an active link is already using it
    const activeExists = currentLinks.some(
      (l) => l.status === 'ACTIVE' && l.slug.toLowerCase() === clean.toLowerCase()
    );
    if (activeExists) {
      setSlugStatus('TAKEN');
    } else {
      setSlugStatus('AVAILABLE');
    }
  }, [slug]);

  const handleReset = () => {
    setDestinationUrl('');
    setSlug('');
    setTitle('');
    setExpiresAt('');
    setShowAdvanced(false);
    setCreatedLink(null);
    setSlugStatus('IDLE');
  };

  const handleCloseModal = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetUrl = destinationUrl.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const cleanSlug = cleanShortSlug(slug || generateRandomSlug(6));

    const currentLinks = getStoredLinks();
    const currentUser = getStoredUser();
    const quota = getUserQuotaSummary(currentUser, currentLinks.length, 0);

    if (!quota.canCreateLink) {
      showToast(`Batas kuota ${quota.maxLinks} tautan telah tercapai untuk akun Member. Hapus tautan lama untuk membuat baru.`, 'error');
      return;
    }

    const activeExists = currentLinks.some(
      (l) => l.status === 'ACTIVE' && l.slug.toLowerCase() === cleanSlug.toLowerCase()
    );

    if (activeExists || slugStatus === 'TAKEN' || slugStatus === 'RESERVED') {
      showToast('Slug tidak dapat digunakan karena sedang aktif dipakai tautan lain.', 'error');
      return;
    }

    setIsSubmitting(true);

    const newLink: ShortLink = {
      id: `link_${Date.now()}`,
      slug: cleanSlug,
      ownerId: currentUser.uid || 'usr_guest',
      title: title.trim() || cleanSlug,
      destinationUrl: targetUrl,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: expiresAt || undefined,
      metrics: {
        totalClicks: 0,
        uniqueVisitors: 0,
      },
    };

    const updated = [newLink, ...currentLinks];
    saveStoredLinks(updated);

    // Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    setIsSubmitting(false);
    setCreatedLink(newLink);
    if (onLinkCreated) onLinkCreated(newLink);
    showToast('Tautan singkat berhasil dibuat! 🎉');
  };

  const handleCopyLink = () => {
    if (!createdLink) return;
    const url = `https://event.mfytech.my.id/${createdLink.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('Tautan berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        title={createdLink ? 'Tautan Siap Digunakan 🎉' : 'Buat Short Link'}
        description={
          createdLink
            ? 'Short link telah aktif dan siap Anda bagikan kepada audiens.'
            : 'Perpendek link panjang dan tentukan custom slug pilihan Anda.'
        }
        maxWidth="md"
      >
        {createdLink ? (
          /* SUCCESS VIEW - PRD SECTION 35 */
          <div className="flex flex-col items-center text-center pt-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Check className="w-6 h-6" />
            </div>

            <h4 className="text-base font-bold text-slate-900">{createdLink.title}</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm truncate">
              {createdLink.destinationUrl}
            </p>

            <div className="w-full mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-[#5B5BF7] truncate">
                event.mfytech.my.id/{createdLink.slug}
              </span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => setShowQrModal(true)}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <QrCode className="w-4 h-4 text-[#5B5BF7]" />
                <span>Lihat QR Code</span>
              </button>

              <button
                onClick={handleCloseModal}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-xs font-semibold text-white hover:opacity-95 transition-opacity"
              >
                <span>Selesai</span>
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW - PRD SECTION 34 */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quota Status Indicator */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Batas Kuota Tautan:</span>
              <span className={`font-bold font-mono ${quota.isAdmin ? 'text-amber-500 dark:text-amber-400' : quota.canCreateLink ? 'text-slate-800 dark:text-slate-200' : 'text-rose-600 dark:text-rose-400'}`}>
                {quota.isAdmin ? '👑 Unlimited (Admin)' : `${quota.linksCount} / ${quota.maxLinks}`}
              </span>
            </div>

            {!quota.canCreateLink && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>Batas kuota 127 tautan telah tercapai untuk akun Member Komunitas. Hapus beberapa tautan lama untuk membuat baru.</span>
              </div>
            )}
            {/* Destination URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                URL Tujuan (Panjang) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="https://docs.google.com/forms/d/..."
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Custom Slug with Auto Generate & Uniqueness Check */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Custom Slug <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {slugStatus === 'AVAILABLE' && (
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      ✓ Slug tersedia
                    </span>
                  )}
                  {slugStatus === 'TAKEN' && (
                    <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                      ✕ Digunakan tautan aktif
                    </span>
                  )}
                  {slugStatus === 'RESERVED' && (
                    <span className="text-[11px] font-medium text-amber-600">
                      ✕ Kata sistem (reserved)
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={generateNewSlug}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5B5BF7] hover:text-[#4848E8] hover:underline cursor-pointer ml-1"
                    title="Generate slug acak baru"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Acak Ulang</span>
                  </button>
                </div>
              </div>

              <div className={`flex items-center bg-slate-50 border rounded-xl overflow-hidden focus-within:bg-white transition-colors ${
                slugStatus === 'TAKEN' ? 'border-rose-400 focus-within:border-rose-500' : 'border-slate-200 focus-within:border-[#5B5BF7]'
              }`}>
                <span className="px-3 py-2.5 text-xs text-slate-400 font-mono select-none bg-slate-100/60 border-r border-slate-200 shrink-0">
                  event.mfytech.my.id/
                </span>
                <input
                  type="text"
                  required
                  placeholder="Contoh: k8Nx7Q"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs text-slate-900 font-mono bg-transparent focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={generateNewSlug}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-[#5B5BF7] hover:bg-slate-100 transition-colors border-l border-slate-200 shrink-0 flex items-center gap-1"
                  title="Generate kombinasi acak (huruf besar, kecil, angka)"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Acak</span>
                </button>
              </div>

              {slugStatus === 'TAKEN' && (
                <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1">
                  Peringatan: Slug ini sudah aktif digunakan oleh tautan lain. Anda tidak dapat membuat tautan dengan slug yang sama selama tautan tersebut masih aktif.
                </p>
              )}
            </div>

            {/* Title / Label */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Judul Tautan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Modul Materi Pelatihan KKG"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white transition-colors"
              />
            </div>

            {/* Optional Settings Collapsible */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-medium text-[#5B5BF7] hover:underline flex items-center gap-1"
              >
                {showAdvanced ? '▾ Sembunyikan Pengaturan Lanjutan' : '▸ Opsi Tanggal Kedaluwarsa'}
              </button>

              {showAdvanced && (
                <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Batas Waktu Aktif (Expiry Date)
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:border-[#5B5BF7]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Setelah tanggal ini, pengunjung akan melihat halaman "Tautan ini telah kedaluwarsa".
                  </p>
                </div>
              )}
            </div>

            {/* Submit CTA */}
            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || slugStatus === 'TAKEN' || slugStatus === 'RESERVED' || !quota.canCreateLink}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] hover:opacity-95 rounded-xl shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isSubmitting ? 'Memproses...' : 'Buat Short Link'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* QR Code Modal for newly created link */}
      {createdLink && (
        <QRCodeModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          slug={createdLink.slug}
          title={createdLink.title}
        />
      )}
    </>
  );
};
