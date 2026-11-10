import { BadRequestException, Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard, Moi } from '../auth/auth.guard';
import { Utilisateur } from '../auth/auth.service';
import { CurriculumService } from '../curriculum/curriculum.service';
import { DbService } from '../db/db.service';
import { EvolutionService } from '../evolution/evolution.service';

const STATUTS = ['a_faire', 'en_cours', 'termine'];

@Controller()
@UseGuards(AuthGuard)
export class ProgressController {
  constructor(private readonly db: DbService, private readonly curriculum: CurriculumService, private readonly evolution: EvolutionService) {}

  @Get('progression')
  async mienne(@Moi() u: Utilisateur) {
    return this.db.query(
      'SELECT cours, statut, quiz_score AS "quizScore", quiz_total AS "quizTotal", quiz_essais AS "quizEssais", maj_le AS "majLe" FROM progression WHERE utilisateur_id = $1',
      [u.id]);
  }

  @Post('progression/:slug')
  async statut(@Param('slug') slug: string, @Body() b: { statut: string }, @Moi() u: Utilisateur) {
    if (!STATUTS.includes(b?.statut)) throw new BadRequestException('Statut inconnu.');
    this.curriculum.un(slug, u); // vérifie que le cours existe et est accessible (404 sinon)
    const [avant] = await this.db.query<{ statut: string }>('SELECT statut FROM progression WHERE utilisateur_id = $1 AND cours = $2', [u.id, slug]);
    await this.db.query(
      `INSERT INTO progression (utilisateur_id, cours, statut) VALUES ($1, $2, $3)
       ON CONFLICT (utilisateur_id, cours) DO UPDATE SET statut = EXCLUDED.statut, maj_le = now()`,
      [u.id, slug, b.statut]);
    // Historique : seulement quand le statut change vraiment.
    if (avant?.statut !== b.statut) {
      if (b.statut === 'en_cours' && (!avant || avant.statut === 'a_faire')) await this.evolution.ajouter(u.id, slug, 'cours_commence');
      if (b.statut === 'termine') await this.evolution.ajouter(u.id, slug, 'cours_termine');
    }
    return { ok: true };
  }

  /** Un chapitre lu : enregistré une seule fois par couple (cours, chapitre). */
  @Post('progression/:slug/chapitre')
  async chapitre(@Param('slug') slug: string, @Body() b: { chapitre?: unknown }, @Moi() u: Utilisateur) {
    const n = Number(b?.chapitre);
    if (!Number.isInteger(n) || n < 0 || n > 200) throw new BadRequestException('Numéro de chapitre invalide.');
    this.curriculum.un(slug, u);
    await this.evolution.ajouter(u.id, slug, 'chapitre_lu', { chapitre: n });
    return { ok: true };
  }

  @Post('progression/:slug/quiz')
  async quiz(@Param('slug') slug: string, @Body() b: { reponses: number[] }, @Moi() u: Utilisateur) {
    if (!Array.isArray(b?.reponses)) throw new BadRequestException('Réponses manquantes.');
    const res = this.curriculum.corriger(slug, u, b.reponses);
    const [avant] = await this.db.query<{ statut: string }>('SELECT statut FROM progression WHERE utilisateur_id = $1 AND cours = $2', [u.id, slug]);
    await this.db.query(
      `INSERT INTO progression (utilisateur_id, cours, statut, quiz_score, quiz_total, quiz_essais) VALUES ($1, $2, 'en_cours', $3, $4, 1)
       ON CONFLICT (utilisateur_id, cours) DO UPDATE SET
         quiz_score = GREATEST(COALESCE(progression.quiz_score, 0), EXCLUDED.quiz_score),
         quiz_total = EXCLUDED.quiz_total, quiz_essais = progression.quiz_essais + 1, maj_le = now()`,
      [u.id, slug, res.score, res.total]);
    if (!avant) await this.evolution.ajouter(u.id, slug, 'cours_commence');
    // Toutes les tentatives sont gardées, avec les questions ratées (pour repérer la plus ratée de chaque cours).
    await this.evolution.ajouter(u.id, slug, 'quiz', {
      score: res.score, total: res.total, ratees: res.detail.map((d, i) => (d.correct ? -1 : i)).filter((i) => i >= 0),
    });
    return res;
  }

  @Get('notes/:slug')
  async lireNote(@Param('slug') slug: string, @Moi() u: Utilisateur) {
    const [n] = await this.db.query('SELECT contenu FROM notes WHERE utilisateur_id = $1 AND cours = $2', [u.id, slug]);
    return { contenu: n?.contenu ?? '' };
  }

  @Put('notes/:slug')
  async ecrireNote(@Param('slug') slug: string, @Body() b: { contenu: string }, @Moi() u: Utilisateur) {
    const contenu = String(b?.contenu ?? '').slice(0, 20000);
    await this.db.query(
      `INSERT INTO notes (utilisateur_id, cours, contenu) VALUES ($1, $2, $3)
       ON CONFLICT (utilisateur_id, cours) DO UPDATE SET contenu = EXCLUDED.contenu, maj_le = now()`,
      [u.id, slug, contenu]);
    return { ok: true };
  }
}
