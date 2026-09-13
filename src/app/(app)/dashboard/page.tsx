'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, isUserLoggedIn } from '@/lib/storage';

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoggedIn()) {
      router.replace('/login');
      return;
    }
    const user = getStoredUser();
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/member/dashboard');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#5B5BF7] border-t-transparent animate-spin" />
        <p className="text-xs text-slate-500 font-medium animate-pulse">
          Mengarahkan ke dasbor Anda...
        </p>
      </div>
    </div>
  );
}
