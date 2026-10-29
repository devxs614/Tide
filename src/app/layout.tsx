// The root of every page: the fonts (Nunito for headings and buttons,
// Atkinson Hyperlegible for reading, Lexend as an option), lang="en", and a
// tiny inline script that replays the saved theme, text size, font and motion
// level before the first paint, so Maya never sees a flash of the wrong look.
import type { Metadata, Viewport } from 'next';
import { Atkinson_Hyperlegible, Lexend, Nunito } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const atkinson = Atkinson_Hyperlegible({
  weight: ['400', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-atkinson',
  display: 'swap',
});

const nunito = Nunito({
  weight: ['600', '700', '800', '900'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-nunito',
  display: 'swap',
});

// Only some readers pick Lexend, so it isn't preloaded on every visit.
const lexend = Lexend({
  weight: ['400', '600', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-lexend',
  display: 'swap',
  preload: false,
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

// Replays what applyToDocument() in lib/settings.tsx saved last time. Kept as
// a plain string because it has to run before any JavaScript bundle loads.
// v2 saves the exact CSS variables and data attributes; an older v1 mirror
// still gets its light or dark look from the CSS defaults.
const PREFS_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem('tide-prefs')||'{}');var r=document.documentElement;var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(p.v===2&&p.vars){var c=p.alt&&p.alt.dark===m&&p.dark!==m?p.alt:p;for(var k in c.vars)r.style.setProperty(k,c.vars[k]);for(var a in p.attrs)r.dataset[a]=p.attrs[a];if(c.dark)r.classList.add('dark');r.style.colorScheme=c.dark?'dark':'light';return;}var t=p.theme||'system';var d=t==='dark'||(t==='system'&&m);if(d)r.classList.add('dark');if(p.textScale)r.style.setProperty('--text-scale',String(p.textScale));r.dataset.spacing=p.extraSpacing?'extra':'normal';r.dataset.reduceMotion=p.reduceMotion?'true':'false';r.dataset.motion=p.reduceMotion?'off':'calm';}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${atkinson.variable} ${nunito.variable} ${lexend.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
