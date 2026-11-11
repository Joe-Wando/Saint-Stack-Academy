import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { CHARTE, VARIABLES_CSS } from '@/lib/charte.mjs';
import './globals.css';
import './v2.css';
import './complement.css';
import './ambiance.css';
// Charte « couleurs UNIPRO » : chargée en dernier, elle l'emporte sur les feuilles précédentes.
import './charte.css';

// Polices hébergées avec le site (dossier app/polices, licence SIL OFL 1.1, fichiers @fontsource 5.3.0) :
// aucun téléchargement chez Google, ni pendant la construction ni pendant la navigation.
const titres = localFont({ src: [{ path: './polices/bricolage-grotesque-latin-600-normal.woff2', weight: '600' }, { path: './polices/bricolage-grotesque-latin-800-normal.woff2', weight: '800' }], variable: '--police-titre', display: 'swap' });
const texte = localFont({ src: [{ path: './polices/manrope-latin-400-normal.woff2', weight: '400' }, { path: './polices/manrope-latin-500-normal.woff2', weight: '500' }, { path: './polices/manrope-latin-700-normal.woff2', weight: '700' }], variable: '--police-texte', display: 'swap' });
const code = localFont({ src: [{ path: './polices/jetbrains-mono-latin-400-normal.woff2', weight: '400' }], variable: '--police-code', display: 'swap' });
const main = localFont({ src: [{ path: './polices/caveat-latin-600-normal.woff2', weight: '600' }, { path: './polices/caveat-latin-700-normal.woff2', weight: '700' }], variable: '--police-main', display: 'swap' });

const DESCRIPTION = 'Apprends l’informatique à ton rythme, de la L1 aux métiers : cours en chapitres, exercices corrigés et quiz.';

export const metadata: Metadata = {
  // Adresse publique du site : les images de partage sont annoncées avec une URL absolue.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Saint Stack Academy', template: '%s · Saint Stack Academy' },
  description: DESCRIPTION,
  openGraph: { title: 'Saint Stack Academy', description: DESCRIPTION, siteName: 'Saint Stack Academy', locale: 'fr_FR', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Saint Stack Academy', description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: CHARTE.nuit };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${titres.variable} ${texte.variable} ${code.variable} ${main.variable}`}>
      {/* Variables de la charte, générées depuis lib/charte.mjs (seul endroit où les couleurs sont définies). */}
      <head><style dangerouslySetInnerHTML={{ __html: VARIABLES_CSS }} /></head>
      <body>{children}</body>
    </html>
  );
}
