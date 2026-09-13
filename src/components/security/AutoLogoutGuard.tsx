'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isUserLoggedIn, setAuthSession } from '@/lib/storage';
import { getFirebaseAuth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { useToast } from '@/components/ui/Toast';

/**
 * 27 Menit Batas Inaktivitas (27 minutes * 60 seconds * 1000 ms = 1.620.000 ms)
 */
export const IDLE_TIMEOUT_MS = 27 * 60 * 1000;
const CHECK_INTERVAL_MS = 10 * 1000; // Cek setiap 10 detik
const THROTTLE_ACTIVITY_MS = 5 * 1000; // Throttle pencatatan aktivitas setiap 5 detik

const STORAGE_KEY_LAST_ACTIVITY = 'mfy_last_activity';

export const recordUserActivity = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, Date.now().toString());
  } catch {
    // Ignore storage errors
  }
};

export const AutoLogoutGuard: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const lastRecordedRef = useRef<number>(0);

  useEffect(() => {
    // Catat aktivitas pertama kali saat komponen dimount
    if (isUserLoggedIn()) {
      recordUserActivity();
    }

    const handleUserInteraction = () => {
      const now = Date.now();
      // Throttle agar tidak membebani localStorage saat mouse bergerak cepat
      if (now - lastRecordedRef.current > THROTTLE_ACTIVITY_MS) {
        lastRecordedRef.current = now;
        recordUserActivity();
      }
    };

    // Daftarkan listener aktivitas pengguna
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((eventName) => {
      window.addEventListener(eventName, handleUserInteraction, { passive: true });
    });

    // Timer pengecekan periodik
    const interval = setInterval(async () => {
      if (!isUserLoggedIn()) return;

      const rawLastActivity = localStorage.getItem(STORAGE_KEY_LAST_ACTIVITY);
      const lastActivityTime = rawLastActivity ? parseInt(rawLastActivity, 10) : Date.now();
      const idleTime = Date.now() - lastActivityTime;

      // Jika inaktivitas telah mencapai 27 menit
      if (idleTime >= IDLE_TIMEOUT_MS) {
        console.warn('[AutoLogout] Sesi berakhir setelah 27 menit tidak ada aktivitas.');

        // 1. Sign out dari Firebase Auth
        const auth = getFirebaseAuth();
        if (auth) {
          try {
            await signOut(auth);
          } catch (err) {
            console.warn('[AutoLogout] Firebase signOut error:', err);
          }
        }

        // 2. Hapus sesi lokal
        setAuthSession(false);

        // 3. Beri notifikasi toast kepada pengguna
        showToast('Sesi Anda telah berakhir secara otomatis karena tidak ada aktivitas selama 27 menit.', 'warning');

        // 4. Arahkan ke halaman login
        router.replace('/login?reason=idle_timeout');
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserInteraction);
      });
      clearInterval(interval);
    };
  }, [router, showToast]);

  return null;
};
