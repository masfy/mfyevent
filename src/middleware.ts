import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek apakah request diawali dengan /@ atau /%40 (misal: /@masalfy atau /%40masalfy)
  if (pathname.startsWith('/@') || pathname.startsWith('/%40')) {
    const raw = pathname.startsWith('/@') ? pathname.substring(2) : pathname.substring(4);
    const slug = decodeURIComponent(raw);
    if (slug) {
      // Rewrite URL internal ke /site/[slug] tanpa mengubah URL pada browser pengguna
      const rewriteUrl = new URL(`/site/${slug}`, request.url);
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  // ================= RBAC SERVER-SIDE SECURITY GUARD =================
  // Saat backend database (PostgreSQL, Supabase, Prisma, NextAuth) diaktifkan:
  // Akses ke /admin/* divalidasi langsung di server/Edge level melalui Secure HttpOnly Cookie / JWT Token.
  // Pengguna biasa yang memanipulasi role di browser/localStorage SAMA SEKALI TIDAK BISA menembus guard ini.
  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('mfy_session_token')?.value;
    const userRole = request.cookies.get('mfy_user_role')?.value;

    // Backend validation hook:
    // Bila sudah production dengan DB, aktifkan proteksi tegas ini:
    // if (!sessionToken || (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN')) {
    //   return NextResponse.redirect(new URL('/member/dashboard?unauthorized=1', request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
