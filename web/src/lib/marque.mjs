/* Monogramme PROVISOIRE de Saint Stack Academy, défini ICI SEULEMENT.
   Il sert à l'en-tête, au pied de page, aux pages de connexion, au favicon, aux icônes de l'application
   et aux images de partage. Le jour où le vrai logo arrive : changer ces valeurs (ou ce fichier),
   puis lancer « npm run icones » à la racine pour régénérer les fichiers d'icônes. */

import { CHARTE } from './charte.mjs';

export const MARQUE = {
  nom: 'Saint Stack Academy',
  nomCourt: 'Saint Stack',
  /** Lettres du monogramme. */
  lettres: 'SS',
  /** Fond du carré (bleu nuit de la charte) et couleur des lettres. */
  fond: CHARTE.nuit,
  texte: '#FFFFFF',
  /** Rayon des coins, en proportion du côté (9 px pour 36 px dans l'en-tête). */
  rayon: 9 / 36,
  /** Hauteur des lettres (hauteur des capitales), en proportion du côté. */
  lettresHauteur: 0.31,
  /** Couleurs de l'application installée (manifeste). */
  couleurTheme: CHARTE.nuit,
  couleurFond: CHARTE.fond,
};
