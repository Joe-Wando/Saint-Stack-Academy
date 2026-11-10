import type { CSSProperties } from 'react';
import { infoDomaine } from './contenu.mjs';

// Les données et le découpage vivent dans un module pur, partagé avec tools/generer-diaporamas.mjs.
export {
  DOMAINES, ORDRE_DOMAINES, infoDomaine, illustration, chapitres, diapos, blocs, estCorrection,
} from './contenu.mjs';
export type { Domaine, Chapitre, Diapo } from './contenu.mjs';

/** Variables CSS d'un domaine (--dom-fond, --dom-texte, --dom-accent), à poser en `style`. */
export function styleDomaine(nomDomaine: string): CSSProperties {
  const d = infoDomaine(nomDomaine);
  return { '--dom-fond': d.fond, '--dom-texte': d.texte, '--dom-accent': d.accent } as CSSProperties;
}
