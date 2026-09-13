'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useTheme } from '@/context/ThemeContext';
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  UserCheck,
  FileText,
  Sun,
  Moon,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export default function PrivacyPolicyPage() {
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
            <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>Kebijakan Privasi</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-[#5B5BF7] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Kebijakan Privasi
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Terakhir diperbarui: 13 September 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Note */}
        <div
          className={`p-5 rounded-2xl border mb-8 ${
            isDark
              ? 'bg-indigo-950/30 border-indigo-800/40 text-indigo-200'
              : 'bg-indigo-50/80 border-indigo-100 text-indigo-900'
          }`}
        >
          <p className="text-xs sm:text-sm leading-relaxed">
            Di <strong>MfyEvent</strong> (bagian dari ekosistem teknologi <strong>MfyTech</strong>), kami memprioritaskan privasi kreator, pengunjung link, serta komunitas pengguna. Dokumen ini menjelaskan bagaimana data Anda dikumpulkan, dilindungi, dan dikelola sesuai Undang-Undang Pelindungan Data Pribadi (UU PDP) Indonesia.
          </p>
        </div>

        {/* Privacy Content Sections */}
        <div className="space-y-8 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <section
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-[#5B5BF7] font-bold text-base mb-3">
              <Database className="w-5 h-5" />
              <h2>1. Informasi yang Kami Kumpulkan</h2>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Kami hanya mengumpulkan informasi yang esensial untuk menyediakan layanan pemendek tautan, pembuatan kode QR, serta penyajian halaman microsite:
            </p>
            <ul className={`list-disc pl-5 mt-3 space-y-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <li><strong>Data Akun & Otentikasi Google:</strong> Nama profil, alamat email aktif terverifikasi, serta foto profil resmi yang disalurkan melalui sistem Google Sign-In (Firebase Authentication). Kami <strong>tidak pernah</strong> mengakses, meminta, atau menyimpan kata sandi (*password*) akun Google Anda.</li>
              <li><strong>Tautan Uji Coba Tamu (Guest Trial 24 Jam):</strong> Pengguna tamu di halaman beranda yang membuat shortlink tanpa login tidak dimintai informasi pribadi apa pun. Kami hanya mencatat URL asli dan slug acak sementara yang otomatis kedaluwarsa setelah 24 jam.</li>
              <li><strong>Data Tautan & Microsite Member:</strong> URL tujuan, judul tautan, kustomisasi slug nama acara, konten blok microsite, tautan sosial media, dan teks informasi acara Anda.</li>
              <li><strong>Statistik Kunjungan Anonim:</strong> Jumlah klik, perkiraan lokasi geografis (tingkat kota/negara), tipe perangkat (mobile, tablet, desktop), serta sumber rujukan (referrer URL). Kami <strong>tidak</strong> merekam data identitas pribadi individual dari pengunjung tautan Anda.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-base mb-3">
              <Eye className="w-5 h-5" />
              <h2>2. Penggunaan Informasi & Komitmen Bebas Jual Data</h2>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Informasi yang dikumpulkan digunakan semata-mata untuk:
            </p>
            <ul className={`list-disc pl-5 mt-3 space-y-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <li>Menjalankan pengalihan tautan (*redirection*) berkecepatan tinggi di bawah 300 milidetik.</li>
              <li>Menampilkan grafik dan analisis performa klik di dasbor pemilik akun.</li>
              <li>Mendeteksi serta memblokir upaya kejahatan siber (phishing, malware, scam, spam bot).</li>
              <li><strong>MfyTech TIDAK PERNAH</strong> memperjualbelikan, menyewakan, atau mendistribusikan data pribadi Anda kepada broker data pihak ketiga mana pun.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-cyan-500 font-bold text-base mb-3">
              <Lock className="w-5 h-5" />
              <h2>3. Keamanan Data & Perlindungan Enkripsi</h2>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Seluruh pertukaran data antara peramban Anda dan server MfyEvent dilindungi menggunakan standar enkripsi modern <strong>Transport Layer Security (TLS 1.3 / SSL)</strong>. Lapisan otentikasi didukung oleh infrastruktur Google Firebase tingkat industri (OAuth 2.0) yang dilengkapi sistem deteksi intrusi dan audit keamanan berkala guna mencegah akses tanpa hak.
            </p>
          </section>

          {/* Section 4 */}
          <section
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-base mb-3">
              <UserCheck className="w-5 h-5" />
              <h2>4. Hak Pengguna atas Data Pribadi</h2>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Sesuai ketentuan hukum yang berlaku, setiap pengguna berhak:
            </p>
            <ul className={`list-disc pl-5 mt-3 space-y-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <li>Mengakses, menyunting, atau memperbarui informasi profil akun sewaktu-waktu melalui halaman Pengaturan Akun.</li>
              <li>Menghapus tautan singkat atau microsite tertentu secara instan dari peredaran publik.</li>
              <li>Mengajukan permohonan penutupan akun permanen dan pembersihan seluruh data riwayat dari sistem kami.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-purple-400 font-bold text-base mb-3">
              <FileText className="w-5 h-5" />
              <h2>5. Cookie & Penyimpanan Lokal (Local Storage)</h2>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Platform MfyEvent memanfaatkan <em>local storage</em> browser semata-mata untuk menyimpan preferensi tampilan (mode Terang / mode Gelap) dan memelihara sesi login aktif demi kenyamanan pengalaman pengguna. Kami tidak menyematkan cookie pelacak lintas situs pihak ketiga.
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
              <h2>6. Hubungi Petugas Privasi Kami</h2>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Jika Anda memiliki pertanyaan seputar kebijakan privasi ini atau ingin mengajukan permintaan data, hubungi tim kami:
            </p>
            <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 font-mono text-xs space-y-1 text-slate-700 dark:text-slate-300">
              <p>Email: <strong>privacy@mfytech.my.id</strong> / <strong>event@mfytech.my.id</strong></p>
              <p>Portal Resmi: <a href="https://www.mfytech.my.id" target="_blank" rel="noreferrer" className="text-[#5B5BF7] hover:underline">www.mfytech.my.id</a></p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>
          © 2026 <span className="font-semibold text-slate-800 dark:text-white">MfyEvent</span> — Inovasi platform oleh <a href="https://www.mfytech.my.id" target="_blank" rel="noreferrer" className="text-[#5B5BF7] hover:underline">MfyTech</a>. Seluruh hak cipta dilindungi.
        </p>
      </footer>
    </div>
  );
}
