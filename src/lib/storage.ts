'use client';

import { ShortLink, Microsite, User, AbuseReport, AuditLog } from '@/types';
import { INITIAL_LINKS, INITIAL_MICROSITES, INITIAL_USER, INITIAL_USERS_LIST, MOCK_REPORTS, MOCK_AUDIT_LOGS } from './mockData';

const STORAGE_KEYS = {
  LINKS: 'mfy_event_links',
  MICROSITES: 'mfy_event_microsites',
  USER: 'mfy_event_user',
  USERS_LIST: 'mfy_event_users_list',
  REPORTS: 'mfy_event_reports',
  AUDIT: 'mfy_event_audit',
};

const MOCK_CLEANUP_VERSION = 'mfy_auth_clean_v4';

/**
 * Otomatis membersihkan sisa mock data dari LocalStorage peramban
 */
export const checkAndCleanLegacyMockData = () => {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = localStorage.getItem('mfy_mock_data_cleaned');
    if (cleaned !== MOCK_CLEANUP_VERSION) {
      // 1. Bersihkan mock links
      const legacySlugs = ['kkg2026', 'materi-ipas', 'daftar-webinar', 'portofolio-desain', 'evaluasi-ujian'];
      const rawLinks = localStorage.getItem(STORAGE_KEYS.LINKS);
      if (rawLinks) {
        const parsed: ShortLink[] = JSON.parse(rawLinks);
        const filtered = parsed.filter((l) => !legacySlugs.includes(l.slug) && !l.id.startsWith('link_'));
        localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(filtered));
      } else {
        localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify([]));
      }

      // 2. Bersihkan mock microsites
      const legacySites = ['masalfy', 'kkg2026', 'sdn2palapi'];
      const rawSites = localStorage.getItem(STORAGE_KEYS.MICROSITES);
      if (rawSites) {
        const parsed: Microsite[] = JSON.parse(rawSites);
        const filtered = parsed.filter((s) => !legacySites.includes(s.slug) && !s.id.startsWith('ms_'));
        localStorage.setItem(STORAGE_KEYS.MICROSITES, JSON.stringify(filtered));
      } else {
        localStorage.setItem(STORAGE_KEYS.MICROSITES, JSON.stringify([]));
      }

      // 3. Bersihkan laporan pelanggaran & audit log contoh
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify([]));

      // 4. Bersihkan daftar user contoh
      const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      if (rawUsers) {
        const parsed: User[] = JSON.parse(rawUsers);
        const filtered = parsed.filter(
          (u) => u.uid !== 'usr_member_02' && !u.displayName.includes('(Member)') && !u.displayName.includes('Ahmad Fauzi')
        );
        localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(filtered.length > 0 ? filtered : [INITIAL_USER]));
      } else {
        localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify([INITIAL_USER]));
      }

      // 5. Pastikan pengunjung yang belum login TIDAK mendapatkan akses Super Admin otomatis
      const isLoggedIn = localStorage.getItem('mfy_event_logged_in') === 'true';
      if (!isLoggedIn) {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }

      localStorage.setItem('mfy_mock_data_cleaned', MOCK_CLEANUP_VERSION);
    }
  } catch (err) {
    console.warn('Storage cleanup error:', err);
  }
};

export const getStoredLinks = (): ShortLink[] => {
  if (typeof window === 'undefined') return [];
  checkAndCleanLegacyMockData();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LINKS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify([]));
      return [];
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveStoredLinks = (links: ShortLink[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
  window.dispatchEvent(new Event('mfy_storage_update'));
};

export const getStoredMicrosites = (): Microsite[] => {
  if (typeof window === 'undefined') return [];
  checkAndCleanLegacyMockData();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MICROSITES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.MICROSITES, JSON.stringify([]));
      return [];
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveStoredMicrosites = (microsites: Microsite[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.MICROSITES, JSON.stringify(microsites));
  window.dispatchEvent(new Event('mfy_storage_update'));
};

/**
 * Memeriksa apakah user memiliki hak akses Admin
 */
export const checkIsAdmin = (user?: User | null): boolean => {
  if (!user) return false;
  if (user.role === 'USER') return false;
  return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
};

/**
 * Mengambil tautan milik pengguna saat ini (atau semua jika Admin)
 */
export const getUserStoredLinks = (currentUser?: User | null): ShortLink[] => {
  const all = getStoredLinks();
  if (!currentUser) return [];
  if (checkIsAdmin(currentUser)) return all;
  return all.filter((l) => l.ownerId === currentUser.uid);
};

/**
 * Mengambil microsite milik pengguna saat ini (atau semua jika Admin)
 */
export const getUserStoredMicrosites = (currentUser?: User | null): Microsite[] => {
  const all = getStoredMicrosites();
  if (!currentUser) return [];
  if (checkIsAdmin(currentUser)) return all;
  return all.filter((m) => m.ownerId === currentUser.uid);
};

/**
 * Hapus link secara aman dengan verifikasi hak kepemilikan (Tenant Isolation)
 */
export const deleteUserStoredLink = (linkId: string, currentUser?: User | null): boolean => {
  if (typeof window === 'undefined') return false;
  const all = getStoredLinks();
  const target = all.find((l) => l.id === linkId);
  if (!target) return false;
  if (!checkIsAdmin(currentUser) && target.ownerId !== currentUser?.uid) {
    console.warn('Unauthorized delete link attempt:', linkId);
    return false;
  }
  const updated = all.filter((l) => l.id !== linkId);
  saveStoredLinks(updated);
  return true;
};

/**
 * Update status link secara aman dengan verifikasi hak kepemilikan (Tenant Isolation)
 */
export const toggleUserStoredLinkStatus = (linkId: string, currentUser?: User | null): boolean => {
  if (typeof window === 'undefined') return false;
  const all = getStoredLinks();
  const target = all.find((l) => l.id === linkId);
  if (!target) return false;
  if (!checkIsAdmin(currentUser) && target.ownerId !== currentUser?.uid) {
    console.warn('Unauthorized toggle link status attempt:', linkId);
    return false;
  }
  const updated = all.map((l) => {
    if (l.id === linkId) {
      const nextStatus = l.status === 'ACTIVE' ? ('DISABLED' as const) : ('ACTIVE' as const);
      return { ...l, status: nextStatus, updatedAt: new Date().toISOString() };
    }
    return l;
  });
  saveStoredLinks(updated);
  return true;
};

/**
 * Hapus microsite secara aman dengan verifikasi hak kepemilikan (Tenant Isolation)
 */
export const deleteUserStoredMicrosite = (micrositeId: string, currentUser?: User | null): boolean => {
  if (typeof window === 'undefined') return false;
  const all = getStoredMicrosites();
  const target = all.find((m) => m.id === micrositeId);
  if (!target) return false;
  if (!checkIsAdmin(currentUser) && target.ownerId !== currentUser?.uid) {
    console.warn('Unauthorized delete microsite attempt:', micrositeId);
    return false;
  }
  const updated = all.filter((m) => m.id !== micrositeId);
  saveStoredMicrosites(updated);
  return true;
};

export const getStoredUsers = (): User[] => {
  if (typeof window === 'undefined') return INITIAL_USERS_LIST;
  checkAndCleanLegacyMockData();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(INITIAL_USERS_LIST));
      return INITIAL_USERS_LIST;
    }
    const parsed: User[] = JSON.parse(data);
    // De-duplicate: jika sudah ada akun Google asli Mas Alfy, bersihkan template 'usr_alfyarnaim_admin'
    const alfyAccounts = parsed.filter((u) => u.email.toLowerCase() === 'alfyarnaim@gmail.com');
    if (alfyAccounts.length > 1) {
      const cleaned = parsed.filter((u) => u.uid !== 'usr_alfyarnaim_admin');
      localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(cleaned));
      return cleaned;
    }
    return parsed;
  } catch {
    return INITIAL_USERS_LIST;
  }
};

export const saveStoredUsers = (users: User[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
  window.dispatchEvent(new Event('mfy_storage_update'));
};

export const GUEST_USER: User = {
  uid: 'usr_guest',
  email: '',
  emailVerified: false,
  displayName: 'Pengunjung',
  username: 'guest',
  photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  role: 'USER',
  status: 'ACTIVE',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  shortLinksCount: 0,
  micrositesCount: 0,
};

export const getStoredUser = (): User => {
  if (typeof window === 'undefined') return GUEST_USER;
  checkAndCleanLegacyMockData();
  try {
    if (!isUserLoggedIn()) {
      return GUEST_USER;
    }
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) {
      return GUEST_USER;
    }
    const parsed: User = JSON.parse(data);
    // Role protection: only primary admin email can hold SUPER_ADMIN
    if (parsed.role === 'SUPER_ADMIN' && parsed.email.trim().toLowerCase() !== 'alfyarnaim@gmail.com') {
      parsed.role = 'USER';
    }
    return parsed;
  } catch {
    return GUEST_USER;
  }
};

export const saveStoredUser = (user: User) => {
  if (typeof window === 'undefined') return;
  // Security protection: only primary admin email can hold SUPER_ADMIN
  const isPrimaryAdmin = user.email?.trim().toLowerCase() === 'alfyarnaim@gmail.com';
  const safeUser: User = {
    ...user,
    role: isPrimaryAdmin ? user.role : (user.role === 'SUPER_ADMIN' ? 'USER' : user.role),
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));
  // Keep users list in sync
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.uid === safeUser.uid);
  if (idx >= 0) {
    users[idx] = safeUser;
    saveStoredUsers(users);
  }
  window.dispatchEvent(new Event('mfy_storage_update'));
};

export const addStoredUser = (newUser: {
  displayName: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status?: 'ACTIVE' | 'SUSPENDED';
  photoURL?: string;
}): User => {
  const users = getStoredUsers();
  const user: User = {
    uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    displayName: newUser.displayName.trim(),
    email: newUser.email.trim().toLowerCase(),
    emailVerified: true,
    username: newUser.username.trim().toLowerCase().replace(/^@/, ''),
    photoURL:
      newUser.photoURL ||
      `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    role: newUser.role,
    status: newUser.status || 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    shortLinksCount: 0,
    micrositesCount: 0,
  };
  const updated = [user, ...users];
  saveStoredUsers(updated);
  return user;
};

export const updateStoredUser = (uid: string, updates: Partial<User>): User | null => {
  const users = getStoredUsers();
  let updatedUser: User | null = null;
  const updated = users.map((u) => {
    if (u.uid === uid) {
      updatedUser = { ...u, ...updates, updatedAt: new Date().toISOString() };
      return updatedUser;
    }
    return u;
  });
  saveStoredUsers(updated);
  const current = getStoredUser();
  if (current.uid === uid) {
    saveStoredUser({ ...current, ...updates });
  }
  return updatedUser;
};

export const deleteStoredUser = (uid: string) => {
  const users = getStoredUsers();
  const filtered = users.filter((u) => u.uid !== uid);
  saveStoredUsers(filtered);
};

export const switchActiveUser = (uid: string): User => {
  const users = getStoredUsers();
  const target = users.find((u) => u.uid === uid) || INITIAL_USER;
  saveStoredUser(target);
  return target;
};

export const isUserLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('mfy_event_logged_in') === 'true';
};

export const setAuthSession = (loggedIn: boolean) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mfy_event_logged_in', loggedIn ? 'true' : 'false');
  if (!loggedIn) {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('mfy_last_activity');
  } else {
    localStorage.setItem('mfy_last_activity', Date.now().toString());
  }
  window.dispatchEvent(new Event('mfy_storage_update'));
};

/**
 * Memproses login/registrasi sukses dari Google Firebase Auth
 * - Email alfyarnaim@gmail.com secara otomatis & permanen mendapatkan role SUPER_ADMIN
 * - Pengguna umum lainnya langsung berstatus ACTIVE dengan role USER
 */
export const handleGoogleAuthSuccess = (googleUser: {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}): User => {
  const users = getStoredUsers();
  const emailLower = googleUser.email.trim().toLowerCase();
  const isPrimaryAdmin = emailLower === 'alfyarnaim@gmail.com';

  const existingIndex = users.findIndex((u) => u.email.toLowerCase() === emailLower);

  let targetUser: User;

  if (existingIndex >= 0) {
    const existing = users[existingIndex];
    targetUser = {
      ...existing,
      displayName: googleUser.displayName || existing.displayName,
      photoURL: googleUser.photoURL || existing.photoURL,
      role: isPrimaryAdmin ? 'SUPER_ADMIN' : existing.role,
      status: 'ACTIVE',
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users[existingIndex] = targetUser;
    saveStoredUsers(users);
  } else {
    const username =
      emailLower.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user${Date.now().toString().slice(-4)}`;
    targetUser = {
      uid: googleUser.uid || `usr_${Date.now()}`,
      email: emailLower,
      emailVerified: true,
      displayName: googleUser.displayName || emailLower.split('@')[0],
      username: username,
      photoURL:
        googleUser.photoURL ||
        (isPrimaryAdmin
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
      role: isPrimaryAdmin ? 'SUPER_ADMIN' : 'USER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      shortLinksCount: 0,
      micrositesCount: 0,
    };
    users.unshift(targetUser);
    saveStoredUsers(users);
  }

  saveStoredUser(targetUser);
  setAuthSession(true);
  return targetUser;
};

export const toggleUserRole = (_targetRole?: 'USER' | 'SUPER_ADMIN'): User => {
  return getStoredUser();
};


export const getStoredReports = (): AbuseReport[] => {
  if (typeof window === 'undefined') return [];
  checkAndCleanLegacyMockData();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
      return [];
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveStoredReports = (reports: AbuseReport[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  window.dispatchEvent(new Event('mfy_storage_update'));
};

export const getStoredAuditLogs = (): AuditLog[] => {
  if (typeof window === 'undefined') return [];
  checkAndCleanLegacyMockData();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify([]));
      return [];
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const addAuditLog = (action: string, targetType: string, targetId: string, reason: string) => {
  if (typeof window === 'undefined') return;
  const user = getStoredUser();
  const logs = getStoredAuditLogs();
  const newLog: AuditLog = {
    id: `log_${Date.now()}`,
    actorEmail: user.email,
    actorRole: user.role,
    action,
    targetType,
    targetId,
    reason,
    createdAt: new Date().toISOString(),
  };
  const updated = [newLog, ...logs];
  localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(updated));
  window.dispatchEvent(new Event('mfy_storage_update'));
};
