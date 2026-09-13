'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase/config';
import { syncUserToFirestore } from '@/lib/firebase/firestore';
import { handleGoogleAuthSuccess, getStoredUser } from '@/lib/storage';

/**
 * FirebaseObserver
 * Memantau status login pengguna secara realtime.
 * Jika pengguna terotentikasi di Firebase Auth:
 * 1. Menjaga profil lokal selalu tersinkronisasi
 * 2. Memastikan profil pengguna tersimpan otomatis di Cloud Firestore (agar terbaca di Admin Dashboard)
 */
export const FirebaseObserver = () => {
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email) {
        try {
          const appUser = handleGoogleAuthSuccess({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email.split('@')[0],
            photoURL: fbUser.photoURL || undefined,
          });

          // Otomatis sinkronkan ke Cloud Firestore
          await syncUserToFirestore(appUser);
        } catch (err) {
          console.warn('[FirebaseObserver] Gagal sinkronisasi data user:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
};
