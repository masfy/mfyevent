'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase/config';
import {
  syncUserToFirestore,
  fetchMicrositesFromFirestore,
  fetchLinksFromFirestore,
} from '@/lib/firebase/firestore';
import { handleGoogleAuthSuccess, getStoredUser } from '@/lib/storage';

/**
 * FirebaseObserver
 * Memantau status login pengguna secara realtime.
 * 1. Menjaga profil lokal dan Firestore selalu sinkron
 * 2. Mengunggah microsite lokal yang berstatus PUBLISHED ke Cloud Firestore
 * 3. Mengambil microsite & short link terbaru dari cloud
 */
export const FirebaseObserver = () => {
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const auth = getFirebaseAuth();
    if (!auth) return;

    // Muat data publik terbaru dari cloud secara background
    fetchMicrositesFromFirestore().catch(() => {});
    fetchLinksFromFirestore().catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email) {
        try {
          const appUser = handleGoogleAuthSuccess({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email.split('@')[0],
            photoURL: fbUser.photoURL || undefined,
          });

          // 1. Otomatis sinkronkan profil user ke Cloud Firestore
          await syncUserToFirestore(appUser);

          // 2. Ambil data terbaru langsung dari cloud
          await fetchMicrositesFromFirestore();
          await fetchLinksFromFirestore();
        } catch (err) {
          console.warn('[FirebaseObserver] Gagal sinkronisasi data user/microsite:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
};

