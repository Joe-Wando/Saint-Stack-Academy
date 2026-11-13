// Gabarit des diaporamas (porté de diaporamas/reference/gabarit-reference.js) :
// couverture, plan, pages de partie numérotées, pages de contenu, mise en pratique. Format 16:9 (10 × 5,625 pouces).
// Couleurs : celles du SUJET (couleurs.mjs), jamais recolorées sur le logo, qui reste dans sa couleur d'origine.
// Icônes : lucide-static ; logos : simple-icons ; thème défini avec pptxgenjs seulement.
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { texteSur } from './couleurs.mjs';

const exiger = createRequire(import.meta.url);
const pptxgen = exiger('pptxgenjs');
const racine = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dossierPaquet = (nom) => dirname(exiger.resolve(`${nom}/package.json`));

/** Couleurs fixes : textes, fonds, bordures. Les couleurs du sujet viennent s'y ajouter. */
export const FIXE = { fond: 'F6F7F9', texte: '14213D', doux: '5B6475', blanc: 'FFFFFF', bord: 'E3E6EC', gris: 'BFC3CC', code: 'E6EDF7', lien: '1D4ED8' };
const MIN_PT = 10; // aucun texte sous 10 pt

/** Logo de MeredianStack, dans ses couleurs (fond transparent), généré par « npm run icones ». */
const marque = (nom) => `image/png;base64,${readFileSync(join(racine, 'web', 'assets', 'marque', nom)).toString('base64')}`;
const LOGO = { data: marque('logo.png'), ratio: 1269 / 666 };
const EMBLEME = { data: marque('embleme.png'), ratio: 744 / 436 };

// ---------- Images (icônes et logos rendus en PNG, mis en cache) ----------
const cache = new Map();
const png = async (svg, taille = 256) => {
  if (cache.has(svg)) return cache.get(svg);
  const b = await sharp(Buffer.from(svg)).resize(taille, taille, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const data = `image/png;base64,${b.toString('base64')}`;
  cache.set(svg, data);
  return data;
};
/** Icône Lucide (nom kebab-case) dessinée dans `couleur`, trait de 2 px. Repli : book-open. */
export async function icone(nom, couleur) {
  const dossier = join(dossierPaquet('lucide-static'), 'icons');
  const fichier = existsSync(join(dossier, `${nom}.svg`)) ? join(dossier, `${nom}.svg`) : join(dossier, 'book-open.svg');
  const svg = readFileSync(fichier, 'utf8').replace(/currentColor/g, `#${couleur}`).replace(/width="24"/, 'width="256"').replace(/height="24"/, 'height="256"');
  return png(svg, 256);
}
/** Logo simple-icons dans SA COULEUR D'ORIGINE (jamais recoloré). */
export async function logoSujet(nom) {
  const si = exiger('simple-icons');
  const l = Object.values(si).find((x) => x && x.slug === nom);
  if (!l) return null;
  return { data: await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="512" height="512"><path fill="#${l.hex}" d="${l.path}"/></svg>`, 512), hex: l.hex, titre: l.title };
}

/**
 * Crée un diaporama.
 * @param {object} o titre, couleurs { principale, sombre, claire }, logo (nom simple-icons ou null),
 *   iconeSujet (nom Lucide pour les sujets sans logo), libelleSujet.
 */
export function creer({ titre, auteur = 'Olivier DIPO WANDO', couleurs, logo = null, iconeSujet = 'book-open', libelleSujet = '' }) {
  const C = { ...FIXE, ...couleurs };
  const surPrincipale = texteSur(C.principale);
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.theme = { headFontFace: 'Arial', bodyFontFace: 'Arial' };
  pres.title = titre; pres.author = auteur; pres.company = 'MeredianStack';
  const S = pres.shapes;
  let section = 'Ouverture';
  let visuel = null; // logo ou icône du sujet, pour le disque blanc

  pres.defineSlideMaster({
    title: 'CONTENU', background: { color: C.fond },
    objects: [
      { placeholder: { options: { name: 'titre', type: 'title', x: 0.6, y: 0.35, w: 7.4, h: 0.75, fontSize: 26, bold: true, color: C.sombre, align: 'left', valign: 'middle', margin: 0, fit: 'shrink' }, text: '' } },
      // Emblème dans le modèle de page : enregistré une seule fois par fichier, pas une fois par page.
      { image: { x: 0.6, y: 5.0, w: 0.36 * EMBLEME.ratio, h: 0.36, data: EMBLEME.data, altText: 'MeredianStack' } },
    ],
    slideNumber: { x: 9.25, y: 5.2, w: 0.5, h: 0.3, fontSize: MIN_PT, color: 'FFFFFF' },
  });
  pres.defineSlideMaster({
    title: 'SEPARATEUR', background: { color: C.fond },
    objects: [
      { placeholder: { options: { name: 'numero', type: 'body', x: 0.6, y: 0.55, w: 1.05, h: 1.15, fontSize: 40, bold: true, color: surPrincipale, align: 'center', valign: 'middle', margin: 0 }, text: '' } },
      { placeholder: { options: { name: 'titre', type: 'title', x: 0.6, y: 2.05, w: 4.3, h: 1.9, fontSize: 32, bold: true, color: C.sombre, align: 'left', valign: 'middle', margin: 0, fit: 'shrink' }, text: '' } },
    ],
  });
  pres.defineSlideMaster({ title: 'COUVERTURE', background: { color: C.fond }, objects: [] });

  const points = (s, x, y) => { for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) s.addShape(S.OVAL, { x: x + i * 0.13 + (r ? 0 : 0.2), y: y + r * 0.13, w: 0.045, h: 0.045, fill: { color: C.sombre }, line: { type: 'none' } }); };
  const baton = (x, y, w, h, couleur) => ({ x, y, w, h, fill: { color: couleur }, line: { type: 'none' }, rectRadius: h / 2, rotate: 315 });
  const decorCoin = (s) => {
    s.addShape(S.RIGHT_TRIANGLE, { x: 8.15, y: 3.78, w: 1.85, h: 1.85, flipH: true, fill: { color: C.sombre }, line: { type: 'none' }, objectName: 'Coin' });
    s.addShape(S.ROUNDED_RECTANGLE, baton(8.25, 3.6, 1.6, 0.17, C.principale));
    s.addShape(S.ROUNDED_RECTANGLE, baton(8.75, 4.25, 1.3, 0.13, C.gris));
    s.addShape(S.ROUNDED_RECTANGLE, baton(8.5, 4.75, 1.0, 0.05, C.blanc));
    points(s, 1.4, 5.1);
  };
  const decorGrand = async (s) => {
    if (!visuel) {
      const l = logo ? await logoSujet(logo) : null;
      visuel = l ? { data: l.data, alt: `Logo ${libelleSujet || l.titre}` } : { data: await icone(iconeSujet, C.principale), alt: '' };
    }
    s.addShape(S.RIGHT_TRIANGLE, { x: 4.4, y: 0, w: 5.6, h: 5.625, flipH: true, fill: { color: C.sombre }, line: { type: 'none' }, objectName: 'Diagonale' });
    s.addShape(S.ROUNDED_RECTANGLE, baton(5.0, 3.5, 2.6, 0.32, C.principale));
    s.addShape(S.ROUNDED_RECTANGLE, baton(7.1, 1.0, 2.3, 0.32, C.gris));
    s.addShape(S.ROUNDED_RECTANGLE, baton(8.2, 0.25, 1.4, 0.07, C.blanc));
    s.addShape(S.ROUNDED_RECTANGLE, baton(5.9, 4.4, 1.6, 0.07, C.blanc));
    s.addShape(S.OVAL, { x: 5.95, y: 1.15, w: 3.3, h: 3.3, fill: { color: C.blanc }, line: { color: C.claire, width: 6 }, shadow: { type: 'outer', color: '000000', opacity: 0.25, blur: 12, offset: 4, angle: 90 }, objectName: 'Disque' });
    s.addImage({ data: visuel.data, x: 6.3, y: 2.35, w: 0.75, h: 0.75, altText: visuel.alt });
    s.addText(libelleSujet, { x: 7.12, y: 2.35, w: 2.0, h: 0.75, fontSize: libelleSujet.length > 12 ? 14 : 20, bold: true, color: C.texte, valign: 'middle', margin: 0, isTextBox: true, fit: 'shrink' });
    points(s, 1.8, 0.25);
  };

  const api = {
    pres, S, C,
    async couverture(t, sousTitre, role = 'Développeur et data analyst · MeredianStack') {
      pres.addSection({ title: 'Ouverture' });
      const s = pres.addSlide({ masterName: 'COUVERTURE', sectionTitle: 'Ouverture' });
      const tt = t.length > 34 ? 26 : t.length > 24 ? 28 : t.length > 14 ? 34 : 40;
      s.addText(t, { x: 0.6, y: 0.75, w: 4.6, h: 1.1, fontSize: tt, bold: true, color: C.sombre, margin: 0, valign: 'bottom', isTextBox: true, fit: 'shrink' });
      const ts = sousTitre.length > 70 ? 14 : sousTitre.length > 40 ? 16 : 20;
      s.addText(sousTitre, { x: 0.6, y: 1.9, w: 4.6, h: 0.95, fontSize: ts, bold: true, color: C.principale, margin: 0, valign: 'top', isTextBox: true, fit: 'shrink' });
      s.addText([{ text: auteur, options: { fontSize: 15, color: C.texte, breakLine: true } }, { text: role, options: { fontSize: 12, italic: true, color: C.doux } }],
        { x: 0.6, y: 3.0, w: 4.6, h: 0.95, margin: 0, isTextBox: true });
      await decorGrand(s);
      s.addImage({ data: LOGO.data, x: 0.6, y: 4.2, w: 0.9 * LOGO.ratio, h: 0.9, altText: 'Logo MeredianStack : Learn, Code, Build' });
    },
    plan(items) {
      const s = api.contenu('Plan du cours');
      const parCol = Math.ceil(items.length / 2);
      const pas = Math.min(0.92, 3.6 / parCol), cote = Math.min(0.62, pas - 0.1);
      const taille = Math.max(MIN_PT + 1, Math.min(15, Math.round(pas * 17)));
      items.forEach((t, i) => {
        const col = i < parCol ? 0 : 1, row = col ? i - parCol : i;
        const x = col ? 4.3 : 0.6, y = 1.25 + row * pas;
        s.addShape(S.RECTANGLE, { x, y, w: cote, h: cote, fill: { color: C.principale }, line: { type: 'none' } });
        s.addText(String(i + 1).padStart(2, '0'), { x, y, w: cote, h: cote, fontSize: Math.max(MIN_PT + 2, Math.round(cote * 28)), bold: true, color: surPrincipale, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
        s.addText(t, { x: x + cote + 0.15, y, w: 3.55 - cote - 0.15 - 0.05, h: cote, fontSize: taille, bold: true, color: C.texte, valign: 'middle', margin: 0, isTextBox: true, fit: 'shrink' });
      });
    },
    /** « Tes outils » : les logiciels à installer et ceux qui marchent en ligne (content/outils.yaml). */
    outils(principal, enLigne = []) {
      const s = api.contenu('Tes outils');
      const lignes = (titre, liste) => liste.length ? [
        { text: titre, options: { bold: true, fontSize: 15, color: C.sombre, breakLine: true, paraSpaceBefore: 6 } },
        ...liste.flatMap((l, i) => [
          { text: `${l.nom} : `, options: { bold: true, fontSize: 13, color: C.texte, bullet: true } },
          { text: `${l.role}. `, options: { fontSize: 13, color: C.texte } },
          { text: l.site.replace(/^https:\/\//, '').replace(/\/$/, ''), options: { fontSize: 11, color: C.lien, hyperlink: { url: l.site }, breakLine: true } },
        ]),
      ] : [];
      api.texte(s, [...lignes('À installer', principal.slice(0, 4)), ...lignes('Sans installation', enLigne.slice(0, 2))], 0.6, 1.25, 7.4, 3.5, 13);
    },
    async separateur(num, t) {
      section = t.replace(/ \?$/, '').slice(0, 60);
      pres.addSection({ title: section });
      const s = pres.addSlide({ masterName: 'SEPARATEUR', sectionTitle: section });
      s.addShape(S.RECTANGLE, { x: 0.6, y: 0.55, w: 1.05, h: 1.15, fill: { color: C.principale }, line: { type: 'none' }, objectName: 'Pastille numero' });
      s.addText(num, { placeholder: 'numero' });
      s.addText(t, { placeholder: 'titre', fontSize: t.length > 40 ? 24 : t.length > 22 ? 28 : 32 });
      await decorGrand(s);
    },
    contenu(t) {
      const s = pres.addSlide({ masterName: 'CONTENU', sectionTitle: section });
      s.addText(t, { placeholder: 'titre', fontSize: t.length > 55 ? 20 : t.length > 40 ? 22 : 26 });
      decorCoin(s);
      return s;
    },
    async pastille(s, nomIcone, x, y, d = 0.5) {
      s.addShape(S.OVAL, { x, y, w: d, h: d, fill: { color: C.claire }, line: { type: 'none' } });
      s.addImage({ data: await icone(nomIcone, C.principale), x: x + d * 0.22, y: y + d * 0.22, w: d * 0.56, h: d * 0.56 });
    },
    texte(s, contenuTexte, x, y, w, h, taille = 14) {
      s.addText(contenuTexte, { x, y, w, h, fontSize: Math.max(MIN_PT, taille), color: C.texte, valign: 'top', margin: 0, isTextBox: true, paraSpaceAfter: 6, fit: 'shrink' });
    },
    code(s, source, x, y, w, h, { titre = null, taille = 11 } = {}) {
      s.addShape(S.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: C.sombre }, line: { type: 'none' }, rectRadius: 0.1 });
      let yy = y + 0.1;
      if (titre) { s.addText(titre, { x: x + 0.18, y: yy, w: w - 0.3, h: 0.3, fontSize: MIN_PT, bold: true, color: C.gris, margin: 0, isTextBox: true }); yy += 0.3; }
      s.addText(source, { x: x + 0.18, y: yy, w: w - 0.3, h: y + h - yy - 0.08, fontFace: 'Courier New', fontSize: Math.max(11, taille), color: C.code, valign: 'top', margin: 0, isTextBox: true, fit: 'shrink' });
    },
    async cartes(s, items, { x0 = 0.6, y0 = 1.25, cols = 2, w = 3.6, h = 1.5, gx = 0.3, gy = 0.2, tailleT = 14, tailleD = 12 } = {}) {
      for (const [i, [ic, t, d]] of items.entries()) {
        const x = x0 + (i % cols) * (w + gx), y = y0 + Math.floor(i / cols) * (h + gy);
        s.addShape(S.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: C.blanc }, line: { color: C.bord, width: 1 }, rectRadius: 0.1, shadow: { type: 'outer', color: '000000', opacity: 0.08, blur: 6, offset: 2, angle: 90 } });
        await api.pastille(s, ic, x + 0.18, y + 0.18, 0.5);
        s.addText(t, { x: x + 0.82, y: y + 0.18, w: w - 1.0, h: 0.5, fontSize: Math.max(MIN_PT + 1, tailleT), bold: true, color: C.texte, margin: 0, valign: 'middle', isTextBox: true, fit: 'shrink' });
        if (d) s.addText(d, { x: x + 0.18, y: y + 0.76, w: w - 0.36, h: h - 0.86, fontSize: Math.max(MIN_PT, tailleD), color: C.doux, margin: 0, valign: 'top', isTextBox: true, fit: 'shrink' });
      }
    },
    tableau(s, entete, lignes, { x = 0.6, y = 1.25, colW, taille = 12 } = {}) {
      const ent = entete.map((t) => ({ text: t, options: { bold: true, color: texteSur(C.sombre), fill: { color: C.sombre }, align: 'center' } }));
      const rows = [ent, ...lignes.map((l) => l.map((t, j) => ({ text: t, options: { bold: j === 0, color: C.texte, fill: { color: j === 0 ? C.claire : C.blanc }, fontFace: (j === 0 && /^[a-z]/.test(t)) ? 'Courier New' : undefined } })))];
      s.addTable(rows, { x, y, w: colW.reduce((a, b) => a + b, 0), colW, fontSize: Math.max(MIN_PT, taille), valign: 'middle', border: { type: 'solid', pt: 0.75, color: 'C9CED8' }, margin: 0.06 });
    },
    etapes(s, etapes, { y = 1.2 } = {}) {
      const n = etapes.length, w = Math.min(1.6, 7.6 / n - 0.06), pas = 7.75 / n;
      etapes.forEach(([t, d, code], i) => {
        const x = 0.45 + i * pas;
        s.addShape(S.OVAL, { x: x + w / 2 - 0.25, y, w: 0.5, h: 0.5, fill: { color: C.principale }, line: { type: 'none' } });
        s.addText(String(i + 1), { x: x + w / 2 - 0.25, y, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: surPrincipale, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
        if (i < n - 1) s.addShape(S.LINE, { x: x + w / 2 + 0.3, y: y + 0.25, w: pas - 0.6, h: 0, line: { color: C.gris, width: 1.5, dashType: 'dash' } });
        s.addText(t, { x, y: y + 0.6, w, h: 0.55, fontSize: 12, bold: true, color: C.texte, align: 'center', valign: 'top', margin: 0, isTextBox: true, fit: 'shrink' });
        if (d) s.addText(d, { x, y: y + 1.15, w, h: 0.5, fontSize: MIN_PT, color: C.doux, align: 'center', valign: 'top', margin: 0, isTextBox: true, fit: 'shrink' });
        if (code) {
          const yc = y + (d ? 1.7 : 1.2);
          s.addShape(S.ROUNDED_RECTANGLE, { x, y: yc, w, h: 1.25, fill: { color: C.sombre }, line: { type: 'none' }, rectRadius: 0.08 });
          s.addText(code, { x: x + 0.06, y: yc + 0.05, w: w - 0.1, h: 1.15, fontFace: 'Courier New', fontSize: MIN_PT, color: C.code, valign: 'middle', margin: 0, isTextBox: true, fit: 'shrink' });
        }
      });
    },
    async ressources(s, liens, defi) {
      s.addText('Pour aller plus loin :', { x: 0.6, y: 1.2, w: 5, h: 0.4, fontSize: 14, color: C.texte, margin: 0, isTextBox: true });
      for (const [i, [ic, t, d, url]] of liens.slice(0, 4).entries()) {
        const y = 1.75 + i * 0.75;
        await api.pastille(s, ic, 0.6, y, 0.5);
        s.addText([{ text: t, options: { bold: true, fontSize: 13, color: C.texte, breakLine: !!d } },
          ...(d ? [url ? { text: d, options: { fontSize: 11, color: C.lien, hyperlink: { url } } } : { text: d, options: { fontSize: 11, color: C.doux } }] : [])],
        { x: 1.25, y: y - 0.05, w: 4.65, h: 0.62, margin: 0, valign: 'middle', isTextBox: true, fit: 'shrink' });
      }
      if (defi) {
        s.addShape(S.ROUNDED_RECTANGLE, { x: 6.2, y: 1.25, w: 2.9, h: 2.4, fill: { color: C.claire }, line: { type: 'none' }, rectRadius: 0.12 });
        s.addText([{ text: 'Défi', options: { bold: true, fontSize: 15, color: C.sombre, breakLine: true } }, { text: defi, options: { fontSize: 11, color: C.texte } }],
          { x: 6.4, y: 1.4, w: 2.55, h: 2.15, margin: 0, valign: 'top', isTextBox: true, fit: 'shrink' });
      }
    },
    async enregistrer(chemin) {
      await pres.writeFile({ fileName: chemin });
    },
  };
  return api;
}

export { racine };
