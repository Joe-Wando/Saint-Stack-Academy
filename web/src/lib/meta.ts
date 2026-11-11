import type { Metadata } from 'next';
import type { Referentiel } from './api';
import { apiServeur } from './og';

/** Balises de partage communes : titre, description, Open Graph et carte Twitter grand format. L'image vient du fichier opengraph-image du segment. */
export function metaPartage({ titre, description, chemin }: { titre: string; description: string; chemin: string }): Metadata {
  return {
    title: titre,
    description,
    alternates: { canonical: chemin },
    openGraph: { title: `${titre} · Saint Stack Academy`, description, url: chemin, siteName: 'Saint Stack Academy', locale: 'fr_FR', type: 'website' },
    twitter: { card: 'summary_large_image', title: `${titre} · Saint Stack Academy`, description },
  };
}

/** Référentiel lu côté serveur (mis en cache une journée). */
export const referentielServeur = () => apiServeur<Referentiel>('/referentiel');
