// The root of every page: the Atkinson Hyperlegible font, lang="en", and a
// tiny inline script that applies the saved theme, text size, spacing and
// motion preference before the first paint, so Maya never sees a white flash
// at the wrong size when she set dark mode and large text.
import type { Metadata, Viewport } from 'next';
import { Atkinson_Hyperlegible } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const atkinson = Atkinson_Hyperlegible({
  weight: ['400', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-atkinson',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tide',
  description: 'Plan for the brain you have right now.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F5F0' },
    { media: '(prefers-color-scheme: dark)', color: '#12181C' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// Mirrors applyToDocument() in lib/settings.tsx. Kept as a plain string
// because it has to run before any JavaScript bundle loads.
const PREFS_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem('tide-prefs')||'{}');var r=document.documentElement;var t=p.theme||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)r.classList.add('dark');if(p.textScale)r.style.setProperty('--text-scale',String(p.textScale));r.dataset.spacing=p.extraSpacing?'extra':'normal';r.dataset.reduceMotion=p.reduceMotion?'true':'false';}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={atkinson.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
