export interface Domaine {
  cle: string; nom: string; noms: string[]; fond: string; texte: string; accent: string; description: string;
}
export interface Chapitre { titre: string; corps: string }
export interface Diapo { titre: string; sousTitre: string | null; blocs: string[] }

export const DOMAINES: Domaine[];
export const ORDRE_DOMAINES: string[];
export const LIGNES_PAR_DIAPO: number;
export function infoDomaine(nomDomaine: string): Domaine;
export function illustration(nomDomaine: string): string;
export function chapitres(markdown: string): Chapitre[];
export function estCorrection(titre: string): boolean;
export function blocs(corps: string): string[];
export function poidsBloc(bloc: string): number;
export function diapos(chapitre: Chapitre, lignesMax?: number): Diapo[];
export type Diapositive =
  | { type: 'couverture' }
  | { type: 'objectifs'; objectifs: string[] }
  | ({ type: 'contenu' } & Diapo)
  | { type: 'question'; numero: number; total: number; question: string; choix: string[] };
export function plan(cours: { titre: string; domaine: string; contenu: string; objectifs?: string[]; quiz?: { question: string; choix: string[] }[] }): Diapositive[];
