import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard, Roles } from '../auth/auth.guard';
import { CurriculumService } from '../curriculum/curriculum.service';
import { DbService } from '../db/db.service';

/** Tableau de bord du formateur : avancement de chaque apprenant sur les séances de groupe. */
@Controller('formateur')
@UseGuards(AuthGuard)
@Roles('formateur')
export class FormateurController {
  constructor(private readonly db: DbService, private readonly curriculum: CurriculumService) {}

  @Get('apercu')
  async apercu() {
    const seances = this.curriculum.tous().filter((c) => c.piste === 'groupe');
    const slugs = new Set(seances.map((s) => s.slug));
    const apprenants = await this.db.query<{ id: number; nom: string; email: string; cree_le: string }>(
      "SELECT id, nom, email, cree_le FROM utilisateurs WHERE role = 'apprenant' ORDER BY nom");
    const lignes = await this.db.query<{ utilisateur_id: number; cours: string; statut: string; quiz_score: number | null; quiz_total: number | null }>(
      'SELECT utilisateur_id, cours, statut, quiz_score, quiz_total FROM progression');

    const parApprenant = apprenants.map((a) => {
      const siens = lignes.filter((l) => l.utilisateur_id === a.id && slugs.has(l.cours));
      const termines = siens.filter((l) => l.statut === 'termine').length;
      const quiz = siens.filter((l) => l.quiz_total);
      const moyenne = quiz.length ? Math.round((100 * quiz.reduce((s, l) => s + (l.quiz_score ?? 0) / (l.quiz_total ?? 1), 0)) / quiz.length) : null;
      return {
        id: a.id, nom: a.nom, email: a.email, inscritLe: a.cree_le,
        termines, total: seances.length, moyenneQuiz: moyenne,
        cours: Object.fromEntries(siens.map((l) => [l.cours, { statut: l.statut, score: l.quiz_score, total: l.quiz_total }])),
      };
    });

    const parSeance = seances.map((s) => {
      const ls = lignes.filter((l) => l.cours === s.slug && apprenants.some((a) => a.id === l.utilisateur_id));
      const quiz = ls.filter((l) => l.quiz_total);
      return {
        slug: s.slug, titre: s.titre, date: s.date, semaine: s.semaine, domaine: s.domaine,
        termines: ls.filter((l) => l.statut === 'termine').length,
        moyenneQuiz: quiz.length ? Math.round((100 * quiz.reduce((x, l) => x + (l.quiz_score ?? 0) / (l.quiz_total ?? 1), 0)) / quiz.length) : null,
      };
    });
    return { apprenants: parApprenant, seances: parSeance };
  }
}
