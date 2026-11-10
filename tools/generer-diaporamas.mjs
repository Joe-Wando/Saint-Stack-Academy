// Génère un PowerPoint 16:9 par cours : web/public/diaporamas/<slug>.pptx
// Utilisation : npm run diaporamas            (les 63 cours)
//               node tools/generer-diaporamas.mjs g01-1-terminal-linux s04-2-sql-fenetres-cte
//               node tools/generer-diaporamas.mjs --apercu <dossier> <slug…>   (aperçus PNG de la mise en page)
//
// Les diapositives sont celles du mode présentation : même plan, mêmes fonctions de découpage
// (web/src/lib/contenu.mjs). Le texte est mesuré avec les métriques réelles de Calibri et Consolas
// quand ces polices sont installées ; un bloc qui ne tient pas passe sur une diapositive « (suite) ».
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import matter from 'gray-matter';
import PptxGenJS from 'pptxgenjs';
import { Resvg } from '@resvg/resvg-js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { plan, infoDomaine } = await import(pathToFileURL(path.join(RACINE, 'web/src/lib/contenu.mjs')).href);
const COURS = path.join(RACINE, 'content/lessons');
const SORTIE = path.join(RACINE, 'web/public/diaporamas');
const ILLUS = path.join(RACINE, 'web/public/illustrations');

const AUTEUR = 'Olivier Jonathan DIPO WANDO';
const PISTES = { groupe: 'Séance de groupe', solo: 'Parcours solo', complement: 'Complément' };
const LETTRES = ['A', 'B', 'C', 'D', 'E', 'F'];

// ---------------------------------------------------------------------------
// Gabarit (pouces ; diapositive LAYOUT_WIDE de 13,333 × 7,5)
// ---------------------------------------------------------------------------
const W = 13.333, H = 7.5, MX = 0.6, CW = W - 2 * MX;
const BAS = 6.72;                 // limite basse du contenu (le pied commence en dessous)
const C = { texte: '1D1B2E', doux: '5F5E6E', pied: '8C8A9E', ligne: 'E6E5EE', gris: 'F1F0F5', code: '1D1B2E', codeTxt: 'EDEBFA', violet: '534AB7', violetClair: 'EEEDFE' };
const T = { titre: 30, sur: 12, corps: 16, code: 12, table: 12, pied: 10 };
const INTERLIGNE = 1.2;           // interligne fixé explicitement (lineSpacing en points)
const SECU = 1.07;                // marge de sécurité sur les largeurs mesurées
const pt2in = (p) => p / 72;
const hauteurLignes = (n, taille) => pt2in(n * taille * INTERLIGNE);
const hex = (c) => c.replace('#', '').toUpperCase();

// ---------------------------------------------------------------------------
// Mesure du texte : métriques réelles si les polices Windows sont présentes
// ---------------------------------------------------------------------------
const polices = {};
try {
  const opentype = (await import('opentype.js')).default;
  const dossier = process.env.WINDIR ? path.join(process.env.WINDIR, 'Fonts') : '/usr/share/fonts';
  for (const [cle, fichier] of [['calibri', 'calibri.ttf'], ['calibrib', 'calibrib.ttf'], ['consolas', 'consola.ttf']]) {
    const f = path.join(dossier, fichier);
    if (fs.existsSync(f)) polices[cle] = opentype.parse(fs.readFileSync(f).buffer);
  }
} catch { /* estimation par caractère */ }

function largeurPt(texte, police, taille) {
  const f = polices[police];
  if (f) return f.getAdvanceWidth(texte, taille) * SECU;
  return texte.length * taille * (police === 'consolas' ? 0.55 : police === 'calibrib' ? 0.53 : 0.5);
}

/** Coupe un texte en lignes qui tiennent dans `largeurIn` pouces. */
function couper(texte, largeurIn, taille, police = 'calibri') {
  const max = largeurIn * 72;
  const lignes = [];
  for (const brut of texte.split('\n')) {
    if (police === 'consolas') {               // code : coupe au caractère, espaces conservés
      let reste = brut;
      if (!reste) { lignes.push(''); continue; }
      const parLigne = Math.max(1, Math.floor(max / largeurPt('M', police, taille)));
      while (reste.length > parLigne) { lignes.push(reste.slice(0, parLigne)); reste = reste.slice(parLigne); }
      lignes.push(reste);
      continue;
    }
    let ligne = '';
    for (const mot of brut.split(/\s+/).filter(Boolean)) {
      const essai = ligne ? `${ligne} ${mot}` : mot;
      if (largeurPt(essai, police, taille) <= max) { ligne = essai; continue; }
      if (ligne) lignes.push(ligne);
      let m = mot;                               // mot plus long que la ligne : coupe au caractère
      while (largeurPt(m, police, taille) > max && m.length > 1) {
        let k = m.length;
        while (k > 1 && largeurPt(m.slice(0, k), police, taille) > max) k--;
        lignes.push(m.slice(0, k)); m = m.slice(k);
      }
      ligne = m;
    }
    lignes.push(ligne);
  }
  return lignes;
}

// ---------------------------------------------------------------------------
// Markdown en ligne → segments { text, bold } ; aucun emoji
// ---------------------------------------------------------------------------
const nettoyer = (s) => (typeof s === 'string' ? s : Object.entries(s ?? {}).map(([k, v]) => `${k} : ${v}`).join(' ') || String(s ?? ''))
  .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}️‍⃣]/gu, '')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/<br\s*\/?>/gi, ' ');

function enLigne(md) {
  let s = nettoyer(md)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<\/?[a-z][^>]*>/gi, '');
  const segs = [];
  for (const morceau of s.split(/(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__)/)) {
    if (!morceau) continue;
    if (/^`[^`]+`$/.test(morceau)) segs.push({ text: morceau.slice(1, -1), bold: false });
    else if (/^(\*\*|__)/.test(morceau) && morceau.length > 4) segs.push({ text: morceau.slice(2, -2), bold: true });
    else segs.push({ text: morceau.replace(/(^|[^\w*])\*([^*\n]+)\*(?!\w)/g, '$1$2').replace(/(^|\s)_([^_\n]+)_(?=\s|$|[.,;:!?)])/g, '$1$2').replace(/\\([\\`*_{}[\]()#+\-.!|>])/g, '$1'), bold: false });
  }
  // fusionne les segments voisins de même graisse
  return segs.reduce((acc, x) => {
    const der = acc[acc.length - 1];
    if (der && der.bold === x.bold) der.text += x.text; else acc.push({ ...x });
    return acc;
  }, []);
}
const texteSimple = (md) => enLigne(md).map((x) => x.text).join('');

// ---------------------------------------------------------------------------
// Blocs Markdown → éléments mesurés. Chaque élément sait se couper en deux s'il est trop grand.
// ---------------------------------------------------------------------------
function analyser(bloc) {
  const lignes = bloc.split('\n');
  if (/^\s*(```|~~~)/.test(lignes[0])) {
    const fin = lignes.length > 1 && /^\s*(```|~~~)/.test(lignes[lignes.length - 1]) ? -1 : undefined;
    return [{ type: 'code', lignes: lignes.slice(1, fin).map((l) => nettoyer(l).replace(/\t/g, '    ')) }];
  }
  const res = [];
  let i = 0;
  while (i < lignes.length) {
    const l = lignes[i];
    if (/^\s*\|/.test(l)) {
      const t = [];
      while (i < lignes.length && /^\s*\|/.test(lignes[i])) t.push(lignes[i++]);
      const rangs = t.filter((x) => !/^\s*\|?\s*:?-{2,}/.test(x))
        .map((x) => x.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((c) => texteSimple(c.trim().replace(/\\\|/g, '|'))));
      if (rangs.length) res.push({ type: 'table', entete: rangs[0], rangs: rangs.slice(1) });
    } else if (/^\s*>/.test(l)) {
      const q = [];
      while (i < lignes.length && /^\s*>/.test(lignes[i])) q.push(lignes[i++].replace(/^\s*>\s?/, ''));
      res.push({ type: 'citation', segs: enLigne(q.join(' ').replace(/\s+/g, ' ').trim()) });
    } else if (/^\s*([-*+]|\d+[.)])\s+/.test(l)) {
      const items = [];
      while (i < lignes.length && (/^\s*([-*+]|\d+[.)])\s+/.test(lignes[i]) || (/^\s{2,}\S/.test(lignes[i]) && items.length))) {
        const x = lignes[i++];
        const m = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(x);
        if (m) items.push({ niveau: Math.min(Math.floor(m[1].replace(/\t/g, '  ').length / 2), 2), ordonne: /\d/.test(m[2]), num: parseInt(m[2], 10) || 0, md: m[3].replace(/^\[[ xX]\]\s*/, '') });
        else items[items.length - 1].md += ' ' + x.trim();
      }
      res.push({ type: 'liste', items: items.map((it) => ({ ...it, segs: enLigne(it.md) })) });
    } else if (/^#{3,6}\s/.test(l)) {
      res.push({ type: 'intertitre', segs: enLigne(l.replace(/^#+\s*/, '')) }); i++;
    } else if (/^\s*([-*_])\s*\1\s*\1[\s\1]*$/.test(l)) {
      i++;                                       // filet horizontal : ignoré
    } else {
      const p = [];
      while (i < lignes.length && lignes[i].trim() && !/^\s*(\||>|[-*+]\s|\d+[.)]\s|#{3,6}\s)/.test(lignes[i])) p.push(lignes[i++].trim());
      if (!p.length) { i++; continue; }
      res.push({ type: 'paragraphe', segs: enLigne(p.join(' ')) });
    }
  }
  return res.filter((e) => e.type === 'code' || e.type === 'table' || (e.segs ?? e.items ?? []).length);
}

const segsTexte = (segs) => segs.map((s) => s.text).join('');
const ESP = { paragraphe: 0.12, liste: 0.12, code: 0.16, table: 0.16, citation: 0.16, intertitre: 0.04 };
const RETRAIT = 0.32;             // retrait d'une puce par niveau

function mesurer(e) {
  switch (e.type) {
    case 'paragraphe': {
      e.n = couper(segsTexte(e.segs), CW, T.corps).length;
      return hauteurLignes(e.n, T.corps);
    }
    case 'intertitre': {
      e.n = couper(segsTexte(e.segs), CW, 18, 'calibrib').length;
      return hauteurLignes(e.n, 18);
    }
    case 'citation': {
      e.n = couper(segsTexte(e.segs), CW - 0.55, T.corps).length;
      return hauteurLignes(e.n, T.corps) + 0.24;
    }
    case 'liste': {
      e.hItems = e.items.map((it) => hauteurLignes(couper(segsTexte(it.segs), CW - RETRAIT * (it.niveau + 1), T.corps).length, T.corps) + 0.04);
      return e.hItems.reduce((a, b) => a + b, 0);
    }
    case 'code': {
      e.vis = e.lignes.flatMap((l) => couper(l, CW - 0.4, T.code, 'consolas'));
      return hauteurLignes(e.vis.length, T.code) + 0.26;
    }
    case 'table': {
      const nb = Math.max(e.entete.length, ...e.rangs.map((r) => r.length));
      const tous = [e.entete, ...e.rangs].map((r) => Array.from({ length: nb }, (_, k) => r[k] ?? ''));
      e.entete = tous[0]; e.rangs = tous.slice(1);
      // largeurs de colonnes proportionnelles au contenu, bornées
      const poids = Array.from({ length: nb }, (_, k) => Math.min(Math.max(...tous.map((r) => largeurPt(r[k], 'calibri', T.table))) + 14, 360));
      const total = poids.reduce((a, b) => a + b, 0) || 1;
      e.colW = poids.map((p) => Math.max(0.9, (p / total) * CW));
      const k = CW / e.colW.reduce((a, b) => a + b, 0);
      e.colW = e.colW.map((w) => w * k);
      const hRang = (r, police) => Math.max(...r.map((c, j) => couper(c || ' ', e.colW[j] - 0.22, T.table, police).length)) * T.table * INTERLIGNE / 72 + 0.14;
      e.hRangs = [hRang(e.entete, 'calibrib'), ...e.rangs.map((r) => hRang(r, 'calibri'))];
      return e.hRangs.reduce((a, b) => a + b, 0);
    }
  }
  return 0;
}

/** Coupe un élément pour que la première partie tienne dans `dispo` pouces. Renvoie [tete, reste] ou null. */
function scinder(e, dispo) {
  if (e.type === 'code') {
    const n = Math.floor((dispo - 0.26) * 72 / (T.code * INTERLIGNE));
    if (n < 3) return null;
    return [{ type: 'code', lignes: e.vis.slice(0, n) }, { type: 'code', lignes: e.vis.slice(n) }];
  }
  if (e.type === 'table') {
    let h = e.hRangs[0], n = 0;
    while (n < e.rangs.length && h + e.hRangs[n + 1] <= dispo) h += e.hRangs[++n];
    if (n < 1) return null;
    return [{ type: 'table', entete: e.entete, rangs: e.rangs.slice(0, n) }, { type: 'table', entete: e.entete, rangs: e.rangs.slice(n) }];
  }
  if (e.type === 'liste') {
    let h = 0, n = 0;
    while (n < e.items.length && h + e.hItems[n] <= dispo) h += e.hItems[n++];
    if (n < 1) return null;
    return [{ type: 'liste', items: e.items.slice(0, n) }, { type: 'liste', items: e.items.slice(n) }];
  }
  if (e.type === 'paragraphe') {
    const lignes = couper(segsTexte(e.segs), CW, T.corps);
    const n = Math.floor(dispo * 72 / (T.corps * INTERLIGNE));
    if (n < 2) return null;
    const tete = lignes.slice(0, n).join(' ');
    return [{ type: 'paragraphe', segs: [{ text: tete, bold: false }] }, { type: 'paragraphe', segs: [{ text: lignes.slice(n).join(' '), bold: false }] }];
  }
  return null;
}

// ---------------------------------------------------------------------------
// Mise en page : plan → pages (chaque page = liste d'éléments positionnés)
// ---------------------------------------------------------------------------
function enTete(surtitre, titre) {
  const lignes = couper(titre, CW, T.titre, 'calibrib');
  const n = Math.min(lignes.length, 2);
  return { surtitre, titre: n < lignes.length ? lignes.slice(0, 2).join(' ').replace(/\s+\S*$/, '…') : titre, hTitre: hauteurLignes(n, T.titre) + 0.05 };
}

function paginerContenu(d, pages) {
  const titreBase = d.sousTitre ?? d.titre;
  let page = null;
  const nouvelle = (suite) => {
    const tt = suite ? `${titreBase.replace(/ \(suite\)$/, '')} (suite)` : titreBase;
    const t = enTete(d.titre, tt);
    page = { type: 'contenu', ...t, elements: [], y: 0.7 + t.hTitre + 0.25 };
    page.haut = page.y;
    pages.push(page);
  };
  nouvelle(false);
  const file = d.blocs.flatMap(analyser);
  while (file.length) {
    const e = file.shift();
    const h = mesurer(e);
    const dispo = BAS - page.y;
    if (h <= dispo) { page.elements.push({ e, y: page.y, h }); page.y += h + ESP[e.type]; continue; }
    const coupe = scinder(e, dispo);
    if (coupe && coupe[1] && (coupe[1].lignes?.length || coupe[1].rangs?.length || coupe[1].items?.length || coupe[1].segs?.[0]?.text)) {
      const hTete = mesurer(coupe[0]);
      page.elements.push({ e: coupe[0], y: page.y, h: hTete });
      file.unshift(coupe[1]);
      nouvelle(true);
      continue;
    }
    if (page.elements.length) { file.unshift(e); nouvelle(true); continue; }
    // page vide et élément indivisible trop grand : on le coupe sur la hauteur d'une page entière
    const force = scinder(e, BAS - page.haut);
    if (force) { const hT = mesurer(force[0]); page.elements.push({ e: force[0], y: page.y, h: hT }); page.y += hT; file.unshift(force[1]); nouvelle(true); }
    else { page.elements.push({ e, y: page.y, h: Math.min(h, dispo) }); page.y = BAS; }
  }
  if (!page.elements.length && pages.length > 1 && pages[pages.length - 2] !== page && d.blocs.length) pages.pop();
}

function paginer(cours) {
  const pages = [];
  for (const d of plan(cours)) {
    if (d.type === 'couverture') pages.push({ type: 'couverture' });
    else if (d.type === 'objectifs') {
      const items = d.objectifs.map((o) => ({ niveau: 0, ordonne: false, segs: enLigne(o) }));
      paginerContenu({ titre: 'Objectifs', sousTitre: 'À la fin de cette séance, tu sauras', blocs: [] }, pages);
      const p = pages[pages.length - 1];
      const e = { type: 'liste', items, objectifs: true };
      const h = mesurer(e);
      p.elements.push({ e, y: p.y, h });
    } else if (d.type === 'contenu') paginerContenu(d, pages);
    else if (d.type === 'question') {
      const t = enTete(`Quiz · question ${d.numero} sur ${d.total}`, 'À toi de répondre');
      const y0 = 0.7 + t.hTitre + 0.3;
      const nq = couper(nettoyer(d.question), CW, 20, 'calibrib').length;
      const hq = hauteurLignes(nq, 20);
      let y = y0 + hq + 0.3;
      const choix = d.choix.map((c, k) => {
        const txt = texteSimple(c);
        const n = couper(txt, CW - 1.1, T.corps).length;
        const h = Math.max(0.62, hauteurLignes(n, T.corps) + 0.26);
        const r = { lettre: LETTRES[k], txt, y, h };
        y += h + 0.14;
        return r;
      });
      pages.push({ type: 'question', ...t, question: nettoyer(d.question), y0, hq, choix });
    }
  }
  return pages;
}

// ---------------------------------------------------------------------------
// Rendu PowerPoint
// ---------------------------------------------------------------------------
const pngCache = new Map();
function illustrationPng(cle) {
  if (!pngCache.has(cle)) {
    const svg = fs.readFileSync(path.join(ILLUS, `${cle}.svg`), 'utf8');
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1100 }, font: { loadSystemFonts: true, defaultFontFamily: 'Arial' } }).render().asPng();
    pngCache.set(cle, png);
  }
  return pngCache.get(cle);
}
const dataPng = (buf) => `data:image/png;base64,${buf.toString('base64')}`;

const base = (taille, extra = {}) => ({ fontFace: 'Calibri', fontSize: taille, color: C.texte, margin: 0, valign: 'top', lineSpacing: taille * INTERLIGNE, ...extra });
const runs = (segs) => segs.map((s) => ({ text: s.text, options: { bold: s.bold } }));

function rendreElement(slide, { e, y, h }, accent) {
  switch (e.type) {
    case 'paragraphe':
      slide.addText(runs(e.segs), { ...base(T.corps), x: MX, y, w: CW, h, fit: 'none' });
      break;
    case 'intertitre':
      slide.addText(segsTexte(e.segs), { ...base(18, { bold: true, color: accent }), x: MX, y, w: CW, h });
      break;
    case 'citation':
      slide.addShape('rect', { x: MX, y, w: CW, h, fill: { color: C.violetClair }, line: { color: C.violetClair } });
      slide.addShape('rect', { x: MX, y, w: 0.07, h, fill: { color: C.violet }, line: { color: C.violet } });
      slide.addText(runs(e.segs), { ...base(T.corps), x: MX + 0.3, y: y + 0.12, w: CW - 0.45, h: h - 0.24 });
      break;
    case 'liste': {
      let yy = y;
      e.items.forEach((it, k) => {
        const hh = e.hItems[k];
        const x = MX + RETRAIT * it.niveau;
        const puce = it.ordonne ? { type: 'number', numberStartAt: it.num || 1, indent: 22 } : { indent: 22, ...(e.objectifs ? { code: '25A0', color: accent } : {}) };
        slide.addText(runs(it.segs).map((r) => ({ ...r, options: { ...r.options } })), { ...base(T.corps), x, y: yy, w: CW - RETRAIT * it.niveau, h: hh, bullet: puce });
        yy += hh;
      });
      break;
    }
    case 'code':
      slide.addText(e.vis.join('\n') || ' ', {
        ...base(T.code, { fontFace: 'Consolas', color: C.codeTxt }), shape: 'roundRect', rectRadius: 0.08,
        x: MX, y, w: CW, h, fill: { color: C.code }, margin: [14, 14, 9, 9], wrap: true,
      });
      break;
    case 'table': {
      const cell = (t, entete) => ({ text: t, options: { bold: entete, fill: { color: entete ? C.gris : 'FFFFFF' } } });
      const rows = [e.entete.map((c) => cell(c, true)), ...e.rangs.map((r) => r.map((c) => cell(c, false)))];
      slide.addTable(rows, {
        x: MX, y, w: CW, colW: e.colW, rowH: e.hRangs, fontFace: 'Calibri', fontSize: T.table, color: C.texte, valign: 'top',
        border: { type: 'solid', pt: 0.75, color: C.ligne }, margin: [0.05, 0.1, 0.05, 0.1], autoPage: false,
      });
      break;
    }
  }
}

function pied(slide, cours, i, n) {
  slide.addShape('line', { x: MX, y: 6.92, w: CW, h: 0, line: { color: C.ligne, width: 0.75 } });
  slide.addText(`Saint Stack Academy · ${cours.titre}`, { ...base(T.pied, { color: C.pied }), x: MX, y: 7.0, w: CW - 1.2, h: 0.25, fit: 'none' });
  slide.addText(`${i} / ${n}`, { ...base(T.pied, { color: C.pied, align: 'right' }), x: W - MX - 1.2, y: 7.0, w: 1.2, h: 0.25 });
}

function enTeteSlide(slide, p, accent) {
  slide.addText(p.surtitre.toUpperCase(), { ...base(T.sur, { bold: true, color: accent, charSpacing: 1.5 }), x: MX, y: 0.42, w: CW, h: 0.25 });
  slide.addText(p.titre, { ...base(T.titre, { bold: true }), x: MX, y: 0.7, w: CW, h: p.hTitre });
}

async function genererPptx(cours, pages, fichier) {
  const dom = infoDomaine(cours.domaine);
  const accent = hex(dom.accent);
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = AUTEUR;
  pptx.company = 'Saint Stack Academy';
  pptx.title = cours.titre;
  pptx.theme = { headFontFace: 'Calibri', bodyFontFace: 'Calibri' };
  const n = pages.length;
  pages.forEach((p, k) => {
    const slide = pptx.addSlide();
    if (p.type === 'couverture') {
      slide.background = { color: hex(dom.fond) };
      const wTxt = 5.9, x = 0.75;
      const lt = couper(cours.titre, wTxt, 36, 'calibrib');
      const hT = hauteurLignes(lt.length, 36);
      const hTotal = 0.35 + 0.25 + hT + 0.25 + 0.35 + 0.35 + 0.4;
      let y = Math.max(0.6, (H - hTotal) / 2);
      slide.addText(`${PISTES[cours.piste] ?? cours.piste} · Semaine ${cours.semaine}`.toUpperCase(), { ...base(T.sur, { bold: true, color: accent, charSpacing: 1.5 }), x, y, w: wTxt, h: 0.3 });
      y += 0.55;
      slide.addText(cours.titre, { ...base(36, { bold: true, color: hex(dom.texte) }), x, y, w: wTxt, h: hT });
      y += hT + 0.25;
      slide.addText(`${dom.nom} · ${cours.duree} min · niveau ${cours.niveau}`, { ...base(T.corps, { color: hex(dom.texte) }), x, y, w: wTxt, h: 0.32 });
      y += 0.6;
      slide.addShape('line', { x, y, w: 1.2, h: 0, line: { color: hex(dom.texte), width: 1.5 } });
      slide.addText(AUTEUR, { ...base(14, { bold: true, color: hex(dom.texte) }), x, y: y + 0.15, w: wTxt, h: 0.3 });
      const wi = 6.2, hi = wi * 9 / 16;
      slide.addImage({ data: dataPng(illustrationPng(dom.cle)), x: W - wi - 0.55, y: (H - hi) / 2, w: wi, h: hi });
      return;
    }
    slide.background = { color: 'FFFFFF' };
    enTeteSlide(slide, p, accent);
    if (p.type === 'contenu') p.elements.forEach((el) => rendreElement(slide, el, accent));
    if (p.type === 'question') {
      slide.addText(p.question, { ...base(20, { bold: true }), x: MX, y: p.y0, w: CW, h: p.hq });
      for (const c of p.choix) {
        slide.addShape('roundRect', { x: MX, y: c.y, w: CW, h: c.h, rectRadius: 0.08, fill: { color: 'FFFFFF' }, line: { color: C.ligne, width: 1 } });
        slide.addText(c.lettre, { ...base(14, { bold: true, color: C.violet, align: 'center', valign: 'middle' }), shape: 'ellipse', x: MX + 0.2, y: c.y + (c.h - 0.42) / 2, w: 0.42, h: 0.42, fill: { color: C.violetClair } });
        slide.addText(c.txt, { ...base(T.corps, { valign: 'middle' }), x: MX + 0.85, y: c.y + 0.1, w: CW - 1.05, h: c.h - 0.2 });
      }
    }
    pied(slide, cours, k + 1, n);
  });
  // stream() : seul chemin de pptxgenjs 4 qui applique réellement DEFLATE (writeFile et write l'ignorent)
  fs.writeFileSync(fichier, await pptx.stream({ compression: true }));
}

// ---------------------------------------------------------------------------
// Aperçu PNG de la mise en page (même découpage, texte coupé avec les mêmes mesures)
// ---------------------------------------------------------------------------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function apercuSvg(cours, p, k, n) {
  const dom = infoDomaine(cours.domaine);
  const S = 96, o = [];
  const txt = (x, y, lignes, taille, opts = {}) => lignes.forEach((l, j) => o.push(`<text x="${x * S}" y="${(y + pt2in(taille * INTERLIGNE) * j + pt2in(taille)) * S}" font-family="${opts.font ?? 'Calibri'}" font-size="${taille * S / 72}" font-weight="${opts.bold ? 700 : 400}" fill="#${opts.color ?? C.texte}" xml:space="preserve">${esc(l)}</text>`));
  if (p.type === 'couverture') {
    o.push(`<rect width="${W * S}" height="${H * S}" fill="${dom.fond}"/>`);
    const lt = couper(cours.titre, 5.9, 36, 'calibrib');
    txt(0.75, 2.2, lt, 36, { bold: true, color: hex(dom.texte) });
    const img = dataPng(illustrationPng(dom.cle));
    o.push(`<image href="${img}" x="${(W - 6.75) * S}" y="${(H - 3.49) / 2 * S}" width="${6.2 * S}" height="${3.49 * S}"/>`);
  } else {
    o.push(`<rect width="${W * S}" height="${H * S}" fill="#fff"/>`);
    txt(MX, 0.42, [p.surtitre.toUpperCase()], T.sur, { bold: true, color: hex(dom.accent) });
    txt(MX, 0.7, couper(p.titre, CW, T.titre, 'calibrib'), T.titre, { bold: true });
    o.push(`<rect x="${MX * S}" y="${BAS * S}" width="${CW * S}" height="1" fill="red" opacity=".4"/>`);
    if (p.type === 'contenu') for (const { e, y, h } of p.elements) {
      o.push(`<rect x="${MX * S}" y="${y * S}" width="${CW * S}" height="${h * S}" fill="none" stroke="#c8c4f0" stroke-dasharray="4 4"/>`);
      if (e.type === 'code') { o.push(`<rect x="${MX * S}" y="${y * S}" width="${CW * S}" height="${h * S}" rx="8" fill="#${C.code}"/>`); txt(MX + 0.2, y + 0.13, e.vis, T.code, { font: 'Consolas', color: C.codeTxt }); }
      else if (e.type === 'liste') { let yy = y; e.items.forEach((it, j) => { txt(MX + RETRAIT * it.niveau, yy, ['•'], T.corps); txt(MX + RETRAIT * it.niveau + 0.3, yy, couper(segsTexte(it.segs), CW - RETRAIT * (it.niveau + 1), T.corps), T.corps); yy += e.hItems[j]; }); }
      else if (e.type === 'table') { let yy = y; [e.entete, ...e.rangs].forEach((r, j) => { let x = MX; r.forEach((c, m) => { o.push(`<rect x="${x * S}" y="${yy * S}" width="${e.colW[m] * S}" height="${e.hRangs[j] * S}" fill="${j ? '#fff' : '#F1F0F5'}" stroke="#E6E5EE"/>`); txt(x + 0.1, yy + 0.05, couper(c || ' ', e.colW[m] - 0.22, T.table, j ? 'calibri' : 'calibrib'), T.table, { bold: !j }); x += e.colW[m]; }); yy += e.hRangs[j]; }); }
      else if (e.type === 'citation') { o.push(`<rect x="${MX * S}" y="${y * S}" width="${CW * S}" height="${h * S}" fill="#EEEDFE"/>`); txt(MX + 0.3, y + 0.12, couper(segsTexte(e.segs), CW - 0.55, T.corps), T.corps); }
      else txt(MX, y, couper(segsTexte(e.segs), CW, e.type === 'intertitre' ? 18 : T.corps, e.type === 'intertitre' ? 'calibrib' : 'calibri'), e.type === 'intertitre' ? 18 : T.corps, { bold: e.type === 'intertitre' });
    }
    if (p.type === 'question') {
      txt(MX, p.y0, couper(p.question, CW, 20, 'calibrib'), 20, { bold: true });
      for (const c of p.choix) { o.push(`<rect x="${MX * S}" y="${c.y * S}" width="${CW * S}" height="${c.h * S}" rx="8" fill="#fff" stroke="#E6E5EE"/>`); txt(MX + 0.3, c.y + 0.15, [c.lettre], 14, { bold: true }); txt(MX + 0.85, c.y + 0.13, couper(c.txt, CW - 1.1, T.corps), T.corps); }
    }
    txt(MX, 7.0, [`Saint Stack Academy · ${cours.titre}`], T.pied, { color: C.pied });
    txt(W - MX - 0.5, 7.0, [`${k + 1} / ${n}`], T.pied, { color: C.pied });
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W * S}" height="${H * S}">${o.join('')}</svg>`;
}

// ---------------------------------------------------------------------------
// Programme principal
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
let apercu = null;
if (args[0] === '--apercu') { apercu = path.resolve(args[1]); args.splice(0, 2); fs.mkdirSync(apercu, { recursive: true }); }
const fichiers = fs.readdirSync(COURS).filter((f) => f.endsWith('.md')).sort()
  .filter((f) => !args.length || args.includes(f.replace(/\.md$/, '')));
if (!fichiers.length) { console.error('Aucun cours trouvé.'); process.exit(1); }
fs.mkdirSync(SORTIE, { recursive: true });
if (!Object.keys(polices).length) console.warn('Polices Calibri/Consolas introuvables : mesure du texte par estimation.');

let totalDiapos = 0, debordements = 0;
for (const f of fichiers) {
  const { data, content } = matter(fs.readFileSync(path.join(COURS, f), 'utf8'));
  const cours = { ...data, slug: data.slug ?? f.replace(/\.md$/, ''), contenu: content, objectifs: data.objectifs ?? [], quiz: data.quiz ?? [] };
  const pages = paginer(cours);
  // contrôle : aucun élément ne doit descendre sous la limite du contenu
  for (const p of pages) {
    for (const el of p.elements ?? []) if (el.y + el.h > BAS + 0.01) { debordements++; console.warn(`  débordement : ${cours.slug} · ${p.titre}`); }
    for (const c of p.choix ?? []) if (c.y + c.h > BAS + 0.01) { debordements++; console.warn(`  débordement : ${cours.slug} · quiz`); }
  }
  await genererPptx(cours, pages, path.join(SORTIE, `${cours.slug}.pptx`));
  if (apercu) pages.forEach((p, k) => fs.writeFileSync(path.join(apercu, `${cours.slug}-${String(k + 1).padStart(2, '0')}.png`), new Resvg(apercuSvg(cours, p, k, pages.length), { font: { loadSystemFonts: true } }).render().asPng()));
  totalDiapos += pages.length;
  console.log(`${cours.slug}.pptx : ${pages.length} diapositives`);
}
console.log(`\n${fichiers.length} fichiers PowerPoint, ${totalDiapos} diapositives au total, dans web/public/diaporamas/.${debordements ? ` ${debordements} débordement(s) signalé(s).` : ''}`);
