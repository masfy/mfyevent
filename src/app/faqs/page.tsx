'use client';

import React, { useState, useMemo } from 'react';
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

export interface FAQItem {
  id: string;
  category: 'links' | 'microsites' | 'qr' | 'account';
  question: string;
  answer: string;
}

export const ALL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'links',
    question: 'Bagaimana cara membuat short link dengan slug kustom?',
    answer:
      'Masuk ke menu Short Links atau Dasbor, klik tombol "+ Short Link", masukkan tautan tujuan yang panjang, lalu ketik slug yang Anda inginkan (misalnya: seminar-ai-2026). Jika slug masih tersedia, tautan singkat Anda siap digunakan seketika dengan domain resmi event.mfytech.my.id/seminar-ai-2026.',
  },
  {
    id: 'faq-2',
    category: 'links',
    question: 'Berapa lama tautan singkat saya akan tetap aktif?',
    answer:
      'Tergantung pada cara Anda membuatnya: (1) Tautan Uji Coba Tamu (dibuat tanpa login di landing page) aktif selama 24 jam dengan slug acak. (2) Seluruh tautan yang Anda buat setelah mendaftar atau masuk ke akun MfyEvent aktif Permanen selamanya tanpa batas waktu kedaluwarsa, selama tidak melanggar ketentuan layanan.',
  },
  {
    id: 'faq-3',
    category: 'qr',
    question: 'Apakah QR Code yang diunduh berkualitas tinggi dan siap dicetak?',
    answer:
      'Ya! MfyEvent menyediakan opsi unduhan format SVG (vektor resolusi tak terhingga) dan PNG resolusi tinggi. Format SVG sangat ideal untuk dicetak pada banner ukuran besar, baliho acara, kaos, hingga brosur promosi tanpa pecah atau buram.',
  },
  {
    id: 'faq-4',
    category: 'microsites',
    question: 'Apa perbedaan antara Short Link biasa dan Microsite?',
    answer:
      'Short Link langsung mengalihkan pengunjung ke satu tautan tujuan spesifik secara instan. Sedangkan Microsite adalah halaman profil berdesain estetik (bio link) yang dapat memuat banyak tautan, video YouTube, galeri foto, tombol WhatsApp, jadwal acara, hingga unduhan materi seminar dalam satu alamat @handle tunggal.',
  },
  {
    id: 'faq-5',
    category: 'account',
    question: 'Apakah layanan MfyEvent gratis digunakan untuk komunitas dan sekolah?',
    answer:
      'Ya! MfyEvent dirancang gratis untuk membantu pendidik, sekolah, kreator digital, serta panitia event lokal dalam mempercepat digitalisasi komunikasi dan penyebaran materi tanpa biaya lisensi.',
  },
  {
    id: 'faq-6',
    category: 'qr',
    question: 'Bisakah saya menyematkan logo sendiri di tengah QR Code?',
    answer:
      'Tentu saja. Di modal kustomisasi QR Code, Anda dapat mengunggah logo instansi, sekolah, atau brand Anda untuk disematkan di titik pusat QR Code dengan tingkat koreksi kesalahan (error correction) yang optimal.',
  },
  {
    id: 'faq-7',
    category: 'microsites',
    question: 'Bagaimana cara menambahkan microsite ke bio Instagram atau TikTok?',
    answer:
      'Salin tautan publik microsite Anda (misalnya: event.mfytech.my.id/@username), buka profil Instagram atau TikTok Anda, pilih "Edit Profil", lalu tempelkan link tersebut ke bagian kolom "Tautan / Website".',
  },
  {
    id: 'faq-8',
    category: 'links',
    question: 'Apakah saya bisa melihat statistik jumlah klik pengunjung?',
    answer:
      'Ya. Dasbor MfyEvent menyajikan analitik real-time yang mencakup total klik, perkiraan lokasi geografis kota/negara, perangkat pengunjung (mobile, tablet, desktop), serta grafik tren lalu lintas harian.',
  },
  {
    id: 'faq-9',
    category: 'microsites',
    question: 'Berapa banyak blok konten yang bisa ditambahkan ke microsite?',
    answer:
      'Setiap microsite dapat memuat puluhan blok konten dinamis, termasuk link tautan eksternal, tombol kontak WhatsApp langsung, embed video interaktif YouTube, hingga tautan media sosial.',
  },
  {
    id: 'faq-10',
    category: 'account',
    question: 'Bagaimana jika saya menemukan tautan yang mencurigakan atau berbahaya?',
    answer:
      'Anda dapat melaporkannya segera dengan mengirimkan email aduan ke abuse@mfytech.my.id atau melalui tombol "Laporkan Tautan" di footer. Tim moderasi MfyTech akan memeriksa dan menindaklanjuti laporan dalam kurun 1x24 jam kerja.',
  },
  {
    id: 'faq-11',
    category: 'links',
    question: 'Mengapa saya tidak bisa mengetik slug kustom saat mencoba di halaman depan?',
    answer:
      'Fitur coba cepat di halaman depan sengaja diperuntukkan bagi tamu dengan slug acak otomatis dan masa aktif 24 jam. Kustomisasi slug sesuai keinginan (seperti /nama-acara) serta tautan permanen adalah fitur eksklusif untuk member terdaftar. Anda cukup masuk atau mendaftar gratis untuk langsung menggunakannya.',
  },
  {
    id: 'faq-12',
    category: 'links',
    question: 'Apa yang terjadi jika tautan uji coba 24 jam telah kedaluwarsa?',
    answer:
      'Jika tautan uji coba dibuka setelah melewati masa aktif 24 jam, sistem akan menampilkan halaman khusus ramah pengunjung yang menginformasikan bahwa tautan uji coba telah berakhir, lengkap dengan tombol untuk mendaftar akun gratis dan membuat tautan permanen.',
  },
  {
    id: 'faq-13',
    category: 'account',
    question: 'Bagaimana cara mendaftar dan mengaktifkan akun di MfyEvent?',
    answer:
      'Sangat instan! Anda dapat mendaftar dengan satu klik menggunakan tombol "Masuk dengan Akun Google" (otomatis aktif seketika dengan status ACTIVE tanpa verifikasi manual). Anda juga dapat mendaftar menggunakan formulir email di halaman Registrasi.',
  },
  {
    id: 'faq-14',
    category: 'account',
    question: 'Apakah akun saya terintegrasi dengan teknologi MfyTech dan Firebase?',
    answer:
      'Ya! MfyEvent 2.0 terintegrasi langsung dengan ekosistem MfyTech dan Google Firebase Authentication berstandar keamanan enterprise. Password akun Google Anda tidak pernah disimpan di peladen kami, menjamin kerahasiaan dan privasi data.',
  },
];

export default function FaqsPage() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'links' | 'microsites' | 'qr' | 'account'>('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    // Exclusive accordion: jika klik item yang sama -> tutup, jika klik item lain -> buka item baru & tutup yang lama
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const filteredFaqs = useMemo(() => {
    return ALL_FAQS.filter((faq) => {
      const matchCategory = activeCategory === 'all' || faq.category === activeCategory;
      const matchSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDark ? 'bg-[#070913] text-white' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* ================= TOP HEADER NAVIGATION ================= */}
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
            {/* Quick Theme Switcher Button di Bagian Atas */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark
                  ? 'border-slate-800 bg-slate-800/60 text-amber-300 hover:bg-slate-800'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              aria-label="Toggle Theme"
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
              <span>Beranda</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION & SEARCH ================= */}
      <section
        className={`relative py-14 sm:py-20 px-4 sm:px-8 border-b transition-colors overflow-hidden ${
          isDark
            ? 'bg-gradient-to-b from-[#0F172A] to-[#070913] border-slate-800'
            : 'bg-gradient-to-b from-indigo-50/70 to-[#F8FAFC] border-slate-200'
        }`}
      >
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[300px] bg-gradient-to-r from-[#5B5BF7]/20 to-[#06B6D4]/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#5B5BF7]/15 text-[#5B5BF7] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pusat Bantuan & Tanya Jawab</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            FAQS MfyEvent
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto leading-relaxed">
            Pertanyaan yang sering ditanyakan seputar pembuatan short link cepat, QR Code dinamis, dan microsite bio link modern.
          </p>

          {/* Search Bar Input */}
          <div className="mt-8 relative max-w-xl mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pertanyaan atau kata kunci (contoh: kustom slug, QR Code, cetak)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border text-xs sm:text-sm outline-none transition-all shadow-xs ${
                isDark
                  ? 'bg-slate-900/90 border-slate-700/80 text-white placeholder-slate-500 focus:border-[#5B5BF7] focus:ring-2 focus:ring-[#5B5BF7]/20'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#5B5BF7] focus:ring-2 focus:ring-[#5B5BF7]/15'
              }`}
            />
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'Semua Pertanyaan', icon: HelpCircle },
              { id: 'links', label: 'Short Links', icon: Link2 },
              { id: 'microsites', label: 'Microsites', icon: LayoutTemplate },
              { id: 'qr', label: 'QR Code', icon: QrCode },
              { id: 'account', label: 'Akun & Keamanan', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white shadow-xs'
                      : isDark
                      ? 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= ACCORDION CONTENT SECTION ================= */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <div className="mb-6 flex items-center justify-between text-xs text-slate-400">
          <span>Menampilkan {filteredFaqs.length} pertanyaan</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#5B5BF7] hover:underline font-semibold"
            >
              Reset pencarian
            </button>
          )}
        </div>

        {/* Animated Exclusive Accordion List */}
        <div className="space-y-3.5">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? isDark
                      ? 'bg-slate-900/90 border-[#5B5BF7]/50 shadow-[0_0_25px_rgba(91,91,247,0.12)]'
                      : 'bg-white border-[#5B5BF7]/40 shadow-sm'
                    : isDark
                    ? 'bg-[#0F172A]/70 border-slate-800/80 hover:border-slate-700'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <span
                    className={`text-sm sm:text-base font-bold transition-colors ${
                      isOpen
                        ? 'text-[#5B5BF7] dark:text-[#818CF8]'
                        : isDark
                        ? 'text-white'
                        : 'text-slate-900'
                    }`}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? 'rotate-180 bg-[#5B5BF7]/10 text-[#5B5BF7]'
                        : isDark
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Animated Collapsible Answer */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div
                      className={`px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t ${
                        isDark
                          ? 'text-slate-300 border-slate-800/60'
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

          {filteredFaqs.length === 0 && (
            <div
              className={`p-10 rounded-2xl border text-center ${
                isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold">Tidak ada pertanyaan yang sesuai</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Coba gunakan kata kunci pencarian yang lain atau hubungi tim dukungan kami di bawah ini.
              </p>
            </div>
          )}
        </div>

        {/* ================= HELP & SUPPORT CALLOUT BANNER ================= */}
        <div
          className={`mt-14 p-6 sm:p-8 rounded-3xl border text-center transition-colors ${
            isDark
              ? 'bg-gradient-to-r from-[#0F172A] via-[#1E1B4B]/50 to-[#0F172A] border-slate-800'
              : 'bg-gradient-to-r from-indigo-50/80 via-white to-cyan-50/60 border-indigo-100 shadow-xs'
          }`}
        >
          <h3 className="text-base sm:text-lg font-bold">Masih memiliki pertanyaan lain?</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Tim dukungan teknis MfyTech siap membantu menjawab kendala teknis atau pertanyaan kemitraan.
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

      {/* ================= FOOTER ================= */}
      <footer className="py-8 px-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>
          © 2026 <span className="font-semibold text-slate-800 dark:text-white">MfyEvent</span> — Layanan resmi dari{' '}
          <a
            href="https://www.mfytech.my.id"
            target="_blank"
            rel="noreferrer"
            className="text-[#5B5BF7] hover:underline"
          >
            MfyTech
          </a>
          . Seluruh hak cipta dilindungi.
        </p>
      </footer>
    </div>
  );
}
