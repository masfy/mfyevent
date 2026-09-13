'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useTheme } from '@/context/ThemeContext';
import {
  FileCheck2,
  AlertOctagon,
  Scale,
  ShieldAlert,
  Server,
  Sun,
  Moon,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Clock,
  Link2,
} from 'lucide-react';

export default function TermsOfServicePage() {
  const { theme, isDark, toggleTheme } = useTheme();

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

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-10 sm:py-16">
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
            <Link href="/" className="hover:text-[#5B5BF7] transition-colors">Beranda</Link>
            <span>/</span>
            <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>Syarat & Ketentuan</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-[#06B6D4] flex items-center justify-center">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Syarat & Ketentuan Layanan
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Mulai berlaku: 11 September 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Note */}
        <div
          className={`p-5 rounded-2xl border mb-8 ${
            isDark
              ? 'bg-cyan-950/30 border-cyan-800/40 text-cyan-200'
              : 'bg-cyan-50/80 border-cyan-100 text-cyan-900'
          }`}
        >
          <p className="text-xs sm:text-sm leading-relaxed">
            Selamat datang di <strong>MfyEvent</strong>. Dengan mendaftar, mengakses, atau menggunakan layanan pemendek tautan, kode QR, dan microsite kami, Anda menyatakan telah membaca, memahami, serta menyetujui seluruh ketentuan layanan di bawah ini.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <section
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-[#5B5BF7] font-bold text-base mb-3">
              <Scale className="w-5 h-5" />
              <h2>1. Ketentuan Akun & Penggunaan Layanan</h2>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Setiap pengguna wajib memberikan informasi yang akurat saat mendaftar dan bertanggung jawab penuh terhadap segala bentuk aktivitas yang terjadi di bawah akun terdaftarnya.
            </p>
            <ul className={`list-disc pl-5 mt-3 space-y-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <li>Pengguna wajib menjaga kerahasiaan kredensial akun dan dilarang mengalihkan akun kepada pihak lain tanpa izin tertulis.</li>
              <li>Akun yang tidak aktif selama lebih dari 365 hari kalender dapat diarsipkan demi efisiensi sistem.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-rose-500 font-bold text-base mb-3">
              <AlertOctagon className="w-5 h-5" />
              <h2>2. Larangan Penggunaan Konten (Zero-Tolerance Policy)</h2>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              MfyEvent melarang keras pembuatan short link, kode QR, atau halaman microsite yang mengarah pada:
            </p>
            <ul className={`list-disc pl-5 mt-3 space-y-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <li><strong>Phishing & Malware:</strong> Tautan penipuan kredensial akun, peretasan, ransomware, atau distribusi virus.</li>
              <li><strong>Perjudian & Penipuan Keuangan:</strong> Tautan situs judi online, skema ponzi, investasi ilegal, atau manipulasi pasar.</li>
              <li><strong>Pornografi & Eksploitasi:</strong> Konten pornografi, kekerasan ekstrim, atau pelecehan anak.</li>
              <li><strong>Ujaran Kebencian & Pelanggaran Hak Cipta:</strong> Kampanye SARA, penyebaran hoaks berbahaya, atau materi berhak cipta tanpa izin sah.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-amber-500 font-bold text-base mb-3">
              <ShieldAlert className="w-5 h-5" />
              <h2>3. Hak Moderasi & Penangguhan Akun Seketika</h2>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Tim Administrator MfyTech berhak secara sepihak untuk:
            </p>
            <ul className={`list-disc pl-5 mt-3 space-y-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <li>Menangguhkan (*suspend*) atau menonaktifkan tautan seketika jika terdeteksi melanggar sistem keamanan atau dilaporkan masyarakat.</li>
              <li>Membekukan akun pengguna yang terbukti melanggar ketentuan tanpa kewajiban ganti rugi.</li>
              <li>Bekerja sama dengan aparat penegak hukum dan instansi berwenang Republik Indonesia apabila terdapat indikasi tindak pidana siber.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-base mb-3">
              <Clock className="w-5 h-5" />
              <h2>4. Ketentuan Tautan Uji Coba 24 Jam & Slug Kustom</h2>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              MfyEvent menyediakan fitur uji coba cepat tanpa pendaftaran di halaman depan dengan ketentuan khusus sebagai berikut:
            </p>
            <ul className={`list-disc pl-5 mt-3 space-y-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <li><strong>Masa Berlaku 24 Jam:</strong> Tautan yang dibuat dalam mode uji coba tamu memiliki masa aktif tepat 24 jam. Setelah 24 jam, tautan akan kedaluwarsa (*expired*) dan pengunjung akan dialihkan ke halaman kedaluwarsa.</li>
              <li><strong>Slug Acak (Random Slug):</strong> Tautan uji coba tamu secara otomatis menggunakan slug acak unik dari sistem.</li>
              <li><strong>Hak Akses Slug Kustom:</strong> Pemilihan slug kustom (contoh: <span className="font-mono text-[#5B5BF7]">/nama-acara</span>) dan masa aktif permanen merupakan hak istimewa pengguna terdaftar (member).</li>
              <li><strong>Larangan Typosquatting:</strong> Dilarang membuat slug yang meniru (*impersonate*), mencatut, atau menyesatkan merek dagang terdaftar, instansi resmi, atau tokoh publik tanpa hak yang sah. MfyTech berhak mencabut slug yang melanggar.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-base mb-3">
              <Server className="w-5 h-5" />
              <h2>5. Ketersediaan Layanan (Service Level) & Pembaruan</h2>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              MfyEvent berupaya keras menjaga ketersediaan sistem hingga 99.9% uptime. Namun demikian, kami berhak melakukan pemeliharaan terencana (*maintenance*) dengan pemberitahuan awal serta memperbarui fitur untuk meningkatkan performa dan perlindungan platform.
            </p>
          </section>

          {/* Section 6 */}
          <section
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-[#5B5BF7] font-bold text-base mb-3">
              <HelpCircle className="w-5 h-5" />
              <h2>6. Laporan Dugaan Pelanggaran</h2>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Masyarakat umum atau pemilik hak cipta dapat melaporkan tautan mencurigakan kapan saja melalui fitur Laporkan Tautan atau mengirimkan aduan ke:
            </p>
            <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 font-mono text-xs space-y-1 text-slate-700 dark:text-slate-300">
              <p>Email Aduan: <strong>abuse@mfytech.my.id</strong> / <strong>event@mfytech.my.id</strong></p>
              <p>Tim Moderasi MfyTech akan menindaklanjuti laporan dalam kurun waktu 1x24 jam kerja.</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>
          © 2026 <span className="font-semibold text-slate-800 dark:text-white">MfyEvent</span> — Layanan resmi dari <a href="https://www.mfytech.my.id" target="_blank" rel="noreferrer" className="text-[#5B5BF7] hover:underline">MfyTech</a>.
        </p>
      </footer>
    </div>
  );
}
