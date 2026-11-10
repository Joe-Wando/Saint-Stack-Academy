/* Monogramme PROVISOIRE de Saint Stack Academy, défini ICI SEULEMENT.
   Il sert à l'en-tête, au pied de page, aux pages de connexion, au favicon, aux icônes de l'application
   et aux images de partage. Le jour où le vrai logo arrive : changer ces valeurs (ou ce fichier),
   puis lancer « npm run icones » à la racine pour régénérer les fichiers d'icônes. */

export const MARQUE = {
  nom: 'Saint Stack Academy',
  nomCourt: 'Saint Stack',
  /** Lettres du monogramme. */
  lettres: 'SS',
  /** Fond du carré (violet Saint Stack) et couleur des lettres. */
  fond: '#534AB7',
  texte: '#FFFFFF',
  /** Rayon des coins, en proportion du côté (12 px pour 34 px dans l'en-tête). */
  rayon: 12 / 34,
  /** Hauteur des lettres (hauteur des capitales), en proportion du côté. */
  lettresHauteur: 0.31,
  /** Couleurs de l'application installée (manifeste). */
  couleurTheme: '#211F4D',
  couleurFond: '#F7F7FA',
};
