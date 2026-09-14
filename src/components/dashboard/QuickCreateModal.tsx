'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Link2, LayoutTemplate, ArrowRight, Sparkles } from 'lucide-react';
import {
  getStoredUser,
  getUserStoredLinks,
  getUserStoredMicrosites,
} from '@/lib/storage';
import { getUserQuotaSummary } from '@/lib/quota';
import { useToast } from '@/components/ui/Toast';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectShortLink: () => void;
  onSelectMicrosite: () => void;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  onClose,
  onSelectShortLink,
  onSelectMicrosite,
}) => {
  const { showToast } = useToast();
  const [linksCount, setLinksCount] = useState(0);
  const [micrositesCount, setMicrositesCount] = useState(0);
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    if (isOpen) {
      const u = getStoredUser();
      setUser(u);
      setLinksCount(getUserStoredLinks(u).length);
      setMicrositesCount(getUserStoredMicrosites(u).length);
    }
  }, [isOpen]);

  const quota = getUserQuotaSummary(user, linksCount, micrositesCount);

  const handleChooseShortLink = () => {
    if (!quota.canCreateLink) {
      showToast(`Batas kuota ${quota.maxLinks} tautan telah tercapai untuk akun Member. Hapus tautan lama untuk membuat baru.`, 'warning');
      return;
    }
    onClose();
    onSelectShortLink();
  };

  const handleChooseMicrosite = () => {
    if (!quota.canCreateMicrosite) {
      showToast(`Batas kuota ${quota.maxMicrosites} microsite telah tercapai untuk akun Member. Hapus microsite lama untuk membuat baru.`, 'warning');
      return;
    }
    onClose();
    onSelectMicrosite();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Baru"
      description="Pilih jenis aset yang ingin Anda publikasikan"
      maxWidth="md"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        {/* Short Link Card Option */}
        <button
          onClick={handleChooseShortLink}
          className="group relative flex flex-col p-5 bg-white border border-slate-200 hover:border-[#5B5BF7] rounded-2xl text-left transition-all duration-200 hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5B5BF7] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Link2 className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
                quota.isAdmin
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                  : quota.canCreateLink
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}
            >
              {quota.isAdmin ? '👑 Unlimited' : `${quota.linksCount} / ${quota.maxLinks}`}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#5B5BF7] flex items-center justify-between">
            Short Link
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#5B5BF7] group-hover:translate-x-1 transition-all" />
          </h4>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Perpendek URL panjang, dapatkan QR Code instan, dan pantau jumlah klik secara akurat.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span>event.mfytech.my.id/</span>
            <span className="text-[#5B5BF7] font-semibold">slug</span>
          </div>
        </button>

        {/* Microsite Card Option */}
        <button
          onClick={handleChooseMicrosite}
          className="group relative flex flex-col p-5 bg-white border border-slate-200 hover:border-[#06B6D4] rounded-2xl text-left transition-all duration-200 hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#06B6D4] flex items-center justify-center group-hover:scale-110 transition-transform">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
                quota.isAdmin
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                  : quota.canCreateMicrosite
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}
            >
              {quota.isAdmin ? '👑 Unlimited' : `${quota.micrositesCount} / ${quota.maxMicrosites}`}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#06B6D4] flex items-center justify-between">
            Microsite
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#06B6D4] group-hover:translate-x-1 transition-all" />
          </h4>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Satukan semua link, modul materi, profil media sosial, dan countdown dalam 1 halaman mobile-first.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span>event.mfytech.my.id/</span>
            <span className="text-[#06B6D4] font-semibold">@username</span>
          </div>
        </button>
      </div>
    </Modal>
  );
};
