// Génère web/src/lib/pictos-donnees.ts : seulement les logos (simple-icons) et les icônes (lucide-react)
// cités dans content/sujets.yaml (et content/organismes.yaml s'il existe), pour garder le bundle léger.
// Usage : npm run pictos   (à relancer après chaque modification de sujets.yaml ou organismes.yaml)
//
// Les logos sont recopiés tels quels depuis simple-icons : tracé et couleur d'origine, sans modification.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import matter from 'gray-matter';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const web = join(racine, 'web');
const exiger = createRequire(join(web, 'package.json'));
const yaml = (f) => matter.engines.yaml.parse(readFileSync(join(racine, 'content', f), 'utf8'));

const sujets = yaml('sujets.yaml').sujets;
const organismes = existsSync(join(racine, 'content', 'organismes.yaml')) ? yaml('organismes.yaml').organismes : {};

const nomsLogos = new Set([...Object.values(sujets), ...Object.values(organismes)].map((x) => x.logo).filter(Boolean));
const nomsIcones = new Set(['book-open', ...Object.values(sujets).map((x) => x.icone).filter(Boolean)]);

// simple-icons : un objet par logo (title, slug, hex, path).
const si = exiger('simple-icons');
const parSlug = new Map(Object.values(si).filter((x) => x && x.slug).map((x) => [x.slug, x]));
const versionPaquet = (p) => JSON.parse(readFileSync(join(web, 'node_modules', p, 'package.json'), 'utf8')).version;
const versionSi = versionPaquet('simple-icons');
// Logos retirés de simple-icons, repris de ses anciennes versions (même format, tracé et couleur d'origine).
const supplements = JSON.parse(readFileSync(join(racine, 'content', 'logos-supplementaires.json'), 'utf8'));
const logos = {};
for (const n of [...nomsLogos].sort()) {
  const x = parSlug.get(n);
  if (x) { logos[n] = { titre: x.title, hex: `#${x.hex}`, trace: x.path }; continue; }
  const s = supplements[n];
  if (!s) { console.warn(`Logo absent de simple-icons ${versionSi} et de logos-supplementaires.json : ${n}`); continue; }
  logos[n] = { titre: s.titre, hex: s.hex, trace: s.trace };
}

// lucide-react : nom kebab-case -> composant PascalCase, vérifié dans le paquet installé.
const lucide = exiger('lucide-react');
const versionLucide = versionPaquet('lucide-react');
const pascal = (n) => n.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const icones = [];
for (const n of [...nomsIcones].sort()) {
  const c = pascal(n);
  if (!lucide[c]) { console.warn(`Icône absente de lucide-react ${versionLucide} : ${n}`); continue; }
  icones.push([n, c]);
}

// Tracés des icônes (pour les images de partage, rendues sans React) : nom PascalCase -> fichier du paquet.
const dossierIcones = join(web, 'node_modules/lucide-react/dist/esm');
const fichierDe = new Map();
for (const m of readFileSync(join(dossierIcones, 'lucide-react.mjs'), 'utf8').matchAll(/export \{([^}]*)\} from '\.\/icons\/([a-z0-9-]+)\.mjs'/g)) {
  for (const n of m[1].matchAll(/default as ([A-Za-z0-9]+)/g)) fichierDe.set(n[1], m[2]);
}
const traces = {};
for (const [n, c] of icones) {
  const f = fichierDe.get(c);
  if (!f) continue;
  const mod = await import(pathToFileURL(join(dossierIcones, 'icons', `${f}.mjs`)).href);
  traces[n] = mod.__iconData.node.map(([tag, { key, ...attrs }]) => [tag, attrs]);
}

const sortie = `// FICHIER GÉNÉRÉ par tools/generer-pictos.mjs : ne pas modifier à la main (npm run pictos).
// Logos : simple-icons ${versionSi} (CC0 1.0 pour les fichiers ; les logos restent des marques de leurs titulaires).
// Icônes : lucide-react ${versionLucide} (ISC).
import type { LucideIcon } from 'lucide-react';
import { ${icones.map(([, c]) => c).join(', ')} } from 'lucide-react';

export interface LogoMarque { titre: string; hex: string; trace: string }

/** Logos de technologies et d'organismes, dans leur couleur d'origine (viewBox 0 0 24 24). */
export const LOGOS: Record<string, LogoMarque> = ${JSON.stringify(logos, null, 2)};

/** Tracés des mêmes icônes (viewBox 0 0 24 24, trait), pour dessiner sans React (images de partage). */
export const TRACES_ICONES: Record<string, [string, Record<string, string>][]> = ${JSON.stringify(traces)};

/** Icônes génériques, par nom Lucide. */
export const ICONES: Record<string, LucideIcon> = {
${icones.map(([n, c]) => `  '${n}': ${c},`).join('\n')}
};
`;
writeFileSync(join(web, 'src/lib/pictos-donnees.ts'), sortie);
console.log(`web/src/lib/pictos-donnees.ts : ${Object.keys(logos).length} logos, ${icones.length} icônes`);
