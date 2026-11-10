import { BadRequestException, Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard, Moi, Roles } from '../auth/auth.guard';
import { Utilisateur } from '../auth/auth.service';
import { CurriculumService } from '../curriculum/curriculum.service';
import { DbService } from '../db/db.service';

/** Options L3 dont les cours préremplissent « Mes cours » au premier accès. */
const OPTIONS_PREREMPLIES = ['big-data-ia', 'reseaux-systemes-cloud'];

/** Administration : statistiques agrégées et espace personnel « Mes cours ». */
@Controller('admin')
@UseGuards(AuthGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly db: DbService, private readonly curriculum: CurriculumService) {}

  /** Données agrégées et anonymes uniquement : aucune liste nominative. */
  @Get('statistiques')
  async statistiques() {
    const [comptes] = await this.db.query<{ inscrits: number; verifies: number }>(
      `SELECT count(*)::int AS inscrits, count(*) FILTER (WHERE email_verifie)::int AS verifies
       FROM utilisateurs WHERE role = 'apprenant'`);
    const niveaux = await this.db.query<{ niveau: string; nombre: number }>(
      `SELECT COALESCE(niveau, 'non renseigné') AS niveau, count(*)::int AS nombre
       FROM utilisateurs WHERE role = 'apprenant' GROUP BY 1 ORDER BY 1`);
    const options = await this.db.query<{ option: string; nombre: number }>(
      `SELECT option_l3 AS option, count(*)::int AS nombre
       FROM utilisateurs WHERE role = 'apprenant' AND niveau = 'L3' AND option_l3 IS NOT NULL GROUP BY 1 ORDER BY 1`);
    const parCours = await this.db.query<{ cours: string; commences: number; termines: number; moyenne: number | null; tentatives: number }>(
      `SELECT p.cours,
              count(*) FILTER (WHERE p.statut IN ('en_cours', 'termine'))::int AS commences,
              count(*) FILTER (WHERE p.statut = 'termine')::int AS termines,
              round(avg(100.0 * p.quiz_score / NULLIF(p.quiz_total, 0)))::int AS moyenne,
              COALESCE(sum(p.quiz_essais), 0)::int AS tentatives
       FROM progression p JOIN utilisateurs u ON u.id = p.utilisateur_id AND u.role = 'apprenant'
       GROUP BY p.cours`);

    const idx = new Map(parCours.map((x) => [x.cours, x]));
    const titres = this.curriculum.tous();
    const cours = titres.map((c) => {
      const s = idx.get(c.slug);
      const moyenne = s?.moyenne ?? null;
      const tentatives = s?.tentatives ?? 0;
      return {
        slug: c.slug, titre: c.titre, domaine: c.domaine, visibilite: c.visibilite,
        commences: s?.commences ?? 0, termines: s?.termines ?? 0, moyenneQuiz: moyenne, tentatives,
        aRevoir: moyenne !== null && moyenne < 60 && tentatives >= 5,
      };
    });
    const optionsL3 = this.curriculum.optionsL3();
    return {
      inscrits: comptes.inscrits,
      verifies: comptes.verifies,
      parNiveau: niveaux,
      parOption: options.map((o) => ({ ...o, titre: optionsL3.find((x) => x.code === o.option)?.titre ?? o.option })),
      plusCommences: [...cours].filter((c) => c.commences > 0).sort((a, b) => b.commences - a.commences).slice(0, 10)
        .map(({ slug, titre, commences }) => ({ slug, titre, commences })),
      cours,
    };
  }

  /** Ma liste personnelle de cours à étudier, dans l'ordre choisi. Préremplie au premier accès. */
  @Get('mes-cours')
  async mesCours(@Moi() u: Utilisateur) {
    const [moi] = await this.db.query<{ mes_cours_initialise: boolean }>('SELECT mes_cours_initialise FROM utilisateurs WHERE id = $1', [u.id]);
    if (!moi?.mes_cours_initialise) {
      const tous = this.curriculum.tous();
      const prives = tous.filter((c) => c.visibilite === 'prive').map((c) => c.slug);
      const options = this.curriculum.referentiel(u).niveaux.find((n) => n.code === 'L3')?.options ?? [];
      const deOptions = OPTIONS_PREREMPLIES.flatMap((code) =>
        (options.find((o) => o.code === code)?.semestres ?? []).flatMap((s) => s.ues.flatMap((ue) => ue.cours.map((c) => c.slug))));
      const slugs = [...new Set([...prives, ...deOptions])];
      await this.remplacer(u.id, slugs.map((cours, i) => ({ cours, ordre: i + 1 })));
      await this.db.query('UPDATE utilisateurs SET mes_cours_initialise = true WHERE id = $1', [u.id]);
    }
    return this.db.query('SELECT cours, ordre FROM mes_cours WHERE utilisateur_id = $1 ORDER BY ordre', [u.id]);
  }

  @Put('mes-cours')
  async enregistrer(@Moi() u: Utilisateur, @Body() b: unknown) {
    if (!Array.isArray(b)) throw new BadRequestException('Envoie une liste [{ cours, ordre }].');
    const connus = new Set(this.curriculum.tous().map((c) => c.slug));
    const vus = new Set<string>();
    const lignes = (b as { cours?: unknown; ordre?: unknown }[])
      .map((x) => ({ cours: String(x?.cours ?? ''), ordre: Number(x?.ordre) }))
      .filter((x) => connus.has(x.cours) && Number.isInteger(x.ordre) && !vus.has(x.cours) && vus.add(x.cours))
      .sort((a, c) => a.ordre - c.ordre)
      .map((x, i) => ({ cours: x.cours, ordre: i + 1 }));
    await this.remplacer(u.id, lignes);
    await this.db.query('UPDATE utilisateurs SET mes_cours_initialise = true WHERE id = $1', [u.id]);
    return lignes;
  }

  private remplacer(id: number, lignes: { cours: string; ordre: number }[]) {
    return this.db.transaction(async (c) => {
      await c.query('DELETE FROM mes_cours WHERE utilisateur_id = $1', [id]);
      for (const l of lignes) await c.query('INSERT INTO mes_cours (utilisateur_id, cours, ordre) VALUES ($1, $2, $3)', [id, l.cours, l.ordre]);
    });
  }
}
