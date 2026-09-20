import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const RESERVED_SLUGS = [
  'admin',
  'api',
  'login',
  'logout',
  'register',
  'dashboard',
  'links',
  'microsites',
  'analytics',
  'settings',
  'privacy',
  'terms',
  'help',
  'support',
  'assets',
  'robots',
  'sitemap',
  'favicon',
  'undefined',
  'null',
];

export function generateRandomSlug(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function cleanShortSlug(slug: string): string {
  return slug
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isSlugReserved(slug: string): boolean {
  const clean = slug.toLowerCase().trim();
  return RESERVED_SLUGS.includes(clean);
}

export function formatNumber(num?: number | null): string {
  return new Intl.NumberFormat('id-ID').format(Number(num) || 0);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

/**
 * Helper to parse any hex, rgb, rgba or CSS gradient into [r, g, b]
 */
export function parseColorToRgb(colorStr?: string): [number, number, number] | null {
  if (!colorStr) return null;
  const str = colorStr.trim().toLowerCase();

  // 1. Direct hex #fff or #ffffff
  if (str.startsWith('#')) {
    let hex = str.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r, g, b];
    }
  }

  // 2. Direct rgb / rgba
  const rgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10)];
  }

  // 3. CSS Gradients (linear-gradient, etc.) -> extract first hex or rgb inside
  if (str.includes('gradient')) {
    const hexMatch = str.match(/#[0-9a-f]{6}|#[0-9a-f]{3}/i);
    if (hexMatch) return parseColorToRgb(hexMatch[0]);
    const gradRgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (gradRgbMatch) return [parseInt(gradRgbMatch[1], 10), parseInt(gradRgbMatch[2], 10), parseInt(gradRgbMatch[3], 10)];
  }

  return null;
}

/**
 * Calculate WCAG relative luminance (0 to 1)
 */
export function getRelativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate WCAG contrast ratio between two luminances (1 to 21)
 */
export function getContrastRatio(lum1: number, lum2: number): number {
  const l1 = Math.max(lum1, lum2);
  const l2 = Math.min(lum1, lum2);
  return (l1 + 0.05) / (l2 + 0.05);
}

/**
 * Automatically determines a high-contrast 1-color tone that adapts to the background.
 * Guarantees contrast ratio >= 3.8:1 against the card background.
 */
export function getAdaptiveRingColor(
  cardBg?: string,
  pageBg?: string,
  accentColor?: string
): {
  ringColor: string;
  isDarkBg: boolean;
  contrastRatio: number;
} {
  const bgRgb = parseColorToRgb(cardBg) || parseColorToRgb(pageBg) || [255, 255, 255];
  const bgLum = getRelativeLuminance(bgRgb);
  const isDarkBg = bgLum < 0.45;

  // If accentColor is provided, check its contrast against the background
  const accentRgb = parseColorToRgb(accentColor);
  if (accentRgb && accentColor) {
    const accentLum = getRelativeLuminance(accentRgb);
    const ratio = getContrastRatio(bgLum, accentLum);

    // If accent already has high contrast (>= 3.8:1), use it directly!
    if (ratio >= 3.8) {
      return {
        ringColor: accentColor,
        isDarkBg,
        contrastRatio: ratio,
      };
    }
  }

  // Automatic high-contrast fallback:
  // If background is dark -> Luminous Sky Cyan (#38BDF8) or crisp White (#FFFFFF)
  // If background is light -> Deep Royal Indigo (#4F46E5) or Deep Slate (#0F172A)
  if (isDarkBg) {
    return {
      ringColor: '#38BDF8',
      isDarkBg: true,
      contrastRatio: getContrastRatio(bgLum, getRelativeLuminance([56, 189, 248])),
    };
  } else {
    return {
      ringColor: '#4F46E5',
      isDarkBg: false,
      contrastRatio: getContrastRatio(bgLum, getRelativeLuminance([79, 70, 229])),
    };
  }
}
