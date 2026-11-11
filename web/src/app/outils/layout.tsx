import type { ReactNode } from 'react';
import { metaPartage } from '@/lib/meta';

export const metadata = metaPartage({
  titre: 'Installer ses outils',
  description: 'Les logiciels à installer pour suivre les cours, sujet par sujet : sites officiels, consignes, et solutions en ligne.',
  chemin: '/outils',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
