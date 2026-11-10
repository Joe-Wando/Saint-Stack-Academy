import {
  BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard, Moi, Roles } from '../auth/auth.guard';
import { AuthService, NIVEAUX, Utilisateur } from '../auth/auth.service';
import { CurriculumService } from '../curriculum/curriculum.service';
import { DbService } from '../db/db.service';
import { EvolutionService } from '../evolution/evolution.service';
import { PhotoService } from '../moi/photo.service';

/** Options L3 dont les cours préremplissent « Mes cours » au premier accès. */
const OPTIONS_PREREMPLIES = ['big-data-ia', 'reseaux-systemes-cloud'];
/** Dernière activité d'un compte : progression, historique ou inscription. */
const DERNIERE_ACTIVITE = `GREATEST(u.cree_le,
  (SELECT max(maj_le) FROM progression WHERE utilisateur_id = u.id),
  (SELECT max(cree_le) FROM activites WHERE utilisateur_id = u.id))`;
const iso = (d: unknown) => (d ? new Date(d as string).toISOString() : null);

/**
 * Administration. Toutes les routes exigent le rôle admin, vérifié côté serveur à chaque requête.
 * Chaque action sur un compte est enregistrée dans le journal d'administration.
 */
@Controller('admin')
@UseGuards(AuthGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly db: DbService, private readonly curriculum: CurriculumService, private readonly auth: AuthService,
    private readonly evolution: EvolutionService, private readonly photos: PhotoService,
  ) {}

  private journaliser(admin: Utilisateur, action: string, cible: string, detail: Record<string, unknown> = {}) {
    return this.db.query('INSERT INTO journal_admin (admin_id, action, cible, detail) VALUES ($1, $2, $3, $4)',
      [admin.id, action, cible, JSON.stringify(detail)]);
  }

  // ----- Tableau de bord ------------------------------------------------------------------------
  @Get()
  async tableau() {
    const [c] = await this.db.query<Record<string, number>>(`
      SELECT
        (SELECT count(*) FROM utilisateurs WHERE role = 'apprenant')::int AS inscrits,
        (SELECT count(*) FROM utilisateurs WHERE role = 'apprenant' AND email_verifie)::int AS verifies,
        (SELECT count(DISTINCT utilisateur_id) FROM activites WHERE cree_le > now() - interval '7 days')::int AS actifs7,
        (SELECT count(DISTINCT utilisateur_id) FROM activites WHERE cree_le > now() - interval '30 days')::int AS actifs30,
        (SELECT count(*) FROM progression WHERE statut = 'termine')::int AS "coursTermines",
        (SELECT count(*) FROM activites WHERE type = 'quiz')::int AS "quizPasses",
        (SELECT count(*) FROM messages WHERE NOT lu)::int AS "messagesNonLus",
        (SELECT count(*) FROM certifications_obtenues)::int AS "badgesDeclares"`);
    const semaines = (table: string, colonne: string, filtre = 'true') => this.db.query<{ semaine: string; nombre: number }>(`
      SELECT to_char(s.semaine, 'YYYY-MM-DD') AS semaine, count(t.*)::int AS nombre
      FROM generate_series(date_trunc('week', now()) - interval '11 weeks', date_trunc('week', now()), interval '1 week') AS s(semaine)
      LEFT JOIN ${table} t ON ${filtre} AND t.${colonne} >= s.semaine AND t.${colonne} < s.semaine + interval '1 week'
      GROUP BY s.semaine ORDER BY s.semaine`);
    const optionsL3 = this.curriculum.optionsL3();
    const parOption = await this.db.query<{ option: string; nombre: number }>(
      `SELECT option_l3 AS option, count(*)::int AS nombre FROM utilisateurs
       WHERE role = 'apprenant' AND niveau = 'L3' AND option_l3 IS NOT NULL GROUP BY 1 ORDER BY 1`);
    return {
      chiffres: c,
      inscriptionsParSemaine: await semaines('utilisateurs', 'cree_le', "t.role = 'apprenant'"),
      activiteParSemaine: await semaines('activites', 'cree_le'),
      parNiveau: await this.db.query(
        `SELECT COALESCE(niveau, 'non renseigné') AS niveau, count(*)::int AS nombre
         FROM utilisateurs WHERE role = 'apprenant' GROUP BY 1 ORDER BY 1`),
      parOption: parOption.map((o) => ({ ...o, titre: optionsL3.find((x) => x.code === o.option)?.titre ?? o.option })),
      derniersInscrits: (await this.db.query(
        `SELECT id, nom, email, photo, niveau, cree_le AS "inscritLe" FROM utilisateurs ORDER BY cree_le DESC LIMIT 5`))
        .map((x) => ({ ...x, inscritLe: iso(x.inscritLe) })),
      derniersMessages: (await this.db.query(
        `SELECT id, nom, sujet, lu, cree_le AS date FROM messages ORDER BY cree_le DESC LIMIT 5`)).map((x) => ({ ...x, date: iso(x.date) })),
      journal: (await this.db.query(
        `SELECT j.id, j.action, j.cible, j.detail, j.cree_le AS date, a.nom AS admin
         FROM journal_admin j LEFT JOIN utilisateurs a ON a.id = j.admin_id ORDER BY j.cree_le DESC LIMIT 20`)).map((x) => ({ ...x, date: iso(x.date) })),
    };
  }

  // ----- Utilisateurs ---------------------------------------------------------------------------
  /** Recherche sur le nom ou l'e-mail, filtres (niveau, vérifié, actif, rôle), tri et pages de 25. */
  @Get('utilisateurs')
  async utilisateurs(
    @Query('q') q = '', @Query('niveau') niveau = '', @Query('verifie') verifie = '', @Query('actif') actif = '',
    @Query('role') role = '', @Query('tri') tri = 'inscription', @Query('page') page = '1',
  ) {
    const conditions: string[] = [];
    const params: unknown[] = [];
    const ajouter = (sql: string, v: unknown) => { params.push(v); conditions.push(sql.replace('?', `$${params.length}`)); };
    const recherche = String(q).trim().slice(0, 100);
    if (recherche) {
      // Les caractères spéciaux de LIKE (% _ \) sont échappés : on cherche le texte tel quel.
      params.push(`%${recherche.replace(/[%_\\]/g, (x) => `\\${x}`)}%`);
      conditions.push(`(u.nom ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }
    if (niveau === 'aucun') conditions.push('u.niveau IS NULL');
    else if ((NIVEAUX as string[]).includes(String(niveau))) ajouter('u.niveau = ?', niveau);
    if (verifie === 'oui') conditions.push('u.email_verifie');
    if (verifie === 'non') conditions.push('NOT u.email_verifie');
    if (actif === 'oui') conditions.push(`${DERNIERE_ACTIVITE} > now() - interval '30 days'`);
    if (actif === 'non') conditions.push(`${DERNIERE_ACTIVITE} <= now() - interval '30 days'`);
    if (actif === 'suspendu') conditions.push('u.suspendu');
    if (role === 'admin' || role === 'apprenant') ajouter('u.role = ?', role);
    const ou = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const ordre = {
      inscription: 'u.cree_le DESC',
      activite: '"derniereActivite" DESC, u.cree_le DESC',
      nom: 'lower(u.nom) ASC',
      termines: 'termines DESC, u.nom ASC',
    }[String(tri)] ?? 'u.cree_le DESC';
    const parPage = 25;
    const p = Math.max(1, Number.parseInt(String(page), 10) || 1);

    const [{ total }] = await this.db.query<{ total: number }>(`SELECT count(*)::int AS total FROM utilisateurs u ${ou}`, params);
    const lignes = await this.db.query(
      `SELECT u.id, u.nom, u.email, u.role, u.niveau, u.option_l3 AS "optionL3", u.etablissement, u.photo, u.suspendu,
              u.email_verifie AS "emailVerifie", u.cree_le AS "inscritLe", ${DERNIERE_ACTIVITE} AS "derniereActivite",
              (SELECT count(*) FROM progression WHERE utilisateur_id = u.id AND statut IN ('en_cours', 'termine'))::int AS commences,
              (SELECT count(*) FROM progression WHERE utilisateur_id = u.id AND statut = 'termine')::int AS termines,
              (SELECT round(avg(100.0 * quiz_score / NULLIF(quiz_total, 0)))::int FROM progression WHERE utilisateur_id = u.id) AS "moyenneQuiz"
       FROM utilisateurs u ${ou}
       ORDER BY ${ordre}
       LIMIT ${parPage} OFFSET ${(p - 1) * parPage}`, params);
    const optionsL3 = this.curriculum.optionsL3();
    return {
      total, page: p, parPage, pages: Math.max(1, Math.ceil(total / parPage)),
      utilisateurs: lignes.map((l) => ({
        ...l, inscritLe: iso(l.inscritLe), derniereActivite: iso(l.derniereActivite),
        optionTitre: optionsL3.find((o) => o.code === l.optionL3)?.titre ?? null,
      })),
    };
  }

  /** Fiche : profil, la même vue « Mon évolution » que l'étudiant, son historique et ses quiz. */
  @Get('utilisateurs/:id')
  async fiche(@Param('id', ParseIntPipe) id: number) {
    const [u] = await this.db.query(
      `SELECT id, nom, email, role, niveau, option_l3 AS "optionL3", etablissement, photo, suspendu,
              email_verifie AS "emailVerifie", cree_le AS "inscritLe", confidentialite_acceptee_le AS "confidentialiteAccepteeLe"
       FROM utilisateurs WHERE id = $1`, [id]);
    if (!u) throw new NotFoundException('Compte introuvable.');
    return {
      utilisateur: {
        ...u, inscritLe: iso(u.inscritLe), confidentialiteAccepteeLe: iso(u.confidentialiteAccepteeLe),
        optionTitre: this.curriculum.optionsL3().find((o) => o.code === u.optionL3)?.titre ?? null,
      },
      evolution: await this.evolution.evolution(id),
      activites: await this.evolution.historique(id, 100),
      certifications: await this.db.query(
        `SELECT id, nom, organisme, type, to_char(obtenue_le, 'YYYY-MM-DD') AS "obtenueLe", lien_verification AS "lienVerification"
         FROM certifications_obtenues WHERE utilisateur_id = $1 ORDER BY obtenue_le DESC`, [id]),
    };
  }

  private async compte(id: number) {
    const [u] = await this.db.query<{ id: number; nom: string; email: string; role: string; email_verifie: boolean; photo: string | null }>(
      'SELECT id, nom, email, role, email_verifie, photo FROM utilisateurs WHERE id = $1', [id]);
    if (!u) throw new NotFoundException('Compte introuvable.');
    return u;
  }
  private pasSoiMeme(admin: Utilisateur, id: number, action: string) {
    if (admin.id === id) throw new ForbiddenException(`Tu ne peux pas ${action} ton propre compte.`);
  }

  @Patch('utilisateurs/:id')
  async modifier(@Moi() admin: Utilisateur, @Param('id', ParseIntPipe) id: number, @Body() b: { niveau?: unknown; optionL3?: unknown }) {
    const u = await this.compte(id);
    const res = await this.auth.modifier(id, { niveau: b?.niveau, optionL3: b?.optionL3 });
    await this.journaliser(admin, 'changement_niveau', u.email, { niveau: res.utilisateur.niveau, optionL3: res.utilisateur.optionL3 });
    return { ok: true };
  }

  @Post('utilisateurs/:id/renvoyer-verification')
  async renvoyer(@Moi() admin: Utilisateur, @Param('id', ParseIntPipe) id: number) {
    const u = await this.compte(id);
    if (u.email_verifie) throw new BadRequestException('Cette adresse est déjà vérifiée.');
    await this.auth.renvoyerVerification(u.email);
    await this.journaliser(admin, 'renvoi_verification', u.email);
    return { message: 'Lien de vérification renvoyé.' };
  }

  @Post('utilisateurs/:id/verifier')
  async verifier(@Moi() admin: Utilisateur, @Param('id', ParseIntPipe) id: number) {
    const u = await this.compte(id);
    await this.db.query('UPDATE utilisateurs SET email_verifie = true WHERE id = $1', [id]);
    await this.journaliser(admin, 'verification_manuelle', u.email);
    return { ok: true };
  }

  /** Un compte suspendu ne peut plus se connecter, et son jeton est refusé dès sa requête suivante. */
  @Post('utilisateurs/:id/suspendre')
  async suspendre(@Moi() admin: Utilisateur, @Param('id', ParseIntPipe) id: number, @Body() b: { suspendu?: boolean }) {
    this.pasSoiMeme(admin, id, 'suspendre');
    const u = await this.compte(id);
    const suspendu = b?.suspendu !== false;
    await this.db.query('UPDATE utilisateurs SET suspendu = $1 WHERE id = $2', [suspendu, id]);
    await this.journaliser(admin, suspendu ? 'suspension' : 'reactivation', u.email);
    return { ok: true, suspendu };
  }

  @Post('utilisateurs/:id/role')
  async role(@Moi() admin: Utilisateur, @Param('id', ParseIntPipe) id: number, @Body() b: { role?: string }) {
    this.pasSoiMeme(admin, id, 'changer le rôle de');
    if (b?.role !== 'admin' && b?.role !== 'apprenant') throw new BadRequestException('Rôle inconnu.');
    const u = await this.compte(id);
    await this.db.query('UPDATE utilisateurs SET role = $1 WHERE id = $2', [b.role, id]);
    await this.journaliser(admin, 'changement_role', u.email, { avant: u.role, apres: b.role });
    return { ok: true };
  }

  @Delete('utilisateurs/:id')
  async supprimer(@Moi() admin: Utilisateur, @Param('id', ParseIntPipe) id: number) {
    this.pasSoiMeme(admin, id, 'supprimer');
    const u = await this.compte(id);
    await this.db.query('DELETE FROM utilisateurs WHERE id = $1', [id]);
    this.photos.effacer(u.photo);
    await this.journaliser(admin, 'suppression', u.email, { nom: u.nom });
    return { ok: true };
  }

  // ----- Cours ----------------------------------------------------------------------------------
  /** Statistiques par cours, avec la question la plus ratée (d'après toutes les tentatives). */
  @Get('cours')
  async cours() {
    const stats = await this.db.query<{ cours: string; commences: number; termines: number; moyenne: number | null; tentatives: number }>(
      `SELECT p.cours,
              count(*) FILTER (WHERE p.statut IN ('en_cours', 'termine'))::int AS commences,
              count(*) FILTER (WHERE p.statut = 'termine')::int AS termines,
              round(avg(100.0 * p.quiz_score / NULLIF(p.quiz_total, 0)))::int AS moyenne,
              COALESCE(sum(p.quiz_essais), 0)::int AS tentatives
       FROM progression p JOIN utilisateurs u ON u.id = p.utilisateur_id AND u.role = 'apprenant'
       GROUP BY p.cours`);
    const ratees = await this.db.query<{ cours: string; question: number; nombre: number }>(
      `SELECT a.cours, (q.v)::int AS question, count(*)::int AS nombre
       FROM activites a JOIN utilisateurs u ON u.id = a.utilisateur_id AND u.role = 'apprenant',
            jsonb_array_elements_text(COALESCE(a.detail->'ratees', '[]'::jsonb)) AS q(v)
       WHERE a.type = 'quiz'
       GROUP BY a.cours, q.v`);
    const idx = new Map(stats.map((x) => [x.cours, x]));
    return this.curriculum.tous().map((c) => {
      const s = idx.get(c.slug);
      const moyenne = s?.moyenne ?? null;
      const tentatives = s?.tentatives ?? 0;
      const pire = ratees.filter((r) => r.cours === c.slug).sort((a, b) => b.nombre - a.nombre)[0];
      return {
        slug: c.slug, titre: c.titre, domaine: c.domaine, visibilite: c.visibilite,
        commences: s?.commences ?? 0, termines: s?.termines ?? 0, moyenneQuiz: moyenne, tentatives,
        aRevoir: moyenne !== null && moyenne < 60 && tentatives >= 5,
        questionPlusRatee: pire && c.quiz[pire.question] ? { numero: pire.question + 1, question: c.quiz[pire.question].question, echecs: pire.nombre } : null,
      };
    });
  }

  @Post('contenu/recharger')
  async recharger(@Moi() admin: Utilisateur) {
    const r = this.curriculum.recharger();
    await this.journaliser(admin, 'rechargement_contenu', 'content/', r);
    return { message: `${r.cours} cours rechargés, dont ${r.prives} privé${r.prives > 1 ? 's' : ''}.`, ...r };
  }

  // ----- Messages -------------------------------------------------------------------------------
  @Get('messages')
  async messages() {
    return (await this.db.query(
      `SELECT m.id, m.nom, m.email, m.sujet, m.message, m.lu, m.cree_le AS date, m.utilisateur_id AS "utilisateurId"
       FROM messages m ORDER BY m.cree_le DESC LIMIT 500`)).map((m) => ({ ...m, date: iso(m.date) }));
  }

  @Post('messages/:id/lu')
  async marquerLu(@Param('id', ParseIntPipe) id: number, @Body() b: { lu?: boolean }) {
    const [m] = await this.db.query('UPDATE messages SET lu = $1 WHERE id = $2 RETURNING id', [b?.lu !== false, id]);
    if (!m) throw new NotFoundException('Message introuvable.');
    return { ok: true };
  }

  // ----- Mes cours (espace personnel de l'admin) ------------------------------------------------
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
