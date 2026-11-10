import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { DbService } from '../db/db.service';
import { config } from '../config';

export type Role = 'formateur' | 'apprenant';
export interface Utilisateur { id: number; nom: string; email: string; role: Role; }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class AuthService {
  constructor(private readonly db: DbService) {}

  async inscrire(nom: string, email: string, motDePasse: string, codeInvitation: string): Promise<{ jeton: string; utilisateur: Utilisateur }> {
    nom = (nom ?? '').trim();
    email = (email ?? '').trim().toLowerCase();
    if (nom.length < 2) throw new BadRequestException('Indique ton nom.');
    if (!EMAIL.test(email)) throw new BadRequestException('Adresse e-mail invalide.');
    if ((motDePasse ?? '').length < 8) throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères.');

    const estFormateur = config.formateurEmail !== '' && email === config.formateurEmail;
    if (!estFormateur && codeInvitation !== config.inviteCode) {
      throw new BadRequestException("Code d'invitation incorrect. Demande-le à ton formateur.");
    }
    const existe = await this.db.query('SELECT 1 FROM utilisateurs WHERE email = $1', [email]);
    if (existe.length) throw new ConflictException('Un compte existe déjà avec cette adresse.');

    const hash = await bcrypt.hash(motDePasse, 10);
    const role: Role = estFormateur ? 'formateur' : 'apprenant';
    const [u] = await this.db.query<Utilisateur>(
      'INSERT INTO utilisateurs (nom, email, mot_de_passe, role) VALUES ($1, $2, $3, $4) RETURNING id, nom, email, role',
      [nom, email, hash, role],
    );
    return { jeton: this.signer(u), utilisateur: u };
  }

  async connecter(email: string, motDePasse: string): Promise<{ jeton: string; utilisateur: Utilisateur }> {
    email = (email ?? '').trim().toLowerCase();
    const [row] = await this.db.query<Utilisateur & { mot_de_passe: string }>(
      'SELECT id, nom, email, role, mot_de_passe FROM utilisateurs WHERE email = $1', [email]);
    if (!row || !(await bcrypt.compare(motDePasse ?? '', row.mot_de_passe))) {
      throw new UnauthorizedException('E-mail ou mot de passe incorrect.');
    }
    const u: Utilisateur = { id: row.id, nom: row.nom, email: row.email, role: row.role };
    return { jeton: this.signer(u), utilisateur: u };
  }

  verifier(jeton: string): Utilisateur {
    try {
      const p = jwt.verify(jeton, config.jwtSecret) as Utilisateur;
      return { id: p.id, nom: p.nom, email: p.email, role: p.role };
    } catch {
      throw new UnauthorizedException('Session expirée, reconnecte-toi.');
    }
  }

  private signer(u: Utilisateur) {
    return jwt.sign({ id: u.id, nom: u.nom, email: u.email, role: u.role }, config.jwtSecret, { expiresIn: '30d' });
  }
}
