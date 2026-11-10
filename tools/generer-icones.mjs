// Génère le favicon et les icônes de l'application à partir du monogramme provisoire (web/src/lib/marque.mjs).
// Usage : npm run icones
//
// Sorties :
//   web/src/app/icon.svg              icône vectorielle de l'onglet
//   web/src/app/favicon.ico           16, 32 et 48 px
//   web/src/app/apple-icon.png        180 × 180, fond opaque
//   web/public/icons/icon-192.png     manifeste
//   web/public/icons/icon-512.png     manifeste
//   web/public/icons/icon-maskable-512.png   manifeste, motif dans la zone de sécurité (cercle de rayon 40 %)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import { Resvg } from '@resvg/resvg-js';
import { MARQUE } from '../web/src/lib/marque.mjs';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const web = join(racine, 'web');
const buf = readFileSync(join(web, 'assets/fonts/bricolage-grotesque-latin-800-normal.woff'));
const police = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

/** Tracé des lettres, centré dans un carré de côté `cote`, hauteur des capitales = `hauteur`. */
function lettres(cote, hauteur) {
  const capitale = (police.tables.os2.sCapHeight || police.unitsPerEm * 0.7) / police.unitsPerEm;
  const taille = hauteur / capitale;
  const espacement = 0.02 * taille; // letter-spacing .02em, comme dans l'en-tête
  // Glyphe par glyphe pour appliquer l'espacement.
  let x = 0;
  const morceaux = [];
  for (const car of MARQUE.lettres) {
    const g = police.charToGlyph(car);
    morceaux.push({ g, x });
    x += (g.advanceWidth / police.unitsPerEm) * taille + espacement;
  }
  const chemins = morceaux.map(({ g, x: gx }) => g.getPath(gx, 0, taille));
  const boites = chemins.map((p) => p.getBoundingBox());
  const x1 = Math.min(...boites.map((b) => b.x1)), x2 = Math.max(...boites.map((b) => b.x2));
  const y1 = Math.min(...boites.map((b) => b.y1)), y2 = Math.max(...boites.map((b) => b.y2));
  const dx = (cote - (x2 - x1)) / 2 - x1, dy = (cote - (y2 - y1)) / 2 - y1;
  const d = morceaux.map(({ g, x: gx }) => g.getPath(gx + dx, dy, taille).toPathData(2)).join('');
  return { d, largeur: x2 - x1 };
}

/** SVG du monogramme. `forme` : 'arrondi' (coins transparents), 'plein' (fond opaque carré), 'masquable'. */
function svg(cote, { forme = 'arrondi', hauteur = MARQUE.lettresHauteur } = {}) {
  let h = hauteur * cote;
  if (forme === 'masquable') {
    // Zone de sécurité : cercle de rayon 40 % du côté. On fait tenir la boîte des lettres dedans.
    const { largeur } = lettres(cote, h);
    const diag = Math.hypot(largeur, h);
    const max = 0.8 * cote * 0.86; // diamètre utile, avec une marge
    if (diag > max) h *= max / diag;
  }
  const { d } = lettres(cote, h);
  const r = forme === 'arrondi' ? (MARQUE.rayon * cote).toFixed(2) : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${cote}" height="${cote}" viewBox="0 0 ${cote} ${cote}">`
    + `<rect width="${cote}" height="${cote}" rx="${r}" fill="${MARQUE.fond}"/>`
    + `<path d="${d}" fill="${MARQUE.texte}"/></svg>`;
}

const png = (code, cote) => new Resvg(code, { fitTo: { mode: 'width', value: cote } }).render().asPng();

/** Fichier .ico contenant des images PNG (format accepté par tous les navigateurs actuels). */
function ico(images) {
  const entete = Buffer.alloc(6 + 16 * images.length);
  entete.writeUInt16LE(0, 0); entete.writeUInt16LE(1, 2); entete.writeUInt16LE(images.length, 4);
  let decalage = entete.length;
  images.forEach(({ cote, data }, i) => {
    const o = 6 + 16 * i;
    entete.writeUInt8(cote >= 256 ? 0 : cote, o); entete.writeUInt8(cote >= 256 ? 0 : cote, o + 1);
    entete.writeUInt8(0, o + 2); entete.writeUInt8(0, o + 3);
    entete.writeUInt16LE(1, o + 4); entete.writeUInt16LE(32, o + 6);
    entete.writeUInt32LE(data.length, o + 8); entete.writeUInt32LE(decalage, o + 12);
    decalage += data.length;
  });
  return Buffer.concat([entete, ...images.map((x) => x.data)]);
}

const ecrire = (chemin, contenu) => { mkdirSync(dirname(chemin), { recursive: true }); writeFileSync(chemin, contenu); console.log('  ', chemin.slice(racine.length + 1), `${(contenu.length / 1024).toFixed(1)} Ko`); };

// Aux petites tailles, les lettres sont un peu agrandies pour rester lisibles.
const petit = { hauteur: 0.4 };
ecrire(join(web, 'src/app/icon.svg'), svg(64));
ecrire(join(web, 'src/app/favicon.ico'), ico([16, 32, 48].map((c) => ({ cote: c, data: png(svg(c, petit), c) }))));
ecrire(join(web, 'src/app/apple-icon.png'), png(svg(180, { forme: 'plein' }), 180));
ecrire(join(web, 'public/icons/icon-192.png'), png(svg(192), 192));
ecrire(join(web, 'public/icons/icon-512.png'), png(svg(512), 512));
ecrire(join(web, 'public/icons/icon-maskable-512.png'), png(svg(512, { forme: 'masquable' }), 512));
