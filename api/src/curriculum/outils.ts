import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import matter = require('gray-matter');
import { config } from '../config';

/** Un logiciel à installer (ou à utiliser en ligne), lu dans content/outils.yaml. */
export interface Logiciel { cle: string; nom: string; role: string; systemes: string[]; site: string; installer: string }
/** Logiciels d'un sujet : ce que le cours utilise, les alternatives, et ce qui marche sans installation. */
export interface OutilsSujet { principal: string[]; autres: string[]; en_ligne: string[]; aucun: boolean }

/**
 * Familles de la page /outils. outils.yaml ne les contient pas (il ne doit pas être modifié) :
 * elles sont définies ici, et un logiciel absent de la liste va dans « Autres ».
 */
export const FAMILLES: { nom: string; cles: string[] }[] = [
  { nom: 'Programmation', cles: ['codeblocks', 'vscode', 'msys2', 'onlinegdb', 'temurin', 'intellij', 'netbeans', 'python', 'jupyter', 'colab', 'nodejs', 'navigateur', 'figma'] },
  { nom: 'Données', cles: ['postgresql', 'mysql', 'dbeaver', 'mongodb', 'redis', 'drawio', 'looping', 'plantuml', 'dbtcore', 'pyspark', 'powerbi'] },
  { nom: 'DevOps', cles: ['git', 'github', 'gitlab', 'dockerdesktop', 'playdocker', 'jenkins', 'minikube', 'helm', 'prometheus', 'ansible', 'netlify', 'vercel', 'awscli'] },
  { nom: 'Systèmes et réseaux', cles: ['wsl', 'virtualbox', 'packettracer', 'wireshark', 'powershell', 'winserver', 'cpuz', 'crystaldisk', 'rufus'] },
  { nom: 'Qualité', cles: ['zap', 'juiceshop', 'postman'] },
  { nom: 'Bureautique', cles: ['trello', 'geogebra', 'libreoffice'] },
];

const logger = new Logger('Outils');
const parse = (matter as unknown as { engines: { yaml: { parse: (s: string) => unknown } } }).engines.yaml.parse;
const liste = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);

/** Lit content/outils.yaml. Fichier absent : aucun bloc « Tes outils » (avertissement dans les journaux). */
export function chargerOutils(): { logiciels: Map<string, Logiciel>; parSujet: Map<string, OutilsSujet> } {
  const f = path.join(config.contentDir, 'outils.yaml');
  if (!fs.existsSync(f)) {
    logger.warn('content/outils.yaml absent : aucun bloc « Tes outils » sur les cours.');
    return { logiciels: new Map(), parSujet: new Map() };
  }
  const brut = (parse(fs.readFileSync(f, 'utf8')) ?? {}) as { logiciels?: Record<string, Omit<Logiciel, 'cle'>>; sujets?: Record<string, Partial<OutilsSujet>> };
  const logiciels = new Map(Object.entries(brut.logiciels ?? {}).map(([cle, l]) => [cle, { cle, nom: String(l.nom), role: String(l.role), systemes: liste(l.systemes), site: String(l.site), installer: String(l.installer) }]));
  const parSujet = new Map(Object.entries(brut.sujets ?? {}).map(([cle, s]) => [cle, { principal: liste(s.principal), autres: liste(s.autres), en_ligne: liste(s.en_ligne), aucun: s.aucun === true }]));
  for (const [cle, s] of parSujet) {
    for (const k of [...s.principal, ...s.autres, ...s.en_ligne]) if (!logiciels.has(k)) logger.warn(`Sujet « ${cle} » : logiciel « ${k} » inconnu dans outils.yaml.`);
  }
  return { logiciels, parSujet };
}
