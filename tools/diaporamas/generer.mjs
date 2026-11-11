// Génère un PowerPoint par cours public : web/public/diaporamas/<slug>.pptx (dossier ignoré par Git).
// Usage : npm run diaporamas            (tous les cours)
//         npm run diaporamas -- <slug>  (un ou plusieurs cours)
//
// Structure (comme diaporamas/exemples/) : couverture, plan, une page de partie numérotée par chapitre,
// pages de contenu, puis « Mise en pratique ». La correction n'est pas incluse.
// Un fichier content/diaporamas/<slug>.mjs (diaporama soigné) remplace la version automatique.
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { creer } from './gabarit.mjs';
import { couleursSujet } from './couleurs.mjs';

const exiger = createRequire(import.meta.url);
const matter = exiger('gray-matter');
const racine = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const { chapitres, estCorrection } = await import(pathToFileURL(join(racine, 'web/src/lib/contenu.mjs')).href);

const SORTIE = join(racine, 'web/public/diaporamas');
const MOTS_MAX = 90;      // mots par page de texte
const LIGNES_CODE = 16;   // lignes par encadré de code
const LARGEUR_CODE = 76;  // caractères par ligne de code (Courier New 11 pt dans 7,1 pouces)
const FIN = /^(exercice guidé|exercice autonome|pour aller plus loin)/i;

// ---------- Sujets ----------
const yaml = (f) => matter.engines.yaml.parse(readFileSync(join(racine, 'content', f), 'utf8'));
const { sujets = {}, cours: sujetDuCours = {} } = yaml('sujets.yaml');
const si = exiger('simple-icons');
const hexLogo = (nom) => Object.values(si).find((x) => x && x.slug === nom)?.hex ?? null;

// ---------- Texte Markdown en morceaux PowerPoint ----------
const mots = (t) => t.split(/\s+/).filter(Boolean).length;
const nu = (t) => t.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/(^|[\s(])[*_]([^*_]+)[*_]/g, '$1$2');

/** Texte en ligne → morceaux { text, options } (gras, code, lien, italique). */
function morceaux(texte, base = {}) {
  const res = [];
  const re = /(\*\*(.+?)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))|((?:^|(?<=[\s(]))[*_]([^*_\n]+)[*_])/g;
  let i = 0; let m;
  while ((m = re.exec(texte))) {
    if (m.index > i) res.push({ text: texte.slice(i, m.index), options: { ...base } });
    if (m[1]) res.push({ text: m[2], options: { ...base, bold: true } });
    else if (m[3]) res.push({ text: m[4], options: { ...base, fontFace: 'Courier New' } });
    else if (m[5]) res.push({ text: m[6], options: { ...base, color: '1D4ED8', hyperlink: /^https?:/.test(m[7]) ? { url: m[7] } : undefined } });
    else if (m[8]) res.push({ text: m[9], options: { ...base, italic: true } });
    i = m.index + m[0].length;
  }
  if (i < texte.length) res.push({ text: texte.slice(i), options: { ...base } });
  return res.length ? res : [{ text: texte, options: { ...base } }];
}

/** Découpe le corps d'un chapitre en blocs : sous-titre, paragraphe, liste, code, tableau, citation. */
function blocsDe(corps) {
  const L = corps.replace(/\r/g, '').split('\n');
  const blocs = [];
  for (let i = 0; i < L.length;) {
    const l = L[i];
    if (/^```/.test(l)) {
      const lang = l.slice(3).trim(); const code = []; i++;
      while (i < L.length && !/^```/.test(L[i])) code.push(L[i++]);
      i++; blocs.push({ type: 'code', lang, lignes: code }); continue;
    }
    if (/^\s*\|/.test(l)) {
      const rows = [];
      while (i < L.length && /^\s*\|/.test(L[i])) { const r = L[i++].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()); if (!r.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(r); }
      blocs.push({ type: 'tableau', rows }); continue;
    }
    if (/^\s*([-*+]|\d+[.)])\s+/.test(l)) {
      const items = []; const ordonnee = /^\s*\d/.test(l);
      while (i < L.length && (/^\s*([-*+]|\d+[.)])\s+/.test(L[i]) || (/^\s{2,}\S/.test(L[i]) && items.length))) {
        if (/^\s*([-*+]|\d+[.)])\s+/.test(L[i])) items.push(L[i].replace(/^\s*([-*+]|\d+[.)])\s+/, ''));
        else items[items.length - 1] += ` ${L[i].trim()}`;
        i++;
      }
      blocs.push({ type: 'liste', items, ordonnee }); continue;
    }
    if (/^#{3,6}\s/.test(l)) { blocs.push({ type: 'sous', texte: l.replace(/^#+\s*/, '') }); i++; continue; }
    if (/^>/.test(l)) {
      const t = []; while (i < L.length && /^>/.test(L[i])) t.push(L[i++].replace(/^>\s?/, ''));
      blocs.push({ type: 'paragraphe', texte: t.join(' ').trim(), citation: true }); continue;
    }
    if (!l.trim() || /^!\[/.test(l) || /^---+$/.test(l.trim())) { i++; continue; }
    const t = []; while (i < L.length && L[i].trim() && !/^(```|\s*\||\s*([-*+]|\d+[.)])\s|#{3,6}\s|>)/.test(L[i])) t.push(L[i++].trim());
    blocs.push({ type: 'paragraphe', texte: t.join(' ') });
  }
  return blocs;
}

/** Découpe un texte trop long en morceaux d'au plus MOTS_MAX mots, à la fin d'une phrase si possible. */
function decouper(texte) {
  if (mots(texte) <= MOTS_MAX) return [texte];
  const phrases = texte.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [texte];
  const res = []; let cur = '';
  for (const p of phrases) {
    if (cur && mots(cur + p) > MOTS_MAX) { res.push(cur.trim()); cur = ''; }
    cur += p;
  }
  if (cur.trim()) res.push(cur.trim());
  return res.flatMap((r) => (mots(r) > MOTS_MAX * 1.3 ? r.split(/\s+/).reduce((acc, w) => { const d = acc[acc.length - 1]; if (mots(d) >= MOTS_MAX) acc.push(w); else acc[acc.length - 1] = d ? `${d} ${w}` : w; return acc; }, ['']) : [r]));
}

/** Coupe les lignes de code trop longues, puis groupe par LIGNES_CODE. */
function pagesDeCode(lignes) {
  const coupees = lignes.flatMap((l) => { const out = []; let r = l.replace(/\t/g, '  '); while (r.length > LARGEUR_CODE) { out.push(r.slice(0, LARGEUR_CODE)); r = `  ${r.slice(LARGEUR_CODE)}`; } out.push(r); return out; });
  const pages = [];
  for (let i = 0; i < coupees.length; i += LIGNES_CODE) pages.push(coupees.slice(i, i + LIGNES_CODE));
  return pages.length ? pages : [[]];
}

/** Hauteur estimée d'une ligne de tableau (pouces) selon le texte et la largeur des colonnes. */
const hauteurLigne = (row, colW, pt) => 0.14 + Math.max(...row.map((c, j) => Math.ceil((nu(c).length || 1) / Math.max(4, (colW[j] - 0.12) / (pt * 0.0075))))) * (pt / 72) * 1.25;

// ---------- Diaporama automatique ----------
async function automatique(d, cours, sujet) {
  const chaps = chapitres(cours.contenu).filter((c) => !estCorrection(c.titre));
  const principaux = chaps.filter((c) => !FIN.test(c.titre));
  const fin = chaps.filter((c) => FIN.test(c.titre));
  const iconeCartes = sujet?.icone ?? 'book-open';

  await d.couverture(sujet?.libelle ?? cours.titre, sujet ? cours.titre : (cours.objectifs?.[0] ?? ''));
  d.plan([...principaux.map((c) => c.titre), ...(fin.length ? ['Mise en pratique'] : [])].slice(0, 14));
  if (cours.objectifs?.length) {
    const s = d.contenu('Objectifs du cours');
    d.texte(s, cours.objectifs.slice(0, 7).flatMap((o, i, t) => morceaux(o, { bullet: true, breakLine: i < t.length - 1 })), 0.6, 1.25, 7.4, 3.5, 15);
  }

  const rendre = async (chapitre, pourFin = false) => {
    let titre = chapitre.titre;
    let tampon = []; let nbMots = 0; let nbLignes = 0;
    const vider = () => {
      if (!tampon.length) return;
      const s = d.contenu(titre);
      d.texte(s, tampon, 0.6, 1.25, 7.4, 3.5, nbMots > 70 || nbLignes > 7 ? 13 : 14);
      tampon = []; nbMots = 0; nbLignes = 0;
    };
    const ajouter = (runs, n, lignes = 1) => {
      if (tampon.length && (nbMots + n > MOTS_MAX || nbLignes + lignes > 10)) vider();
      if (tampon.length) tampon[tampon.length - 1].options = { ...tampon[tampon.length - 1].options, breakLine: true };
      tampon.push(...runs); nbMots += n; nbLignes += lignes;
    };
    for (const b of blocsDe(chapitre.corps)) {
      if (b.type === 'sous') { vider(); titre = nu(b.texte); continue; }
      if (b.type === 'paragraphe') {
        for (const part of decouper(b.texte)) ajouter(morceaux(part, b.citation ? { italic: true } : {}), mots(part), Math.ceil(nu(part).length / 85));
        continue;
      }
      if (b.type === 'liste') {
        const items = b.items.map((t) => {
          const m = /^\*\*(.+?)\*\*\s*[:–-]?\s*(.*)$/.exec(t) ?? /^([^:]{2,40}) : (.+)$/.exec(t);
          return m ? [iconeCartes, nu(m[1]).replace(/[ :]+$/, ''), nu(m[2])] : [iconeCartes, nu(t), ''];
        });
        const courts = b.items.every((t) => mots(nu(t)) <= 18) && items.every(([, t, desc]) => mots(t) <= 7 || (!desc && mots(t) <= 9));
        if (b.items.length >= 2 && b.items.length <= 6 && courts && !b.ordonnee) {
          vider();
          const s = d.contenu(titre);
          const n = items.length, cols = n <= 4 ? 2 : 3, rows = Math.ceil(n / cols);
          const w = (7.4 - (cols - 1) * 0.25) / cols, h = Math.min(1.6, (3.5 - (rows - 1) * 0.2) / rows);
          await d.cartes(s, items.map(([ic, t, desc]) => [ic, t, h < 1.0 ? '' : desc]), { x0: 0.6, y0: 1.25, cols, w, h, gx: 0.25, gy: 0.2, tailleT: 13, tailleD: 11 });
          continue;
        }
        for (const [i, t] of b.items.entries()) {
          const prefixe = b.ordonnee ? `${i + 1}. ` : '';
          ajouter(morceaux(prefixe + t, b.ordonnee ? {} : { bullet: true }), mots(t), Math.ceil(nu(t).length / 80));
        }
        continue;
      }
      if (b.type === 'code') {
        // Un court texte d'introduction reste au-dessus du code, sur la même page.
        const pages = pagesDeCode(b.lignes);
        for (const [k, lignes] of pages.entries()) {
          const intro = k === 0 && tampon.length && nbMots <= 45 && lignes.length <= 11 ? tampon : null;
          if (!intro) vider();
          const s = d.contenu(pages.length > 1 ? `${titre} (${k + 1}/${pages.length})` : titre);
          let y = 1.25;
          if (intro) { d.texte(s, intro, 0.6, 1.25, 7.4, 0.95, 13); y = 2.3; tampon = []; nbMots = 0; nbLignes = 0; }
          const h = Math.min(4.85 - y, 0.3 + Math.max(lignes.length, 2) * 0.2 + (b.lang ? 0.3 : 0));
          d.code(s, lignes.join('\n'), 0.6, y, 7.4, h, { titre: b.lang && b.lang !== 'text' ? b.lang : null, taille: 11 });
        }
        continue;
      }
      if (b.type === 'tableau' && b.rows.length) {
        vider();
        const [entete, ...corps] = b.rows;
        const nCol = entete.length;
        const pt = nCol > 3 ? 10 : 11;
        const poids = entete.map((_, j) => Math.max(6, ...b.rows.map((r) => nu(r[j] ?? '').length)));
        const total = poids.reduce((a, x) => a + Math.min(x, 60), 0);
        const colW = poids.map((x) => Math.max(0.9, (7.4 * Math.min(x, 60)) / total));
        const k = 7.4 / colW.reduce((a, x) => a + x, 0); for (let j = 0; j < nCol; j++) colW[j] *= k;
        const pages = []; let cur = []; let hauteur = hauteurLigne(entete, colW, pt);
        for (const r of corps) {
          const hl = hauteurLigne(r, colW, pt);
          if (cur.length && hauteur + hl > 3.45) { pages.push(cur); cur = []; hauteur = hauteurLigne(entete, colW, pt); }
          cur.push(r); hauteur += hl;
        }
        if (cur.length || !pages.length) pages.push(cur);
        for (const [k2, lignes] of pages.entries()) {
          const s = d.contenu(pages.length > 1 ? `${titre} (${k2 + 1}/${pages.length})` : titre);
          d.tableau(s, entete.map(nu), lignes.map((r) => entete.map((_, j) => nu(r[j] ?? ''))), { x: 0.6, y: 1.25, colW, taille: pt });
        }
      }
    }
    vider();
    return pourFin;
  };

  let num = 1;
  for (const c of principaux) {
    await d.separateur(String(num++).padStart(2, '0'), c.titre);
    await rendre(c);
  }

  if (fin.length) {
    await d.separateur(String(num).padStart(2, '0'), 'Mise en pratique');
    const plusLoin = fin.find((c) => /^pour aller plus loin/i.test(c.titre));
    const autonome = fin.find((c) => /^exercice autonome/i.test(c.titre));
    for (const c of fin.filter((x) => x !== plusLoin)) await rendre(c, true);
    // Dernière page : les ressources de « Pour aller plus loin » et le défi de l'exercice autonome.
    const liens = [];
    if (plusLoin) {
      for (const b of blocsDe(plusLoin.corps)) {
        if (b.type !== 'liste') continue;
        for (const t of b.items) {
          const m = /\[([^\]]+)\]\((https?:[^)]+)\)\s*[:–-]?\s*(.*)$/.exec(t);
          liens.push(m ? ['external-link', m[1], nu(m[3]) || new URL(m[2]).hostname, m[2]] : ['book-open', nu(t).slice(0, 70), '', null]);
        }
      }
    }
    const defiTexte = autonome ? nu(blocsDe(autonome.corps).find((b) => b.type === 'paragraphe')?.texte ?? '') : '';
    const defi = defiTexte.split(/\s+/).slice(0, 45).join(' ') + (mots(defiTexte) > 45 ? '…' : '');
    if (liens.length || defi) {
      const s = d.contenu('Mise en pratique');
      await d.ressources(s, liens.length ? liens : [['graduation-cap', 'Cours MeredianStack', cours.titre, null]], defi || null);
    }
  }
}

// ---------- Programme principal ----------
const dossierCours = join(racine, 'content/lessons');
const demandes = process.argv.slice(2);
const fichiers = readdirSync(dossierCours).filter((f) => f.endsWith('.md')).filter((f) => !demandes.length || demandes.includes(f.slice(0, -3)));
mkdirSync(SORTIE, { recursive: true });
let ok = 0; const erreurs = [];
for (const f of fichiers) {
  const slug = f.slice(0, -3);
  const { data, content } = matter(readFileSync(join(dossierCours, f), 'utf8'));
  const cible = join(SORTIE, `${slug}.pptx`);
  if (data.visibilite === 'prive') { if (existsSync(cible)) rmSync(cible); continue; } // pas de fichier public pour un cours privé
  try {
    const cle = sujetDuCours[slug];
    const sujet = cle ? sujets[cle] : null;
    const couleurs = couleursSujet(sujet, sujet?.logo ? hexLogo(sujet.logo) : null);
    const soigne = join(racine, 'content/diaporamas', `${slug}.mjs`);
    const mod = existsSync(soigne) ? await import(pathToFileURL(soigne).href) : null;
    const d = creer({ titre: mod?.titre ?? data.titre, couleurs, logo: sujet?.logo ?? null, iconeSujet: sujet?.icone ?? 'book-open', libelleSujet: sujet?.libelle ?? '' });
    if (mod) await mod.default(d);
    else await automatique(d, { ...data, contenu: content }, sujet);
    await d.enregistrer(cible);
    const mo = statSync(cible).size / 1024 / 1024;
    if (mo > 3) erreurs.push(`${slug} : ${mo.toFixed(1)} Mo (plus de 3 Mo)`);
    ok++;
  } catch (e) {
    erreurs.push(`${slug} : ${e.message}`);
  }
}
writeFileSync(join(SORTIE, 'LISEZMOI.txt'), 'Fichiers générés par « npm run diaporamas » (tools/diaporamas/generer.mjs). Ne pas modifier à la main.\n');
console.log(`${ok} diaporama(s) généré(s) dans web/public/diaporamas/`);
if (erreurs.length) { console.error(erreurs.join('\n')); process.exit(1); }
