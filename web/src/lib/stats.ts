import { Progression, ResumeCours } from './api';

export interface StatDomaine { domaine: string; total: number; termines: number; quiz: number | null }

/** Calcule l'avancement par domaine et le niveau atteint, à partir du programme et de la progression. */
export function parDomaine(programme: ResumeCours[], prog: Progression[]): StatDomaine[] {
  const idx = new Map(prog.map((p) => [p.cours, p]));
  const domaines = [...new Set(programme.map((c) => c.domaine))];
  return domaines.map((domaine) => {
    const cours = programme.filter((c) => c.domaine === domaine);
    const termines = cours.filter((c) => idx.get(c.slug)?.statut === 'termine').length;
    const avecQuiz = cours.map((c) => idx.get(c.slug)).filter((p) => p?.quizTotal) as Progression[];
    const quiz = avecQuiz.length ? Math.round((100 * avecQuiz.reduce((s, p) => s + (p.quizScore ?? 0) / (p.quizTotal ?? 1), 0)) / avecQuiz.length) : null;
    return { domaine, total: cours.length, termines, quiz };
  });
}

/** Niveau de maîtrise d'un domaine, sur l'échelle utilisée dans tout le programme. */
export function niveau(s: StatDomaine): { label: string; cls: string } {
  const avance = s.total ? s.termines / s.total : 0;
  const q = s.quiz ?? 0;
  if (avance >= 0.9 && q >= 80) return { label: 'Opérationnel', cls: 'lvl-3' };
  if (avance >= 0.5 && q >= 60) return { label: 'Bases', cls: 'lvl-2' };
  if (avance > 0) return { label: 'Découverte', cls: 'lvl-1' };
  return { label: 'Pas commencé', cls: 'lvl-0' };
}

export function pourcent(n: number, d: number) {
  return d ? Math.round((100 * n) / d) : 0;
}
