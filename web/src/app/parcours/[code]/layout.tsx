import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { metaPartage } from '@/lib/meta';
import { gabaritParcours } from '@/lib/og-donnees';

/** Balises de partage du parcours métier. */
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const p = await gabaritParcours(code);
  return p ? metaPartage({ titre: p.titre, description: p.description, chemin: `/parcours/${code}` }) : {};
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
