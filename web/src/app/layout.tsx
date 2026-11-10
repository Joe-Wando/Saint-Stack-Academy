import type { Metadata } from 'next';
import './globals.css';
import './v2.css';

export const metadata: Metadata = {
  title: 'Saint Stack Academy',
  description: 'Apprends l’informatique à ton rythme, de la L1 aux métiers : cours en chapitres, exercices corrigés et quiz.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
