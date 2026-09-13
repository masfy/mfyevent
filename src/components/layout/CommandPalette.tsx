'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Link2,
  LayoutTemplate,
  BarChart3,
  Settings,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
  X,
} from 'lucide-react';
import { getStoredLinks, getStoredMicrosites } from '@/lib/storage';
import { ShortLink, Microsite } from '@/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateLink: () => void;
  onOpenCreateMicrosite: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenCreateLink,
  onOpenCreateMicrosite,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [microsites, setMicrosites] = useState<Microsite[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLinks(getStoredLinks());
      setMicrosites(getStoredMicrosites());
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredLinks = links.filter(
    (l) =>
      l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.slug.toLowerCase().includes(query.toLowerCase())
  );

  const filteredSites = microsites.filter(
    (m) =>
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.slug.toLowerCase().includes(query.toLowerCase())
  );

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Ketik untuk mencari link, microsite, atau ketik perintah..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-xs text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-hidden"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded-sm border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Action & Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Quick Actions */}
          {!query && (
            <div>
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Aksi Cepat
              </p>
              <div className="space-y-1 mt-1">
                <button
                  onClick={() => {
                    onClose();
                    onOpenCreateLink();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-[#5B5BF7] rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4 text-[#5B5BF7]" />
                    <span>Buat Short Link Baru</span>
                  </div>
                  <span className="text-[10px] text-slate-400">🔗 Link</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenCreateMicrosite();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 hover:bg-cyan-50 hover:text-[#06B6D4] rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutTemplate className="w-4 h-4 text-[#06B6D4]" />
                    <span>Buat Microsite Baru</span>
                  </div>
                  <span className="text-[10px] text-slate-400">▣ @handle</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          {!query && (
            <div>
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Navigasi Platform
              </p>
              <div className="space-y-1 mt-1">
                <button
                  onClick={() => handleNavigate('/dashboard')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-left"
                >
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  <span>Dashboard Overview</span>
                </button>
                <button
                  onClick={() => handleNavigate('/links')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-left"
                >
                  <Link2 className="w-4 h-4 text-slate-500" />
                  <span>Daftar Short Links</span>
                </button>
                <button
                  onClick={() => handleNavigate('/microsites')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-left"
                >
                  <LayoutTemplate className="w-4 h-4 text-slate-500" />
                  <span>Daftar Microsite</span>
                </button>
                <button
                  onClick={() => handleNavigate('/admin')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-left"
                >
                  <ShieldCheck className="w-4 h-4 text-[#5B5BF7]" />
                  <span>Portal Admin & Moderasi</span>
                </button>
              </div>
            </div>
          )}

          {/* Filtered Short Links */}
          {filteredLinks.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Short Links ({filteredLinks.length})
              </p>
              <div className="space-y-1 mt-1">
                {filteredLinks.slice(0, 4).map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleNavigate(`/links/${link.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-left"
                  >
                    <div className="truncate pr-2">
                      <p className="font-semibold text-slate-900 truncate">{link.title}</p>
                      <p className="text-[11px] font-mono text-[#5B5BF7] truncate">
                        event.mfytech.my.id/{link.slug}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {link.metrics.totalClicks} klik
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtered Microsites */}
          {filteredSites.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Microsites ({filteredSites.length})
              </p>
              <div className="space-y-1 mt-1">
                {filteredSites.slice(0, 4).map((site) => (
                  <button
                    key={site.id}
                    onClick={() => handleNavigate(`/microsites/${site.id}/edit`)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-left"
                  >
                    <div className="truncate pr-2">
                      <p className="font-semibold text-slate-900 truncate">{site.title}</p>
                      <p className="text-[11px] font-mono text-[#06B6D4] truncate">
                        event.mfytech.my.id/@{site.slug}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {site.views} views
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && filteredLinks.length === 0 && filteredSites.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              Tidak ditemukan hasil untuk &quot;{query}&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
