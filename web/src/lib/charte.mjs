/* Charte graphique « couleurs UNIPRO », définie ICI SEULEMENT (CHARTE.md § 1).
   Les couleurs sont provisoires : elles seront ajustées quand le logo officiel sera disponible.
   Les variables CSS (--nuit, --bleu…) sont générées à partir de cet objet dans app/layout.tsx ;
   les images de partage, les schémas et les graphiques lisent directement ces valeurs.
   Le site n'affiche ni le nom ni le logo d'UNIPRO. */

export const CHARTE = {
  nuit: '#1B2F52',            // titres, bandeaux sombres, pied de page, blocs de code
  bleu: '#2B4C7E',            // bouton bleu, liens, chiffres clés, icônes
  'bleu-moyen': '#3D6AA8',    // ruban et bandeau L1
  'bleu-clair': '#E8EEF7',    // pastilles d'icône, code en ligne, barres de progression, éléments actifs
  corail: '#C8473A',          // bouton principal, lien actif, trait de l'en-tête, surtitres, progression
  'corail-fonce': '#A93A2F',  // survol du bouton principal
  'corail-clair': '#FCE8E4',  // encadrés « Attention », fond des icônes de certification
  fond: '#F6F8FB',            // fond des pages
  blanc: '#FFFFFF',           // cartes, en-tête, formulaires
  doux: '#4F5F7A',            // descriptions, métadonnées
  bord: '#D9E1EE',            // bordures des cartes, des champs et des puces
  'sur-sombre': '#C9D4E8',    // paragraphes sur bleu nuit
  'corail-sur-sombre': '#F08A7E', // « Academy » et surtitres sur bleu nuit
  'contour-sombre': '#8FA4C8',    // contour du bouton sur fond sombre
  succes: '#1F6B4A', 'succes-fond': '#E3F1EA',
  alerte: '#9A3328', 'alerte-fond': '#FCE8E4',
  'attention-texte': '#6B241C',
};

/** Rubans de niveau (texte blanc, contraste supérieur à 4,5:1). Une option de L3 ajoute un liseré corail. */
export const COULEURS_RUBANS = {
  L1: CHARTE['bleu-moyen'],
  L2: CHARTE.bleu,
  L3: CHARTE.nuit,
  option: CHARTE.nuit,
  horsLicence: CHARTE.nuit,
};

/** Déclarations CSS des variables de la charte, injectées dans <head>. */
export const VARIABLES_CSS = `:root{${Object.entries(CHARTE).map(([k, v]) => `--${k}:${v}`).join(';')}}`;
