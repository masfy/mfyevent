'use client';

import React, { useState, useEffect } from 'react';
import { Microsite, MicrositeBlock, PrebuiltThemeId, BlockType, ButtonVariant } from '@/types';
import { PREBUILT_THEMES } from '@/lib/mockData';
import { PublicMicrositeView } from '@/components/microsite/PublicMicrositeView';
import { useToast } from '@/components/ui/Toast';
import { saveStoredMicrosites, getStoredMicrosites } from '@/lib/storage';
import { syncMicrositeToFirestore } from '@/lib/firebase/firestore';
import { getFirebaseAuth } from '@/lib/firebase/config';
import { normalizeSlug, isSlugReserved } from '@/lib/utils';
import confetti from 'canvas-confetti';
import {
  Smartphone,
  Tablet,
  Monitor,
  Undo2,
  Redo2,
  Check,
  Eye,
  EyeOff,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Layers,
  Palette,
  Settings as SettingsIcon,
  Search as SeoIcon,
  ExternalLink,
  Copy,
  Sparkles,
  Link2,
  Heading,
  MessageCircle,
  Clock,
  Share2,
  FileText,
  HelpCircle,
  Pencil,
  Image as ImageIcon,
  Upload,
  Camera,
} from 'lucide-react';
import Link from 'next/link';
import { EditBlockModal } from './EditBlockModal';

interface MicrositeStudioProps {
  initialMicrosite: Microsite;
}

export const MicrositeStudio: React.FC<MicrositeStudioProps> = ({ initialMicrosite }) => {
  const { showToast } = useToast();

  // Active studio states
  const [site, setSite] = useState<Microsite>(initialMicrosite);
  const [history, setHistory] = useState<Microsite[]>([initialMicrosite]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'settings' | 'seo'>('content');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [saveStatus, setSaveStatus] = useState<'SAVED' | 'SAVING'>('SAVED');

  // Block modal state
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<MicrositeBlock | null>(null);
  const [themeFilter, setThemeFilter] = useState<'all' | 'pastel' | 'gradient' | 'classic'>('all');

  // Autosave with debounce (PRD Section 46 & 89)
  useEffect(() => {
    setSaveStatus('SAVING');
    const timer = setTimeout(async () => {
      const allSites = getStoredMicrosites();
      const updated = allSites.map((s) => (s.id === site.id ? site : s));
      saveStoredMicrosites(updated);

      // Jika statusnya PUBLISHED, sinkronkan ke cloud secara otomatis
      if (site.status === 'PUBLISHED') {
        try {
          await syncMicrositeToFirestore(site);
        } catch {
          // ignore background autosave errors
        }
      }

      setSaveStatus('SAVED');
    }, 700);

    return () => clearTimeout(timer);
  }, [site]);

  // Update site helper with history stack
  const updateSiteState = (newSite: Microsite) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newSite);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setSite(newSite);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSite(history[historyIndex - 1]);
      showToast('Undo berhasil');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSite(history[historyIndex + 1]);
      showToast('Redo berhasil');
    }
  };

  // Image Upload Handlers with 1 MB Limit
  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB (1,048,576 bytes)

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      showToast(`Ukuran foto profil (${sizeMb} MB) melebihi batas maksimal 1 MB!`, 'error');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        updateSiteState({
          ...site,
          profile: { ...site.profile, avatarUrl: base64 },
        });
        showToast('Foto profil berhasil diunggah! (Maks 1 MB)', 'success');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      showToast(`Ukuran foto sampul (${sizeMb} MB) melebihi batas maksimal 1 MB!`, 'error');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        updateSiteState({
          ...site,
          profile: { ...site.profile, coverUrl: base64 },
        });
        showToast('Foto sampul berhasil diunggah! (Maks 1 MB)', 'success');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Block Operations
  const handleAddBlock = (type: BlockType) => {
    const newBlock: MicrositeBlock = {
      id: `blk_${Date.now()}`,
      type,
      order: (site.blocks.length + 1) * 1000,
      visible: true,
      content: {
        title:
          type === 'LINK'
            ? 'Judul Tautan Baru'
            : type === 'HEADING'
            ? 'Heading Section'
            : type === 'WHATSAPP'
            ? 'Chat WhatsApp'
            : type === 'COUNTDOWN'
            ? 'Countdown Event'
            : type === 'IMAGE'
            ? 'Galeri Dokumentasi'
            : type === 'FAQ'
            ? 'Tanya Jawab Seputar Acara'
            : type === 'SOCIAL'
            ? 'Kanal Media Sosial'
            : 'Teks Informasi',
        url: type === 'LINK' ? 'https://event.mfytech.my.id' : undefined,
        description: type === 'LINK' ? 'Deskripsi singkat tautan' : undefined,
        phoneNumber: type === 'WHATSAPP' ? '6281234567890' : undefined,
        prefilledText: type === 'WHATSAPP' ? 'Halo, saya menghubungi melalui microsite...' : undefined,
        targetDate: type === 'COUNTDOWN' ? new Date(Date.now() + 7 * 86400000).toISOString() : undefined,
        imageUrl: type === 'IMAGE' ? 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800' : undefined,
        socials: type === 'SOCIAL' ? [
          { platform: 'instagram', url: 'https://instagram.com/' },
          { platform: 'whatsapp', url: 'https://wa.me/6281234567890' }
        ] : undefined,
        faqs: type === 'FAQ' ? [
          { question: 'Bagaimana cara mendaftar dalam kegiatan ini?', answer: 'Klik tombol pendaftaran di atas dan lengkapi formulir registrasi.' }
        ] : undefined,
      },
    };

    updateSiteState({
      ...site,
      blocks: [...site.blocks, newBlock],
    });

    setShowAddBlockModal(false);
    showToast('Block berhasil ditambahkan! ✨');
  };

  const handleDeleteBlock = (id: string) => {
    updateSiteState({
      ...site,
      blocks: site.blocks.filter((b) => b.id !== id),
    });
    showToast('Block dihapus');
  };

  const handleToggleVisible = (id: string) => {
    updateSiteState({
      ...site,
      blocks: site.blocks.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)),
    });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...site.blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;

    // Recalculate order values
    const reordered = newBlocks.map((b, idx) => ({ ...b, order: (idx + 1) * 1000 }));
    updateSiteState({ ...site, blocks: reordered });
  };

  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    const publishedSite: Microsite = {
      ...site,
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
    };
    updateSiteState(publishedSite);

    // 1. Simpan ke LocalStorage
    const allSites = getStoredMicrosites();
    const updated = allSites.map((s) => (s.id === site.id ? publishedSite : s));
    saveStoredMicrosites(updated);

    // 2. Sinkronkan langsung ke Cloud Firestore agar instan bisa diakses publik
    let cloudResult: { success: boolean; error?: string } = { success: false, error: '' };
    try {
      cloudResult = await syncMicrositeToFirestore(publishedSite);
    } catch (err: any) {
      cloudResult = { success: false, error: err?.message };
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (cloudResult.success) {
      showToast('Microsite berhasil dipublikasikan secara live ke cloud! 🌐🎉', 'success');
    } else {
      showToast(
        `Microsite tersimpan lokal. Cloud: ${cloudResult.error || 'Periksa Firestore Rules di Firebase Console'}`,
        'warning'
      );
    }
    setPublishing(false);
  };

  const handleCopyPublicUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://event.mfytech.my.id';
    const url = `${origin}/@${site.slug}`;
    navigator.clipboard.writeText(url);
    showToast('Link publik disalin ke clipboard! 📋');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -mt-4 -mx-4 sm:-mx-8">
      {/* ================= STUDIO TOP BAR ================= */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/microsites"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            ← Kembali
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <h2 className="text-sm font-bold text-slate-900 truncate max-w-xs">{site.title}</h2>
          <span className="text-xs font-mono text-[#06B6D4] bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">
            @{site.slug}
          </span>
        </div>

        {/* Center: Save Indicator & Undo/Redo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className={`w-2 h-2 rounded-full ${
                saveStatus === 'SAVED' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="text-[11px] font-medium hidden sm:inline">
              {saveStatus === 'SAVED' ? 'Tersimpan otomatis' : 'Menyimpan...'}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Share & Publish CTA */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyPublicUrl}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin Link</span>
          </button>

          <Link
            href={`/@${site.slug}`}
            target="_blank"
            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Buka Halaman Live"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all disabled:opacity-60 cursor-pointer"
          >
            {publishing ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{publishing ? 'Menyinkronkan...' : 'Publikasikan'}</span>
          </button>
        </div>
      </div>

      {/* ================= 3-PANE STUDIO LAYOUT ================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Pane 1: Left Navigation Tabs */}
        <div className="w-16 sm:w-20 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-[11px] font-semibold transition-all ${
              activeTab === 'content'
                ? 'bg-indigo-50 text-[#5B5BF7]'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>Konten</span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-[11px] font-semibold transition-all ${
              activeTab === 'design'
                ? 'bg-cyan-50 text-[#06B6D4]'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Palette className="w-5 h-5" />
            <span>Desain</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-[11px] font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-indigo-50 text-[#5B5BF7]'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Setelan</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-[11px] font-semibold transition-all ${
              activeTab === 'seo'
                ? 'bg-indigo-50 text-[#5B5BF7]'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SeoIcon className="w-5 h-5" />
            <span>SEO</span>
          </button>
        </div>

        {/* Pane 2: Middle Editor Area */}
        <div className="w-full sm:w-96 lg:w-[420px] bg-slate-50 border-r border-slate-200 overflow-y-auto p-5 shrink-0">
          {/* TAB 1: KONTEN */}
          {activeTab === 'content' && (
            <div className="space-y-5">
              {/* Profile Card Editor */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Profil Utama
                </h4>

                <div className="space-y-4">
                  {/* Foto Profil with Upload (Maks 1 MB) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        Foto Profil
                      </label>
                      <span className="text-[10px] text-indigo-600 bg-indigo-50 font-bold px-1.5 py-0.5 rounded-sm">
                        Maks. 1 MB
                      </span>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs">
                        <img
                          src={site.profile.avatarUrl || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150'}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs transition-all active:scale-95">
                            <Upload className="w-3.5 h-3.5 text-[#5B5BF7]" />
                            <span>Upload Foto</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/gif"
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />
                          </label>
                          {site.profile.avatarUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                updateSiteState({
                                  ...site,
                                  profile: { ...site.profile, avatarUrl: '' },
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                              title="Hapus foto profil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">
                          JPG, PNG, WebP • Maks. 1 MB
                        </p>
                      </div>
                    </div>

                    {/* URL Input Fallback */}
                    <div className="mt-1.5">
                      <input
                        type="text"
                        placeholder="Atau tempel link URL foto profil..."
                        value={site.profile.avatarUrl?.startsWith('data:') ? '' : site.profile.avatarUrl}
                        onChange={(e) =>
                          updateSiteState({
                            ...site,
                            profile: { ...site.profile, avatarUrl: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-hidden focus:border-[#5B5BF7]"
                      />
                    </div>
                  </div>

                  {/* Foto Sampul / Cover Banner with Upload (Maks 1 MB) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        Foto Sampul / Banner Cover
                      </label>
                      <span className="text-[10px] text-cyan-700 bg-cyan-50 font-bold px-1.5 py-0.5 rounded-sm">
                        Maks. 1 MB
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                      {site.profile.coverUrl ? (
                        <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                          <img
                            src={site.profile.coverUrl}
                            alt="Cover Banner Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-slate-900 text-xs font-semibold rounded-lg shadow-sm backdrop-blur-xs transition-all">
                              <Upload className="w-3.5 h-3.5 text-[#5B5BF7]" />
                              <span>Ganti Banner</span>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                onChange={handleCoverUpload}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                updateSiteState({
                                  ...site,
                                  profile: { ...site.profile, coverUrl: '' },
                                })
                              }
                              className="p-1.5 bg-white/95 hover:bg-white text-rose-600 rounded-lg shadow-sm transition-all cursor-pointer"
                              title="Hapus foto sampul"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-[#5B5BF7] rounded-xl bg-white hover:bg-indigo-50/20 transition-all text-center group">
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#5B5BF7] mb-1.5 transition-colors" />
                          <span className="text-xs font-bold text-slate-700 group-hover:text-[#5B5BF7]">
                            Upload Foto Sampul
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            JPG, PNG, WebP • Maksimal 1 MB (Rekomendasi lanskap)
                          </span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={handleCoverUpload}
                            className="hidden"
                          />
                        </label>
                      )}

                      {/* URL Input Fallback */}
                      <div>
                        <input
                          type="text"
                          placeholder="Atau tempel link URL foto sampul..."
                          value={site.profile.coverUrl?.startsWith('data:') ? '' : (site.profile.coverUrl || '')}
                          onChange={(e) =>
                            updateSiteState({
                              ...site,
                              profile: { ...site.profile, coverUrl: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-hidden focus:border-[#5B5BF7]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nama Tampilan
                    </label>
                    <input
                      type="text"
                      value={site.profile.name}
                      onChange={(e) =>
                        updateSiteState({
                          ...site,
                          profile: { ...site.profile, name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#5B5BF7]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Bio Singkat
                    </label>
                    <textarea
                      rows={2}
                      value={site.profile.bio}
                      onChange={(e) =>
                        updateSiteState({
                          ...site,
                          profile: { ...site.profile, bio: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#5B5BF7]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-medium text-slate-700">Badge Verifikasi</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateSiteState({
                          ...site,
                          profile: { ...site.profile, verified: !site.profile.verified },
                        })
                      }
                      className={`w-9 h-5 rounded-full transition-colors relative ${
                        site.profile.verified ? 'bg-[#5B5BF7]' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          site.profile.verified ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Blocks List Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Daftar Block ({site.blocks.length})
                  </h4>
                  <button
                    onClick={() => setShowAddBlockModal(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#5B5BF7] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Block</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {site.blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 group"
                    >
                      <button
                        type="button"
                        onClick={() => setEditingBlock(block)}
                        className="flex items-center gap-2.5 truncate text-left flex-1 hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <span className="text-xs text-slate-400 font-mono select-none">
                          {index + 1}
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-800 truncate flex items-center gap-1.5">
                            <span>{block.content.title || block.type}</span>
                          </p>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">
                            {block.type}
                          </span>
                        </div>
                      </button>

                      {/* Action controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingBlock(block)}
                          className="flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-[#5B5BF7] font-semibold text-[11px] rounded-lg transition-colors cursor-pointer"
                          title="Edit Isi & Konfigurasi Block"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleMoveBlock(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                          title="Geser ke atas"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveBlock(index, 'down')}
                          disabled={index === site.blocks.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                          title="Geser ke bawah"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleVisible(block.id)}
                          className={`p-1 cursor-pointer ${block.visible ? 'text-slate-400 hover:text-slate-700' : 'text-amber-500'}`}
                          title={block.visible ? 'Sembunyikan' : 'Tampilkan'}
                        >
                          {block.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteBlock(block.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Hapus Block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {site.blocks.length === 0 && (
                    <div className="text-center p-8 bg-white border border-dashed border-slate-200 rounded-2xl">
                      <p className="text-xs text-slate-500">Belum ada block konten.</p>
                      <button
                        onClick={() => setShowAddBlockModal(true)}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-[#5B5BF7] text-white text-xs font-semibold"
                      >
                        + Tambah Block Pertama
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DESAIN & TEMA */}
          {activeTab === 'design' && (
            <div className="space-y-5">
              {/* Preset Themes with Filter Chips */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Preset Tema Populer
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pilihan tema pastel lembut, gradasi 2 warna kekinian, & modern
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold bg-indigo-50 text-[#5B5BF7] px-2 py-0.5 rounded-full">
                    {PREBUILT_THEMES.length} Tema
                  </span>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-1.5 mb-3 pb-2 border-b border-slate-100">
                  {[
                    { id: 'all', label: 'Semua (16)' },
                    { id: 'pastel', label: 'Pastel Lembut (5)' },
                    { id: 'gradient', label: 'Gradasi 2 Warna (5)' },
                    { id: 'classic', label: 'Klasik Modern (6)' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setThemeFilter(filter.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                        themeFilter === filter.id
                          ? 'bg-[#5B5BF7] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Theme Cards Grid */}
                <div className="grid grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {PREBUILT_THEMES.filter((t) => {
                    if (themeFilter === 'pastel') return t.id.startsWith('pastel-');
                    if (themeFilter === 'gradient') return t.id.startsWith('grad-');
                    if (themeFilter === 'classic') return !t.id.startsWith('pastel-') && !t.id.startsWith('grad-');
                    return true;
                  }).map((theme) => {
                    const isSelected = site.theme.id === theme.id;
                    const isPastel = theme.id.startsWith('pastel-');
                    const isGrad = theme.id.startsWith('grad-');

                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => updateSiteState({ ...site, theme })}
                        style={{ background: theme.background }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between h-28 transition-all relative overflow-hidden cursor-pointer ${
                          isSelected
                            ? 'border-[#5B5BF7] ring-2 ring-[#5B5BF7]/40 shadow-md scale-[1.01]'
                            : 'border-slate-200 hover:border-slate-300 opacity-95 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-start justify-between w-full relative z-10">
                          <div>
                            <span
                              style={{ color: theme.textColor }}
                              className="text-xs font-bold truncate block max-w-[110px]"
                            >
                              {theme.name}
                            </span>
                            <span
                              style={{ color: theme.subtextColor }}
                              className="text-[9px] font-medium block opacity-85"
                            >
                              {isPastel ? 'Pastel' : isGrad ? '2-Warna Gradasi' : 'Klasik'}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-white bg-[#5B5BF7] rounded-full p-0.5 shadow-xs shrink-0" />
                          )}
                        </div>

                        {/* Theme Button Preview Pill */}
                        <div className="w-full relative z-10">
                          <div
                            style={{
                              background: theme.buttonVariant === 'liquidglass' 
                                ? 'rgba(255, 255, 255, 0.65)' 
                                : theme.buttonBg,
                              color: theme.buttonVariant === 'liquidglass' 
                                ? theme.textColor 
                                : theme.buttonTextColor,
                              border: theme.buttonVariant === 'liquidglass'
                                ? '1px solid rgba(255, 255, 255, 0.8)'
                                : 'none',
                              backdropFilter: theme.buttonVariant === 'liquidglass' ? 'blur(8px)' : undefined,
                            }}
                            className="text-[9px] py-1 px-2 text-center rounded-lg font-semibold truncate shadow-xs flex items-center justify-center gap-1"
                          >
                            {theme.buttonVariant === 'liquidglass' && <Sparkles className="w-2.5 h-2.5 opacity-80" />}
                            <span>Preview Tombol</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gaya Desain Tombol (UI Variant - Liquid Glass, Neon, Brutalist, dll.) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Gaya Desain Tombol (UI Variant)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pilih gaya visual tombol interaktif (Liquid Glass, Neon, Brutalist, Clay, dll.)
                    </p>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200/60">
                    Kekinian
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  {[
                    {
                      id: 'liquidglass',
                      name: 'Liquid Glass',
                      desc: 'Frosted glossy blur (Apple)',
                      previewClass: 'bg-white/60 backdrop-blur-md border border-white/80 shadow-xs text-slate-800',
                      badge: 'Populer',
                    },
                    {
                      id: 'solid',
                      name: 'Solid Modern',
                      desc: 'Warna solid tajam & tegas',
                      previewClass: 'bg-[#5B5BF7] text-white shadow-xs',
                      badge: 'Standar',
                    },
                    {
                      id: 'neon',
                      name: 'Cyber Neon',
                      desc: 'Border berpijar neon glowing',
                      previewClass: 'bg-slate-900 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]',
                      badge: 'Cyber',
                    },
                    {
                      id: 'brutalist',
                      name: 'Neo-Brutalist',
                      desc: 'Border hitam tebal & retro',
                      previewClass: 'bg-yellow-300 text-slate-950 border-2 border-black shadow-[2px_2px_0px_0px_#000]',
                      badge: 'Retro',
                    },
                    {
                      id: 'clay',
                      name: 'Soft Clay 3D',
                      desc: 'Efek timbul claymorphic 3D',
                      previewClass: 'bg-indigo-500 text-white shadow-[0_4px_10px_rgba(0,0,0,0.15),inset_0_-2px_3px_rgba(0,0,0,0.2),inset_0_2px_3px_rgba(255,255,255,0.4)]',
                      badge: '3D Soft',
                    },
                    {
                      id: 'outline',
                      name: 'Clean Outline',
                      desc: 'Border minimalis transparan',
                      previewClass: 'bg-transparent text-slate-700 border-1.5 border-slate-400',
                      badge: 'Minimal',
                    },
                    {
                      id: 'soft',
                      name: 'Soft Pastel',
                      desc: 'Aksen warna halus transparan',
                      previewClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
                      badge: 'Pastel',
                    },
                    {
                      id: 'glass',
                      name: 'Classic Glass',
                      desc: 'Kaca transparan halus',
                      previewClass: 'bg-white/30 backdrop-blur-xs border border-white/50 text-slate-800',
                      badge: 'Glass',
                    },
                  ].map((variant) => {
                    const isSelected = (site.theme.buttonVariant || 'solid') === variant.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() =>
                          updateSiteState({
                            ...site,
                            theme: {
                              ...site.theme,
                              buttonVariant: variant.id as ButtonVariant,
                            },
                          })
                        }
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#5B5BF7] ring-2 ring-[#5B5BF7]/30 bg-indigo-50/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">
                              {variant.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-medium">
                              {variant.badge}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#5B5BF7] bg-white rounded-full p-0.5 shadow-xs shrink-0" />
                          )}
                        </div>

                        <p className="text-[10px] text-slate-500 mb-2 leading-tight">
                          {variant.desc}
                        </p>

                        {/* Interactive mini preview */}
                        <div
                          className={`w-full py-1.5 px-2 rounded-lg text-center text-[10px] font-semibold truncate ${variant.previewClass}`}
                        >
                          Klik Tautan
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Button Radius Customizer */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Bentuk Sudut Tombol (Radius)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pilih kelengkungan sudut tombol pada seluruh halaman microsite
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Square', sublabel: '8px', value: 8, shapeClass: 'rounded-md' },
                    { label: 'Medium', sublabel: '14px', value: 14, shapeClass: 'rounded-lg' },
                    { label: 'Squircle', sublabel: '20px', value: 20, shapeClass: 'rounded-xl' },
                    { label: 'Full Pill', sublabel: 'Kapsul', value: 9999, shapeClass: 'rounded-full' },
                  ].map((rad) => {
                    const isSelected = site.theme.buttonRadius === rad.value;
                    return (
                      <button
                        key={rad.label}
                        type="button"
                        onClick={() =>
                          updateSiteState({
                            ...site,
                            theme: { ...site.theme, buttonRadius: rad.value },
                          })
                        }
                        className={`p-2.5 text-center border rounded-xl transition-all flex flex-col items-center justify-between h-20 cursor-pointer ${
                          isSelected
                            ? 'border-[#5B5BF7] bg-indigo-50/50 text-[#5B5BF7] font-bold ring-2 ring-[#5B5BF7]/20'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {/* Visual Shape Mini-indicator */}
                        <div
                          className={`w-10 h-5 border-2 ${
                            isSelected ? 'border-[#5B5BF7] bg-[#5B5BF7]/15' : 'border-slate-300 bg-slate-100'
                          } ${rad.shapeClass} transition-all`}
                        />
                        <div>
                          <span className="text-xs font-semibold block leading-tight">{rad.label}</span>
                          <span className="text-[10px] opacity-70 block">{rad.sublabel}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SETELAN */}
          {activeTab === 'settings' && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Pengaturan Microsite
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Custom Handle / Slug
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                  <span className="px-2.5 py-2 text-xs text-slate-400 font-mono bg-slate-100">
                    /@
                  </span>
                  <input
                    type="text"
                    value={site.slug}
                    onChange={(e) =>
                      updateSiteState({
                        ...site,
                        slug: normalizeSlug(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-2 text-xs font-mono text-slate-900 bg-transparent focus:outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Alamat publik: event.mfytech.my.id/@{site.slug}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Status Halaman
                </label>
                <select
                  value={site.status}
                  onChange={(e) =>
                    updateSiteState({
                      ...site,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="PUBLISHED">Published (Publik & Aktif)</option>
                  <option value="DRAFT">Draft (Hanya Anda yang Dapat Melihat)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: SEO */}
          {activeTab === 'seo' && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Metadata & Social Share
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={site.seo.metaTitle}
                  onChange={(e) =>
                    updateSiteState({
                      ...site,
                      seo: { ...site.seo, metaTitle: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={site.seo.metaDescription}
                  onChange={(e) =>
                    updateSiteState({
                      ...site,
                      seo: { ...site.seo, metaDescription: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              {/* Social Share Mockup Preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Pratinjau WhatsApp / Twitter Card
                </p>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {site.seo.metaTitle || site.title}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {site.seo.metaDescription || site.profile.bio}
                  </p>
                  <p className="text-[10px] text-[#5B5BF7] font-mono mt-1">
                    event.mfytech.my.id/@{site.slug}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pane 3: Right Live Interactive Device Canvas */}
        <div className="hidden sm:flex flex-1 bg-slate-100 items-center justify-center p-6 flex-col overflow-hidden relative">
          {/* Device Frame Switcher */}
          <div className="mb-4 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1 z-10">
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewDevice === 'mobile'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>

            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewDevice === 'tablet'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>

            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewDevice === 'desktop'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
          </div>

          {/* Interactive Frame Wrapper */}
          <div
            className={`transition-all duration-300 overflow-hidden shadow-2xl flex flex-col ${
              previewDevice === 'mobile'
                ? 'w-[360px] h-[640px] rounded-[44px] border-[10px] border-slate-900 relative ring-1 ring-slate-800'
                : previewDevice === 'tablet'
                ? 'w-[520px] h-[640px] rounded-[30px] border-[12px] border-slate-900'
                : 'w-[90%] max-w-2xl h-[640px] rounded-2xl border border-slate-300 bg-white'
            }`}
          >
            {/* iPhone Dynamic Island Notch */}
            {previewDevice === 'mobile' && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 ml-auto mr-3" />
              </div>
            )}

            {/* Desktop window bar */}
            {previewDevice === 'desktop' && (
              <div className="h-8 bg-slate-100 border-b border-slate-200 px-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-[10px] font-mono text-slate-400">
                    https://event.mfytech.my.id/@{site.slug}
                  </span>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto w-full">
              <PublicMicrositeView microsite={site} previewMode={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Add Block Modal Picker */}
      {showAddBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Tambah Block Konten</h3>
            <p className="text-xs text-slate-500 mb-4">
              Pilih jenis elemen interaktif yang ingin ditampilkan pada microsite
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleAddBlock('LINK')}
                className="p-3 text-left border border-slate-200 hover:border-[#5B5BF7] rounded-xl hover:bg-indigo-50/40 transition-all flex flex-col gap-1"
              >
                <Link2 className="w-4 h-4 text-[#5B5BF7]" />
                <span className="text-xs font-bold text-slate-800">Tautan Link</span>
                <span className="text-[10px] text-slate-500">Tombol klik ke website/materi</span>
              </button>

              <button
                onClick={() => handleAddBlock('HEADING')}
                className="p-3 text-left border border-slate-200 hover:border-[#5B5BF7] rounded-xl hover:bg-indigo-50/40 transition-all flex flex-col gap-1"
              >
                <Heading className="w-4 h-4 text-[#5B5BF7]" />
                <span className="text-xs font-bold text-slate-800">Heading Judul</span>
                <span className="text-[10px] text-slate-500">Pemisah kategori & seksi materi</span>
              </button>

              <button
                onClick={() => handleAddBlock('WHATSAPP')}
                className="p-3 text-left border border-slate-200 hover:border-[#25D366] rounded-xl hover:bg-emerald-50/40 transition-all flex flex-col gap-1"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span className="text-xs font-bold text-slate-800">Chat WhatsApp</span>
                <span className="text-[10px] text-slate-500">Tombol kontak langsung ke WA</span>
              </button>

              <button
                onClick={() => handleAddBlock('COUNTDOWN')}
                className="p-3 text-left border border-slate-200 hover:border-amber-500 rounded-xl hover:bg-amber-50/40 transition-all flex flex-col gap-1"
              >
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800">Hitung Mundur</span>
                <span className="text-[10px] text-slate-500">Batas registrasi atau hari H event</span>
              </button>

              <button
                onClick={() => handleAddBlock('SOCIAL')}
                className="p-3 text-left border border-slate-200 hover:border-[#5B5BF7] rounded-xl hover:bg-indigo-50/40 transition-all flex flex-col gap-1 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#5B5BF7]" />
                <span className="text-xs font-bold text-slate-800">Media Sosial</span>
                <span className="text-[10px] text-slate-500">Ikon IG, WA, YT, TikTok, dll</span>
              </button>

              <button
                onClick={() => handleAddBlock('IMAGE')}
                className="p-3 text-left border border-slate-200 hover:border-cyan-500 rounded-xl hover:bg-cyan-50/40 transition-all flex flex-col gap-1 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-cyan-600" />
                <span className="text-xs font-bold text-slate-800">Galeri / Banner</span>
                <span className="text-[10px] text-slate-500">Gambar materi atau foto dokumentasi</span>
              </button>

              <button
                onClick={() => handleAddBlock('FAQ')}
                className="p-3 text-left border border-slate-200 hover:border-indigo-500 rounded-xl hover:bg-indigo-50/40 transition-all flex flex-col gap-1 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">Tanya Jawab FAQ</span>
                <span className="text-[10px] text-slate-500">Accordion tanya jawab acara</span>
              </button>

              <button
                onClick={() => handleAddBlock('TEXT')}
                className="p-3 text-left border border-slate-200 hover:border-slate-400 rounded-xl hover:bg-slate-50 transition-all flex flex-col gap-1 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-800">Teks / Info</span>
                <span className="text-[10px] text-slate-500">Pengumuman & catatan singkat</span>
              </button>

              <button
                onClick={() => handleAddBlock('DIVIDER')}
                className="p-3 text-left border border-slate-200 hover:border-slate-400 rounded-xl hover:bg-slate-50 transition-all flex flex-col gap-1 cursor-pointer"
              >
                <span className="text-base font-bold text-slate-400">—</span>
                <span className="text-xs font-bold text-slate-800">Garis Pemisah</span>
                <span className="text-[10px] text-slate-500">Garis batas antar konten</span>
              </button>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowAddBlockModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Block Modal */}
      <EditBlockModal
        isOpen={!!editingBlock}
        block={editingBlock}
        onClose={() => setEditingBlock(null)}
        onSave={(updatedBlock) => {
          const updatedBlocks = site.blocks.map((b) =>
            b.id === updatedBlock.id ? updatedBlock : b
          );
          updateSiteState({ ...site, blocks: updatedBlocks });
          showToast('Block berhasil diperbarui! ✨');
        }}
      />
    </div>
  );
};
