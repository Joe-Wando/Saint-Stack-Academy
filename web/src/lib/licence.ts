import type { Referentiel, SemestreRef } from './api';

/** Tous les cours (sans doublon) d'une ou plusieurs listes de semestres. */
export function slugsDe(...sections: SemestreRef[][]) {
  return [...new Set(sections.flat().flatMap((s) => s.ues.flatMap((u) => u.cours.map((c) => c.slug))))];
}

/** Ancre d'une UE dans /licence/<niveau> : « S3-Bases de données… » → « s3-bases-de-donnees… ». */
export const ancreUe = (semestre: string, ue: string) =>
  `${semestre}-${ue}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Lien vers l'UE de la licence qui prépare à une certification (si elle existe dans le référentiel). */
export function lienUeDepuis(ref: Referentiel | null, niveau: string, ue?: string) {
  if (!ref || !ue) return null;
  const n = ref.niveaux.find((x) => x.code === niveau);
  const sems = n ? [...n.semestres, ...n.troncCommun, ...n.options.flatMap((o) => o.semestres)] : [];
  const s = sems.find((x) => x.ues.some((u) => u.titre === ue));
  return s ? `/licence/${niveau}#${ancreUe(s.code, ue)}` : null;
}
