// Vérification du contenu : chaque sujet de content/sujets.yaml a ses logiciels dans content/outils.yaml,
// chaque clé de logiciel existe, chaque site est en https://, et les champs « outils » des cours sont valides.
// Usage : npm run verifier   (échoue avec un code 1 s'il y a une erreur ; lancé aussi pendant la construction du site)
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const matter = createRequire(import.meta.url)('gray-matter');
const yaml = (f) => matter.engines.yaml.parse(readFileSync(join(racine, 'content', f), 'utf8'));
const { sujets } = yaml('sujets.yaml');
const { logiciels = {}, sujets: parSujet = {} } = yaml('outils.yaml');
const erreurs = [];

for (const [cle, l] of Object.entries(logiciels)) {
  if (!/^https:\/\//.test(l.site ?? '')) erreurs.push(`Logiciel « ${cle} » : le site doit commencer par https:// (${l.site}).`);
  for (const champ of ['nom', 'role', 'systemes', 'installer']) if (!l[champ]) erreurs.push(`Logiciel « ${cle} » : champ « ${champ} » manquant.`);
}
const verifierListe = (ou, liste) => (liste ?? []).forEach((k) => { if (!logiciels[k]) erreurs.push(`${ou} : le logiciel « ${k} » n'existe pas dans outils.yaml.`); });
for (const cle of Object.keys(sujets)) {
  const s = parSujet[cle];
  if (!s) { erreurs.push(`Sujet « ${cle} » (sujets.yaml) absent de outils.yaml.`); continue; }
  if (s.aucun) continue;
  for (const champ of ['principal', 'autres', 'en_ligne']) verifierListe(`Sujet « ${cle} », ${champ}`, s[champ]);
  if (!s.principal?.length) erreurs.push(`Sujet « ${cle} » : liste « principal » vide (ou mettre aucun: true).`);
}
for (const cle of Object.keys(parSujet)) if (!sujets[cle]) erreurs.push(`Sujet « ${cle} » (outils.yaml) absent de sujets.yaml.`);
// Champ facultatif « outils » d'un cours : il remplace la liste du sujet.
const dossier = join(racine, 'content', 'lessons');
for (const f of readdirSync(dossier).filter((x) => x.endsWith('.md'))) {
  const { data } = matter(readFileSync(join(dossier, f), 'utf8'));
  if (data.outils !== undefined) {
    if (!Array.isArray(data.outils)) erreurs.push(`${f} : « outils » doit être une liste de clés.`);
    else verifierListe(`${f}, outils`, data.outils);
  }
}

if (erreurs.length) { console.error(`Vérification des outils : ${erreurs.length} erreur(s)\n- ${erreurs.join('\n- ')}`); process.exit(1); }
console.log(`Vérification des outils : ${Object.keys(logiciels).length} logiciels, ${Object.keys(parSujet).length} sujets, tout est cohérent.`);
