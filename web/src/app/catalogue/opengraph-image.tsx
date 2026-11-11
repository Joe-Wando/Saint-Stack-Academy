import { COULEURS_NIVEAUX, infoDomaine } from '@/lib/contenu.mjs';
import { apiServeur, imageGabarit, TAILLE_OG, TYPE_OG } from '@/lib/og';

export const alt = 'Le catalogue des cours de Saint Stack Academy, domaine par domaine';
export const size = TAILLE_OG;
export const contentType = TYPE_OG;
// Rendue à la demande (l'API n'est pas joignable pendant la construction) ; la réponse de l'API reste en cache une journée.
export const dynamic = 'force-dynamic';

export default async function Image() {
  const cours = await apiServeur<{ domaine: string }[]>('/cours');
  const domaines = cours ? new Set(cours.map((c) => infoDomaine(c.domaine).cle)).size : 0;
  return imageGabarit({
    bandeau: 'Catalogue', couleur: COULEURS_NIVEAUX.parcours,
    titre: 'Les cours, domaine par domaine',
    sousTitre: cours ? `${cours.length} cours, une notion à la fois` : 'Une notion à la fois',
    detail: domaines ? `${domaines} domaines, de la programmation au cloud` : 'De la programmation au cloud',
  });
}
