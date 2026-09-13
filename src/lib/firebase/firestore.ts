'use client';

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseFirestore, isFirebaseConfigured, PRIMARY_ADMIN_EMAIL } from './config';
import { User, ShortLink, Microsite } from '@/types';
import { saveStoredUsers, getStoredUsers, saveStoredLinks, getStoredLinks, saveStoredMicrosites, getStoredMicrosites } from '@/lib/storage';

/**
 * =========================================================================
 * FIRESTORE USERS MANAGEMENT & REAL-TIME SYNC
 * =========================================================================
 */

/**
 * Menyimpan atau memperbarui profil pengguna di Cloud Firestore
 */
export const syncUserToFirestore = async (user: User): Promise<boolean> => {
  if (!isFirebaseConfigured()) return false;
  const db = getFirebaseFirestore();
  if (!db) return false;

  try {
    const userRef = doc(db, 'users', user.uid);
    const payload = {
      uid: user.uid,
      email: user.email.toLowerCase(),
      displayName: user.displayName,
      username: user.username,
      photoURL: user.photoURL || '',
      role: user.email.toLowerCase() === PRIMARY_ADMIN_EMAIL ? 'SUPER_ADMIN' : user.role,
      status: user.status || 'ACTIVE',
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: user.lastLoginAt || new Date().toISOString(),
      shortLinksCount: user.shortLinksCount || 0,
      micrositesCount: user.micrositesCount || 0,
    };

    await setDoc(userRef, payload, { merge: true });
    return true;
  } catch (error) {
    console.warn('Gagal menyimpan user ke Firestore:', error);
    return false;
  }
};

/**
 * Membersihkan duplikasi pengguna berdasarkan email (khususnya akun template vs akun Google Auth asli)
 */
export const deduplicateUsers = (users: User[], db?: any): User[] => {
  const seenEmails = new Map<string, User>();
  const duplicatesToRemove: string[] = [];

  for (const user of users) {
    const emailKey = user.email.trim().toLowerCase();
    if (!emailKey) {
      seenEmails.set(user.uid, user);
      continue;
    }

    if (seenEmails.has(emailKey)) {
      const existing = seenEmails.get(emailKey)!;
      // Jika salah satu adalah template 'usr_alfyarnaim_admin' dan yang lain adalah UID Firebase asli,
      // utamakan yang asli dari Google Auth
      if (existing.uid === 'usr_alfyarnaim_admin' && user.uid !== 'usr_alfyarnaim_admin') {
        duplicatesToRemove.push(existing.uid);
        seenEmails.set(emailKey, user);
      } else if (user.uid === 'usr_alfyarnaim_admin') {
        duplicatesToRemove.push(user.uid);
      } else {
        // Jika keduanya non-template, pertahankan yang paling baru
        const existingDate = new Date(existing.updatedAt || existing.createdAt).getTime();
        const userDate = new Date(user.updatedAt || user.createdAt).getTime();
        if (userDate > existingDate) {
          seenEmails.set(emailKey, user);
        }
      }
    } else {
      seenEmails.set(emailKey, user);
    }
  }

  // Hapus dokumen duplikat dari Firestore secara otomatis di latar belakang jika ada
  if (db && duplicatesToRemove.length > 0) {
    duplicatesToRemove.forEach(async (uid) => {
      try {
        await deleteDoc(doc(db, 'users', uid));
        console.log(`[Deduplicate] Menghapus akun template duplikat dari Firestore: ${uid}`);
      } catch (e) {
        console.warn('Gagal menghapus duplikat dari Firestore:', e);
      }
    });
  }

  return Array.from(seenEmails.values());
};

/**
 * Mengambil seluruh daftar pengguna dari Cloud Firestore
 */
export const fetchUsersFromFirestore = async (): Promise<User[]> => {
  if (!isFirebaseConfigured()) return getStoredUsers();
  const db = getFirebaseFirestore();
  if (!db) return getStoredUsers();

  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    if (snap.empty) {
      return getStoredUsers();
    }

    const cloudUsers: User[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      cloudUsers.push({
        uid: data.uid || docSnap.id,
        email: data.email || '',
        emailVerified: data.emailVerified ?? true,
        displayName: data.displayName || data.email?.split('@')[0] || 'User',
        username: data.username || data.email?.split('@')[0] || 'user',
        photoURL: data.photoURL || undefined,
        role: data.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL ? 'SUPER_ADMIN' : (data.role || 'USER'),
        status: data.status || 'ACTIVE',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        lastLoginAt: data.lastLoginAt || new Date().toISOString(),
        shortLinksCount: data.shortLinksCount || 0,
        micrositesCount: data.micrositesCount || 0,
      });
    });

    const uniqueUsers = deduplicateUsers(cloudUsers, db);

    if (uniqueUsers.length > 0) {
      saveStoredUsers(uniqueUsers);
      return uniqueUsers;
    }

    return getStoredUsers();
  } catch (error) {
    console.warn('Gagal mengambil users dari Firestore:', error);
    return getStoredUsers();
  }
};

/**
 * Berlangganan real-time snapshot pembaruan pengguna dari Cloud Firestore
 */
export const subscribeUsersFromFirestore = (
  onUsersUpdate: (users: User[]) => void
): Unsubscribe | null => {
  if (!isFirebaseConfigured()) return null;
  const db = getFirebaseFirestore();
  if (!db) return null;

  try {
    const usersCol = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersCol,
      (snap) => {
        if (!snap.empty) {
          const cloudUsers: User[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            cloudUsers.push({
              uid: data.uid || docSnap.id,
              email: data.email || '',
              emailVerified: data.emailVerified ?? true,
              displayName: data.displayName || data.email?.split('@')[0] || 'User',
              username: data.username || data.email?.split('@')[0] || 'user',
              photoURL: data.photoURL || undefined,
              role: data.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL ? 'SUPER_ADMIN' : (data.role || 'USER'),
              status: data.status || 'ACTIVE',
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
              lastLoginAt: data.lastLoginAt || new Date().toISOString(),
              shortLinksCount: data.shortLinksCount || 0,
              micrositesCount: data.micrositesCount || 0,
            });
          });

          const uniqueUsers = deduplicateUsers(cloudUsers, db);

          if (uniqueUsers.length > 0) {
            saveStoredUsers(uniqueUsers);
            onUsersUpdate(uniqueUsers);
          }
        }
      },
      (error) => {
        console.warn('Error pada listener users Firestore:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Gagal menginisialisasi listener Firestore users:', err);
    return null;
  }
};

/**
 * Menghapus pengguna dari Cloud Firestore
 */
export const deleteUserFromFirestore = async (uid: string): Promise<boolean> => {
  if (!isFirebaseConfigured()) return false;
  const db = getFirebaseFirestore();
  if (!db) return false;

  try {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
    return true;
  } catch (error) {
    console.warn('Gagal menghapus user dari Firestore:', error);
    return false;
  }
};

/**
 * =========================================================================
 * FIRESTORE LINKS MANAGEMENT & REAL-TIME SYNC
 * =========================================================================
 */

export const syncLinkToFirestore = async (link: ShortLink): Promise<boolean> => {
  if (!isFirebaseConfigured()) return false;
  const db = getFirebaseFirestore();
  if (!db) return false;

  try {
    const linkRef = doc(db, 'links', link.id || link.slug);
    await setDoc(linkRef, link, { merge: true });
    return true;
  } catch (error) {
    console.warn('Gagal menyimpan link ke Firestore:', error);
    return false;
  }
};

export const fetchLinksFromFirestore = async (): Promise<ShortLink[]> => {
  if (!isFirebaseConfigured()) return getStoredLinks();
  const db = getFirebaseFirestore();
  if (!db) return getStoredLinks();

  try {
    const snap = await getDocs(collection(db, 'links'));
    if (snap.empty) return getStoredLinks();

    const cloudLinks: ShortLink[] = [];
    snap.forEach((d) => {
      cloudLinks.push(d.data() as ShortLink);
    });

    if (cloudLinks.length > 0) {
      saveStoredLinks(cloudLinks);
      return cloudLinks;
    }
    return getStoredLinks();
  } catch (error) {
    console.warn('Gagal mengambil links dari Firestore:', error);
    return getStoredLinks();
  }
};

/**
 * =========================================================================
 * FIRESTORE MICROSITES MANAGEMENT & REAL-TIME SYNC
 * =========================================================================
 */

export const syncMicrositeToFirestore = async (site: Microsite): Promise<boolean> => {
  if (!isFirebaseConfigured()) return false;
  const db = getFirebaseFirestore();
  if (!db) return false;

  try {
    const siteRef = doc(db, 'microsites', site.id || site.slug);
    await setDoc(siteRef, site, { merge: true });
    return true;
  } catch (error) {
    console.warn('Gagal menyimpan microsite ke Firestore:', error);
    return false;
  }
};

export const fetchMicrositesFromFirestore = async (): Promise<Microsite[]> => {
  if (!isFirebaseConfigured()) return getStoredMicrosites();
  const db = getFirebaseFirestore();
  if (!db) return getStoredMicrosites();

  try {
    const snap = await getDocs(collection(db, 'microsites'));
    if (snap.empty) return getStoredMicrosites();

    const cloudSites: Microsite[] = [];
    snap.forEach((d) => {
      cloudSites.push(d.data() as Microsite);
    });

    if (cloudSites.length > 0) {
      saveStoredMicrosites(cloudSites);
      return cloudSites;
    }
    return getStoredMicrosites();
  } catch (error) {
    console.warn('Gagal mengambil microsites dari Firestore:', error);
    return getStoredMicrosites();
  }
};
