'use client';

import React, { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/Toast';

export const ClientSecurityGuard: React.FC = () => {
  const { showToast } = useToast();
  const lastToastTimeRef = useRef<number>(0);

  const triggerSecurityWarning = (message: string) => {
    const now = Date.now();
    // Debounce notification so user isn't spammed within 2.5 seconds
    if (now - lastToastTimeRef.current > 2500) {
      lastToastTimeRef.current = now;
      showToast(message, 'warning');
    }
  };

  useEffect(() => {
    // 1. Disable Right Click (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerSecurityWarning('⚠️ Klik kanan dinonaktifkan demi keamanan antarmuka.');
      return false;
    };

    // 2. Disable Developer Tools Shortcuts & View Source
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === 'F12') {
        e.preventDefault();
        triggerSecurityWarning('⚠️ Akses inspeksi elemen (F12) dinonaktifkan.');
        return false;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl+Shift+I or Cmd+Option+I (Inspect Element)
      // Ctrl+Shift+J or Cmd+Option+J (Developer Console)
      // Ctrl+Shift+C or Cmd+Option+C (Element Inspector)
      if (ctrlOrCmd && (e.shiftKey || (isMac && e.altKey))) {
        if (['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k'].includes(e.key)) {
          e.preventDefault();
          triggerSecurityWarning('⚠️ Pintasan alat pengembang dinonaktifkan.');
          return false;
        }
      }

      // Ctrl+U or Cmd+U (View Page Source)
      if (ctrlOrCmd && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        triggerSecurityWarning('⚠️ Akses melihat kode sumber halaman (Ctrl+U) dinonaktifkan.');
        return false;
      }

      // Ctrl+S or Cmd+S (Save Webpage)
      if (ctrlOrCmd && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
};
