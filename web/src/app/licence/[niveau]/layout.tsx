import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { metaPartage } from '@/lib/meta';
import { gabaritNiveau } from '@/lib/og-donnees';

/** Balises de partage du niveau de licence. */
export async function generateMetadata({ params }: { params: Promise<{ niveau: string }> }): Promise<Metadata> {
  const { niveau } = await params;
  const n = await gabaritNiveau(niveau);
  return n ? metaPartage({ titre: `${n.bandeau} · ${n.titre}`, description: n.description, chemin: `/licence/${niveau}` }) : {};
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
