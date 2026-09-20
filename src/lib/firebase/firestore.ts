'use client';

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  increment,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseFirestore, isFirebaseConfigured, PRIMARY_ADMIN_EMAIL } from './config';
import { User, ShortLink, Microsite } from '@/types';
import { saveStoredUsers, getStoredUsers, saveStoredLinks, getStoredLinks, saveStoredMicrosites, getStoredMicrosites } from '@/lib/storage';
import { compressBase64Image } from '@/lib/imageOptimizer';

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

  const cleanSlug = (link.slug || '').trim().toLowerCase();
  if (!cleanSlug) return false;

  const payload: ShortLink = {
    ...link,
    slug: cleanSlug,
    updatedAt: new Date().toISOString(),
  };

  const safePayload = JSON.parse(JSON.stringify(payload));

  try {
    const linkRef = doc(db, 'links', cleanSlug);
    await setDoc(linkRef, safePayload, { merge: true });
    return true;
  } catch (error) {
    console.warn('[Firestore] Gagal menyimpan link ke Firestore:', error);
    return false;
  }
};

export const fetchLinkBySlug = async (slug: string): Promise<ShortLink | null> => {
  if (!slug) return null;
  const clean = slug.trim().toLowerCase();

  if (!isFirebaseConfigured()) {
    const all = getStoredLinks();
    return all.find((l) => l.slug.toLowerCase() === clean) || null;
  }

  const db = getFirebaseFirestore();
  if (!db) {
    const all = getStoredLinks();
    return all.find((l) => l.slug.toLowerCase() === clean) || null;
  }

  try {
    const docRef = doc(db, 'links', clean);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ShortLink;
    }

    const q = query(collection(db, 'links'), where('slug', '==', clean));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return querySnap.docs[0].data() as ShortLink;
    }

    return null;
  } catch (error) {
    console.warn('[Firestore] Gagal mengambil link dari cloud:', error);
    const all = getStoredLinks();
    return all.find((l) => l.slug.toLowerCase() === clean) || null;
  }
};

export const deleteLinkFromFirestore = async (slug: string): Promise<boolean> => {
  if (!isFirebaseConfigured()) return false;
  const db = getFirebaseFirestore();
  if (!db) return false;

  const clean = slug.trim().toLowerCase();
  try {
    await deleteDoc(doc(db, 'links', clean));
    return true;
  } catch (error) {
    console.warn('[Firestore] Gagal menghapus link dari Firestore:', error);
    return false;
  }
};

export const recordLinkClickInFirestore = async (slug: string, linkId?: string): Promise<boolean> => {
  if (!isFirebaseConfigured()) return false;
  const db = getFirebaseFirestore();
  if (!db) return false;

  const clean = slug.trim().toLowerCase();
  if (!clean) return false;

  try {
    const docRef = doc(db, 'links', clean);
    await setDoc(
      docRef,
      {
        metrics: {
          totalClicks: increment(1),
          uniqueVisitors: increment(1),
        },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log(`[Firestore] Sukses mencatat klik untuk link /${clean}`);
    return true;
  } catch (error) {
    console.warn('[Firestore] Gagal update klik langsung, mencoba query fallback:', error);
    try {
      const q = query(collection(db, 'links'), where('slug', '==', clean));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const targetDocRef = snap.docs[0].ref;
        await setDoc(
          targetDocRef,
          {
            metrics: {
              totalClicks: increment(1),
              uniqueVisitors: increment(1),
            },
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        return true;
      }
    } catch (err2) {
      console.warn('[Firestore] Gagal mencatat klik link via query fallback:', err2);
    }
    return false;
  }
};

export const recordMicrositeViewInFirestore = async (slug: string, siteId?: string): Promise<boolean> => {
  if (!isFirebaseConfigured()) return false;
  const db = getFirebaseFirestore();
  if (!db) return false;

  const clean = slug.trim().toLowerCase().replace(/^@/, '');
  if (!clean) return false;

  try {
    const docRef = doc(db, 'microsites', clean);
    await setDoc(
      docRef,
      {
        views: increment(1),
        uniqueVisitors: increment(1),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log(`[Firestore] Sukses mencatat view untuk microsite /@${clean}`);
    return true;
  } catch (error) {
    console.warn('[Firestore] Gagal update view microsite langsung, mencoba query fallback:', error);
    try {
      const q = query(collection(db, 'microsites'), where('slug', '==', clean));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const targetDocRef = snap.docs[0].ref;
        await setDoc(
          targetDocRef,
          {
            views: increment(1),
            uniqueVisitors: increment(1),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        return true;
      }
    } catch (err2) {
      console.warn('[Firestore] Gagal mencatat view microsite via query fallback:', err2);
    }
    return false;
  }
};

export const fetchLinksFromFirestore = async (): Promise<ShortLink[]> => {
  if (!isFirebaseConfigured()) return getStoredLinks();
  const db = getFirebaseFirestore();
  if (!db) return getStoredLinks();

  try {
    const snap = await getDocs(collection(db, 'links'));
    if (snap.empty) {
      saveStoredLinks([]);
      return [];
    }

    const cloudLinks: ShortLink[] = [];
    snap.forEach((d) => {
      cloudLinks.push(d.data() as ShortLink);
    });

    saveStoredLinks(cloudLinks);
    return cloudLinks;
  } catch (error) {
    console.warn('Gagal mengambil links dari Firestore:', error);
    return getStoredLinks();
  }
};

export const subscribeLinksFromFirestore = (
  onLinksUpdate: (links: ShortLink[]) => void
): Unsubscribe | null => {
  if (!isFirebaseConfigured()) return null;
  const db = getFirebaseFirestore();
  if (!db) return null;

  try {
    const linksCol = collection(db, 'links');
    const unsubscribe = onSnapshot(
      linksCol,
      (snap) => {
        const cloudLinks: ShortLink[] = [];
        snap.forEach((docSnap) => {
          cloudLinks.push(docSnap.data() as ShortLink);
        });
        saveStoredLinks(cloudLinks);
        onLinksUpdate(cloudLinks);
      },
      (error) => {
        console.warn('Error pada listener links Firestore:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Gagal menginisialisasi listener Firestore links:', err);
    return null;
  }
};

/**
 * =========================================================================
 * FIRESTORE MICROSITES MANAGEMENT & REAL-TIME SYNC
 * =========================================================================
 */

export interface FirestoreSyncResult {
  success: boolean;
  error?: string;
  code?: string;
}

export const syncMicrositeToFirestore = async (site: Microsite): Promise<FirestoreSyncResult> => {
  if (!isFirebaseConfigured()) {
    return { success: false, error: 'Firebase belum terkonfigurasi pada proyek.' };
  }
  const db = getFirebaseFirestore();
  if (!db) {
    return { success: false, error: 'Koneksi ke Firestore gagal diinisialisasi.' };
  }

  const cleanSlug = (site.slug || '').trim().toLowerCase().replace(/^@/, '');
  if (!cleanSlug) {
    return { success: false, error: 'Slug microsite kosong.' };
  }

  // 1. Optimasi & Kompresi Foto Profil / Sampul jika berupa Base64 besar
  let optimizedProfile = { ...(site.profile || { name: site.title, bio: '', avatarUrl: '', verified: false }) };
  let imageCompressed = false;

  if (typeof window !== 'undefined') {
    if (optimizedProfile.avatarUrl?.startsWith('data:image/') && optimizedProfile.avatarUrl.length > 60000) {
      try {
        const compressed = await compressBase64Image(optimizedProfile.avatarUrl, {
          maxWidth: 400,
          maxHeight: 400,
          quality: 0.85,
        });
        if (compressed && compressed !== optimizedProfile.avatarUrl) {
          optimizedProfile.avatarUrl = compressed;
          imageCompressed = true;
        }
      } catch (err) {
        console.warn('[Firestore] Gagal mengompres avatar:', err);
      }
    }

    if (optimizedProfile.coverUrl?.startsWith('data:image/') && optimizedProfile.coverUrl.length > 60000) {
      try {
        const compressed = await compressBase64Image(optimizedProfile.coverUrl, {
          maxWidth: 1200,
          maxHeight: 600,
          quality: 0.80,
        });
        if (compressed && compressed !== optimizedProfile.coverUrl) {
          optimizedProfile.coverUrl = compressed;
          imageCompressed = true;
        }
      } catch (err) {
        console.warn('[Firestore] Gagal mengompres cover:', err);
      }
    }
  }

  const payload: Microsite = {
    ...site,
    slug: cleanSlug,
    profile: optimizedProfile,
    updatedAt: new Date().toISOString(),
  };

  // Jika ada kompresi gambar, sinkronkan balik ke localStorage agar ringan
  if (imageCompressed && typeof window !== 'undefined') {
    try {
      const all = getStoredMicrosites();
      const updated = all.map((s) => (s.id === site.id || s.slug === cleanSlug ? payload : s));
      saveStoredMicrosites(updated);
    } catch {
      // ignore
    }
  }

  // 2. Sanitasi payload: Hilangkan nilai undefined agar tidak memicu error schema di Firestore
  const safePayload = JSON.parse(JSON.stringify(payload));

  try {
    // Simpan dokumen dengan ID cleanSlug agar pencarian publik cepat & pasti
    const siteRef = doc(db, 'microsites', cleanSlug);
    await setDoc(siteRef, safePayload, { merge: true });
    console.log(`[Firestore] Berhasil menyimpan microsite @${cleanSlug} ke cloud.`);
    return { success: true };
  } catch (error: any) {
    console.warn(`[Firestore] Gagal menyimpan microsite @${cleanSlug}:`, error);
    let message = error?.message || 'Gagal menyimpan ke Firestore.';
    if (error?.code === 'permission-denied' || message.includes('permission')) {
      message = 'Izin ditolak (Permission Denied). Harap perbarui Firestore Rules di Firebase Console agar mengizinkan penulisan.';
    } else if (message.includes('invalid nested entity') || message.includes('INVALID_ARGUMENT')) {
      message = 'Ukuran/format data profile terlalu besar atau tidak didukung Firestore. Sistem telah otomatis mengompres foto profil Anda, silakan coba simpan sekali lagi.';
    }
    return { success: false, error: message, code: error?.code };
  }
};

export const fetchMicrositeBySlug = async (slug: string): Promise<Microsite | null> => {
  if (!slug) return null;
  const cleanSlug = slug.trim().toLowerCase().replace(/^@/, '');
  if (!cleanSlug) return null;

  if (!isFirebaseConfigured()) {
    const all = getStoredMicrosites();
    return all.find((s) => s.slug.toLowerCase() === cleanSlug) || null;
  }

  const db = getFirebaseFirestore();
  if (!db) {
    const all = getStoredMicrosites();
    return all.find((s) => s.slug.toLowerCase() === cleanSlug) || null;
  }

  try {
    // 1. Coba ambil langsung berdasarkan doc ID (karena disimpan dengan id = cleanSlug)
    const docRef = doc(db, 'microsites', cleanSlug);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Microsite;
    }

    // 2. Fallback query jika dokumen lama disimpan dengan ID custom
    const q = query(collection(db, 'microsites'), where('slug', '==', cleanSlug));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return querySnap.docs[0].data() as Microsite;
    }

    return null;
  } catch (error) {
    console.warn('[Firestore] Gagal mengambil microsite dari cloud:', error);
    const all = getStoredMicrosites();
    return all.find((s) => s.slug.toLowerCase() === cleanSlug) || null;
  }
};

export const deleteMicrositeFromFirestore = async (slugOrId: string): Promise<boolean> => {
  if (!isFirebaseConfigured()) return false;
  const db = getFirebaseFirestore();
  if (!db) return false;

  const clean = slugOrId.trim().toLowerCase().replace(/^@/, '');
  try {
    await deleteDoc(doc(db, 'microsites', clean));
    return true;
  } catch (error) {
    console.warn('[Firestore] Gagal menghapus microsite dari Firestore:', error);
    return false;
  }
};

export interface LocalSyncResult {
  total: number;
  synced: number;
  failed: number;
  errors: string[];
}

/**
 * Otomatis menyinkronkan seluruh microsite berstatus PUBLISHED di LocalStorage ke Cloud Firestore
 */
export const syncLocalMicrositesToCloud = async (
  currentUser?: User | null
): Promise<LocalSyncResult> => {
  if (!isFirebaseConfigured()) {
    return { total: 0, synced: 0, failed: 0, errors: ['Firebase belum dikonfigurasi'] };
  }
  const localSites = getStoredMicrosites();
  if (!localSites || localSites.length === 0) {
    return { total: 0, synced: 0, failed: 0, errors: [] };
  }

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const site of localSites) {
    const isOwner =
      !currentUser ||
      !site.ownerId ||
      site.ownerId === currentUser.uid ||
      currentUser.role === 'ADMIN' ||
      currentUser.role === 'SUPER_ADMIN';

    if (site.status === 'PUBLISHED' && isOwner) {
      const res = await syncMicrositeToFirestore(site);
      if (res.success) {
        synced++;
      } else {
        failed++;
        if (res.error && !errors.includes(res.error)) {
          errors.push(res.error);
        }
      }
    }
  }

  return { total: localSites.length, synced, failed, errors };
};

export const fetchMicrositesFromFirestore = async (): Promise<Microsite[]> => {
  if (!isFirebaseConfigured()) return getStoredMicrosites();
  const db = getFirebaseFirestore();
  if (!db) return getStoredMicrosites();

  try {
    const snap = await getDocs(collection(db, 'microsites'));
    if (snap.empty) {
      saveStoredMicrosites([]);
      return [];
    }

    const cloudSites: Microsite[] = [];
    snap.forEach((d) => {
      cloudSites.push(d.data() as Microsite);
    });

    saveStoredMicrosites(cloudSites);
    return cloudSites;
  } catch (error) {
    console.warn('Gagal mengambil microsites dari Firestore:', error);
    return getStoredMicrosites();
  }
};

/**
 * Berlangganan (subscribe) real-time pembaruan seluruh microsite dari Cloud Firestore
 */
export const subscribeMicrositesFromFirestore = (
  onMicrositesUpdate: (sites: Microsite[]) => void
): Unsubscribe | null => {
  if (!isFirebaseConfigured()) return null;
  const db = getFirebaseFirestore();
  if (!db) return null;

  try {
    const sitesCol = collection(db, 'microsites');
    const unsubscribe = onSnapshot(
      sitesCol,
      (snap) => {
        const cloudSites: Microsite[] = [];
        snap.forEach((docSnap) => {
          cloudSites.push(docSnap.data() as Microsite);
        });
        saveStoredMicrosites(cloudSites);
        onMicrositesUpdate(cloudSites);
      },
      (error) => {
        console.warn('Error pada listener microsites Firestore:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Gagal menginisialisasi listener Firestore microsites:', err);
    return null;
  }
};

/**
 * Berlangganan (subscribe) real-time data satu microsite berdasarkan slug untuk halaman publik /@slug
 */
export const subscribeMicrositeBySlug = (
  slug: string,
  onUpdate: (site: Microsite | null) => void
): Unsubscribe | null => {
  if (!slug) {
    onUpdate(null);
    return null;
  }
  const cleanSlug = slug.trim().toLowerCase().replace(/^@/, '');
  if (!cleanSlug) {
    onUpdate(null);
    return null;
  }

  if (!isFirebaseConfigured()) {
    const all = getStoredMicrosites();
    onUpdate(all.find((s) => s.slug.toLowerCase() === cleanSlug) || null);
    return null;
  }

  const db = getFirebaseFirestore();
  if (!db) {
    const all = getStoredMicrosites();
    onUpdate(all.find((s) => s.slug.toLowerCase() === cleanSlug) || null);
    return null;
  }

  try {
    const docRef = doc(db, 'microsites', cleanSlug);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as Microsite);
        } else {
          // Coba fallback query jika dokumen disimpan dengan custom ID
          const q = query(collection(db, 'microsites'), where('slug', '==', cleanSlug));
          getDocs(q)
            .then((querySnap) => {
              if (!querySnap.empty) {
                onUpdate(querySnap.docs[0].data() as Microsite);
              } else {
                onUpdate(null);
              }
            })
            .catch(() => {
              onUpdate(null);
            });
        }
      },
      (error) => {
        console.warn('[Firestore] Error snapshot microsite by slug:', error);
        fetchMicrositeBySlug(cleanSlug).then(onUpdate).catch(() => onUpdate(null));
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Gagal subscribe microsite by slug:', err);
    fetchMicrositeBySlug(cleanSlug).then(onUpdate).catch(() => onUpdate(null));
    return null;
  }
};
