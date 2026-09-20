'use client';

import React, { useState, useEffect } from 'react';
import { Microsite, MicrositeBlock, ButtonVariant } from '@/types';
import {
  ExternalLink,
  MessageCircle,
  Clock,
  ChevronDown,
  Globe,
  Share2,
  Check,
  ShieldCheck,
  ArrowLeft,
  QrCode,
} from 'lucide-react';
import { QRCodeModal } from '@/components/qr/QRCodeModal';
import { getAdaptiveRingColor } from '@/lib/utils';

interface PublicMicrositeViewProps {
  microsite: Microsite;
  previewMode?: boolean;
}

export const PublicMicrositeView: React.FC<PublicMicrositeViewProps> = ({
  microsite,
  previewMode = false,
}) => {
  const profile = microsite?.profile || {
    name: microsite?.title || 'Microsite',
    bio: '',
    verified: false,
  };
  const theme = microsite?.theme || {
    id: 'default',
    name: 'Default',
    background: '#FFFFFF',
    font: 'sans',
    primaryColor: '#5B5BF7',
    textColor: '#1E293B',
    subtextColor: '#64748B',
    cardBg: '#F8FAFC',
    cardBorder: '#E2E8F0',
    buttonVariant: 'rounded-xl',
  };
  const blocks = Array.isArray(microsite?.blocks) ? microsite.blocks : [];
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const countdownBlock = blocks.find((b) => b.type === 'COUNTDOWN' && b.visible);

  useEffect(() => {
    if (!countdownBlock?.content?.targetDate) return;
    const target = new Date(countdownBlock.content.targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownBlock]);

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://event.mfytech.my.id/@${microsite.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const socialBlock = blocks.find((b) => b.type === 'SOCIAL' && b.visible);
  const visibleBlocks = blocks
    .filter((b) => b.visible && b.type !== 'SOCIAL')
    .sort((a, b) => a.order - b.order);

  // Social icon mapper with inline SVGs for 100% reliability
  const renderSocialIcon = (platform: string) => {
    switch (platform.toLowerCase().trim()) {
      case 'instagram':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case 'whatsapp':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 0C5.394 0 0 5.394 0 12.031c0 2.115.553 4.179 1.603 5.999L0 24l6.166-1.618a12.003 12.003 0 0 0 5.865 1.52h.005c6.634 0 12.028-5.394 12.028-12.031A12.034 12.034 0 0 0 12.031 0zm0 21.996h-.004a9.98 9.98 0 0 1-5.088-1.39l-.365-.216-3.778.991 1.008-3.684-.237-.378a9.96 9.96 0 0 1-1.528-5.288c0-5.518 4.49-10.008 10.01-10.008 2.673 0 5.185 1.041 7.076 2.932a9.957 9.957 0 0 1 2.93 7.078c0 5.519-4.49 10.008-10.022 10.008zm5.485-7.491c-.3-.15-1.777-.878-2.052-.978-.276-.1-.476-.15-.676.15s-.777.978-.952 1.179c-.176.2-.351.225-.652.075-.3-.15-1.268-.468-2.417-1.493-.893-.797-1.496-1.782-1.672-2.083-.175-.3-.019-.462.131-.612.135-.135.301-.351.451-.526.15-.175.2-.3.301-.5.101-.2.05-.376-.025-.526-.075-.15-.676-1.63-.926-2.232-.244-.587-.492-.507-.676-.516l-.576-.01c-.2 0-.526.075-.801.376s-1.052 1.028-1.052 2.508c0 1.48 1.077 2.909 1.228 3.109.15.2 2.119 3.236 5.134 4.539.717.31 1.277.495 1.713.633.72.229 1.376.197 1.895.12.578-.087 1.777-.726 2.027-1.428.251-.702.251-1.303.176-1.428-.076-.126-.276-.201-.577-.351z"/>
          </svg>
        );
      case 'youtube':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'tiktok':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
        );
      case 'github':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        );
      case 'twitter':
      case 'x':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case 'telegram':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.941z"/>
          </svg>
        );
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  // Social media brand hover configurations
  const getSocialBrand = (platform: string, fallbackColor: string) => {
    switch (platform.toLowerCase().trim()) {
      case 'instagram':
        return {
          name: 'Instagram',
          color: '#E1306C',
          hoverBg: 'rgba(225, 48, 108, 0.12)',
          hoverBorder: 'rgba(225, 48, 108, 0.55)',
          hoverShadow: '0 8px 20px -3px rgba(225, 48, 108, 0.35)',
        };
      case 'whatsapp':
        return {
          name: 'WhatsApp',
          color: '#25D366',
          hoverBg: 'rgba(37, 211, 102, 0.12)',
          hoverBorder: 'rgba(37, 211, 102, 0.55)',
          hoverShadow: '0 8px 20px -3px rgba(37, 211, 102, 0.35)',
        };
      case 'youtube':
        return {
          name: 'YouTube',
          color: '#FF0000',
          hoverBg: 'rgba(255, 0, 0, 0.12)',
          hoverBorder: 'rgba(255, 0, 0, 0.55)',
          hoverShadow: '0 8px 20px -3px rgba(255, 0, 0, 0.35)',
        };
      case 'tiktok':
        return {
          name: 'TikTok',
          color: '#FE2C55',
          hoverBg: 'rgba(254, 44, 85, 0.12)',
          hoverBorder: 'rgba(254, 44, 85, 0.55)',
          hoverShadow: '0 8px 20px -3px rgba(254, 44, 85, 0.35)',
        };
      case 'twitter':
      case 'x':
        return {
          name: 'Twitter / X',
          color: '#1DA1F2',
          hoverBg: 'rgba(29, 161, 242, 0.12)',
          hoverBorder: 'rgba(29, 161, 242, 0.55)',
          hoverShadow: '0 8px 20px -3px rgba(29, 161, 242, 0.35)',
        };
      case 'github':
        return {
          name: 'GitHub',
          color: '#24292F',
          hoverBg: 'rgba(36, 41, 47, 0.12)',
          hoverBorder: 'rgba(36, 41, 47, 0.55)',
          hoverShadow: '0 8px 20px -3px rgba(36, 41, 47, 0.3)',
        };
      case 'linkedin':
        return {
          name: 'LinkedIn',
          color: '#0A66C2',
          hoverBg: 'rgba(10, 102, 194, 0.12)',
          hoverBorder: 'rgba(10, 102, 194, 0.55)',
          hoverShadow: '0 8px 20px -3px rgba(10, 102, 194, 0.35)',
        };
      case 'facebook':
        return {
          name: 'Facebook',
          color: '#1877F2',
          hoverBg: 'rgba(24, 119, 242, 0.12)',
          hoverBorder: 'rgba(24, 119, 242, 0.55)',
          hoverShadow: '0 8px 20px -3px rgba(24, 119, 242, 0.35)',
        };
      case 'telegram':
        return {
          name: 'Telegram',
          color: '#229ED9',
          hoverBg: 'rgba(34, 158, 217, 0.12)',
          hoverBorder: 'rgba(34, 158, 217, 0.55)',
          hoverShadow: '0 8px 20px -3px rgba(34, 158, 217, 0.35)',
        };
      default:
        return {
          name: platform,
          color: fallbackColor,
          hoverBg: `${fallbackColor}18`,
          hoverBorder: `${fallbackColor}60`,
          hoverShadow: `0 8px 20px -3px ${fallbackColor}40`,
        };
    }
  };

  // Interactive Social Link Button with dynamic brand hover colors
  const SocialLinkButton: React.FC<{
    social: { platform: string; url: string };
    cardBg: string;
    accentColor: string;
    previewMode?: boolean;
  }> = ({ social, cardBg, accentColor, previewMode }) => {
    const [isHovered, setIsHovered] = useState(false);
    const brand = getSocialBrand(social.platform, accentColor);

    return (
      <a
        href={previewMode ? '#' : social.url}
        target={previewMode ? undefined : '_blank'}
        rel="noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: isHovered ? brand.hoverBg : cardBg,
          borderColor: isHovered ? brand.hoverBorder : 'rgba(0, 0, 0, 0.08)',
          boxShadow: isHovered
            ? brand.hoverShadow
            : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
        className="w-10 h-10 rounded-full border transition-all duration-200 transform hover:scale-115 active:scale-95 flex items-center justify-center cursor-pointer shadow-xs"
        title={brand.name}
      >
        <div
          className="w-4 h-4 transition-colors duration-200 flex items-center justify-center"
          style={{ color: isHovered ? brand.color : 'currentColor' }}
        >
          {renderSocialIcon(social.platform)}
        </div>
      </a>
    );
  };

  // Button radius class mapping
  const getRadiusClass = (radius: number) => {
    if (radius <= 8) return 'rounded-lg';
    if (radius <= 14) return 'rounded-xl';
    if (radius <= 20) return 'rounded-2xl';
    return 'rounded-full';
  };

  const radiusClass = getRadiusClass(theme.buttonRadius);
  const { ringColor, isDarkBg } = getAdaptiveRingColor(
    theme.cardBg,
    theme.background,
    theme.accentColor
  );
  const cardBgColor = theme.cardBg || (isDarkBg ? '#1E293B' : '#FFFFFF');

  // Helper to determine styling for interactive buttons based on theme.buttonVariant
  const getButtonStylesAndClasses = (customVariant?: ButtonVariant) => {
    const v: ButtonVariant = customVariant || theme.buttonVariant || 'solid';

    switch (v) {
      case 'liquidglass':
        return {
          className: `group relative flex items-center justify-between p-4 ${radiusClass} backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] block overflow-hidden`,
          style: {
            background: isDarkBg
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.38) 100%)',
            backdropFilter: 'blur(20px) saturate(190%)',
            WebkitBackdropFilter: 'blur(20px) saturate(190%)',
            border: isDarkBg
              ? '1px solid rgba(255, 255, 255, 0.22)'
              : '1px solid rgba(255, 255, 255, 0.75)',
            boxShadow: isDarkBg
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)'
              : '0 8px 24px -4px rgba(31, 38, 135, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04), inset 0 1px 2px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.03)',
            color: isDarkBg ? '#FFFFFF' : theme.textColor,
          },
          isLiquidGlass: true,
        };

      case 'neon':
        return {
          className: `group relative flex items-center justify-between p-4 ${radiusClass} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] block overflow-hidden`,
          style: {
            backgroundColor: isDarkBg ? 'rgba(15, 23, 42, 0.85)' : '#FFFFFF',
            border: `1.5px solid ${theme.accentColor}`,
            boxShadow: `0 0 16px -2px ${theme.accentColor}55, inset 0 0 12px -4px ${theme.accentColor}20`,
            color: isDarkBg ? '#FFFFFF' : theme.textColor,
          },
          isLiquidGlass: false,
        };

      case 'brutalist':
        return {
          className: `group relative flex items-center justify-between p-4 ${radiusClass} transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 font-bold block overflow-hidden`,
          style: {
            background: theme.buttonBg && !theme.buttonBg.includes('rgba(255, 255, 255') ? theme.buttonBg : '#FFFFFF',
            border: '2.5px solid #0F172A',
            boxShadow: '4px 4px 0px 0px #0F172A',
            color: theme.buttonTextColor || '#0F172A',
          },
          isLiquidGlass: false,
        };

      case 'clay':
        return {
          className: `group relative flex items-center justify-between p-4 ${radiusClass} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] block overflow-hidden font-semibold`,
          style: {
            background: theme.buttonBg,
            color: theme.buttonTextColor,
            border: '1px solid rgba(255, 255, 255, 0.35)',
            boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.14), inset 0 -3px 4px 0 rgba(0, 0, 0, 0.16), inset 0 3px 4px 0 rgba(255, 255, 255, 0.5)',
          },
          isLiquidGlass: false,
        };

      case 'soft':
        return {
          className: `group relative flex items-center justify-between p-4 ${radiusClass} transition-all duration-200 hover:scale-[1.015] active:scale-[0.985] block overflow-hidden`,
          style: {
            backgroundColor: `${theme.accentColor}18`,
            border: `1px solid ${theme.accentColor}35`,
            color: isDarkBg ? '#FFFFFF' : theme.textColor,
            boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
          },
          isLiquidGlass: false,
        };

      case 'outline':
        return {
          className: `group relative flex items-center justify-between p-4 ${radiusClass} transition-all duration-200 hover:scale-[1.015] active:scale-[0.985] block overflow-hidden`,
          style: {
            backgroundColor: 'transparent',
            border: `1.5px solid ${theme.accentColor || theme.textColor}`,
            color: isDarkBg ? '#FFFFFF' : theme.textColor,
            boxShadow: 'none',
          },
          isLiquidGlass: false,
        };

      case 'glass':
        return {
          className: `group relative flex items-center justify-between p-4 ${radiusClass} backdrop-blur-md transition-all duration-200 hover:scale-[1.015] active:scale-[0.985] block overflow-hidden`,
          style: {
            backgroundColor: isDarkBg ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.45)',
            border: isDarkBg ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.06)',
            color: isDarkBg ? '#FFFFFF' : theme.textColor,
          },
          isLiquidGlass: false,
        };

      case 'solid':
      default:
        return {
          className: `group relative flex items-center justify-between p-4 ${radiusClass} shadow-xs hover:scale-[1.015] active:scale-[0.985] transition-all duration-200 border border-black/5 block overflow-hidden`,
          style: {
            background: theme.buttonBg,
            color: theme.buttonTextColor,
            boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.08)',
          },
          isLiquidGlass: false,
        };
    }
  };

  return (
    <div
      style={{
        background: theme.background,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
      }}
      className="min-h-full w-full pb-10 flex flex-col items-center justify-between transition-colors duration-300"
    >
      {/* ================= HERO HEADER CARD (Sesuai Persis Referensi Gambar Pengguna) ================= */}
      <div
        style={{
          backgroundColor: cardBgColor,
        }}
        className="w-full max-w-lg rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-xl shadow-slate-900/5 border border-black/5 dark:border-white/10 relative mb-6 backdrop-blur-md"
      >
        {/* Top Cover Banner */}
        <div className="relative w-full h-48 sm:h-60 bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <img
            src={
              profile.coverUrl ||
              'https://images.unsplash.com/photo-1562774053-701939374585?w=1000&auto=format&fit=crop&q=80'
            }
            alt="Cover Banner"
            className="w-full h-full object-cover"
          />
          {/* Subtle gradient overlay for control clarity */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />

          {/* Top Bar inside Banner: Back Button (Left) & QR/Share Buttons (Right) */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            {previewMode ? (
              <div className="w-9 h-9 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-sm">
                <ArrowLeft className="w-4 h-4" />
              </div>
            ) : (
              <a
                href="/"
                className="w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md border border-white/40 flex items-center justify-center text-white transition-all shadow-sm hover:scale-105 active:scale-95"
                title="Kembali ke Beranda"
              >
                <ArrowLeft className="w-4 h-4" />
              </a>
            )}

            {/* Right: QR Code & Circular Share Button (Mengikuti warna aksen tunggal otomatis) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Lihat QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleShare}
                style={{ backgroundColor: ringColor }}
                className="w-9 h-9 rounded-full hover:opacity-90 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Bagikan Tautan Halaman"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Center Overlapping Circular Avatar with 1-Color Dynamic Animated Line */}
        <div className="relative -mt-14 sm:-mt-16 flex justify-center z-10">
          <div className="relative group">
            {/* 1-Color Dynamic Animated Line (Menyesuaikan Background Otomatis & Kontras Tinggi) */}
            <div className="absolute -inset-1.5 sm:-inset-2 pointer-events-none">
              {/* Static Base Track in 1 Adaptive Color: 2px subtle outline so the full circle is always crisp */}
              <div
                style={{ borderColor: `${ringColor}35` }}
                className="absolute inset-0 rounded-full border-2"
              />

              {/* Active Rotating 1-Color Story Line (Smooth Vector with Rounded End Caps) */}
              <svg
                className="w-full h-full animate-spin-slow"
                viewBox="0 0 100 100"
                style={{
                  transformOrigin: 'center',
                  filter: `drop-shadow(0 0 6px ${ringColor}80)`,
                }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="80 140"
                />
              </svg>
            </div>

            {/* Inner Gap matching the card background - cleanly frames the photo */}
            <div
              style={{ backgroundColor: cardBgColor }}
              className="relative p-1 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-105"
            >
              <img
                src={
                  profile.avatarUrl ||
                  'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop&q=80'
                }
                alt={profile.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover block"
              />
            </div>

            {/* Verified Badge with matching single accent color */}
            {profile.verified && (
              <div
                style={{ backgroundColor: ringColor }}
                className="absolute bottom-1 right-1 p-1.5 rounded-full text-white shadow-md border-2 border-white flex items-center justify-center z-20"
                title="Profil Terverifikasi Resmi"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>

        {/* Text Content Area */}
        <div className="pt-4 pb-7 px-5 sm:px-8 text-center flex flex-col items-center">
          {/* Main Headline Title (Persis Judul Besar Tebal di Gambar) */}
          <h1 className="text-xl sm:text-2xl lg:text-[25px] font-black tracking-tight leading-snug max-w-md mx-auto">
            {profile.name}
          </h1>

          {/* Subtitle / Bio Description (Persis Keterangan di Gambar) */}
          {profile.bio && (
            <p
              style={{ color: theme.subtextColor }}
              className="text-xs sm:text-sm mt-3 max-w-md mx-auto leading-relaxed font-normal opacity-85"
            >
              {profile.bio}
            </p>
          )}

          {/* Profile Social Media Icons with Dynamic Brand Hover Colors */}
          {socialBlock && socialBlock.content.socials && socialBlock.content.socials.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5 pt-1">
              {socialBlock.content.socials.map((social, idx) => (
                <SocialLinkButton
                  key={idx}
                  social={social}
                  cardBg={cardBgColor}
                  accentColor={ringColor}
                  previewMode={previewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Blocks Container */}
      <div className="w-full max-w-md px-4 sm:px-6 mb-6 space-y-3.5">
        {visibleBlocks.map((block) => {
          switch (block.type) {
            case 'HEADING':
              return (
                <div key={block.id} className="pt-3 pb-1 text-center">
                  <h3 className="text-base sm:text-lg font-bold tracking-tight">
                    {block.content.title}
                  </h3>
                  {block.content.description && (
                    <p style={{ color: theme.subtextColor }} className="text-xs mt-0.5">
                      {block.content.description}
                    </p>
                  )}
                </div>
              );

            case 'LINK':
              const btnConfig = getButtonStylesAndClasses(block.style?.variant);
              return (
                <a
                  key={block.id}
                  href={block.content.url || '#'}
                  target={previewMode ? undefined : '_blank'}
                  rel="noreferrer"
                  style={btnConfig.style}
                  className={btnConfig.className}
                >
                  {/* Glossy top specular reflection line for liquid glass */}
                  {btnConfig.isLiquidGlass && (
                    <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
                  )}
                  <div className="flex-1 text-left truncate pr-3 relative z-10">
                    <p className="text-sm font-semibold truncate leading-tight">
                      {block.content.title}
                    </p>
                    {block.content.description && (
                      <p className="text-xs opacity-80 truncate mt-0.5 font-normal">
                        {block.content.description}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 relative z-10" />
                </a>
              );

            case 'WHATSAPP':
              const waUrl = `https://wa.me/${block.content.phoneNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(
                block.content.prefilledText || ''
              )}`;
              return (
                <a
                  key={block.id}
                  href={previewMode ? '#' : waUrl}
                  target={previewMode ? undefined : '_blank'}
                  rel="noreferrer"
                  className={`flex items-center justify-center gap-2.5 p-4 ${radiusClass} bg-[#25D366] text-white font-semibold text-sm shadow-xs hover:opacity-95 hover:scale-[1.015] active:scale-[0.985] transition-all`}
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>{block.content.title || 'Chat di WhatsApp'}</span>
                </a>
              );

            case 'COUNTDOWN':
              return (
                <div
                  key={block.id}
                  style={{ backgroundColor: theme.cardBg }}
                  className={`p-4 ${radiusClass} border border-black/5 text-center shadow-xs`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5 opacity-80">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{block.content.title || 'Hitung Mundur'}</span>
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <div className="bg-black/5 rounded-lg py-2">
                      <span className="text-lg font-extrabold block">{timeLeft.days}</span>
                      <span className="text-[10px] opacity-70 uppercase">Hari</span>
                    </div>
                    <div className="bg-black/5 rounded-lg py-2">
                      <span className="text-lg font-extrabold block">{timeLeft.hours}</span>
                      <span className="text-[10px] opacity-70 uppercase">Jam</span>
                    </div>
                    <div className="bg-black/5 rounded-lg py-2">
                      <span className="text-lg font-extrabold block">{timeLeft.minutes}</span>
                      <span className="text-[10px] opacity-70 uppercase">Menit</span>
                    </div>
                    <div className="bg-black/5 rounded-lg py-2">
                      <span className="text-lg font-extrabold block">{timeLeft.seconds}</span>
                      <span className="text-[10px] opacity-70 uppercase">Detik</span>
                    </div>
                  </div>
                </div>
              );

            case 'SOCIAL':
              return (
                <div key={block.id} className="flex flex-wrap items-center justify-center gap-2.5 py-2">
                  {block.content.socials?.map((social, idx) => (
                    <SocialLinkButton
                      key={idx}
                      social={social}
                      cardBg={cardBgColor}
                      accentColor={ringColor}
                      previewMode={previewMode}
                    />
                  ))}
                </div>
              );

            case 'TEXT':
              return (
                <div
                  key={block.id}
                  style={{ backgroundColor: theme.cardBg }}
                  className={`p-4 ${radiusClass} text-xs leading-relaxed opacity-90 border border-black/5 shadow-xs`}
                >
                  {block.content.description}
                </div>
              );

            case 'DIVIDER':
              return (
                <div key={block.id} className="py-2 flex items-center justify-center">
                  <div className="w-16 h-0.5 bg-black/10 rounded-full" />
                </div>
              );

            case 'IMAGE':
              return (
                <div
                  key={block.id}
                  style={{ backgroundColor: theme.cardBg }}
                  className={`overflow-hidden ${radiusClass} border border-black/5 shadow-xs`}
                >
                  {block.content.imageUrl ? (
                    <img
                      src={block.content.imageUrl}
                      alt={block.content.title || 'Microsite Media'}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-36 bg-black/5 flex items-center justify-center text-xs opacity-60">
                      Gambar belum diatur
                    </div>
                  )}
                  {block.content.title && (
                    <div className="p-3 text-center">
                      <p className="text-xs font-semibold">{block.content.title}</p>
                      {block.content.description && (
                        <p style={{ color: theme.subtextColor }} className="text-[11px] mt-0.5">
                          {block.content.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );

            case 'FAQ':
              return (
                <div key={block.id} className="space-y-2">
                  {block.content.title && (
                    <h4 className="text-xs font-bold text-center uppercase tracking-wider opacity-80 mb-2">
                      {block.content.title}
                    </h4>
                  )}
                  {block.content.faqs?.map((faq, idx) => {
                    const isOpen = expandedFaq === idx;
                    return (
                      <div
                        key={idx}
                        style={{ backgroundColor: theme.cardBg }}
                        className={`${radiusClass} border border-black/5 overflow-hidden transition-all shadow-xs`}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaq(isOpen ? null : idx)}
                          className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold cursor-pointer"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform opacity-70 shrink-0 ml-2 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div
                            style={{ color: theme.subtextColor }}
                            className="px-3.5 pb-3.5 pt-1 text-xs leading-relaxed border-t border-black/5"
                          >
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );

            default:
              return null;
          }
        })}

        {visibleBlocks.length === 0 && (
          <div className="p-8 text-center text-xs opacity-60">
            Belum ada block yang ditambahkan.
          </div>
        )}
      </div>

      {/* Footer Branding Badge (PRD Section 50) */}
      <footer className="pt-6 pb-2 text-center text-[11px] opacity-80 select-none">
        <a
          href="https://event.mfytech.my.id"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 transition-colors backdrop-blur-xs font-medium"
        >
          <span>Powered by</span>
          <span className="font-bold text-[#5B5BF7]">MfyEvent</span>
          <span className="opacity-50">·</span>
          <span className="opacity-90">MfyTech</span>
        </a>
      </footer>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        slug={`@${microsite.slug}`}
        title={microsite.title}
      />
    </div>
  );
};
