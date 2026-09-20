'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import {
  ArrowRight,
  Sparkles,
  Link2,
  LayoutTemplate,
  QrCode,
  CheckCircle2,
  Zap,
  Users,
  School,
  CalendarDays,
  Check,
  Copy,
  LayoutDashboard,
  LogIn,
  Quote,
  Sun,
  Moon,
  ChevronDown,
  HelpCircle,
  ExternalLink,
  Clock,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { PublicMicrositeView } from '@/components/microsite/PublicMicrositeView';
import { LANDING_DEMO_MICROSITE } from '@/lib/mockData';
import { useToast } from '@/components/ui/Toast';
import { isUserLoggedIn, getStoredLinks, saveStoredLinks } from '@/lib/storage';
import { syncLinkToFirestore } from '@/lib/firebase/firestore';
import { useTheme } from '@/context/ThemeContext';
import { ShortLink } from '@/types';
import { QRCodeModal } from '@/components/qr/QRCodeModal';

interface LandingFaqItem {
  id: string;
  question: string;
  answer: string;
}

const LANDING_FAQS: LandingFaqItem[] = [
  {
    id: 'landing-faq-1',
    question: 'Apa perbedaan antara Short Link dan Microsite di MfyEvent?',
    answer:
      'Short Link adalah tautan ringkas untuk mengalihkan pengunjung langsung ke satu URL tujuan (seperti link materi, Google Form, atau file). Sedangkan Microsite adalah halaman mini yang dapat Anda bangun dengan berbagai komponen interaktif seperti tombol bio link, kartu kontak, jadwal acara, teks, dan media dalam satu link estetis.',
  },
  {
    id: 'landing-faq-2',
    question: 'Apakah MfyEvent benar-benar dapat digunakan secara gratis?',
    answer:
      'Ya! Anda dapat mendaftar, membuat short link kustom, membuat microsite cantik, dan mengunduh QR Code beresolusi tinggi secara gratis tanpa biaya langganan awal.',
  },
  {
    id: 'landing-faq-3',
    question: 'Bisakah saya mengubah URL tujuan tautan setelah dibuat?',
    answer:
      'Tentu saja. Anda dapat mengedit URL tujuan, judul, dan pengaturan tautan kapan saja dari dashboard tanpa mengubah alamat short link atau mencetak ulang QR Code yang sudah disebarkan.',
  },
  {
    id: 'landing-faq-4',
    question: 'Apakah tautan dilengkapi analitik jumlah klik dan pengunjung?',
    answer:
      'Ya, setiap tautan dan microsite yang Anda buat memiliki analitik real-time yang mencatat jumlah klik total, perangkat pengunjung (mobile/desktop), sistem operasi, dan tren kunjungan berkala.',
  },
  {
    id: 'landing-faq-5',
    question: 'Bagaimana cara membagikan Microsite ke media sosial atau brosur?',
    answer:
      'Setiap microsite mendapatkan URL pendek eksklusif (misal: event.mfytech.my.id/acara-anda) serta QR Code instan yang siap diunduh dalam format PNG resolusi tinggi untuk dicetak di poster, flyer, spanduk, maupun diletakkan di bio Instagram & TikTok.',
  },
];

export default function LandingPage() {
  const { showToast } = useToast();
  const { theme, isDark, toggleTheme } = useTheme();
  const [demoTab, setDemoTab] = useState<'link' | 'site'>('link');
  const [demoSlug, setDemoSlug] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [demoCopied, setDemoCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isShortening, setIsShortening] = useState(false);
  const [trialActive, setTrialActive] = useState(false);
  const [trialExpiresAt, setTrialExpiresAt] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openLandingFaq, setOpenLandingFaq] = useState<string | null>('landing-faq-1');

  const toggleLandingFaq = (id: string) => {
    setOpenLandingFaq((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    setIsLoggedIn(isUserLoggedIn());
    const handleStorageUpdate = () => {
      setIsLoggedIn(isUserLoggedIn());
    };
    window.addEventListener('mfy_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('mfy_storage_update', handleStorageUpdate);
  }, []);

  const sampleMicrosite = LANDING_DEMO_MICROSITE;

  const generateRandomSlug = () => {
    const chars = '23456789abcdefghjkmnpqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ev-${result}`;
  };

  const handleShortenLink = () => {
    if (!demoUrl || demoUrl.trim() === '') {
      showToast('Silakan masukkan URL yang ingin dipendekkan! ⚠️');
      return;
    }

    setIsShortening(true);

    let targetUrl = demoUrl.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // If logged in & customSlug provided, use customSlug.
    // If guest (not logged in), ALWAYS generate a random slug!
    let chosenSlug = '';
    if (isLoggedIn && customSlug.trim()) {
      chosenSlug = customSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    } else {
      chosenSlug = generateRandomSlug();
    }

    // 24-hour expiration for guest trial; permanent (undefined) for logged-in users!
    const expTime = isLoggedIn ? undefined : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const newLink: ShortLink = {
      id: `link-${chosenSlug}-${Date.now()}`,
      slug: chosenSlug,
      title: isLoggedIn ? `Tautan (${chosenSlug})` : `Uji Coba 24 Jam (${chosenSlug})`,
      destinationUrl: targetUrl,
      ownerId: isLoggedIn ? 'user-member' : 'guest-trial',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: expTime,
      metrics: {
        totalClicks: 0,
        uniqueVisitors: 0,
      },
    };

    const existingLinks = getStoredLinks();
    const filtered = existingLinks.filter((l) => l.slug.toLowerCase() !== chosenSlug);
    saveStoredLinks([newLink, ...filtered]);
    syncLinkToFirestore(newLink).catch(() => {});

    setTimeout(() => {
      setDemoSlug(chosenSlug);
      setTrialActive(!isLoggedIn);
      setTrialExpiresAt(expTime || null);
      setHasGenerated(true);
      setIsShortening(false);
      showToast(
        isLoggedIn
          ? '🎉 Tautan kustom permanen berhasil dibuat!'
          : '🎉 Tautan acak berhasil dibuat! Aktif selama 24 jam.'
      );
    }, 350);
  };

  const handleCopyDemo = () => {
    const origin =
      typeof window !== 'undefined' && window.location.origin.includes('localhost')
        ? window.location.origin
        : 'https://event.mfytech.my.id';
    const linkToCopy = `${origin}/${demoSlug}`;
    navigator.clipboard.writeText(linkToCopy);
    setDemoCopied(true);
    showToast('Tautan berhasil disalin! 🎉');
    setTimeout(() => setDemoCopied(false), 2000);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 overflow-x-clip ${
        isDark
          ? 'bg-[#070913] text-white selection:bg-[#5B5BF7]/30 selection:text-white'
          : 'bg-[#F8FAFC] text-slate-900 selection:bg-[#5B5BF7]/20 selection:text-[#5B5BF7]'
      }`}
    >
      {/* ================= FIXED NAVBAR (ALWAYS VISIBLE WHILE SCROLLING) ================= */}
      <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-2.5 sm:py-3.5 w-full pointer-events-none transition-all duration-300">
        <div
          className={`max-w-7xl mx-auto rounded-2xl sm:rounded-3xl px-4 sm:px-8 py-3 flex items-center justify-between pointer-events-auto ios-gpu-layer transition-all duration-300 ${
            isDark
              ? 'bg-[#0A0D1A]/90 backdrop-blur-md sm:backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/70 ring-1 ring-white/5'
              : 'bg-white/95 backdrop-blur-md sm:backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-900/10 ring-1 ring-black/5'
          }`}
        >
          <BrandLogo size="md" theme={theme} href="/" />

          <nav
            className={`hidden md:flex items-center gap-7 text-xs font-semibold ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            <a
              href="#fitur"
              className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:text-white hover:bg-white/5' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Fitur Unggulan
            </a>
            <a
              href="#demo"
              className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:text-white hover:bg-white/5' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Coba Interaktif
            </a>
            <a
              href="#audiens"
              className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:text-white hover:bg-white/5' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Untuk Siapa
            </a>
            <a
              href="#faqs"
              className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:text-white hover:bg-white/5' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              FAQS
            </a>
            <Link
              href="/@masalfy"
              target="_blank"
              className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                isDark ? 'hover:text-white hover:bg-white/5' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Contoh Microsite</span>
              <span
                className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${
                  isDark
                    ? 'bg-cyan-500/20 text-[#06B6D4] border border-cyan-500/30'
                    : 'bg-cyan-50 text-[#06B6D4] border border-cyan-200'
                }`}
              >
                Live
              </span>
            </Link>
          </nav>

          {/* Nav Actions: Theme Switcher & Dashboard/Login (Icon with 1 Word) */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Beralih ke mode ${isDark ? 'terang' : 'gelap'}`}
              aria-label="Toggle Light/Dark Mode"
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isDark
                  ? 'bg-white/10 hover:bg-white/15 text-amber-300 border border-white/10 hover:scale-105 active:scale-95'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 hover:scale-105 active:scale-95'
              }`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
              )}
            </button>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-bold shadow-[0_0_18px_rgba(91,91,247,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-bold shadow-[0_0_18px_rgba(91,91,247,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ================= SECTION 1: HERO SECTION ================= */}
      {/* THEME: PURPLE & CYAN DENGAN GRID TRANSPARAN TEPI & BLUR MENYATU DI BAWAH */}
      <section
        className={`relative pt-24 sm:pt-36 pb-28 sm:pb-36 px-4 sm:px-8 overflow-hidden transition-colors duration-300 ${
          isDark ? 'bg-[#070913]' : 'bg-[#F8FAFC]'
        }`}
      >
        {/* Layer 1: Base Tech Grid Squares dengan Mask Vignette Transparan di Tepi Atas, Kiri, dan Kanan (Opacity 75%) */}
        <div
          className={`absolute inset-0 pointer-events-none mask-hero-edges opacity-[0.75] ${
            isDark ? 'bg-grid-tech' : 'bg-grid-tech-light'
          }`}
        />

        {/* Layer 2: Glowing Purple & Blue Tech Grid Lines (Opacity 75%) */}
        <div
          className={`absolute inset-0 pointer-events-none mask-hero-edges opacity-[0.75] ${
            isDark
              ? 'bg-grid-hero-purple-blue'
              : 'bg-grid-hero-purple-blue-light'
          }`}
        />

        {/* Layer 3: Ambient Radial Glows in Purple & Blue (GPU-Friendly Radial Gradients) */}
        <div
          className={`absolute -top-10 left-1/2 -translate-x-[75%] sm:-translate-x-[60%] w-[380px] sm:w-[650px] h-[380px] sm:h-[650px] rounded-full glow-orb-purple pointer-events-none ${
            isDark ? 'opacity-90' : 'opacity-40'
          }`}
        />
        <div
          className={`absolute top-10 left-1/2 translate-x-[5%] sm:translate-x-[15%] w-[380px] sm:w-[620px] h-[380px] sm:h-[620px] rounded-full glow-orb-cyan pointer-events-none ${
            isDark ? 'opacity-90' : 'opacity-40'
          }`}
        />
        <div
          className={`absolute top-32 left-1/2 -translate-x-1/2 w-[340px] sm:w-[700px] h-[320px] rounded-full glow-orb-purple-cyan pointer-events-none ${
            isDark ? 'opacity-90' : 'opacity-40'
          }`}
        />

        {/* Layer 4: Ultra-Soft Radial Grid Softener directly behind Hero Headline, Text & Trust Points */}
        <div
          className={`absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 w-[115%] max-w-4xl h-[620px] sm:h-[720px] rounded-[50%] pointer-events-none z-10 transition-colors duration-300 ${
            isDark
              ? 'bg-[radial-gradient(ellipse_at_center,rgba(7,9,19,0.92)_0%,rgba(7,9,19,0.65)_40%,rgba(7,9,19,0.25)_70%,transparent_90%)]'
              : 'bg-[radial-gradient(ellipse_at_center,rgba(248,250,252,0.92)_0%,rgba(248,250,252,0.65)_40%,rgba(248,250,252,0.25)_70%,transparent_90%)]'
          }`}
        />


        {/* ================= FLOATING TESTIMONIAL / BENEFIT CHIPS WITH ANIMATIONS ================= */}
        {/* Floating Chip 1: Left Top (Animate Float 1) */}
        <div
          className={`hidden xl:flex absolute top-28 left-[6%] max-w-[230px] p-3.5 rounded-2xl backdrop-blur-md shadow-2xl transition-all duration-300 pointer-events-auto z-10 animate-float-1 hover:scale-105 cursor-default ${
            isDark
              ? 'bg-slate-900/85 border border-indigo-500/40 shadow-black/80 ring-1 ring-indigo-500/25 hover:shadow-[0_0_30px_rgba(91,91,247,0.35)]'
              : 'bg-white/95 border border-indigo-200/90 shadow-slate-900/10 ring-1 ring-indigo-100 hover:shadow-[0_0_25px_rgba(91,91,247,0.2)]'
          }`}
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[#5B5BF7]">
              <Quote className="w-3.5 h-3.5 fill-[#5B5BF7]/20" />
              <span
                className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Event Organizer
              </span>
            </div>
            <p
              className={`text-[11px] font-medium leading-relaxed ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}
            >
              &ldquo;Short link super rapi & QR Code SVG siap cetak di poster acara!&rdquo;
            </p>
            <span
              className={`text-[10px] font-medium ${
                isDark ? 'text-indigo-300' : 'text-indigo-600 font-semibold'
              }`}
            >
              — Dimas, EO TechFest
            </span>
          </div>
        </div>

        {/* Floating Chip 2: Left Bottom (Animate Float 2) */}
        <div
          className={`hidden xl:flex absolute bottom-28 left-[8%] max-w-[240px] p-3.5 rounded-2xl backdrop-blur-md shadow-2xl transition-all duration-300 pointer-events-auto z-10 animate-float-2 hover:scale-105 cursor-default ${
            isDark
              ? 'bg-slate-900/85 border border-cyan-500/40 shadow-black/80 ring-1 ring-cyan-500/25 hover:shadow-[0_0_30px_rgba(6,182,212,0.35)]'
              : 'bg-white/95 border border-cyan-200/90 shadow-slate-900/10 ring-1 ring-cyan-100 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]'
          }`}
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#06B6D4]">
                <Quote className="w-3.5 h-3.5 fill-cyan-400/20" />
                <span
                  className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Pendidik
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#06B6D4] shadow-[0_0_8px_#06B6D4]" />
            </div>
            <p
              className={`text-[11px] font-medium leading-relaxed ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}
            >
              &ldquo;Microsite materi workshop langsung diakses 500+ siswa tanpa kendala.&rdquo;
            </p>
            <span
              className={`text-[10px] font-medium ${
                isDark ? 'text-cyan-300' : 'text-cyan-600 font-semibold'
              }`}
            >
              — Bu Ratna, Guru SMA
            </span>
          </div>
        </div>

        {/* Floating Chip 3: Right Top (Animate Float 3) */}
        <div
          className={`hidden xl:flex absolute top-32 right-[6%] max-w-[240px] p-3.5 rounded-2xl backdrop-blur-md shadow-2xl transition-all duration-300 pointer-events-auto z-10 animate-float-3 hover:scale-105 cursor-default ${
            isDark
              ? 'bg-slate-900/85 border border-purple-500/40 shadow-black/80 ring-1 ring-purple-500/25 hover:shadow-[0_0_30px_rgba(168,85,247,0.35)]'
              : 'bg-white/95 border border-purple-200/90 shadow-slate-900/10 ring-1 ring-purple-100 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]'
          }`}
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-purple-500">
                <Quote className="w-3.5 h-3.5 fill-purple-400/20" />
                <span
                  className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Kreator Digital
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
            </div>
            <p
              className={`text-[11px] font-medium leading-relaxed ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}
            >
              &ldquo;Satu link estetik untuk semua portofolio, YouTube & WhatsApp saya.&rdquo;
            </p>
            <span
              className={`text-[10px] font-medium ${
                isDark ? 'text-purple-300' : 'text-purple-600 font-semibold'
              }`}
            >
              — Rian, Visual Creator
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-20">
          {/* ================= ULTRA-SOFT RADIAL BACKDROP BEHIND TEXT ================= */}
          {/* Menjadikan kotak-kotak persis di belakang teks lebih soft dan melebur sempurna di mode gelap */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] w-[125%] max-w-4xl h-[500px] rounded-full pointer-events-none -z-10 transition-colors duration-300 ${
              isDark
                ? 'bg-[radial-gradient(ellipse_at_center,rgba(7,9,19,0.85)_0%,rgba(7,9,19,0.45)_55%,transparent_85%)]'
                : 'bg-[radial-gradient(ellipse_at_center,rgba(248,250,252,0.88)_0%,rgba(248,250,252,0.50)_55%,transparent_85%)]'
            }`}
          />


          {/* ================= PERTEGAS LINE ROUNDED BADGE ================= */}
          <div
            className={`relative inline-flex items-center p-[1px] rounded-full bg-gradient-to-r from-[#5B5BF7] via-[#818CF8] to-[#06B6D4] mb-7 hover:scale-[1.02] transition-transform duration-300 ${
              isDark
                ? 'shadow-[0_0_12px_rgba(91,91,247,0.3)]'
                : 'shadow-[0_0_8px_rgba(91,91,247,0.15)]'
            }`}
          >
            <div
              className={`flex items-center gap-2.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full backdrop-blur-xl ${
                isDark ? 'bg-[#080B1E]/95' : 'bg-white/95'
              }`}
            >
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06B6D4] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-[#06B6D4] shadow-[0_0_6px_#06B6D4]"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#818CF8]" />
              <span
                className={`text-xs sm:text-sm font-bold tracking-wide ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}
              >
                MfyEvent 2.0{' '}
                <span className={`${isDark ? 'text-slate-500' : 'text-slate-400'} font-normal mx-1.5`}>•</span>{' '}
                Powered by{' '}
                <span className="bg-gradient-to-r from-[#818CF8] to-[#06B6D4] bg-clip-text text-transparent font-extrabold">
                  MfyTech
                </span>
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1
            className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] max-w-4xl ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Short Links.{' '}
            <span
              className={`bg-gradient-to-r from-[#5B5BF7] via-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent ${
                isDark ? 'drop-shadow-[0_0_35px_rgba(91,91,247,0.45)]' : ''
              }`}
            >
              Beautiful Microsites.
            </span>
            <br />
            <span className={isDark ? 'text-slate-100' : 'text-slate-900'}>Satu Tempat Sederhana.</span>
          </h1>

          {/* Subtitle */}
          <p
            className={`mt-5 text-sm sm:text-lg max-w-2xl leading-relaxed font-normal ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Buat tautan singkat yang mudah diingat, QR Code dinamis untuk materi atau event, serta
            halaman profil microsite modern tanpa perlu memahami koding.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href={isLoggedIn ? '/dashboard' : '/login'}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white font-bold text-sm shadow-[0_0_24px_rgba(91,91,247,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>{isLoggedIn ? 'Buka Dashboard Saya' : 'Mulai Buat Sekarang — Gratis'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#demo"
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm backdrop-blur-md transition-all ${
                isDark
                  ? 'border border-white/20 bg-white/5 hover:bg-white/10 text-white hover:border-white/35'
                  : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs hover:border-slate-300'
              }`}
            >
              <Zap className="w-4 h-4 text-[#06B6D4]" />
              <span>Coba Demo Interaktif</span>
            </a>
          </div>

          {/* Trust points with semi-transparent glass capsule background for maximum readability */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium relative z-20">
            <span
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl backdrop-blur-md transition-all shadow-xs border ${
                isDark
                  ? 'bg-slate-900/70 border-white/10 text-slate-200 shadow-black/40'
                  : 'bg-white/80 border-slate-200/90 text-slate-700 shadow-slate-900/5'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Redirect super cepat &lt;300ms</span>
            </span>

            <span
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl backdrop-blur-md transition-all shadow-xs border ${
                isDark
                  ? 'bg-slate-900/70 border-white/10 text-slate-200 shadow-black/40'
                  : 'bg-white/80 border-slate-200/90 text-slate-700 shadow-slate-900/5'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
              <span>100% Mobile-first responsive</span>
            </span>

            <span
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl backdrop-blur-md transition-all shadow-xs border ${
                isDark
                  ? 'bg-slate-900/70 border-white/10 text-slate-200 shadow-black/40'
                  : 'bg-white/80 border-slate-200/90 text-slate-700 shadow-slate-900/5'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>QR Code SVG &amp; PNG instan</span>
            </span>
          </div>
        </div>

        {/* ================= NATURAL BACKGROUND SEAMLESS CONNECTOR AT BOTTOM ================= */}
        {/* Background menyatu alami ke section berikutnya di layer dasar tanpa ditumpuk overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-32 pointer-events-none -z-0 transition-colors duration-300 ${
            isDark
              ? 'bg-gradient-to-b from-transparent via-[#0A0D22]/50 to-[#0A0D22]'
              : 'bg-gradient-to-b from-transparent via-slate-100/50 to-slate-100'
          }`}
        />
      </section>

      {/* ================= SECTION 2: INTERACTIVE DEMO SHOWCASE ================= */}
      {/* THEME: ELECTRIC INDIGO & ROYAL VIOLET */}
      <section
        id="demo"
        className={`relative py-20 px-4 sm:px-8 overflow-hidden transition-colors duration-300 ${
          isDark ? 'bg-[#0A0D22]' : 'bg-slate-100/90 border-y border-slate-200/80'
        }`}
      >
        {/* Subtle Violet/Indigo Tech Grid */}
        <div
          className={`absolute inset-0 pointer-events-none mask-radial-faded ${
            isDark ? 'bg-grid-indigo opacity-40' : 'bg-grid-tech-light opacity-30'
          }`}
        />

        {/* Ambient Indigo Glow (GPU-Friendly Radial Gradient) */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] rounded-full glow-orb-indigo pointer-events-none -z-0 ${
            isDark ? 'opacity-85' : 'opacity-40'
          }`}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-3 ${
                isDark
                  ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300'
                  : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
              }`}
            >
              <Zap className="w-3 h-3 text-indigo-500" />
              <span>Coba Tanpa Registrasi</span>
            </div>
            <h2
              className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Rasakan Kemudahan MfyEvent Secara Langsung
            </h2>
            <p
              className={`text-xs sm:text-sm mt-2 max-w-xl mx-auto ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Pilih pengalaman yang ingin Anda coba di bawah ini untuk melihat kecepatan platform kami
            </p>

            {/* Toggle Switcher */}
            <div
              className={`mt-7 inline-flex p-1 rounded-2xl shadow-xl backdrop-blur-md ${
                isDark
                  ? 'bg-[#060814]/90 border border-indigo-500/35'
                  : 'bg-white border border-slate-200 shadow-slate-900/5'
              }`}
            >
              <button
                onClick={() => setDemoTab('link')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  demoTab === 'link'
                    ? isDark
                      ? 'bg-gradient-to-r from-[#5B5BF7] to-[#8B5CF6] text-white shadow-[0_0_18px_rgba(91,91,247,0.45)]'
                      : 'bg-slate-900 text-white shadow-md'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Pembuat Short Link</span>
              </button>

              <button
                onClick={() => setDemoTab('site')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  demoTab === 'site'
                    ? isDark
                      ? 'bg-gradient-to-r from-[#5B5BF7] to-[#8B5CF6] text-white shadow-[0_0_18px_rgba(91,91,247,0.45)]'
                      : 'bg-slate-900 text-white shadow-md'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>Live Microsite Renderer</span>
              </button>
            </div>
          </div>

          {/* DEMO 1: SHORT LINK LIVE CARD */}
          {demoTab === 'link' && (
            <div
              className={`max-w-2xl mx-auto rounded-3xl p-6 sm:p-8 backdrop-blur-md sm:backdrop-blur-xl ios-gpu-layer animate-in fade-in duration-300 ${
                isDark
                  ? 'bg-[#0F142A]/90 border border-indigo-500/35 shadow-[0_0_50px_rgba(91,91,247,0.2)]'
                  : 'bg-white border border-slate-200 shadow-xl'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-4 border-b ${
                  isDark ? 'border-indigo-500/20' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      isDark
                        ? 'bg-indigo-500/15 border border-indigo-500/35 text-indigo-300'
                        : 'bg-indigo-50 text-[#5B5BF7]'
                    }`}
                  >
                    <Link2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-bold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      Buat Tautan Singkat
                    </h3>
                    <p
                      className={`text-[11px] ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Masukkan URL panjang dan perpendek seketika
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 ${
                    isDark
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                      : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {hasGenerated ? 'Tautan Aktif' : 'Siap Dicoba'}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {/* 1. INPUT URL PANJANG */}
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    URL Asli yang Panjang
                  </label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://contoh.com/link-panjang-anda"
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono focus:outline-hidden focus:border-[#5B5BF7] focus:ring-1 focus:ring-[#5B5BF7] transition-all ${
                      isDark
                        ? 'bg-[#080B1A] border border-indigo-500/30 text-slate-200 placeholder:text-slate-600'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                {/* 2. CUSTOM SLUG FIELD (LOCKED IF NOT LOGGED IN) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      className={`text-xs font-semibold flex items-center gap-1.5 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      <span>Slug Tautan</span>
                      {!isLoggedIn ? (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isDark
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <Lock className="w-2.5 h-2.5" />
                          Perlu Login untuk Custom
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isDark
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <Check className="w-2.5 h-2.5" />
                          Custom Slug Aktif
                        </span>
                      )}
                    </label>

                    {!isLoggedIn && (
                      <Link
                        href="/login"
                        className={`text-[11px] font-semibold flex items-center gap-1 hover:underline ${
                          isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-[#5B5BF7] hover:text-indigo-700'
                        }`}
                      >
                        <span>Masuk untuk Custom Slug</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {!isLoggedIn ? (
                    <div>
                      <div
                        className={`flex items-center rounded-xl overflow-hidden border ${
                          isDark
                            ? 'bg-[#080B1A]/60 border-white/10 opacity-80'
                            : 'bg-slate-100/80 border-slate-200 opacity-85'
                        }`}
                      >
                        <span
                          className={`px-3.5 py-2.5 text-xs font-mono border-r select-none ${
                            isDark
                              ? 'text-slate-500 bg-white/5 border-white/10'
                              : 'text-slate-400 bg-slate-150 border-slate-200'
                          }`}
                        >
                          event.mfytech.my.id/
                        </span>
                        <input
                          type="text"
                          disabled
                          value=""
                          placeholder="Otomatis random acak (contoh: /ev-7k9p2x)"
                          className="w-full px-3.5 py-2.5 text-xs font-mono italic cursor-not-allowed bg-transparent text-slate-400 focus:outline-hidden"
                        />
                        <div className="pr-3 text-slate-400">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <p className={`text-[11px] mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        🔒 Mode tamu menghasilkan <span className="font-semibold">slug acak</span> otomatis aktif 24 jam. Untuk menentukan slug sendiri (misal: <span className="font-mono text-[#5B5BF7]">/nama-acara</span>) dan aktif permanen, silakan <Link href="/login" className="underline font-semibold hover:text-[#5B5BF7]">Masuk</Link> atau <Link href="/register" className="underline font-semibold hover:text-[#5B5BF7]">Daftar</Link>.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div
                        className={`flex items-center rounded-xl overflow-hidden focus-within:border-[#5B5BF7] focus-within:ring-1 focus-within:ring-[#5B5BF7] transition-all ${
                          isDark
                            ? 'bg-[#080B1A] border border-indigo-500/30'
                            : 'bg-slate-50 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`px-3.5 py-2.5 text-xs font-mono border-r ${
                            isDark
                              ? 'text-slate-400 bg-white/5 border-indigo-500/20'
                              : 'text-slate-400 bg-slate-100 border-slate-200'
                          }`}
                        >
                          event.mfytech.my.id/
                        </span>
                        <input
                          type="text"
                          value={customSlug}
                          onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                          placeholder="masukkan-slug-kustom"
                          className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold text-[#5B5BF7] bg-transparent focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. TOMBOL PERPENDEK TAUTAN */}
                <button
                  type="button"
                  onClick={handleShortenLink}
                  disabled={isShortening}
                  className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#5B5BF7] via-[#4F46E5] to-[#06B6D4] text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.005] active:scale-[0.995]"
                >
                  {isShortening ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memproses Tautan...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Perpendek Tautan Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* 4. HASIL SHORTLINK (HANYA TAMPIL SETELAH KLIK TOMBOL PERPENDEK) */}
                {hasGenerated && demoSlug && (
                  <div
                    className={`mt-6 p-4 sm:p-5 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-3 duration-300 ${
                      isDark
                        ? 'bg-[#090C1E] border-indigo-500/30 text-white shadow-xl shadow-black/40'
                        : 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm'
                    }`}
                  >
                    {/* Top Status & 24h Expiry Pill */}
                    <div
                      className={`flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-dashed ${
                        isDark ? 'border-indigo-500/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            trialActive
                              ? isDark
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                              : isDark
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>
                            {trialActive ? 'Uji Coba Aktif 24 Jam (Random Slug)' : 'Tautan Permanen Aktif'}
                          </span>
                        </span>
                        <span
                          className={`text-[11px] ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {trialActive ? 'Bisa langsung dicoba & dibagikan' : 'Aktif selamanya tanpa batas'}
                        </span>
                      </div>

                      <div
                        className={`text-[11px] font-mono flex items-center gap-1 ${
                          isDark ? 'text-indigo-300/80' : 'text-slate-500'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{trialActive ? 'Kedaluwarsa dalam 24 jam' : 'Masa aktif: Permanen'}</span>
                      </div>
                    </div>

                    {/* 1. Tampilan Tautan Utama (Di Atas) */}
                    <div
                      className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between gap-3 ${
                        isDark
                          ? 'bg-[#060815] border-indigo-500/25'
                          : 'bg-white border-slate-200/90 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isDark
                              ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                              : 'bg-cyan-50 border-cyan-200 text-cyan-600'
                          }`}
                        >
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider block ${
                              isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            Tautan Siap Digunakan
                          </span>
                          <p
                            className={`font-mono text-xs sm:text-base font-bold select-all break-all ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            event.mfytech.my.id/{demoSlug}
                          </p>
                        </div>
                      </div>

                      {/* Quick Copy Mini Badge */}
                      <button
                        onClick={handleCopyDemo}
                        className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isDark
                            ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title="Salin Cepat"
                      >
                        {demoCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{demoCopied ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>

                    {/* 2. Tombol Aksi di Bawah Tautan (Salin, Tes Tautan, QR Code, Kelola Dashboard) */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:flex md:items-center gap-2.5">
                      <button
                        onClick={handleCopyDemo}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          isDark
                            ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                        title="Salin Tautan"
                      >
                        {demoCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        <span>{demoCopied ? 'Tersalin!' : 'Salin Tautan'}</span>
                      </button>

                      <a
                        href={`/${demoSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                          isDark
                            ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-[#5B5BF7] border border-indigo-200 shadow-xs'
                        }`}
                        title="Buka dan Tes Pengalihan Tautan Langsung"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Tes Tautan</span>
                      </a>

                      <button
                        onClick={() => setQrModalOpen(true)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                          isDark
                            ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
                        }`}
                        title="Tampilkan QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>QR Code</span>
                      </button>

                      {isLoggedIn && (
                        <Link
                          href="/dashboard"
                          className="col-span-2 sm:col-span-1 md:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-xs font-bold text-white hover:opacity-95 shadow-md shadow-indigo-500/25 transition-all"
                        >
                          <span>Kelola di Dashboard</span>
                        </Link>
                      )}
                    </div>

                    {/* LOCK NOTICE FOR PERMANENT & CUSTOM SLUG (ONLY FOR GUEST) */}
                    {!isLoggedIn && (
                      <div
                        className={`mt-4 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 ${
                          isDark
                            ? 'bg-indigo-950/35 border-indigo-500/25 text-white'
                            : 'bg-indigo-50/90 border-indigo-200 text-slate-900'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-[#5B5BF7] flex items-center justify-center shrink-0 mt-0.5">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">
                              Ingin Tautan Aktif Selamanya & Bisa Custom Slug?
                            </p>
                            <p className={`text-[11px] mt-0.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              Tautan uji coba di atas akan kedaluwarsa setelah 24 jam. Buat akun gratis untuk menikmati tautan permanen, custom slug pilihan sendiri (seperti <span className="font-mono text-[#5B5BF7]">/nama-event</span>), dan dashboard analitik lengkap.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <Link
                            href="/register"
                            className="flex-1 sm:flex-none text-center px-4 py-2 rounded-lg bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-bold hover:opacity-95 shadow-xs transition-all whitespace-nowrap"
                          >
                            Daftar Gratis
                          </Link>
                          <Link
                            href="/login"
                            className={`flex-1 sm:flex-none text-center px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                              isDark
                                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            Masuk
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* SHORTEN ANOTHER LINK BUTTON */}
                    <div
                      className={`mt-3.5 pt-3 border-t flex items-center justify-between gap-2.5 ${
                        isDark ? 'border-white/5' : 'border-slate-200/70'
                      }`}
                    >
                      <p
                        className={`text-[11px] ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        Ingin mencoba URL lainnya?
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setHasGenerated(false);
                          setDemoUrl('');
                        }}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                          isDark
                            ? 'text-indigo-300 hover:text-white hover:bg-indigo-500/20'
                            : 'text-[#5B5BF7] hover:text-indigo-800 hover:bg-indigo-50'
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Perpendek URL Lain</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DEMO 2: LIVE MICROSITE PHONE PREVIEW */}
          {demoTab === 'site' && (
            <div className="flex flex-col items-center animate-in fade-in duration-300">
              <div className="w-[340px] sm:w-[360px] h-[580px] rounded-[44px] border-[10px] border-slate-950 bg-slate-950 shadow-[0_0_50px_rgba(91,91,247,0.3)] overflow-hidden relative ring-1 ring-white/10">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20 border border-white/10" />
                <div className="h-full overflow-y-auto pt-6">
                  <PublicMicrositeView microsite={sampleMicrosite} previewMode={true} />
                </div>
              </div>
              <p
                className={`text-xs mt-4 font-medium ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Pratinjau langsung microsite publik <span className="font-mono text-[#06B6D4]">/@masalfy</span>
              </p>
            </div>
          )}
        </div>

        {/* BOTTOM SEAMLESS COLOR CONNECTOR (Demo -> Features Section) */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent pointer-events-none ${
            isDark ? 'via-[#071324]/80 to-[#071324]' : 'via-[#F8FAFC]/80 to-[#F8FAFC]'
          }`}
        />
      </section>

      {/* ================= SECTION 3: CORE FEATURES ================= */}
      {/* THEME: OCEAN CYAN & EMERALD TEAL */}
      <section
        id="fitur"
        className={`relative py-24 px-4 sm:px-8 overflow-hidden transition-colors duration-300 ${
          isDark ? 'bg-[#071324]' : 'bg-[#F8FAFC]'
        }`}
      >
        {/* Cyan Tech Grid */}
        <div
          className={`absolute inset-0 pointer-events-none mask-radial-faded ${
            isDark ? 'bg-grid-cyan opacity-40' : 'bg-grid-tech-light opacity-30'
          }`}
        />

        {/* Ambient Cyan/Emerald Glows (GPU-Friendly Radial Gradients) */}
        <div
          className={`absolute top-1/3 left-1/4 w-[600px] h-[380px] rounded-full glow-orb-cyan pointer-events-none ${
            isDark ? 'opacity-85' : 'opacity-40'
          }`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-[550px] h-[340px] rounded-full glow-orb-emerald pointer-events-none ${
            isDark ? 'opacity-80' : 'opacity-35'
          }`}
        />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-3 ${
                isDark
                  ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
                  : 'bg-cyan-50 border border-cyan-200 text-cyan-700'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#06B6D4]" />
              <span>Kapabilitas Lengkap</span>
            </div>
            <h2
              className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Fitur Lengkap untuk Segala Kebutuhan Tautan
            </h2>
            <p
              className={`text-xs sm:text-sm mt-2 leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Dari pemendek URL super cepat hingga builder microsite fleksibel, semua dikelola dari satu dashboard cerdas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Short Link Cerdas */}
            <div
              className={`p-7 rounded-3xl transition-all duration-300 flex flex-col justify-between group backdrop-blur-xs sm:backdrop-blur-md ios-gpu-layer ${
                isDark
                  ? 'bg-[#0A1A2F]/85 border border-indigo-500/25 hover:border-indigo-400 hover:shadow-[0_0_35px_rgba(91,91,247,0.25)]'
                  : 'bg-white border border-slate-200 hover:border-[#5B5BF7] shadow-sm hover:shadow-lg'
              }`}
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${
                    isDark
                      ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300'
                      : 'bg-indigo-50 text-[#5B5BF7]'
                  }`}
                >
                  <Link2 className="w-6 h-6" />
                </div>
                <h3
                  className={`text-lg font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Short Link Cerdas
                </h3>
                <p
                  className={`text-xs mt-2.5 leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Tentukan custom slug sesuka Anda. Didukung validasi nama langsung, pengaturan tanggal kedaluwarsa, dan pengalihan secepat kilat.
                </p>
              </div>
              <div
                className={`mt-8 pt-4 border-t flex items-center gap-2 text-xs font-semibold ${
                  isDark
                    ? 'border-white/10 text-indigo-300 group-hover:text-indigo-200'
                    : 'border-slate-100 text-[#5B5BF7]'
                }`}
              >
                <span>Pelajari redirect engine</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Microsite Builder */}
            <div
              className={`p-7 rounded-3xl transition-all duration-300 flex flex-col justify-between group backdrop-blur-xs sm:backdrop-blur-md ios-gpu-layer ${
                isDark
                  ? 'bg-[#0A1A2F]/85 border border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_35px_rgba(6,182,212,0.3)]'
                  : 'bg-white border border-slate-200 hover:border-[#06B6D4] shadow-sm hover:shadow-lg'
              }`}
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${
                    isDark
                      ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                      : 'bg-cyan-50 text-[#06B6D4]'
                  }`}
                >
                  <LayoutTemplate className="w-6 h-6" />
                </div>
                <h3
                  className={`text-lg font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Microsite Builder Studio
                </h3>
                <p
                  className={`text-xs mt-2.5 leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Susun block modul, heading, tombol WhatsApp, hitung mundur event, dan media sosial dengan drag-and-drop serta pratinjau live phone frame.
                </p>
              </div>
              <div
                className={`mt-8 pt-4 border-t flex items-center gap-2 text-xs font-semibold ${
                  isDark
                    ? 'border-white/10 text-cyan-300 group-hover:text-cyan-200'
                    : 'border-slate-100 text-[#06B6D4]'
                }`}
              >
                <span>Lihat pilihan tema</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: QR Code Studio */}
            <div
              className={`p-7 rounded-3xl transition-all duration-300 flex flex-col justify-between group backdrop-blur-xs sm:backdrop-blur-md ios-gpu-layer ${
                isDark
                  ? 'bg-[#0A1A2F]/85 border border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_35px_rgba(16,185,129,0.3)]'
                  : 'bg-white border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-lg'
              }`}
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${
                    isDark
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  <QrCode className="w-6 h-6" />
                </div>
                <h3
                  className={`text-lg font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  QR Code Studio Dinamis
                </h3>
                <p
                  className={`text-xs mt-2.5 leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Setiap short link dan microsite otomatis menghasilkan kode QR vektor SVG & PNG yang dapat diunduh langsung untuk dicetak pada banner dan pamflet.
                </p>
              </div>
              <div
                className={`mt-8 pt-4 border-t flex items-center gap-2 text-xs font-semibold ${
                  isDark
                    ? 'border-white/10 text-emerald-300 group-hover:text-emerald-200'
                    : 'border-slate-100 text-emerald-600'
                }`}
              >
                <span>Unduh format PNG & SVG</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SEAMLESS COLOR CONNECTOR (Features -> Target Audiences) */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent pointer-events-none ${
            isDark ? 'via-[#100B24]/80 to-[#100B24]' : 'via-slate-100/80 to-slate-100'
          }`}
        />
      </section>

      {/* ================= SECTION 4: TARGET AUDIENCES ================= */}
      {/* THEME: COSMIC MAGENTA & WARM AMBER */}
      <section
        id="audiens"
        className={`relative py-20 px-4 sm:px-8 overflow-hidden transition-colors duration-300 ${
          isDark ? 'bg-[#100B24]' : 'bg-slate-100/70'
        }`}
      >
        {/* Magenta Tech Grid */}
        <div
          className={`absolute inset-0 pointer-events-none mask-radial-faded ${
            isDark ? 'bg-grid-magenta opacity-35' : 'bg-grid-tech-light opacity-25'
          }`}
        />

        {/* Ambient Cosmic Magenta & Warm Amber Glows (GPU-Friendly Radial Gradients) */}
        <div
          className={`absolute top-1/4 left-1/4 w-[550px] h-[340px] rounded-full glow-orb-magenta pointer-events-none ${
            isDark ? 'opacity-85' : 'opacity-40'
          }`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-[520px] h-[320px] rounded-full glow-orb-amber pointer-events-none ${
            isDark ? 'opacity-80' : 'opacity-35'
          }`}
        />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-3 ${
                isDark
                  ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300'
                  : 'bg-purple-50 border border-purple-200 text-purple-700'
              }`}
            >
              <Users className="w-3 h-3 text-purple-500" />
              <span>Dibuat Khusus</span>
            </div>
            <h2
              className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Dirancang untuk Siapa Saja yang Berbagi
            </h2>
            <p
              className={`text-xs sm:text-sm mt-2 leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Pengalaman sederhana dan ramah pengguna yang cocok untuk berbagai macam profil dan kebutuhan
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Audiens 1: Guru */}
            <div
              className={`p-6 rounded-2xl transition-all duration-300 backdrop-blur-xs sm:backdrop-blur-md ios-gpu-layer ${
                isDark
                  ? 'bg-[#181135]/85 border border-purple-500/25 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]'
                  : 'bg-white border border-slate-200 hover:border-purple-400 shadow-xs hover:shadow-md'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                  isDark
                    ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
                    : 'bg-purple-50 text-purple-600'
                }`}
              >
                <School className="w-5 h-5" />
              </div>
              <h4
                className={`text-sm font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Guru & Sekolah
              </h4>
              <p
                className={`text-xs mt-1.5 leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Bagikan modul bahan ajar, presensi kehadiran workshop, dan portofolio kelas dalam 1 link rapi.
              </p>
            </div>

            {/* Audiens 2: Event Organizer */}
            <div
              className={`p-6 rounded-2xl transition-all duration-300 backdrop-blur-xs sm:backdrop-blur-md ios-gpu-layer ${
                isDark
                  ? 'bg-[#181135]/85 border border-cyan-500/25 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]'
                  : 'bg-white border border-slate-200 hover:border-cyan-400 shadow-xs hover:shadow-md'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                  isDark
                    ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                    : 'bg-cyan-50 text-cyan-600'
                }`}
              >
                <CalendarDays className="w-5 h-5" />
              </div>
              <h4
                className={`text-sm font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Event Organizer
              </h4>
              <p
                className={`text-xs mt-1.5 leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Short link pendaftaran webinar, countdown hari H, dan QR code yang siap dipasang di pamflet acara.
              </p>
            </div>

            {/* Audiens 3: Komunitas & UMKM */}
            <div
              className={`p-6 rounded-2xl transition-all duration-300 backdrop-blur-xs sm:backdrop-blur-md ios-gpu-layer ${
                isDark
                  ? 'bg-[#181135]/85 border border-pink-500/25 hover:border-pink-400 hover:shadow-[0_0_25px_rgba(236,72,153,0.25)]'
                  : 'bg-white border border-slate-200 hover:border-pink-400 shadow-xs hover:shadow-md'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                  isDark
                    ? 'bg-pink-500/15 border border-pink-500/30 text-pink-300'
                    : 'bg-pink-50 text-pink-600'
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
              <h4
                className={`text-sm font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Komunitas & UMKM
              </h4>
              <p
                className={`text-xs mt-1.5 leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Katalog produk sederhana, tombol WhatsApp direct chat, dan pusat informasi kegiatan komunitas.
              </p>
            </div>

            {/* Audiens 4: Kreator & Freelancer */}
            <div
              className={`p-6 rounded-2xl transition-all duration-300 backdrop-blur-xs sm:backdrop-blur-md ios-gpu-layer ${
                isDark
                  ? 'bg-[#181135]/85 border border-amber-500/25 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                  : 'bg-white border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                  isDark
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <h4
                className={`text-sm font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Kreator & Freelancer
              </h4>
              <p
                className={`text-xs mt-1.5 leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Satukan seluruh kanal YouTube, Instagram, GitHub, dan Behance dalam halaman bio link berestetika tinggi.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM SEAMLESS COLOR CONNECTOR (Audiens -> FAQS) */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent pointer-events-none ${
            isDark ? 'via-[#070914]/80 to-[#070914]' : 'via-white/80 to-white'
          }`}
        />
      </section>

      {/* ================= SECTION: FAQS (PERTANYAAN YANG SERING DITANYAKAN) ================= */}
      <section
        id="faqs"
        className={`relative py-20 px-4 sm:px-8 transition-colors duration-300 ${
          isDark ? 'bg-[#070914]' : 'bg-[#F8FAFC]'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-3 ${
                isDark
                  ? 'bg-[#5B5BF7]/15 border border-[#5B5BF7]/30 text-[#8B8BFA]'
                  : 'bg-[#5B5BF7]/10 border border-[#5B5BF7]/20 text-[#5B5BF7]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQS</span>
            </div>
            <h2
              className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Pertanyaan yang sering ditanyakan
            </h2>
            <p
              className={`mt-3 text-xs sm:text-base max-w-xl mx-auto leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Temukan jawaban cepat atas pertanyaan umum seputar short link, microsite, dan fitur MfyEvent.
            </p>
          </div>

          {/* Animated Exclusive Accordion List (Opens one, closes others) */}
          <div className="space-y-3.5">
            {LANDING_FAQS.map((faq) => {
              const isOpen = openLandingFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl transition-all duration-300 border overflow-hidden ios-gpu-layer ${
                    isOpen
                      ? isDark
                        ? 'bg-[#0E1326] border-[#5B5BF7]/60 shadow-[0_4px_30px_rgba(91,91,247,0.15)]'
                        : 'bg-white border-[#5B5BF7]/50 shadow-lg shadow-[#5B5BF7]/5'
                      : isDark
                      ? 'bg-[#0B0F1F]/75 hover:bg-[#0E1326]/80 border-white/5 hover:border-white/10'
                      : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleLandingFaq(faq.id)}
                    className="w-full py-4 sm:py-5 px-5 sm:px-6 flex items-center justify-between text-left gap-4 focus:outline-none cursor-pointer select-none"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`text-sm sm:text-base font-bold transition-colors ${
                        isOpen
                          ? 'text-[#5B5BF7]'
                          : isDark
                          ? 'text-white'
                          : 'text-slate-900'
                      }`}
                    >
                      {faq.question}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen
                          ? 'rotate-180 bg-[#5B5BF7] text-white shadow-xs'
                          : isDark
                          ? 'bg-white/5 text-slate-400'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Animated Collapse Transition */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div
                        className={`px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t ${
                          isDark
                            ? 'text-slate-300 border-white/5'
                            : 'text-slate-600 border-slate-100'
                        }`}
                      >
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action Button to Dedicated FAQS Page */}
          <div className="mt-10 text-center">
            <Link
              href="/faqs"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white hover:opacity-95 shadow-lg shadow-[#5B5BF7]/25 hover:scale-105 active:scale-95"
            >
              <span>Buka Halaman FAQS Selengkapnya</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: FINAL CTA BANNER ================= */}
      {/* THEME: RADIANT GRADIENT BLEND */}
      <section
        className={`relative py-20 px-4 sm:px-8 transition-colors duration-300 overflow-hidden ${
          isDark ? 'bg-[#070914]' : 'bg-white'
        }`}
      >
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] glow-orb-purple-cyan rounded-full pointer-events-none ${
            isDark ? 'opacity-85' : 'opacity-40'
          }`}
        />

        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#5B5BF7] via-[#4F46E5] to-[#06B6D4] rounded-3xl p-8 sm:p-14 text-white text-center shadow-[0_0_60px_rgba(91,91,247,0.35)] relative overflow-hidden border border-white/20 ios-gpu-layer">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Siap Membuat Short Link dan Microsite Anda Sendiri?
            </h2>
            <p className="mt-3 text-xs sm:text-base opacity-95 leading-relaxed font-normal">
              Bergabung bersama ribuan kreator, pendidik, dan komunitas yang telah menyederhanakan cara berbagi dengan MfyEvent.
            </p>
            {/* Adaptive Single CTA Button */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3">
              <Link
                href={isLoggedIn ? '/dashboard' : '/login'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-2xl bg-white text-slate-900 font-extrabold text-sm sm:text-base hover:bg-slate-100 shadow-[0_12px_35px_rgba(0,0,0,0.25)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>{isLoggedIn ? 'Buka Dashboard Saya' : 'Mulai Sekarang — Gratis'}</span>
                <ArrowRight className="w-4 h-4 text-[#5B5BF7]" />
              </Link>
              <p className="text-xs text-white/80 font-medium">
                {isLoggedIn
                  ? 'Sesi Anda aktif • Kelola seluruh tautan & microsite Anda'
                  : 'Tanpa biaya langganan • Akses instan dalam hitungan detik'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 6: FOOTER (LIGHT & DARK ADAPTIVE) ================= */}
      <footer
        className={`mt-auto relative z-10 transition-colors duration-300 ${
          isDark ? 'bg-[#05070E] border-t border-white/10' : 'bg-white border-t border-slate-200'
        }`}
      >
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#5B5BF7] via-[#06B6D4] to-transparent" />

        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <BrandLogo size="md" variant="long" theme={theme} href="/" />
            <p
              className={`text-xs mt-1 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Platform Short Link & Microsite Cepat & Modern oleh MfyTech.
            </p>
          </div>

          <div
            className={`flex flex-wrap items-center justify-center gap-6 text-xs font-semibold ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            <a
              href="https://www.mfytech.my.id"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#06B6D4] transition-colors"
            >
              MfyTech
            </a>
            <Link href="/privacy" className="hover:text-[#06B6D4] transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/terms" className="hover:text-[#06B6D4] transition-colors">
              Syarat & Ketentuan
            </Link>
            <Link href="/faqs" className="hover:text-[#06B6D4] transition-colors font-bold text-[#5B5BF7] dark:text-[#8B8BFA]">
              FAQS
            </Link>
            <Link href="/help" className="hover:text-[#06B6D4] transition-colors">
              Bantuan
            </Link>
          </div>

          <p
            className={`text-[11px] ${
              isDark ? 'text-slate-400' : 'text-slate-400'
            }`}
          >
            © 2026 MfyTech. All rights reserved.
          </p>
        </div>
      </footer>

      {/* QR Code Preview Modal for Demo Link */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        slug={demoSlug}
        title="QR Code Tautan Uji Coba"
      />
    </div>
  );
}
