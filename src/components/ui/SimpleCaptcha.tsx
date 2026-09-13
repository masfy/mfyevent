'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, ShieldCheck } from 'lucide-react';

interface SimpleCaptchaProps {
  value: string;
  onChange: (val: string) => void;
  onCodeChange: (code: string) => void;
  isError?: boolean;
}

// Unambiguous character set (no 0/O, 1/I/l to avoid user confusion)
const CHAR_SET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export const SimpleCaptcha: React.FC<SimpleCaptchaProps> = ({
  value,
  onChange,
  onCodeChange,
  isError = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate random 5-character string
  const generateCode = useCallback(() => {
    let result = '';
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * CHAR_SET.length);
      result += CHAR_SET[idx];
    }
    return result;
  }, []);

  // Draw distorted captcha canvas
  const drawCaptcha = useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background fill with subtle gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0F172A');
    bgGrad.addColorStop(1, '#1E1B4B');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Random background noise lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 100 + 100}, ${
        Math.random() * 150 + 100
      }, 255, ${Math.random() * 0.35 + 0.15})`;
      ctx.lineWidth = Math.random() * 1.5 + 0.75;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height
      );
      ctx.stroke();
    }

    // Random background noise dots
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 200 + 55}, ${
        Math.random() * 200 + 55
      }, 255, ${Math.random() * 0.4 + 0.2})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 1.5 + 0.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Colors palette for characters
    const textColors = ['#818CF8', '#38BDF8', '#34D399', '#F472B6', '#FBBF24', '#A78BFA'];

    // Draw each character with random rotation & offset
    const charSpacing = (width - 24) / code.length;
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const x = 16 + i * charSpacing + Math.random() * 4 - 2;
      const y = height / 2 + Math.random() * 6 - 3;
      const rot = (Math.random() * 32 - 16) * (Math.PI / 180);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);

      ctx.font = `bold ${Math.floor(Math.random() * 4 + 20)}px monospace`;
      ctx.fillStyle = textColors[i % textColors.length];
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1.5;
      ctx.shadowOffsetY = 1.5;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }, []);

  const refreshCaptcha = useCallback(() => {
    setIsRefreshing(true);
    const newCode = generateCode();
    setCurrentCode(newCode);
    onCodeChange(newCode);
    onChange('');
    setTimeout(() => {
      drawCaptcha(newCode);
      setIsRefreshing(false);
    }, 150);
  }, [generateCode, drawCaptcha, onCodeChange, onChange]);

  useEffect(() => {
    const code = generateCode();
    setCurrentCode(code);
    onCodeChange(code);
    drawCaptcha(code);
  }, [generateCode, drawCaptcha, onCodeChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#5B5BF7] dark:text-indigo-400" />
          <span>Verifikasi Keamanan (Captcha)</span>
        </label>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">Ketik kode visual</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Distorted Canvas Box */}
        <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner shrink-0 bg-slate-900">
          <canvas
            ref={canvasRef}
            width={140}
            height={42}
            className="block select-none pointer-events-none"
          />
        </div>

        {/* Reload Button */}
        <button
          type="button"
          onClick={refreshCaptcha}
          title="Ganti kode captcha"
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#5B5BF7] dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all cursor-pointer shrink-0"
        >
          <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Input Box */}
        <div className="flex-1 relative">
          <input
            type="text"
            required
            maxLength={5}
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            placeholder="5 Karakter"
            autoComplete="off"
            spellCheck="false"
            className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs font-mono font-bold tracking-widest text-slate-900 dark:text-white placeholder:font-sans placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 focus:outline-hidden transition-all uppercase ${
              isError
                ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 focus:border-rose-500'
                : 'border-slate-200 dark:border-slate-700 focus:border-[#5B5BF7] focus:bg-white dark:focus:bg-slate-900'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
