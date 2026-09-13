'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#5B5BF7] border-t-transparent animate-spin" />
        <p className="text-xs text-slate-500 font-medium animate-pulse">
          Mengarahkan ke Portal Administrasi...
        </p>
      </div>
    </div>
  );
}
