import { COULEURS_NIVEAUX } from '@/lib/contenu.mjs';
import { imageGabarit, TAILLE_OG, TYPE_OG } from '@/lib/og';

export const alt = 'Les certifications à viser, niveau par niveau, sur MeredianStack';
export const size = TAILLE_OG;
export const contentType = TYPE_OG;

/** Aucun logo d'organisme ici : ils n'apparaissent que sur les cartes de certification. */
export default function Image() {
  return imageGabarit({
    bandeau: 'Certifications', couleur: COULEURS_NIVEAUX.parcours,
    titre: 'Les certifications à viser, niveau par niveau',
    sousTitre: 'Badges, certificats et certifications', detail: 'De la L1 à la L3, avec l’UE qui y prépare',
  });
}
