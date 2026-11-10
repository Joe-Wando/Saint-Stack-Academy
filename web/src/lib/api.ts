'use client';

export const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export type Role = 'admin' | 'apprenant';
export type Niveau = 'L1' | 'L2' | 'L3' | 'autre';
export interface Utilisateur {
  id: number; nom: string; email: string; role: Role;
  niveau: Niveau | null; optionL3: string | null; etablissement: string | null; inscritLe?: string; photo?: string | null; bienvenueVue?: boolean;
}
export interface PlaceLicence { niveau: string; semestre: string; ue: string; option?: string }
export interface ResumeCours {
  slug: string; titre: string; domaine: string; duree: number; difficulte: string; ordre: number;
  objectifs: string[]; nbQuestions: number; visibilite: 'public' | 'prive';
  licence: PlaceLicence[]; parcours: { parcours: string; ordre: number }[];
}
export type Emplacement =
  | ({ type: 'licence'; optionTitre: string | null; suivant: { slug: string; titre: string } | null } & PlaceLicence)
  | { type: 'parcours'; code: string; titre: string; etape: number; total: number; suivant: { slug: string; titre: string } | null };
export interface Cours {
  slug: string; titre: string; domaine: string; duree: number; difficulte: string; ordre: number; visibilite: 'public' | 'prive';
  objectifs: string[]; prerequis: string[]; referentiels: string[];
  prerequisCours: { slug: string; titre: string }[];
  emplacements: Emplacement[];
  contenu: string; quiz: { question: string; choix: string[] }[];
}
export interface Progression { cours: string; statut: 'a_faire' | 'en_cours' | 'termine'; quizScore: number | null; quizTotal: number | null; quizEssais: number }

export interface UeRef { titre: string; cours: ResumeCours[] }
export interface SemestreRef { code: string; ues: UeRef[] }
export interface Referentiel {
  niveaux: { code: string; titre: string; semestres: SemestreRef[]; troncCommun: SemestreRef[]; options: { code: string; titre: string; semestres: SemestreRef[] }[] }[];
  parcours: { code: string; titre: string; domaine: string; cours: (ResumeCours & { etape: number })[] }[];
}
export interface ElementCertification {
  nom: string; organisme: string; type: 'badge' | 'certificat' | 'certification'; cout: string;
  ue?: string; prepare?: string; facultatif?: boolean; lien?: string;
}
export interface Certifications {
  niveaux: { L1: { intro: string; elements: ElementCertification[] }; L2: { intro: string; elements: ElementCertification[] }; L3: { intro: string; options: Record<string, ElementCertification[]> } };
  conseils: string[];
}
export interface MonNiveau {
  certifications?: ElementCertification[];
  niveau: string | null; option: { code: string; titre: string } | null; titre: string | null;
  ues: { niveau: string; semestre: string; ue: string; option: string | null; cours: ResumeCours[] }[];
}

const CLE = 'ssa-session';
type Session = { jeton: string; utilisateur: Utilisateur };

export function session(): Session | null {
  try { return JSON.parse(localStorage.getItem(CLE) ?? 'null'); } catch { return null; }
}
export function enregistrerSession(s: Session) {
  try { localStorage.setItem(CLE, JSON.stringify(s)); } catch { /* navigation privée */ }
}
export function deconnecter() {
  try { localStorage.removeItem(CLE); } catch { /* rien */ }
  window.location.href = '/connexion';
}

/** Appel à l'API avec le jeton de session ; renvoie vers la connexion si la session a expiré. */
export async function api<T>(chemin: string, options: RequestInit = {}): Promise<T> {
  const s = session();
  const res = await fetch(`${API}${chemin}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(s ? { authorization: `Bearer ${s.jeton}` } : {}), ...(options.headers ?? {}) },
  });
  if (res.status === 401 && s) { deconnecter(); throw new Error('Session expirée.'); }
  const corps = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(Array.isArray(corps.message) ? corps.message.join(' ') : corps.message ?? 'Erreur réseau.') as Error & { statut?: number };
    e.statut = res.status;
    throw e;
  }
  return corps as T;
}

export const STATUTS = { a_faire: 'À faire', en_cours: 'En cours', termine: 'Terminé' } as const;
export const NIVEAUX: Record<Niveau, string> = { L1: 'Licence 1', L2: 'Licence 2', L3: 'Licence 3', autre: 'Autre parcours' };
export const DIFFICULTES = ['découverte', 'bases', 'opérationnel'] as const;
export const capitale = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Durée en heures : 120 → « 2 h », 90 → « 1 h 30 ». */
export function dureeH(minutes: number) {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return h ? `${h} h${m ? ` ${String(m).padStart(2, '0')}` : ''}` : `${m} min`;
}

/** Libellé du niveau d'un utilisateur : « Licence 3 · Big Data et intelligence artificielle ». */
export function libelleNiveau(u: Pick<Utilisateur, 'niveau' | 'optionL3'>, optionTitre?: string | null) {
  if (!u.niveau) return 'Niveau à préciser';
  return u.niveau === 'L3' && optionTitre ? `${NIVEAUX.L3} · ${optionTitre}` : NIVEAUX[u.niveau];
}

/** Index de la progression par slug. */
export const indexer = (prog: Progression[]) => new Map(prog.map((p) => [p.cours, p]));
export const pourcent = (n: number, d: number) => (d ? Math.round((100 * n) / d) : 0);

/** Adresse publique d'une photo de profil. */
export const urlPhoto = (photo?: string | null) => (photo ? `${API}/photos/${photo}` : null);

/** La progression si l'on est connecté, une liste vide sinon (pages consultables sans compte). */
export const progressionSiConnecte = () => (session() ? api<Progression[]>('/progression') : Promise.resolve([] as Progression[]));

/** Page où revenir après l'inscription et la connexion (mémorisée pendant la vérification de l'e-mail). */
export function memoriserSuite(chemin: string) {
  try { if (chemin) localStorage.setItem('ssa-suite', chemin); } catch { /* indisponible */ }
}
export function reprendreSuite() {
  try { const s = localStorage.getItem('ssa-suite') ?? ''; localStorage.removeItem('ssa-suite'); return s; } catch { return ''; }
}
