// Génère, à partir du logo de MeredianStack (web/assets/marque/logo-source.png), toutes les images de la marque.
// Usage : npm run icones
//
// Le fond blanc du logo devient transparent ; les couleurs du logo ne sont pas modifiées.
// Sorties :
//   web/assets/marque/logo.png        logo complet (emblème, nom, slogan) : couverture des PowerPoint
//   web/assets/marque/embleme.png     emblème (M et chevrons) : bas des pages des PowerPoint
//   web/assets/marque/m.png           M seul : images de partage
//   web/public/marque/embleme.png     emblème de l'en-tête et des pages de connexion (72 px de haut)
//   web/public/marque/logo.png        logo complet du haut de la page d'accueil (480 px de large)
//   web/src/app/icon.png              icône de l'onglet (M sur carré blanc arrondi)
//   web/src/app/favicon.ico           16, 32 et 48 px
//   web/src/app/apple-icon.png        180 × 180, fond opaque
//   web/public/icons/icon-192.png     manifeste
//   web/public/icons/icon-512.png     manifeste
//   web/public/icons/icon-maskable-512.png   manifeste, motif dans la zone de sécurité (cercle de rayon 40 %)
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { MARQUE } from '../web/src/lib/marque.mjs';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const web = join(racine, 'web');
const source = join(web, 'assets/marque/logo-source.png');

/** Zones du logo source (1536 × 1024), mesurées sur l'image. */
const ZONES = {
  logo: { left: 135, top: 177, width: 1269, height: 666 },
  embleme: { left: 396, top: 177, width: 744, height: 436 },
  m: { left: 561, top: 177, width: 415, height: 436 },
};

/** Fond blanc → transparent : chaque pixel est vu comme un mélange de sa couleur et du blanc. */
async function sansFond(zone) {
  const { data, info } = await sharp(source).extract(zone).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const sortie = Buffer.alloc(info.width * info.height * 4);
  for (let p = 0, q = 0; p < data.length; p += 3, q += 4) {
    const [r, g, b] = [data[p], data[p + 1], data[p + 2]];
    let a = (255 - Math.min(r, g, b)) / 255;
    if (a < 0.03) a = 0;
    const net = (c) => (a ? Math.round(Math.min(255, Math.max(0, (c - 255 * (1 - a)) / a))) : 0);
    sortie[q] = net(r); sortie[q + 1] = net(g); sortie[q + 2] = net(b); sortie[q + 3] = Math.round(a * 255);
  }
  return sharp(sortie, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

const logo = await sansFond(ZONES.logo);
const embleme = await sansFond(ZONES.embleme);
const m = await sansFond(ZONES.m);

/** Carré blanc (coins arrondis ou non), avec le M centré occupant `part` du côté. */
async function tuile(cote, { arrondi = true, part = 0.7 } = {}) {
  const r = arrondi ? MARQUE.rayon * cote : 0;
  const fond = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cote}" height="${cote}"><rect width="${cote}" height="${cote}" rx="${r}" fill="#FFFFFF"/></svg>`);
  const h = Math.round(cote * part);
  const motif = await sharp(m).resize({ height: h, width: h, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const decal = Math.round((cote - h) / 2);
  return sharp(fond).composite([{ input: motif, left: decal, top: decal }]).png().toBuffer();
}

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
const largeur = (img, l) => sharp(img).resize({ width: l }).png({ compressionLevel: 9 }).toBuffer();
const hauteur = (img, h) => sharp(img).resize({ height: h }).png({ compressionLevel: 9 }).toBuffer();

ecrire(join(web, 'assets/marque/logo.png'), await largeur(logo, 600));
ecrire(join(web, 'assets/marque/embleme.png'), await hauteur(embleme, 120));
ecrire(join(web, 'assets/marque/m.png'), await hauteur(m, 240));
ecrire(join(web, 'public/marque/embleme.png'), await hauteur(embleme, 72));
ecrire(join(web, 'public/marque/logo.png'), await largeur(logo, 480));
// Ancienne icône vectorielle du monogramme « MS » : remplacée par icon.png.
if (existsSync(join(web, 'src/app/icon.svg'))) rmSync(join(web, 'src/app/icon.svg'));
ecrire(join(web, 'src/app/icon.png'), await tuile(96));
// Aux petites tailles, le M occupe plus de place pour rester lisible.
ecrire(join(web, 'src/app/favicon.ico'), ico(await Promise.all([16, 32, 48].map(async (c) => ({ cote: c, data: await tuile(c, { part: 0.84 }) })))));
ecrire(join(web, 'src/app/apple-icon.png'), await tuile(180, { arrondi: false }));
ecrire(join(web, 'public/icons/icon-192.png'), await tuile(192));
ecrire(join(web, 'public/icons/icon-512.png'), await tuile(512));
ecrire(join(web, 'public/icons/icon-maskable-512.png'), await tuile(512, { arrondi: false, part: 0.5 }));
