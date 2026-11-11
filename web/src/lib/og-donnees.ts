// Données des images et des balises de partage, lues côté serveur depuis l'API.
import { COULEURS_NIVEAUX, infoDomaine, niveauCours } from './contenu.mjs';
import type { Gabarit } from './og';
import { apiServeur } from './og';
import { referentielServeur } from './meta';

interface CoursServeur {
  slug: string; titre: string; domaine: string; objectifs: string[];
  licence: { niveau: string; semestre: string; option?: string }[];
  parcours: { parcours: string; ordre: number }[];
  sujet?: { libelle: string; logo: string | null; icone: string } | null;
}

/** Résumé public d'un cours (liste /cours : sans connexion, sans les cours privés). */
export async function coursServeur(slug: string): Promise<CoursServeur | null> {
  const tous = await apiServeur<CoursServeur[]>('/cours');
  return tous?.find((c) => c.slug === slug) ?? null;
}

/** Gabarit d'un cours : bandeau du niveau (ou du parcours), titre, sujet et sa pastille, domaine. */
export async function gabaritCours(slug: string): Promise<Gabarit | null> {
  const c = await coursServeur(slug);
  if (!c) return null;
  const n = niveauCours(c.licence);
  let bandeau = n.libelle;
  if (!c.licence?.length && c.parcours?.length) {
    const ref = await referentielServeur();
    const p = ref?.parcours.find((x) => x.code === c.parcours[0].parcours);
    if (p) bandeau = `Parcours · ${p.titre}`;
  }
  const d = infoDomaine(c.domaine);
  return { bandeau, couleur: n.couleur, titre: c.titre, sousTitre: c.sujet?.libelle, detail: d.nom, sujet: c.sujet ?? null, accent: d.accent };
}

/** Gabarit d'un parcours métier. */
export async function gabaritParcours(code: string): Promise<(Gabarit & { description: string }) | null> {
  const ref = await referentielServeur();
  const p = ref?.parcours.find((x) => x.code === code);
  if (!p) return null;
  const etapes = p.cours?.length ?? 0;
  const d = infoDomaine(p.domaine);
  const description = `Parcours métier ${p.titre} : ${etapes} étapes, dans l’ordre conseillé.`;
  return { bandeau: 'Parcours métier', couleur: COULEURS_NIVEAUX.parcours, titre: p.titre, sousTitre: `${etapes} étapes, dans l’ordre conseillé`, detail: d.nom, accent: d.accent, description };
}

/** Gabarit d'un niveau de licence (L1, L2, L3). */
export async function gabaritNiveau(code: string): Promise<(Gabarit & { description: string }) | null> {
  const ref = await referentielServeur();
  const n = ref?.niveaux.find((x) => x.code === code);
  if (!n) return null;
  const libelle = `Licence ${code.slice(1)}`;
  const titre = n.titre.split(' · ').slice(1).join(' · ') || n.titre;
  const nbUe = [...(n.semestres ?? []), ...(n.troncCommun ?? []), ...(n.options ?? []).flatMap((o) => o.semestres ?? [])]
    .reduce((t, s) => t + ((s as { ues?: unknown[] }).ues?.length ?? 0), 0);
  const description = `${libelle}, ${titre} : les cours, UE par UE, avec exercices corrigés et quiz.`;
  return {
    bandeau: libelle, couleur: COULEURS_NIVEAUX[code] ?? COULEURS_NIVEAUX.parcours, titre,
    sousTitre: nbUe ? `${nbUe} UE, une notion à la fois` : 'Une notion à la fois', detail: code === 'L3' ? 'Trois options : Big Data et IA, réseaux et cloud, développement logiciel' : undefined,
    description,
  };
}
