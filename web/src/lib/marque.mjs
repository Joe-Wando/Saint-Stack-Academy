/* Marque MeredianStack, définie ICI SEULEMENT.
   Le logo lui-même est web/assets/marque/logo-source.png : après l'avoir remplacé, lancer « npm run icones »
   à la racine pour régénérer l'emblème de l'en-tête, le favicon, les icônes de l'application et les images
   utilisées par les images de partage et les PowerPoint. */

import { CHARTE } from './charte.mjs';

export const MARQUE = {
  nom: 'MeredianStack',
  nomCourt: 'MeredianStack',
  /** Rayon des coins des icônes (carré blanc arrondi), en proportion du côté. */
  rayon: 9 / 36,
  /** Couleurs de l'application installée (manifeste). */
  couleurTheme: CHARTE.nuit,
  couleurFond: CHARTE.fond,
};
