// Migre l'en-tête YAML des cours vers le format v2 (licence, parcours, ordre, visibilité).
// Utilisation : node tools/migrer-cours.mjs        (idempotent : un cours déjà migré est ignoré)
//
// - lit placement-cours.json (emplacements en licence et dans les parcours) ;
// - supprime piste, semaine et date ; renomme niveau en difficulte ;
// - calcule `ordre` à partir de l'ordre actuel des cours (date puis slug) dans leur première UE ;
// - déduit prerequis_cours des prérequis qui citent un cours par son titre entre « » ;
// - garde les slugs et ne touche pas au corps des cours.
// L'en-tête est modifié comme du texte, pour garder la mise en forme des quiz.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOSSIER = path.join(RACINE, 'content/lessons');
const placement = JSON.parse(fs.readFileSync(path.join(RACINE, 'placement-cours.json'), 'utf8'));
const PRIVES = new Set(['s08-2-bilan-plan-aws']);

const normal = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const sansPrefixe = (t) => {
  const s = t.replace(/^\s*Compl[ée]ment\s*:\s*/i, '');
  return s === t ? t : s.charAt(0).toUpperCase() + s.slice(1);
};
const q = (s) => JSON.stringify(s);   // chaîne YAML entre guillemets doubles (compatible JSON)

const fichiers = fs.readdirSync(DOSSIER).filter((f) => f.endsWith('.md')).sort();
const cours = fichiers.map((f) => {
  const brut = fs.readFileSync(path.join(DOSSIER, f), 'utf8');
  const { data } = matter(brut);
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? '');
  return { f, brut, data, slug: String(data.slug ?? f.replace(/\.md$/, '')), date };
});

// Ordre conseillé dans chaque UE : l'ordre actuel des cours (date, puis slug).
const parUe = new Map();
for (const c of [...cours].sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug))) {
  for (const l of placement[c.slug]?.licence ?? []) {
    const cle = `${l.niveau}|${l.semestre}|${l.option ?? ''}|${l.ue}`;
    parUe.set(cle, [...(parUe.get(cle) ?? []), c.slug]);
  }
}
const ordreDe = (slug) => {
  const l = placement[slug]?.licence?.[0];
  if (!l) return 1;
  return parUe.get(`${l.niveau}|${l.semestre}|${l.option ?? ''}|${l.ue}`).indexOf(slug) + 1;
};

// Titre normalisé → slug, pour retrouver les cours cités dans les prérequis.
const parTitre = new Map(cours.map((c) => [normal(sansPrefixe(String(c.data.titre ?? ''))), c.slug]));
const prerequisCours = (c) => {
  const res = new Set();
  for (const p of c.data.prerequis ?? []) {
    for (const m of String(p).matchAll(/«\s*([^»]+?)\s*»/g)) {
      const s = parTitre.get(normal(m[1]));
      if (s && s !== c.slug) res.add(s);
    }
  }
  return [...res];
};

let migres = 0, ignores = 0;
for (const c of cours) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/.exec(c.brut);
  if (!m) { console.warn(`En-tête introuvable : ${c.f}`); continue; }
  const lignes = m[1].split(/\r?\n/);
  if (lignes.some((l) => /^licence:/.test(l))) { ignores++; continue; }

  // Regroupe l'en-tête en entrées de premier niveau (clé + lignes indentées qui suivent).
  const entrees = [];
  for (const l of lignes) {
    const k = /^([A-Za-z_]+):/.exec(l);
    if (k) entrees.push({ cle: k[1], lignes: [l] });
    else if (entrees.length) entrees[entrees.length - 1].lignes.push(l);
  }
  const p = placement[c.slug] ?? { licence: [], parcours: [] };
  const licence = p.licence.length
    ? ['licence:', ...p.licence.map((l) => `  - { niveau: ${l.niveau}, semestre: ${l.semestre}, ue: ${q(l.ue)}${l.option ? `, option: ${l.option}` : ''} }`)]
    : ['licence: []'];
  const parcours = p.parcours.length
    ? ['parcours:', ...p.parcours.map((x) => `  - { parcours: ${x.parcours}, ordre: ${x.ordre} }`)]
    : ['parcours: []'];
  const prereq = prerequisCours(c);
  const nouveaux = [
    ...licence, ...parcours,
    `ordre: ${ordreDe(c.slug)}`,
    `prerequis_cours: [${prereq.join(', ')}]`,
    `visibilite: ${PRIVES.has(c.slug) ? 'prive' : 'public'}`,
  ];

  const sortie = [];
  for (const e of entrees) {
    if (['piste', 'semaine', 'date'].includes(e.cle)) continue;
    if (e.cle === 'titre') {
      const t = sansPrefixe(String(c.data.titre ?? ''));
      sortie.push(t === String(c.data.titre) ? e.lignes[0] : `titre: ${q(t)}`);
      continue;
    }
    if (e.cle === 'niveau') {
      sortie.push(e.lignes[0].replace(/^niveau:/, 'difficulte:'), ...nouveaux);
      continue;
    }
    sortie.push(...e.lignes);
  }
  if (!entrees.some((e) => e.cle === 'niveau')) {
    const i = sortie.findIndex((l) => /^duree:/.test(l));
    sortie.splice(i + 1, 0, 'difficulte: bases', ...nouveaux);
  }
  const corps = c.brut.slice(m[0].length);
  fs.writeFileSync(path.join(DOSSIER, c.f), `---\n${sortie.join('\n')}\n---\n${corps}`);
  migres++;
}
console.log(`${migres} cours migrés, ${ignores} déjà au format v2.`);
