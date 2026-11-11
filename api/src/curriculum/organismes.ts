import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import matter = require('gray-matter');
import { config } from '../config';
import { logosDisponibles } from './sujets';

/**
 * Organisme qui délivre une certification, renvoyé avec chaque élément de certifications.yaml.
 * Le logo (simple-icons, couleur d'origine) indique seulement OÙ se passe la certification :
 * MeredianStack n'est partenaire d'aucun de ces organismes.
 */
export interface OrganismeCertif { cle: string; nom: string; logo: string | null; site: string }

interface OrganismeDef { nom: string; logo: string | null; motifs: string[]; site: string; marque: string | null }

const logger = new Logger('Organismes');
const parse = (matter as unknown as { engines: { yaml: { parse: (s: string) => unknown } } }).engines.yaml.parse;
const echapper = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Lit content/organismes.yaml. `trouver(texte)` renvoie les organismes cités dans le champ « organisme »
 * d'une certification, dans l'ordre du texte (motifs sans tenir compte de la casse, mots entiers).
 * Un logo absent de simple-icons est signalé dans les logs puis remplacé par le nom seul.
 */
export function chargerOrganismes(): { trouver: (texte: string) => OrganismeCertif[]; marques: { nom: string; marque: string }[] } {
  const f = path.join(config.contentDir, 'organismes.yaml');
  if (!fs.existsSync(f)) {
    logger.warn('content/organismes.yaml absent : les certifications s’affichent sans organisme reconnu.');
    return { trouver: () => [], marques: [] };
  }
  const defs = ((parse(fs.readFileSync(f, 'utf8')) as { organismes?: Record<string, OrganismeDef> })?.organismes) ?? {};
  const logos = logosDisponibles();
  const liste = Object.entries(defs).map(([cle, d]) => {
    let logo = d.logo ?? null;
    if (logo && logos && !logos.has(logo)) {
      logger.warn(`Organisme « ${cle} » : le logo « ${logo} » n’existe pas dans simple-icons, nom seul affiché.`);
      logo = null;
    }
    const motifs = (d.motifs ?? [d.nom]).map((m) => new RegExp(`(?<![\\p{L}\\p{N}])${echapper(m)}(?![\\p{L}\\p{N}])`, 'iu'));
    return { org: { cle, nom: d.nom, logo, site: d.site }, motifs, marque: logo ? d.marque : null };
  });

  const trouver = (texte: string) => liste
    .map(({ org, motifs }) => ({ org, pos: Math.min(...motifs.map((m) => texte.search(m)).map((p) => (p < 0 ? Infinity : p))) }))
    .filter((x) => x.pos !== Infinity)
    .sort((a, b) => a.pos - b.pos)
    .map((x) => x.org);
  const marques = liste.filter((x) => x.marque).map((x) => ({ nom: x.org.nom, marque: x.marque as string }));
  return { trouver, marques };
}
