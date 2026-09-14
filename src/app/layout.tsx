import type { Metadata } from 'next';
import Script from 'next/script';
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#F8FAFC] dark:bg-[#070913] text-slate-900 dark:text-slate-100 selection:bg-[#5B5BF7]/20 selection:text-[#5B5BF7]"
      >
        <Script
          id="mfy-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var saved = localStorage.getItem('mfy_theme');
                if (saved === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                }
              } catch(e) {}

              // Filter & sanitasi atribut ekstensi browser pihak ketiga (Urban VPN, Bitdefender, Bitwarden)
              // seperti bis_skin_checked, bis_register, __processed_* agar tidak memicu React 19 hydration mismatch
              try {
                if (typeof window !== 'undefined') {
                  var isExtAttr = function(name) {
                    return name && (name.indexOf('bis_') === 0 || name.indexOf('__processed_') === 0);
                  };

                  var cleanExtAttrs = function(node) {
                    if (!node || !node.attributes) return;
                    for (var i = node.attributes.length - 1; i >= 0; i--) {
                      var a = node.attributes[i];
                      if (a && isExtAttr(a.name)) {
                        node.removeAttribute(a.name);
                      }
                    }
                  };

                  // Bersihkan elemen yang sudah ada di DOM
                  cleanExtAttrs(document.documentElement);
                  cleanExtAttrs(document.body);

                  // MutationObserver aktif untuk segera membersihkan atribut ekstensi sebelum React hidrasi
                  if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                      for (var m = 0; m < mutations.length; m++) {
                        var mutation = mutations[m];
                        if (mutation.type === 'attributes' && isExtAttr(mutation.attributeName)) {
                          mutation.target.removeAttribute(mutation.attributeName);
                        } else if (mutation.type === 'childList') {
                          for (var c = 0; c < mutation.addedNodes.length; c++) {
                            var child = mutation.addedNodes[c];
                            if (child && child.nodeType === 1) {
                              cleanExtAttrs(child);
                            }
                          }
                        }
                      }
                    });
                    observer.observe(document.documentElement, {
                      attributes: true,
                      subtree: true,
                      childList: true,
                      attributeFilter: ['bis_skin_checked', 'bis_register', 'bis_frame_id']
                    });
                  }

                  // Supresi console.error spesifik jika masih ada sisa warning dari ekstensi pihak ketiga
                  var origErr = console.error;
                  console.error = function() {
                    var msg = arguments[0];
                    if (typeof msg === 'string' && (msg.indexOf('bis_skin_checked') !== -1 || msg.indexOf('bis_register') !== -1 || msg.indexOf('__processed_') !== -1)) {
                      return;
                    }
                    return origErr.apply(this, arguments);
                  };
                }
              } catch(e) {}
            })();`,
          }}
        />
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

