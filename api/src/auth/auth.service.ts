import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import { DbService } from '../db/db.service';
import { config } from '../config';
import { MailService } from './mail.service';
import { CurriculumService } from '../curriculum/curriculum.service';

export type Role = 'admin' | 'apprenant';
export type Niveau = 'L1' | 'L2' | 'L3' | 'autre';
export const NIVEAUX: Niveau[] = ['L1', 'L2', 'L3', 'autre'];

/** Contenu du jeton de session. */
export interface Utilisateur { id: number; nom: string; email: string; role: Role }
/** Profil complet, renvoyé au navigateur. */
export interface Profil extends Utilisateur { niveau: Niveau | null; optionL3: string | null; etablissement: string | null; inscritLe: string; photo: string | null; bienvenueVue: boolean }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUT_BCRYPT = 12;
export const MSG_VERIFIER = 'Vérifie ta boîte mail pour activer ton compte.';
export const MSG_OUBLI = 'Si un compte existe avec cette adresse, tu vas recevoir un e-mail pour choisir un nouveau mot de passe.';
const COLONNES = `id, nom, email, role, niveau, option_l3 AS "optionL3", etablissement, cree_le AS "inscritLe", photo, bienvenue_vue AS "bienvenueVue"`;

const hacher = (jeton: string) => createHash('sha256').update(jeton).digest('hex');

@Injectable()
export class AuthService {
  constructor(private readonly db: DbService, private readonly mail: MailService, private readonly curriculum: CurriculumService) {}

  // ----- Validation -----------------------------------------------------------------------
  private niveauValide(niveau: unknown, optionL3: unknown): { niveau: Niveau; optionL3: string | null } {
    if (!NIVEAUX.includes(niveau as Niveau)) throw new BadRequestException('Choisis ton niveau : L1, L2, L3 ou autre.');
    if (niveau !== 'L3') return { niveau: niveau as Niveau, optionL3: null };
    const options = this.curriculum.optionsL3().map((o) => o.code);
    if (!options.includes(String(optionL3 ?? ''))) throw new BadRequestException('En L3, choisis ton option.');
    return { niveau: 'L3', optionL3: String(optionL3) };
  }
  private motDePasseValide(mdp: unknown) {
    if (typeof mdp !== 'string' || mdp.length < 8) throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères.');
    if (mdp.length > 200) throw new BadRequestException('Le mot de passe est trop long.');
    return mdp;
  }
  private etablissementValide(e: unknown) {
    const s = String(e ?? '').trim().slice(0, 120);
    return s || null;
  }

  // ----- Jetons d'e-mail (stockés hachés, à usage unique, avec expiration) ---------------
  private async creerJeton(utilisateurId: number, type: 'verification' | 'reinitialisation' | 'changement_email', heures: number, nouvelEmail: string | null = null) {
    const jeton = randomBytes(32).toString('base64url');
    await this.db.query(`UPDATE jetons_email SET utilise = true WHERE utilisateur_id = $1 AND type = $2 AND NOT utilise`, [utilisateurId, type]);
    await this.db.query(
      `INSERT INTO jetons_email (jeton_hash, utilisateur_id, type, expire_le, nouvel_email) VALUES ($1, $2, $3, now() + make_interval(hours => $4), $5)`,
      [hacher(jeton), utilisateurId, type, heures, nouvelEmail]);
    return jeton;
  }
  /** Consomme un jeton valide et renvoie l'identifiant de l'utilisateur, ou null. */
  private async consommerJeton(jeton: unknown, type: 'verification' | 'reinitialisation'): Promise<number | null> {
    return (await this.consommer(jeton, type))?.utilisateur_id ?? null;
  }
  private async consommer(jeton: unknown, type: 'verification' | 'reinitialisation' | 'changement_email') {
    if (typeof jeton !== 'string' || jeton.length < 20 || jeton.length > 100) return null;
    const [row] = await this.db.query<{ utilisateur_id: number; nouvel_email: string | null }>(
      `UPDATE jetons_email SET utilise = true
       WHERE jeton_hash = $1 AND type = $2 AND NOT utilise AND expire_le > now()
       RETURNING utilisateur_id, nouvel_email`, [hacher(jeton), type]);
    return row ?? null;
  }

  // ----- Inscription et vérification ------------------------------------------------------
  async inscrire(b: { nom?: unknown; email?: unknown; motDePasse?: unknown; niveau?: unknown; optionL3?: unknown; etablissement?: unknown; confidentialite?: unknown }) {
    const nom = String(b.nom ?? '').trim().slice(0, 80);
    const email = String(b.email ?? '').trim().toLowerCase();
    if (nom.length < 2) throw new BadRequestException('Indique ton nom (au moins 2 caractères).');
    if (!EMAIL.test(email) || email.length > 200) throw new BadRequestException('Adresse e-mail invalide.');
    const mdp = this.motDePasseValide(b.motDePasse);
    const { niveau, optionL3 } = this.niveauValide(b.niveau, b.optionL3);
    const etablissement = this.etablissementValide(b.etablissement);
    if (b.confidentialite !== true) throw new BadRequestException('Coche la case pour indiquer que tu as lu la politique de confidentialité.');

    const [existe] = await this.db.query<{ id: number; nom: string; email_verifie: boolean }>(
      'SELECT id, nom, email_verifie FROM utilisateurs WHERE email = $1', [email]);
    if (existe) {
      // Même réponse que pour un nouveau compte : on ne révèle pas que l'adresse existe.
      if (!existe.email_verifie) await this.mail.verification(email, existe.nom, await this.creerJeton(existe.id, 'verification', 24));
      return { message: MSG_VERIFIER };
    }
    const role: Role = config.adminEmail !== '' && email === config.adminEmail ? 'admin' : 'apprenant';
    const hash = await bcrypt.hash(mdp, COUT_BCRYPT);
    const [u] = await this.db.query<{ id: number }>(
      `INSERT INTO utilisateurs (nom, email, mot_de_passe, role, niveau, option_l3, etablissement, confidentialite_acceptee_le)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now()) RETURNING id`,
      [nom, email, hash, role, niveau, optionL3, etablissement]);
    await this.mail.verification(email, nom, await this.creerJeton(u.id, 'verification', 24));
    return { message: MSG_VERIFIER };
  }

  async verifierEmail(jeton: unknown) {
    const id = await this.consommerJeton(jeton, 'verification');
    if (!id) throw new BadRequestException('Ce lien est invalide ou a expiré. Demande un nouveau lien.');
    await this.db.query('UPDATE utilisateurs SET email_verifie = true WHERE id = $1', [id]);
    return { message: 'Ton adresse est vérifiée. Tu peux te connecter.' };
  }

  async renvoyerVerification(email: unknown) {
    const e = String(email ?? '').trim().toLowerCase();
    if (EMAIL.test(e)) {
      const [u] = await this.db.query<{ id: number; nom: string; email_verifie: boolean }>(
        'SELECT id, nom, email_verifie FROM utilisateurs WHERE email = $1', [e]);
      if (u && !u.email_verifie) await this.mail.verification(e, u.nom, await this.creerJeton(u.id, 'verification', 24));
    }
    return { message: MSG_VERIFIER };
  }

  // ----- Connexion --------------------------------------------------------------------------
  async connecter(email: unknown, motDePasse: unknown): Promise<{ jeton: string; utilisateur: Profil }> {
    const e = String(email ?? '').trim().toLowerCase();
    const [row] = await this.db.query<Profil & { mot_de_passe: string; email_verifie: boolean; suspendu: boolean }>(
      `SELECT ${COLONNES}, mot_de_passe, email_verifie, suspendu FROM utilisateurs WHERE email = $1`, [e]);
    if (!row || !(await bcrypt.compare(String(motDePasse ?? ''), row.mot_de_passe))) {
      throw new UnauthorizedException('E-mail ou mot de passe incorrect.');
    }
    if (row.suspendu) throw new ForbiddenException('Ce compte est suspendu. Écris-nous depuis la page Contact.');
    if (!row.email_verifie) throw new ForbiddenException('Active ton compte avec le lien reçu par e-mail.');
    const { mot_de_passe, email_verifie, suspendu, ...profil } = row;
    return { jeton: this.signer(profil), utilisateur: profil };
  }

  // ----- Mot de passe oublié ----------------------------------------------------------------
  async motDePasseOublie(email: unknown) {
    const e = String(email ?? '').trim().toLowerCase();
    if (EMAIL.test(e)) {
      const [u] = await this.db.query<{ id: number; nom: string }>('SELECT id, nom FROM utilisateurs WHERE email = $1', [e]);
      if (u) await this.mail.reinitialisation(e, u.nom, await this.creerJeton(u.id, 'reinitialisation', 1));
    }
    return { message: MSG_OUBLI };
  }

  async reinitialiser(jeton: unknown, motDePasse: unknown) {
    const mdp = this.motDePasseValide(motDePasse);
    const id = await this.consommerJeton(jeton, 'reinitialisation');
    if (!id) throw new BadRequestException('Ce lien est invalide ou a expiré. Refais une demande.');
    // Recevoir le lien prouve aussi que l'adresse est valide.
    await this.db.query('UPDATE utilisateurs SET mot_de_passe = $1, email_verifie = true WHERE id = $2', [await bcrypt.hash(mdp, COUT_BCRYPT), id]);
    return { message: 'Ton mot de passe a été changé. Tu peux te connecter.' };
  }

  // ----- Profil -----------------------------------------------------------------------------
  async profil(id: number): Promise<Profil> {
    const [p] = await this.db.query<Profil>(`SELECT ${COLONNES} FROM utilisateurs WHERE id = $1`, [id]);
    if (!p) throw new UnauthorizedException('Compte introuvable, reconnecte-toi.');
    return p;
  }

  async modifier(id: number, b: { nom?: unknown; niveau?: unknown; optionL3?: unknown; etablissement?: unknown; bienvenueVue?: unknown }) {
    const actuel = await this.profil(id);
    // La visite de bienvenue terminée ou passée : on ne la propose plus automatiquement.
    if (b.bienvenueVue === true) await this.db.query('UPDATE utilisateurs SET bienvenue_vue = true WHERE id = $1', [id]);
    const nom = b.nom === undefined ? actuel.nom : String(b.nom).trim().slice(0, 80);
    if (nom.length < 2) throw new BadRequestException('Indique ton nom (au moins 2 caractères).');
    const { niveau, optionL3 } = b.niveau === undefined && b.optionL3 === undefined && actuel.niveau
      ? { niveau: actuel.niveau, optionL3: actuel.optionL3 }
      : this.niveauValide(b.niveau ?? actuel.niveau, b.optionL3 ?? actuel.optionL3);
    const etablissement = b.etablissement === undefined ? actuel.etablissement : this.etablissementValide(b.etablissement);
    await this.db.query('UPDATE utilisateurs SET nom = $1, niveau = $2, option_l3 = $3, etablissement = $4 WHERE id = $5',
      [nom, niveau, optionL3, etablissement, id]);
    const p = await this.profil(id);
    return { jeton: this.signer(p), utilisateur: p };
  }

  // ----- Sécurité du compte -----------------------------------------------------------------
  private async verifierMotDePasse(id: number, motDePasse: unknown) {
    const [row] = await this.db.query<{ mot_de_passe: string }>('SELECT mot_de_passe FROM utilisateurs WHERE id = $1', [id]);
    if (!row || !(await bcrypt.compare(String(motDePasse ?? ''), row.mot_de_passe))) throw new BadRequestException('Mot de passe actuel incorrect.');
  }

  async changerMotDePasse(id: number, ancien: unknown, nouveau: unknown) {
    const mdp = this.motDePasseValide(nouveau);
    await this.verifierMotDePasse(id, ancien);
    await this.db.query('UPDATE utilisateurs SET mot_de_passe = $1 WHERE id = $2', [await bcrypt.hash(mdp, COUT_BCRYPT), id]);
    return { message: 'Ton mot de passe a été changé.' };
  }

  /** Envoie un lien de confirmation à la nouvelle adresse ; l'adresse ne change qu'après le clic. */
  async demanderChangementEmail(id: number, nouvelEmail: unknown, motDePasse: unknown) {
    const e = String(nouvelEmail ?? '').trim().toLowerCase();
    if (!EMAIL.test(e) || e.length > 200) throw new BadRequestException('Adresse e-mail invalide.');
    await this.verifierMotDePasse(id, motDePasse);
    const p = await this.profil(id);
    if (e === p.email) throw new BadRequestException("C'est déjà ton adresse actuelle.");
    const [prise] = await this.db.query('SELECT 1 FROM utilisateurs WHERE email = $1', [e]);
    // Même réponse si l'adresse est déjà prise : on ne révèle pas les comptes existants.
    if (!prise) await this.mail.changementEmail(e, p.nom, await this.creerJeton(id, 'changement_email', 24, e));
    return { message: `Un lien de confirmation a été envoyé à ${e}. Ton adresse changera après le clic.` };
  }

  async confirmerEmail(jeton: unknown) {
    const row = await this.consommer(jeton, 'changement_email');
    if (!row?.nouvel_email) throw new BadRequestException('Ce lien est invalide ou a expiré.');
    const [prise] = await this.db.query('SELECT 1 FROM utilisateurs WHERE email = $1', [row.nouvel_email]);
    if (prise) throw new BadRequestException('Cette adresse est déjà utilisée par un autre compte.');
    await this.db.query('UPDATE utilisateurs SET email = $1, email_verifie = true WHERE id = $2', [row.nouvel_email, row.utilisateur_id]);
    return { message: 'Ton adresse e-mail a été changée. Reconnecte-toi avec ta nouvelle adresse.' };
  }

  /** Vérifie à chaque requête que le compte existe encore et n'est pas suspendu ; renvoie son rôle actuel. */
  async etatCompte(id: number): Promise<{ role: Role } | null> {
    const [row] = await this.db.query<{ role: Role; suspendu: boolean }>('SELECT role, suspendu FROM utilisateurs WHERE id = $1', [id]);
    return row && !row.suspendu ? { role: row.role } : null;
  }

  // ----- Jeton de session -------------------------------------------------------------------
  verifier(jeton: string): Utilisateur {
    try {
      const p = jwt.verify(jeton, config.jwtSecret) as Utilisateur;
      // Les jetons émis avant la v2 portent encore le rôle « formateur ».
      const role: Role = p.role === 'admin' || (p.role as string) === 'formateur' ? 'admin' : 'apprenant';
      return { id: p.id, nom: p.nom, email: p.email, role };
    } catch {
      throw new UnauthorizedException('Session expirée, reconnecte-toi.');
    }
  }

  private signer(u: Utilisateur) {
    return jwt.sign({ id: u.id, nom: u.nom, email: u.email, role: u.role }, config.jwtSecret, { expiresIn: '30d' });
  }
}
