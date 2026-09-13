'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ArrowRight, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { setAuthSession } from '@/lib/storage';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { useTheme } from '@/context/ThemeContext';

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        showToast(
          res.isSimulated
            ? `Pendaftaran berhasil! Akun Anda aktif sebagai ${res.user?.displayName} 🎉`
            : `Pendaftaran berhasil! Selamat datang, ${res.user?.displayName} 🎉`,
          'success'
        );
        router.push(res.redirectUrl);
      } else if (res.error) {
        showToast(res.error, 'warning');
      }
    } catch {
      showToast('Gagal mendaftar dengan akun Google.', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAuthSession(true);
      showToast('Registrasi berhasil! Selamat datang di MfyEvent 🎉');
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070913] flex flex-col md:flex-row transition-colors duration-200">
      {/* Left Column: Visual Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1E1B4B] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#5B5BF7]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-[#06B6D4]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Spacer to maintain flex layout balance */}
        <div className="relative z-10" />

        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pendaftaran Instan & Akun Langsung Aktif</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug">
            Mulai Bagikan Ide & Materi Anda Lebih Mudah.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Dapatkan short link kustom, QR Code siap cetak, dan halaman microsite bio link modern tanpa biaya langganan awal.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          MfyEvent · by{' '}
          <a
            href="https://www.mfytech.my.id"
            target="_blank"
            rel="noreferrer"
            className="text-white hover:underline font-semibold"
          >
            MfyTech
          </a>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 bg-white dark:bg-[#0F172A] transition-colors duration-200">
        <div className="w-full max-w-sm space-y-6">
          {/* Logo prominently displayed on form area */}
          <div className="mb-4 flex items-center justify-start">
            <BrandLogo size="lg" theme={isDark ? 'dark' : 'light'} href="/" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Buat Akun Baru</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Daftar dalam 30 detik dan mulai gunakan MfyEvent
            </p>
          </div>

          {/* ================= GOOGLE ONE-CLICK SIGN-UP ================= */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer group hover:border-[#5B5BF7]/50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{googleLoading ? 'Mendaftarkan Akun Google...' : 'Daftar dengan Akun Google (Aktif Otomatis)'}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-[#0F172A] px-3 text-[10px] text-slate-400 font-semibold tracking-wider uppercase shrink-0">
                atau isi formulir manual
              </span>
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Mas Alfy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white dark:focus:bg-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white dark:focus:bg-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white dark:focus:bg-slate-900 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="font-semibold text-[#5B5BF7] dark:text-indigo-400 hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
