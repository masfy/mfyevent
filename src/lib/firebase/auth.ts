'use client';

import { signInWithPopup, UserCredential } from 'firebase/auth';
import { getFirebaseAuth, getGoogleProvider, isFirebaseConfigured, PRIMARY_ADMIN_EMAIL } from './config';
import { syncUserToFirestore } from './firestore';
import { handleGoogleAuthSuccess } from '@/lib/storage';
import { User } from '@/types';

export interface GoogleAuthResult {
  success: boolean;
  user?: User;
  redirectUrl: string;
  error?: string;
  isSimulated?: boolean;
}

/**
 * Otentikasi dan Registrasi Akun Otomatis menggunakan Akun Google (Firebase Auth)
 * - Jika email adalah alfyarnaim@gmail.com -> Otomatis role SUPER_ADMIN -> redirect ke /admin/dashboard
 * - Pengguna umum lainnya -> Otomatis role USER (Langsung ACTIVE) -> redirect ke /member/dashboard
 */
export const signInWithGoogle = async (fallbackEmail?: string, fallbackName?: string): Promise<GoogleAuthResult> => {
  // 1. Cek apakah konfigurasi kredensial Firebase sudah tersedia
  if (isFirebaseConfigured()) {
    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error('Gagal menghubungkan ke Firebase Auth Client.');
      }
      const provider = getGoogleProvider();
      const result: UserCredential = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      if (!fbUser.email) {
        throw new Error('Akun Google tidak menyediakan alamat email.');
      }

      const email = fbUser.email.trim().toLowerCase();
      const displayName = fbUser.displayName || email.split('@')[0];
      const photoURL = fbUser.photoURL || undefined;
      const uid = fbUser.uid;

      // Sinkronisasi data ke penyimpanan aplikasi
      const appUser = handleGoogleAuthSuccess({
        uid,
        email,
        displayName,
        photoURL,
      });

      // Sinkronisasi data langsung ke Cloud Firestore agar instan terbaca di Dashboard Admin
      try {
        await syncUserToFirestore(appUser);
      } catch (err) {
        console.warn('Gagal sinkronisasi user ke Firestore:', err);
      }

      const isAdmin = appUser.role === 'ADMIN' || appUser.role === 'SUPER_ADMIN';
      const redirectUrl = isAdmin ? '/admin/dashboard' : '/member/dashboard';

      return {
        success: true,
        user: appUser,
        redirectUrl,
        isSimulated: false,
      };
    } catch (error: any) {
      console.warn('Firebase signInWithPopup error/cancelled:', error);

      // Jika user membatalkan popup (popup-closed-by-user), return error tanpa crash
      if (error.code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          redirectUrl: '',
          error: 'Proses login dibatalkan oleh pengguna.',
        };
      }

      // Jika ada error jaringan atau domain belum didaftarkan di Firebase Console
      return {
        success: false,
        redirectUrl: '',
        error: error.message || 'Gagal masuk menggunakan akun Google.',
      };
    }
  }

  // 2. Mode Simulasi Cepat (Jika kredensial Firebase di .env / Settings belum diisi)
  // Memungkinkan pengujian instan untuk admin alfyarnaim@gmail.com maupun pendaftar baru
  const email = (fallbackEmail || PRIMARY_ADMIN_EMAIL).trim().toLowerCase();
  const displayName = fallbackName || (email === PRIMARY_ADMIN_EMAIL ? 'Alfy Arnaim' : email.split('@')[0]);

  const appUser = handleGoogleAuthSuccess({
    uid: `google_sim_${Date.now()}`,
    email,
    displayName,
    photoURL:
      email === PRIMARY_ADMIN_EMAIL
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  });

  const isAdmin = appUser.role === 'ADMIN' || appUser.role === 'SUPER_ADMIN';
  const redirectUrl = isAdmin ? '/admin/dashboard' : '/member/dashboard';

  return {
    success: true,
    user: appUser,
    redirectUrl,
    isSimulated: true,
  };
};
