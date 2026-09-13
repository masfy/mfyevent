export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  username: string;
  photoURL?: string;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  shortLinksCount: number;
  micrositesCount: number;
}

export interface ShortLink {
  id: string;
  slug: string;
  ownerId: string;
  title: string;
  destinationUrl: string;
  status: 'ACTIVE' | 'DISABLED' | 'EXPIRED' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  metrics: {
    totalClicks: number;
    uniqueVisitors: number;
  };
}

export type BlockType = 
  | 'PROFILE'
  | 'HEADING'
  | 'TEXT'
  | 'LINK'
  | 'IMAGE'
  | 'DIVIDER'
  | 'SOCIAL'
  | 'WHATSAPP'
  | 'COUNTDOWN'
  | 'FAQ';

export interface MicrositeBlock {
  id: string;
  type: BlockType;
  order: number;
  visible: boolean;
  content: {
    title?: string;
    url?: string;
    description?: string;
    imageUrl?: string;
    buttonText?: string;
    level?: 'h1' | 'h2' | 'h3';
    phoneNumber?: string;
    prefilledText?: string;
    targetDate?: string;
    faqs?: Array<{ question: string; answer: string }>;
    socials?: Array<{ platform: 'instagram' | 'whatsapp' | 'youtube' | 'tiktok' | 'twitter' | 'github' | 'linkedin'; url: string }>;
  };
  style?: {
    variant?: ButtonVariant;
    textColor?: string;
    bgColor?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type PrebuiltThemeId = 
  | 'minimal-light'
  | 'midnight-obsidian'
  | 'ocean-cyan'
  | 'lavender-glow'
  | 'warm-sunset'
  | 'monochrome-slate'
  | 'pastel-sage'
  | 'pastel-butter'
  | 'pastel-sky'
  | 'pastel-lilac'
  | 'pastel-peach'
  | 'grad-sunset'
  | 'grad-aurora'
  | 'grad-cosmic'
  | 'grad-ocean'
  | 'grad-amber'
  | string;

export type ButtonVariant = 
  | 'solid' 
  | 'soft' 
  | 'outline' 
  | 'glass' 
  | 'liquidglass' 
  | 'neon' 
  | 'brutalist' 
  | 'clay';

export interface MicrositeTheme {
  id: PrebuiltThemeId;
  name: string;
  backgroundType: 'solid' | 'gradient' | 'mesh';
  background: string;
  cardBg: string;
  textColor: string;
  subtextColor: string;
  accentColor: string;
  fontFamily: string;
  buttonVariant: ButtonVariant;
  buttonRadius: number; // 8, 12, 16, 24, 9999
  buttonBg: string;
  buttonTextColor: string;
}

export interface MicrositeProfile {
  name: string;
  bio: string;
  avatarUrl: string;
  verified: boolean;
  coverUrl?: string;
  category?: string;
}

export interface MicrositeSEO {
  metaTitle: string;
  metaDescription: string;
  ogImage?: string;
}

export interface Microsite {
  id: string;
  ownerId: string;
  slug: string;
  title: string;
  status: 'PUBLISHED' | 'DRAFT' | 'SUSPENDED';
  profile: MicrositeProfile;
  theme: MicrositeTheme;
  seo: MicrositeSEO;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views: number;
  uniqueVisitors: number;
  blocks: MicrositeBlock[];
}

export interface AnalyticsRecord {
  date: string;
  clicks: number;
  visitors: number;
}

export interface DeviceStat {
  device: string;
  percentage: number;
  count: number;
}

export interface ReferrerStat {
  source: string;
  count: number;
  percentage: number;
}

export interface CountryStat {
  country: string;
  code: string;
  count: number;
}

export interface AbuseReport {
  id: string;
  targetType: 'SHORT_LINK' | 'MICROSITE';
  targetId: string;
  targetSlug: string;
  reason: 'Phishing' | 'Malware' | 'Spam' | 'Scam' | 'Impersonation' | 'Inappropriate Content' | 'Other';
  description: string;
  status: 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  createdAt: string;
}
