import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'long' | 'square' | 'image';
  showSubtitle?: boolean;
  href?: string;
  className?: string;
  theme?: 'light' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'long',
  showSubtitle = true,
  href = '/',
  className = '',
  theme = 'light',
}) => {
  const squareSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const pixelSizes = {
    sm: 28,
    md: 32,
    lg: 40,
    xl: 48,
  };

  const isDark = theme === 'dark';

  const content = (
    <div className={`flex items-center group select-none ${className}`}>
      {variant === 'square' ? (
        <img
          src="/logo.png"
          alt="MfyEvent"
          width={pixelSizes[size]}
          height={pixelSizes[size]}
          loading="eager"
          decoding="async"
          className={`${squareSizes[size]} object-contain group-hover:scale-105 transition-transform duration-200`}
        />
      ) : (
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="MfyEvent"
            width={pixelSizes[size]}
            height={pixelSizes[size]}
            loading="eager"
            decoding="async"
            className={`${squareSizes[size]} object-contain group-hover:scale-105 transition-transform duration-200`}
          />
          <div className="flex flex-col text-left">
            <div
              className={`flex items-center ${textSizes[size]} font-extrabold tracking-tight leading-none ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <span>Mfy</span>
              <span className="bg-gradient-to-r from-[#5B5BF7] via-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
                Event
              </span>
            </div>
            {showSubtitle && (
              <span
                className={`text-[10px] font-semibold tracking-wider leading-none mt-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                One Link. Every Event.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};
