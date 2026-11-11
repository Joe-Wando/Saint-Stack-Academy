import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { metaPartage } from '@/lib/meta';
import { coursServeur } from '@/lib/og-donnees';

/** Balises de partage du cours (la page elle-même est un composant client). */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await coursServeur(slug);
  if (!c) return {};
  const description = c.objectifs?.[0] ? `${c.objectifs[0]}` : `Cours de ${c.domaine} sur MeredianStack.`;
  return metaPartage({ titre: c.titre, description, chemin: `/cours/${slug}` });
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
