import type { ReactNode } from 'react';
import { metaPartage } from '@/lib/meta';

export const metadata = metaPartage({
  titre: 'Certifications',
  description: 'Les badges, certificats et certifications à viser, niveau par niveau, de la L1 à la L3.',
  chemin: '/certifications',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
