// Chemins des illustrations des pages (générées par tools/illustrations-pages.js).
const P = '/illustrations/pages/';

/** Illustration d'un niveau de licence ; en L3, celle de l'option si elle est connue. */
export function illustrationNiveau(code: string, option?: string | null) {
  if (code.toUpperCase() === 'L3' && option) return `${P}option-${option}.svg`;
  return `${P}niveau-${code.toLowerCase()}.svg`;
}

/** Illustration d'un parcours métier. */
export const illustrationParcours = (code: string) => `${P}parcours-${code}.svg`;

/** Une illustration par écran de la visite de bienvenue. */
export const ILLUS_BIENVENUE = ['bienvenue-1-apprendre', 'bienvenue-2-niveau', 'bienvenue-3-certifications', 'bienvenue-4-methode'].map((n) => `${P}${n}.svg`);

export const ILLUS = {
  erreur404: `${P}erreur-404.svg`,
  videCours: `${P}vide-cours.svg`,
  videRecherche: `${P}vide-recherche.svg`,
  videBadges: `${P}vide-badges.svg`,
  contact: `${P}contact.svg`,
  certifications: `${P}certifications.svg`,
};
