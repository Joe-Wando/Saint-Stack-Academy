import type { ReactNode } from 'react';
import { metaPartage } from '@/lib/meta';

export const metadata = metaPartage({
  titre: 'Marques et logos',
  description: 'Les mentions de marque des technologies et des organismes de certification cités sur MeredianStack.',
  chemin: '/marques',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
