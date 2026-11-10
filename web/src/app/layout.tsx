import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saint Stack Academy',
  description: 'Cours, programme et suivi de progression du groupe Saint Stack.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
