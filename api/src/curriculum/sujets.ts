import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import matter = require('gray-matter');
import { config } from '../config';

/** Sujet d'un cours, renvoyé avec chaque cours : il sert au logo de la technologie ou à l'icône générique. */
export interface SujetCours { cle: string; libelle: string; logo: string | null; icone: string }

interface SujetDef { libelle: string; logo: string | null; icone: string; marque: string | null }
interface FichierSujets { sujets: Record<string, SujetDef>; cours: Record<string, string> }

/** Icône de repli quand un sujet manque ou qu'une icône n'existe pas. */
export const ICONE_REPLI = 'book-open';
const REPLI: SujetCours = { cle: 'general', libelle: 'Cours', logo: null, icone: ICONE_REPLI };

const logger = new Logger('Sujets');
const parse = (matter as unknown as { engines: { yaml: { parse: (s: string) => unknown } } }).engines.yaml.parse;

/** Dossier d'un paquet installé (résolu depuis node_modules de l'API). */
function dossierPaquet(nom: string): string | null {
  // package.json n'est pas toujours exporté : on part du point d'entrée et on remonte jusqu'au dossier du paquet.
  try {
    let d = path.dirname(require.resolve(nom));
    while (path.basename(d) !== nom && path.dirname(d) !== d) d = path.dirname(d);
    return path.basename(d) === nom ? d : null;
  } catch { return null; }
}

/** Noms des logos de simple-icons installés (fichiers icons/<nom>.svg). */
export function logosDisponibles(): Set<string> | null {
  const d = dossierPaquet('simple-icons');
  if (!d) return null;
  return new Set(fs.readdirSync(path.join(d, 'icons')).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)));
}

/** Noms des icônes Lucide installées, alias compris (history = rotate-ccw-clock, par exemple). */
function iconesDisponibles(): Set<string> | null {
  const d = dossierPaquet('lucide');
  if (!d) return null;
  const noms = new Set(fs.readdirSync(path.join(d, 'dist/esm/icons')).filter((f) => f.endsWith('.mjs')).map((f) => f.slice(0, -4)));
  const alias = path.join(d, 'dist/esm/iconsAndAliases.mjs');
  if (fs.existsSync(alias)) {
    // « export { default as History, default as RotateCcwClock } » : chaque nom exporté, remis en kebab-case.
    for (const m of fs.readFileSync(alias, 'utf8').matchAll(/default as ([A-Z][A-Za-z0-9]*)/g)) {
      noms.add(m[1].replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Za-z])([0-9])/g, '$1-$2').toLowerCase());
    }
  }
  return noms;
}

/**
 * Lit content/sujets.yaml et associe un sujet à chaque cours.
 * Vérifie que chaque cours a un sujet et que chaque logo ou icône existe dans les versions installées :
 * sinon, un avertissement dans les logs et l'icône de repli « book-open ».
 */
export function chargerSujets(slugs: string[]): { sujetDe: (slug: string) => SujetCours; marques: { libelle: string; marque: string }[] } {
  const f = path.join(config.contentDir, 'sujets.yaml');
  if (!fs.existsSync(f)) {
    logger.warn('content/sujets.yaml absent : tous les cours prennent l’icône générique.');
    return { sujetDe: () => REPLI, marques: [] };
  }
  const brut = parse(fs.readFileSync(f, 'utf8')) as FichierSujets;
  const logos = logosDisponibles();
  const icones = iconesDisponibles();
  if (!logos) logger.warn('Paquet simple-icons introuvable : les logos ne sont pas vérifiés.');
  if (!icones) logger.warn('Paquet lucide introuvable : les icônes ne sont pas vérifiées.');

  const sujets = new Map<string, SujetCours>();
  for (const [cle, s] of Object.entries(brut.sujets ?? {})) {
    let logo = s.logo ? String(s.logo) : null;
    let icone = String(s.icone ?? ICONE_REPLI);
    if (logo && logos && !logos.has(logo)) { logger.warn(`Sujet « ${cle} » : le logo « ${logo} » n’existe pas dans simple-icons, icône générique à la place.`); logo = null; }
    if (icones && !icones.has(icone)) { logger.warn(`Sujet « ${cle} » : l’icône « ${icone} » n’existe pas dans Lucide, repli sur « ${ICONE_REPLI} ».`); icone = ICONE_REPLI; }
    sujets.set(cle, { cle, libelle: String(s.libelle ?? cle), logo, icone });
  }

  const parCours = brut.cours ?? {};
  const sansSujet = slugs.filter((s) => !parCours[s] || !sujets.has(parCours[s]));
  if (sansSujet.length) logger.warn(`${sansSujet.length} cours sans sujet valide (icône générique) : ${sansSujet.join(', ')}`);
  const inconnus = Object.keys(parCours).filter((s) => !slugs.includes(s));
  if (inconnus.length) logger.warn(`sujets.yaml cite des cours absents de content/lessons : ${inconnus.join(', ')}`);
  logger.log(`${sujets.size} sujets, ${slugs.length - sansSujet.length} cours sur ${slugs.length} associés`);

  const marques = Object.values(brut.sujets ?? {})
    .filter((s) => s.logo && s.marque)
    .map((s) => ({ libelle: String(s.libelle), marque: String(s.marque) }));

  return { sujetDe: (slug) => sujets.get(parCours[slug]) ?? REPLI, marques };
}
