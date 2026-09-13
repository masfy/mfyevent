'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Modal } from '@/components/ui/Modal';
import { Download, Copy, Check, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  title: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  slug,
  title,
}) => {
  const { showToast } = useToast();
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fullUrl = `https://event.mfytech.my.id/${slug}`;

  useEffect(() => {
    if (!isOpen || !slug) return;

    QRCode.toDataURL(fullUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        setDataUrl(url);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [isOpen, slug, fullUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    showToast('Tautan berhasil disalin! 🎉');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `mfy-event-qr-${slug}.png`;
    a.click();
    showToast('QR Code PNG berhasil diunduh');
  };

  const handleDownloadSVG = async () => {
    try {
      const svgString = await QRCode.toString(fullUrl, {
        type: 'svg',
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mfy-event-qr-${slug}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('QR Code SVG vektor berhasil diunduh');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="QR Code Tautan"
      description={`Kode QR dinamis untuk ${title}`}
      maxWidth="sm"
    >
      <div className="flex flex-col items-center">
        {/* QR Canvas Card */}
        <div className="relative p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col items-center">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt={`QR Code untuk ${slug}`}
              className="w-56 h-56 rounded-lg object-contain"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center skeleton-shimmer rounded-lg" />
          )}

          {/* MFY Official Logo Center Accent Badge */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white p-1 rounded-xl shadow-md border border-slate-200 flex items-center justify-center pointer-events-none">
            <img
              src="/logo.png"
              alt="MfyEvent"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs font-semibold text-slate-800">event.mfytech.my.id/{slug}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Scan untuk membuka tujuan otomatis</p>
          </div>
        </div>

        {/* Link preview & Copy */}
        <div className="w-full mt-4 flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <span className="truncate text-slate-600 font-mono pr-2">{fullUrl}</span>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>

        {/* Download Buttons */}
        <div className="w-full grid grid-cols-2 gap-2.5 mt-4">
          <button
            onClick={handleDownloadPNG}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handleDownloadSVG}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download SVG</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
