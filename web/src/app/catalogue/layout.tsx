import type { ReactNode } from 'react';
import { metaPartage } from '@/lib/meta';

export const metadata = metaPartage({
  titre: 'Catalogue des cours',
  description: 'Tous les cours, domaine par domaine : programmation, systèmes, DevOps, web, data et plus encore.',
  chemin: '/catalogue',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
