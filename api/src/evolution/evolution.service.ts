import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CurriculumService } from '../curriculum/curriculum.service';

export type TypeActivite = 'cours_commence' | 'chapitre_lu' | 'cours_termine' | 'quiz';

/** pg renvoie les timestamptz en objets Date : on les passe en ISO pour les trier et les envoyer. */
const iso = (d: unknown) => new Date(d as string).toISOString();

interface Jalon { code: string; titre: string; atteint: boolean; date: string | null; detail?: string }

/**
 * Historique des activités et vue « Mon évolution ».
 * On montre ce qui a été fait, avec sa date : jamais d'objectif daté, de retard ni de série.
 */
@Injectable()
export class EvolutionService {
  constructor(private readonly db: DbService, private readonly curriculum: CurriculumService) {}

  async ajouter(utilisateurId: number, cours: string, type: TypeActivite, detail: Record<string, unknown> | null = null) {
    await this.db.query(
      `INSERT INTO activites (utilisateur_id, cours, type, detail) VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [utilisateurId, cours, type, detail ? JSON.stringify(detail) : null]);
  }

  /** Activités récentes, avec le titre du cours (pour la fiche de l'administration). */
  async historique(utilisateurId: number, limite = 100) {
    const lignes = await this.db.query<{ cours: string; type: TypeActivite; detail: Record<string, unknown> | null; date: string }>(
      `SELECT cours, type, detail, cree_le AS date FROM activites WHERE utilisateur_id = $1 ORDER BY cree_le DESC LIMIT $2`,
      [utilisateurId, limite]);
    const titres = new Map(this.curriculum.tous().map((c) => [c.slug, c.titre]));
    return lignes.map((l) => ({ ...l, date: iso(l.date), titre: titres.get(l.cours) ?? l.cours }));
  }

  async evolution(utilisateurId: number) {
    const tous = this.curriculum.tous();
    const titres = new Map(tous.map((c) => [c.slug, c.titre]));

    const prog = (await this.db.query<{ cours: string; statut: string; quiz_score: number | null; quiz_total: number | null; maj_le: string }>(
      'SELECT cours, statut, quiz_score, quiz_total, maj_le FROM progression WHERE utilisateur_id = $1', [utilisateurId])).map((p) => ({ ...p, maj_le: iso(p.maj_le) }));
    const acts = (await this.db.query<{ cours: string; type: TypeActivite; detail: { score?: number; total?: number } | null; cree_le: string }>(
      'SELECT cours, type, detail, cree_le FROM activites WHERE utilisateur_id = $1 ORDER BY cree_le', [utilisateurId])).map((a) => ({ ...a, cree_le: iso(a.cree_le) }));

    // Date de fin de chaque cours terminé : l'activité si elle existe, sinon la dernière mise à jour (données d'avant l'historique).
    const finDe = new Map<string, string>();
    for (const a of acts) if (a.type === 'cours_termine' && !finDe.has(a.cours)) finDe.set(a.cours, a.cree_le);
    for (const p of prog) if (p.statut === 'termine' && !finDe.has(p.cours)) finDe.set(p.cours, p.maj_le);
    const termines = new Set(prog.filter((p) => p.statut === 'termine').map((p) => p.cours));
    for (const c of [...finDe.keys()]) if (!termines.has(c)) finDe.delete(c); // un cours repassé « en cours » n'est plus terminé

    const quizActs = acts.filter((a) => a.type === 'quiz' && a.detail?.total);
    const quiz = quizActs.map((a) => ({
      cours: a.cours, titre: titres.get(a.cours) ?? a.cours, score: Number(a.detail!.score ?? 0), total: Number(a.detail!.total), date: a.cree_le,
    }));
    const moyenneQuiz = quiz.length ? Math.round((100 * quiz.reduce((s, q) => s + q.score / q.total, 0)) / quiz.length) : null;

    const parSemaine = await this.db.query<{ semaine: string; termines: number; chapitres: number }>(
      `SELECT to_char(s.semaine, 'YYYY-MM-DD') AS semaine,
              count(a.*) FILTER (WHERE a.type = 'cours_termine')::int AS termines,
              count(a.*) FILTER (WHERE a.type = 'chapitre_lu')::int AS chapitres
       FROM generate_series(date_trunc('week', now()) - interval '11 weeks', date_trunc('week', now()), interval '1 week') AS s(semaine)
       LEFT JOIN activites a ON a.utilisateur_id = $1 AND a.cree_le >= s.semaine AND a.cree_le < s.semaine + interval '1 week'
       GROUP BY s.semaine ORDER BY s.semaine`, [utilisateurId]);

    // Par domaine : avancement sur les cours publics et moyenne des meilleurs scores.
    const idx = new Map(prog.map((p) => [p.cours, p]));
    const domaines = [...new Set(tous.filter((c) => c.visibilite === 'public').map((c) => c.domaine))].map((domaine) => {
      const cours = tous.filter((c) => c.domaine === domaine && c.visibilite === 'public');
      const faits = cours.filter((c) => termines.has(c.slug)).length;
      const avecQuiz = cours.map((c) => idx.get(c.slug)).filter((p) => p?.quiz_total);
      const moyenne = avecQuiz.length ? Math.round((100 * avecQuiz.reduce((s, p) => s + (p!.quiz_score ?? 0) / (p!.quiz_total ?? 1), 0)) / avecQuiz.length) : null;
      const avance = cours.length ? faits / cours.length : 0;
      const niveau = avance >= 0.9 && (moyenne ?? 0) >= 80 ? 'Opérationnel' : avance >= 0.5 && (moyenne ?? 0) >= 60 ? 'Bases' : faits > 0 ? 'Découverte' : 'Pas commencé';
      return { domaine, total: cours.length, termines: faits, moyenneQuiz: moyenne, niveau };
    });

    const notes = await this.db.query<{ cours: string; maj_le: string }>(
      "SELECT cours, maj_le FROM notes WHERE utilisateur_id = $1 AND btrim(contenu) <> '' ORDER BY maj_le DESC", [utilisateurId]);
    const [badge] = await this.db.query<{ date: string; nom: string }>(
      "SELECT to_char(obtenue_le, 'YYYY-MM-DD') AS date, nom FROM certifications_obtenues WHERE utilisateur_id = $1 ORDER BY obtenue_le, id LIMIT 1", [utilisateurId]);
    const [{ chapitres }] = await this.db.query<{ chapitres: number }>(
      "SELECT count(*)::int AS chapitres FROM activites WHERE utilisateur_id = $1 AND type = 'chapitre_lu'", [utilisateurId]);

    return {
      totaux: {
        coursTermines: termines.size,
        coursCommences: prog.filter((p) => p.statut === 'en_cours' || p.statut === 'termine').length,
        chapitresLus: chapitres,
        quizPasses: quiz.length,
        moyenneQuiz,
      },
      parSemaine,
      quiz,
      domaines,
      jalons: [
        ...this.jalons(finDe, quiz, prog),
        { code: 'badge', titre: 'Premier badge obtenu', atteint: !!badge, date: badge?.date ?? null, detail: badge?.nom },
      ],
      notes: notes.map((n) => ({ cours: n.cours, titre: titres.get(n.cours) ?? n.cours, majLe: iso(n.maj_le) })),
    };
  }

  /** Jalons atteints, avec la date à laquelle ils l'ont été. */
  private jalons(finDe: Map<string, string>, quiz: { score: number; total: number; date: string }[], prog: { quiz_score: number | null; quiz_total: number | null; maj_le: string }[]): Jalon[] {
    const dates = [...finDe.values()].sort();
    const nieme = (n: number, titre: string, code: string): Jalon => ({ code, titre, atteint: dates.length >= n, date: dates[n - 1] ?? null });
    const parfait = quiz.find((q) => q.total >= 5 && q.score === q.total)?.date
      ?? prog.filter((p) => p.quiz_total && p.quiz_total >= 5 && p.quiz_score === p.quiz_total).map((p) => p.maj_le).sort()[0] ?? null;

    // Un ensemble de cours est « complet » quand tous ses cours sont terminés ; sa date est celle du dernier terminé.
    const complet = (slugs: string[]) => (slugs.length && slugs.every((s) => finDe.has(s)) ? slugs.map((s) => finDe.get(s)!).sort().pop()! : null);
    const premier = (ensembles: { nom: string; slugs: string[] }[]) => ensembles
      .map((e) => ({ nom: e.nom, date: complet(e.slugs) }))
      .filter((e): e is { nom: string; date: string } => !!e.date)
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;

    const ref = this.curriculum.referentiel({ role: 'apprenant' });
    const semestres = ref.niveaux.flatMap((n) => [
      ...n.semestres.map((s) => ({ nom: `${n.code} · ${s.code}`, ues: s.ues })),
      ...n.troncCommun.map((s) => ({ nom: `${n.code} · ${s.code} (tronc commun)`, ues: s.ues })),
      ...n.options.flatMap((o) => o.semestres.map((s) => ({ nom: `${n.code} · ${s.code} · ${o.titre}`, ues: s.ues }))),
    ]);
    const ue = premier(semestres.flatMap((s) => s.ues.map((u) => ({ nom: u.titre, slugs: u.cours.map((c) => c.slug) }))));
    const semestre = premier(semestres.map((s) => ({ nom: s.nom, slugs: s.ues.flatMap((u) => u.cours.map((c) => c.slug)) })));
    const parcours = premier(ref.parcours.map((p) => ({ nom: p.titre, slugs: p.cours.map((c) => c.slug) })));

    return [
      nieme(1, 'Premier cours terminé', 'cours-1'),
      nieme(5, '5 cours terminés', 'cours-5'),
      nieme(10, '10 cours terminés', 'cours-10'),
      nieme(25, '25 cours terminés', 'cours-25'),
      { code: 'quiz-parfait', titre: 'Premier quiz à 5 sur 5', atteint: !!parfait, date: parfait },
      { code: 'ue', titre: 'Une UE complète', atteint: !!ue, date: ue?.date ?? null, detail: ue?.nom },
      { code: 'semestre', titre: 'Un semestre complet', atteint: !!semestre, date: semestre?.date ?? null, detail: semestre?.nom },
      { code: 'parcours', titre: 'Un parcours métier complet', atteint: !!parcours, date: parcours?.date ?? null, detail: parcours?.nom },
    ];
  }
}
