import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Caveat, Manrope } from 'next/font/google';
import './globals.css';
import './v2.css';
import './complement.css';
import './ambiance.css';

// Polices auto-hébergées par next/font (aucun appel à Google pendant la navigation).
const titres = Bricolage_Grotesque({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--police-titre', display: 'swap' });
const texte = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--police-texte', display: 'swap' });
const main = Caveat({ subsets: ['latin'], weight: ['600', '700'], variable: '--police-main', display: 'swap' });

const DESCRIPTION = 'Apprends l’informatique à ton rythme, de la L1 aux métiers : cours en chapitres, exercices corrigés et quiz.';

export const metadata: Metadata = {
  // Adresse publique du site : les images de partage sont annoncées avec une URL absolue.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Saint Stack Academy', template: '%s · Saint Stack Academy' },
  description: DESCRIPTION,
  openGraph: { title: 'Saint Stack Academy', description: DESCRIPTION, siteName: 'Saint Stack Academy', locale: 'fr_FR', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Saint Stack Academy', description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: '#211F4D' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${titres.variable} ${texte.variable} ${main.variable}`}>
      <body>{children}</body>
    </html>
  );
}
