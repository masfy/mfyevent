import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/context/ThemeContext';
import { ClientSecurityGuard } from '@/components/security/ClientSecurityGuard';
import { AutoLogoutGuard } from '@/components/security/AutoLogoutGuard';
import { FirebaseObserver } from '@/components/FirebaseObserver';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MfyEvent — Short Link & Microsite Platform by MfyTech',
  description:
    'Satu tempat untuk short link cepat, QR Code dinamis, dan microsite memukau tanpa coding. Modern, aman, dan dirancang untuk kreator, sekolah, serta event organizer.',
  keywords: ['short link', 'microsite', 'mfytech', 'qr code', 'bio link', 'event organizer', 'pendidikan digital', 'mfyevent'],
  authors: [{ name: 'MfyTech', url: 'https://www.mfytech.my.id' }],
  metadataBase: new URL('https://event.mfytech.my.id'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo.png', sizes: '1080x1080', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'MfyEvent — Short Link & Microsite Platform by MfyTech',
    description: 'Satu tempat untuk short link cepat, QR Code dinamis, dan microsite memukau tanpa coding.',
    url: 'https://event.mfytech.my.id',
    siteName: 'MfyEvent',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MfyEvent Platform by MfyTech',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MfyEvent — Short Link & Microsite Platform by MfyTech',
    description: 'Satu tempat untuk short link cepat, QR Code dinamis, dan microsite memukau tanpa coding.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('mfy_theme');
                if (saved === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] dark:bg-[#070913] text-slate-900 dark:text-slate-100 selection:bg-[#5B5BF7]/20 selection:text-[#5B5BF7] transition-colors duration-200">
        <ThemeProvider>
          <ToastProvider>
            <ClientSecurityGuard />
            <AutoLogoutGuard />
            <FirebaseObserver />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

