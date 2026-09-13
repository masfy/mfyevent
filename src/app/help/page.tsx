'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useTheme } from '@/context/ThemeContext';
import {
  HelpCircle,
  Search,
  Link2,
  LayoutTemplate,
  QrCode,
  ShieldCheck,
  ChevronDown,
  MessageCircle,
  Mail,
  ExternalLink,
  Sun,
  Moon,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'links' | 'microsites' | 'qr' | 'account';
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'f1',
    category: 'links',
    question: 'Bagaimana cara membuat short link dengan slug kustom?',
    answer:
      'Masuk ke menu Short Links atau Dasbor, klik tombol "+ Short Link", masukkan tautan tujuan yang panjang, lalu ketik slug yang Anda inginkan (misalnya: seminar-ai-2026). Jika slug masih tersedia, tautan singkat Anda siap digunakan seketika dengan domain resmi event.mfytech.my.id/seminar-ai-2026.',
  },
  {
    id: 'f2',
    category: 'links',
    question: 'Berapa lama tautan singkat saya akan tetap aktif?',
    answer:
      'Tergantung mode pembuatan: (1) Tautan Uji Coba Tamu (dibuat tanpa login di halaman utama) aktif selama 24 jam dengan slug acak. (2) Tautan Member (setelah Anda mendaftar atau masuk ke akun) berstatus Permanen tanpa batas kedaluwarsa waktu, selama mematuhi Syarat & Ketentuan Layanan.',
  },
  {
    id: 'f3',
    category: 'qr',
    question: 'Apakah QR Code yang diunduh berkualitas tinggi dan siap dicetak?',
    answer:
      'Ya! MfyEvent menyediakan opsi unduhan format SVG (vektor resolusi tak terhingga) dan PNG resolusi tinggi. Format SVG sangat ideal untuk dicetak pada banner ukuran besar, baliho acara, kaos, hingga brosur promosi tanpa pecah atau buram.',
  },
  {
    id: 'f4',
    category: 'qr',
    question: 'Bisakah saya menyematkan logo sendiri di tengah QR Code?',
    answer:
      'Tentu saja. Di modal kustomisasi QR Code, Anda dapat mengunggah logo instansi, sekolah, atau brand Anda untuk disematkan di titik pusat QR Code dengan tingkat koreksi kesalahan (error correction) yang optimal.',
  },
  {
    id: 'f5',
    category: 'microsites',
    question: 'Apa perbedaan antara Short Link biasa dan Microsite?',
    answer:
      'Short Link langsung mengalihkan pengunjung ke satu tautan tujuan spesifik. Sedangkan Microsite adalah halaman profil berdesain estetik (bio-link) yang dapat memuat banyak tautan, video YouTube, galeri foto, tombol WhatsApp, jadwal acara, hingga unduhan materi seminar dalam satu link @handle tunggal.',
  },
  {
    id: 'f6',
    category: 'microsites',
    question: 'Bagaimana cara menambahkan microsite ke bio Instagram atau TikTok?',
    answer:
      'Salin link publik microsite Anda (misalnya: event.mfytech.my.id/@username), buka profil Instagram/TikTok Anda, pilih "Edit Profil", lalu tempelkan link tersebut ke bagian kolom "Tautan / Website".',
  },
  {
    id: 'f7',
    category: 'account',
    question: 'Apakah layanan MfyEvent gratis digunakan untuk komunitas dan sekolah?',
    answer:
      'Ya! MfyEvent dirancang gratis untuk membantu pendidik, sekolah, kreator digital, serta panitia event lokal dalam mempercepat digitalisasi komunikasi dan penyebaran materi tanpa biaya lisensi.',
  },
  {
    id: 'f8',
    category: 'account',
    question: 'Bagaimana jika saya menemukan tautan yang mencurigakan atau berbahaya?',
    answer:
      'Anda dapat melaporkannya segera dengan mengirimkan email aduan ke abuse@mfytech.my.id atau melalui tombol "Laporkan Tautan" di footer. Tim moderasi kami akan memeriksa dan menindaklanjuti dalam kurun 1x24 jam.',
  },
  {
    id: 'f9',
    category: 'links',
    question: 'Mengapa saya tidak bisa mengetik slug kustom saat mencoba di halaman depan?',
    answer:
      'Fitur coba cepat di halaman utama menghasilkan slug acak otomatis aktif 24 jam untuk tamu. Untuk menentukan slug sendiri (seperti /nama-acara) dan masa aktif permanen, silakan masuk atau daftar akun terlebih dahulu.',
  },
  {
    id: 'f10',
    category: 'account',
    question: 'Bagaimana cara mendaftar dan mengaktifkan akun di MfyEvent?',
    answer:
      'Sangat cepat! Anda dapat masuk menggunakan tombol "Masuk dengan Akun Google" (otomatis aktif seketika dengan status ACTIVE) atau mendaftar manual menggunakan formulir email di halaman Registrasi.',
  },
];

export default function HelpCenterPage() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'links' | 'microsites' | 'qr' | 'account'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('f1');

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDark ? 'bg-[#070913] text-white' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Top Header Navigation */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors ${
          isDark
            ? 'bg-[#0A0D1A]/85 border-slate-800/80 shadow-lg shadow-black/40'
            : 'bg-white/90 border-slate-200/90 shadow-xs'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <BrandLogo size="md" theme={theme} href="/" />

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark
                  ? 'border-slate-800 bg-slate-800/60 text-amber-300 hover:bg-slate-800'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isDark
                  ? 'border-slate-800 bg-slate-850 hover:bg-slate-800 text-slate-300'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner with Search Bar */}
      <section
        className={`py-12 sm:py-16 px-4 sm:px-8 border-b transition-colors ${
          isDark
            ? 'bg-gradient-to-b from-[#0F172A] to-[#070913] border-slate-800'
            : 'bg-gradient-to-b from-indigo-50/70 to-[#F8FAFC] border-slate-200'
        }`}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#5B5BF7]/15 text-[#5B5BF7] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pusat Bantuan MfyEvent 2.0</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ada yang bisa kami bantu?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
            Temukan petunjuk penggunaan short link, panduan desain microsite, serta jawaban atas pertanyaan umum seputar platform.
          </p>

          {/* Search Bar Input */}
          <div className="mt-6 relative max-w-xl mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kata kunci (contoh: kustom slug, QR Code, cetak, bio link)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl border transition-all shadow-md focus:outline-hidden focus:ring-2 ${
                isDark
                  ? 'bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#5B5BF7] focus:ring-[#5B5BF7]/30'
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#5B5BF7] focus:ring-[#5B5BF7]/20'
              }`}
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-10 sm:py-14">
        {/* 4 Category Quick Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <button
            onClick={() => setActiveCategory(activeCategory === 'links' ? 'all' : 'links')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeCategory === 'links'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-[#5B5BF7] ring-1 ring-[#5B5BF7]'
                : isDark
                ? 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <Link2 className="w-5 h-5 text-[#5B5BF7] mb-2" />
            <p className="text-xs font-bold">Short Links</p>
            <span className="text-[10px] text-slate-400 block mt-0.5">Slug & Pengalihan</span>
          </button>

          <button
            onClick={() => setActiveCategory(activeCategory === 'microsites' ? 'all' : 'microsites')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeCategory === 'microsites'
                ? 'bg-cyan-50 dark:bg-cyan-950/70 border-[#06B6D4] ring-1 ring-[#06B6D4]'
                : isDark
                ? 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <LayoutTemplate className="w-5 h-5 text-[#06B6D4] mb-2" />
            <p className="text-xs font-bold">Microsites</p>
            <span className="text-[10px] text-slate-400 block mt-0.5">Bio Link & Desain</span>
          </button>

          <button
            onClick={() => setActiveCategory(activeCategory === 'qr' ? 'all' : 'qr')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeCategory === 'qr'
                ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-500 ring-1 ring-purple-500'
                : isDark
                ? 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <QrCode className="w-5 h-5 text-purple-500 mb-2" />
            <p className="text-xs font-bold">QR Code</p>
            <span className="text-[10px] text-slate-400 block mt-0.5">Logo & Siap Cetak</span>
          </button>

          <button
            onClick={() => setActiveCategory(activeCategory === 'account' ? 'all' : 'account')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeCategory === 'account'
                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 ring-1 ring-emerald-500'
                : isDark
                ? 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
            <p className="text-xs font-bold">Akun & Keamanan</p>
            <span className="text-[10px] text-slate-400 block mt-0.5">Profil & Kebijakan</span>
          </button>
        </div>

        {/* FAQ Accordion Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Pertanyaan yang Sering Diajukan ({filteredFaqs.length})
            </h2>
            {activeCategory !== 'all' && (
              <button
                onClick={() => setActiveCategory('all')}
                className="text-xs text-[#5B5BF7] font-semibold hover:underline"
              >
                Tampilkan Semua Kategori
              </button>
            )}
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
              <p className="text-xs text-slate-400">Tidak ada pertanyaan yang sesuai dengan pencarian Anda.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-3 px-3 py-1 text-xs font-semibold text-[#5B5BF7] hover:underline"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = expandedId === faq.id;

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? 'border-[#5B5BF7]/50 shadow-sm'
                      : isDark
                      ? 'border-slate-800 bg-[#0F172A]/70'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold leading-relaxed">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#5B5BF7]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      className={`px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm leading-relaxed border-t ${
                        isDark
                          ? 'border-slate-800/80 text-slate-300 bg-slate-900/40'
                          : 'border-slate-100 text-slate-600 bg-slate-50/50'
                      }`}
                    >
                      <p className="pt-2">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Need Help / Contact Support Box */}
        <div
          className={`mt-12 p-6 sm:p-8 rounded-3xl border text-center transition-all ${
            isDark
              ? 'bg-gradient-to-r from-[#0F172A] via-[#1E1B4B]/50 to-[#0F172A] border-slate-800'
              : 'bg-gradient-to-r from-indigo-50/80 via-white to-cyan-50/60 border-indigo-100 shadow-sm'
          }`}
        >
          <h3 className="text-base sm:text-lg font-bold">Masih memerlukan bantuan teknis?</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Tim dukungan teknis MfyTech siap membantu pertanyaan seputar integrasi, pemulihan akun, atau kolaborasi instansi.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Tim%20MfyTech%2C%20saya%20butuh%20bantuan%20seputar%20MfyEvent"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Dukungan</span>
            </a>

            <a
              href="mailto:event@mfytech.my.id"
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                isDark
                  ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs'
              }`}
            >
              <Mail className="w-4 h-4 text-[#5B5BF7]" />
              <span>Kirim Email Support</span>
            </a>

            <a
              href="https://www.mfytech.my.id"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-[#5B5BF7] transition-colors"
            >
              <span>Portal MfyTech</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>
          © 2026 <span className="font-semibold text-slate-800 dark:text-white">MfyEvent</span> — Pusat Bantuan resmi dari <a href="https://www.mfytech.my.id" target="_blank" rel="noreferrer" className="text-[#5B5BF7] hover:underline">MfyTech</a>.
        </p>
      </footer>
    </div>
  );
}
