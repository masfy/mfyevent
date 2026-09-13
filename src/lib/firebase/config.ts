'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const PRIMARY_ADMIN_EMAIL = 'alfyarnaim@gmail.com';

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: 'AIzaSyAmfIKQR-NwpnCjnRomUT-I5aL8TJi0mmk',
  authDomain: 'mfyevent.firebaseapp.com',
  projectId: 'mfyevent',
  storageBucket: 'mfyevent.firebasestorage.app',
  messagingSenderId: '1022353875461',
  appId: '1:1022353875461:web:c2b6e95506cefcf1b2326c',
  measurementId: 'G-1NJPFYSMCG',
};

const STORAGE_KEY_FIREBASE_CONFIG = 'mfy_firebase_config';

/**
 * Mendapatkan konfigurasi Firebase dari LocalStorage, Environment Variables, atau Konfigurasi Default Proyek
 */
export const getFirebaseConfig = (): FirebaseConfig => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.apiKey && parsed.projectId) {
          return parsed;
        }
      }
    } catch {
      // ignore parse error
    }
  }

  const envConfig: FirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  return DEFAULT_FIREBASE_CONFIG;
};

/**
 * Menyimpan konfigurasi Firebase ke LocalStorage
 */
export const saveFirebaseConfig = (config: FirebaseConfig) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
  window.dispatchEvent(new Event('mfy_storage_update'));
};

/**
 * Cek apakah kredensial Firebase sudah terisi lengkap
 */
export const isFirebaseConfigured = (): boolean => {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.apiKey.trim() !== '' && config.projectId && config.projectId.trim() !== '');
};

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedProvider: GoogleAuthProvider | null = null;

/**
 * Inisialisasi Firebase App
 */
export const getFirebaseAppInstance = (): FirebaseApp | null => {
  const config = getFirebaseConfig();
  if (!config.apiKey || !config.projectId) {
    return null;
  }

  try {
    if (getApps().length > 0) {
      cachedApp = getApp();
    } else {
      cachedApp = initializeApp(config);
    }
    return cachedApp;
  } catch (error) {
    console.error('Gagal menginisialisasi Firebase App:', error);
    return null;
  }
};

/**
 * Mendapatkan instance Firebase Auth
 */
export const getFirebaseAuth = (): Auth | null => {
  const app = getFirebaseAppInstance();
  if (!app) return null;
  if (!cachedAuth) {
    cachedAuth = getAuth(app);
  }
  return cachedAuth;
};

/**
 * Mendapatkan instance GoogleAuthProvider
 */
export const getGoogleProvider = (): GoogleAuthProvider => {
  if (!cachedProvider) {
    cachedProvider = new GoogleAuthProvider();
    cachedProvider.setCustomParameters({
      prompt: 'select_account',
    });
  }
  return cachedProvider;
};

/**
 * Mendapatkan instance Firebase Analytics (Hanya di browser)
 */
export const initFirebaseAnalytics = async () => {
  if (typeof window === 'undefined') return null;
  const app = getFirebaseAppInstance();
  if (!app) return null;

  try {
    const { getAnalytics, isSupported } = await import('firebase/analytics');
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
  } catch {
    // Analytics is optional and depends on browser cookie/tracking settings
  }
  return null;
};

let cachedFirestore: Firestore | null = null;

/**
 * Mendapatkan instance Cloud Firestore
 */
export const getFirebaseFirestore = (): Firestore | null => {
  const app = getFirebaseAppInstance();
  if (!app) return null;
  if (!cachedFirestore) {
    cachedFirestore = getFirestore(app);
  }
  return cachedFirestore;
};

