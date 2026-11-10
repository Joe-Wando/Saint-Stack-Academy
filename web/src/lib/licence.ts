import type { SemestreRef } from './api';

/** Tous les cours (sans doublon) d'une ou plusieurs listes de semestres. */
export function slugsDe(...groupes: SemestreRef[][]) {
  return [...new Set(groupes.flat().flatMap((s) => s.ues.flatMap((u) => u.cours.map((c) => c.slug))))];
}

/** Ancre d'une UE dans /licence/<niveau> : « S3-Bases de données… » → « s3-bases-de-donnees… ». */
export const ancreUe = (semestre: string, ue: string) =>
  `${semestre}-${ue}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
