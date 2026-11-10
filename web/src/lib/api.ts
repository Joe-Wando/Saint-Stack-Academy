'use client';

export const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export type Role = 'formateur' | 'apprenant';
export interface Utilisateur { id: number; nom: string; email: string; role: Role }
export type Piste = 'groupe' | 'solo' | 'complement';
export interface ResumeCours {
  slug: string; titre: string; piste: Piste; semaine: number; date: string; domaine: string;
  duree: number; niveau: string; objectifs: string[]; prerequis: string[]; referentiels: string[]; nbQuestions: number;
}
export interface Cours extends Omit<ResumeCours, 'nbQuestions'> { contenu: string; quiz: { question: string; choix: string[] }[] }
export interface Progression { cours: string; statut: 'a_faire' | 'en_cours' | 'termine'; quizScore: number | null; quizTotal: number | null; quizEssais: number }

const CLE = 'ssa-session';

export function session(): { jeton: string; utilisateur: Utilisateur } | null {
  try { return JSON.parse(localStorage.getItem(CLE) ?? 'null'); } catch { return null; }
}
export function enregistrerSession(s: { jeton: string; utilisateur: Utilisateur }) {
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
  if (!res.ok) throw new Error(Array.isArray(corps.message) ? corps.message.join(' ') : corps.message ?? 'Erreur réseau.');
  return corps as T;
}

export const PISTES: Record<Piste, string> = { groupe: 'Séance de groupe', solo: 'Parcours solo', complement: 'Complément' };
export const STATUTS = { a_faire: 'À faire', en_cours: 'En cours', termine: 'Terminé' } as const;

export function dateFr(iso: string) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}
export function aujourdHui() {
  return new Date().toISOString().slice(0, 10);
}
export function dateCourte(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
/** Durée en heures : 120 → « 2 h », 90 → « 1 h 30 ». */
export function dureeH(minutes: number) {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return h ? `${h} h${m ? ` ${String(m).padStart(2, '0')}` : ''}` : `${m} min`;
}
