import { User } from '@/types';
import { PRIMARY_ADMIN_EMAIL } from './firebase/config';

/**
 * Batas Kuota Aset MfyEvent:
 * - Akun Admin / Super Admin: UNLIMITED (Tanpa Batas / ∞)
 * - Akun Member Komunitas: 11 Microsite & 127 Short Links
 */
export const QUOTA_LIMITS = {
  MEMBER: {
    MAX_LINKS: 127,
    MAX_MICROSITES: 11,
  },
  ADMIN: {
    MAX_LINKS: Infinity,
    MAX_MICROSITES: Infinity,
  },
} as const;

/**
 * Memeriksa apakah pengguna memiliki hak akses Administrator (Admin / Super Admin)
 */
export const isUserAdmin = (user?: User | null): boolean => {
  if (!user) return false;
  // Jika role pengguna adalah 'USER', maka mutlak merupakan Member (bukan Admin)
  if (user.role === 'USER') {
    return false;
  }
  return (
    user.role === 'ADMIN' ||
    user.role === 'SUPER_ADMIN'
  );
};

export interface UserQuotaSummary {
  isAdmin: boolean;
  maxLinks: number;
  maxMicrosites: number;
  linksCount: number;
  micrositesCount: number;
  canCreateLink: boolean;
  canCreateMicrosite: boolean;
  linksRemaining: number;
  micrositesRemaining: number;
  linksUsageLabel: string;
  micrositesUsageLabel: string;
}

/**
 * Menghitung status kuota tautan dan microsite pengguna
 */
export const getUserQuotaSummary = (
  user?: User | null,
  linksCount = 0,
  micrositesCount = 0
): UserQuotaSummary => {
  const isAdmin = isUserAdmin(user);
  const maxLinks = isAdmin ? QUOTA_LIMITS.ADMIN.MAX_LINKS : QUOTA_LIMITS.MEMBER.MAX_LINKS;
  const maxMicrosites = isAdmin ? QUOTA_LIMITS.ADMIN.MAX_MICROSITES : QUOTA_LIMITS.MEMBER.MAX_MICROSITES;

  const canCreateLink = isAdmin || linksCount < maxLinks;
  const canCreateMicrosite = isAdmin || micrositesCount < maxMicrosites;

  const linksRemaining = isAdmin ? Infinity : Math.max(0, maxLinks - linksCount);
  const micrositesRemaining = isAdmin ? Infinity : Math.max(0, maxMicrosites - micrositesCount);

  const linksUsageLabel = isAdmin ? `${linksCount} / ∞ (Unlimited)` : `${linksCount} / ${maxLinks}`;
  const micrositesUsageLabel = isAdmin ? `${micrositesCount} / ∞ (Unlimited)` : `${micrositesCount} / ${maxMicrosites}`;

  return {
    isAdmin,
    maxLinks,
    maxMicrosites,
    linksCount,
    micrositesCount,
    canCreateLink,
    canCreateMicrosite,
    linksRemaining,
    micrositesRemaining,
    linksUsageLabel,
    micrositesUsageLabel,
  };
};
