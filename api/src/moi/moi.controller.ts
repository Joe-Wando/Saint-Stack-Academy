import {
  BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Patch, Post, Res, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as fs from 'fs';
import { AuthGuard, Moi } from '../auth/auth.guard';
import { AuthService, Utilisateur } from '../auth/auth.service';
import { LimiteGuard } from '../auth/limite.guard';
import { CurriculumService } from '../curriculum/curriculum.service';
import { DbService } from '../db/db.service';
import { EvolutionService } from '../evolution/evolution.service';
import { NOM_PHOTO, PhotoService } from './photo.service';

/** L'espace personnel : évolution, photo, sécurité, export et suppression du compte. */
@Controller('moi')
@UseGuards(AuthGuard)
export class MoiController {
  constructor(
    private readonly db: DbService, private readonly auth: AuthService,
    private readonly evolution: EvolutionService, private readonly photos: PhotoService,
    private readonly curriculum: CurriculumService,
  ) {}

  @Get('evolution')
  monEvolution(@Moi() u: Utilisateur) {
    return this.evolution.evolution(u.id);
  }

  /** Envoi de la photo (multipart, champ « photo »). La taille est vérifiée ici pour un message clair. */
  @Post('photo')
  @UseInterceptors(FileInterceptor('photo', { limits: { fileSize: 10 * 1024 * 1024, files: 1 } }))
  envoyerPhoto(@Moi() u: Utilisateur, @UploadedFile() fichier?: Express.Multer.File) {
    return this.photos.enregistrer(u.id, fichier);
  }

  @Delete('photo')
  retirerPhoto(@Moi() u: Utilisateur) {
    return this.photos.retirer(u.id);
  }

  @Patch('mot-de-passe')
  @UseGuards(LimiteGuard)
  motDePasse(@Moi() u: Utilisateur, @Body() b: { ancien?: string; nouveau?: string }) {
    return this.auth.changerMotDePasse(u.id, b?.ancien, b?.nouveau);
  }

  @Post('email')
  @UseGuards(LimiteGuard)
  email(@Moi() u: Utilisateur, @Body() b: { nouvelEmail?: string; motDePasse?: string }) {
    return this.auth.demanderChangementEmail(u.id, b?.nouvelEmail, b?.motDePasse);
  }

  // ----- Mes badges et certifications (déclarés par l'étudiant) ---------------------------------
  @Get('certifications')
  async mesCertifications(@Moi() u: Utilisateur) {
    const lignes = await this.db.query<{ organisme: string }>(
      `SELECT id, nom, organisme, type, to_char(obtenue_le, 'YYYY-MM-DD') AS "obtenueLe", lien_verification AS "lienVerification"
       FROM certifications_obtenues WHERE utilisateur_id = $1 ORDER BY obtenue_le DESC, id DESC`, [u.id]);
    return lignes.map((l) => ({ ...l, organismes: this.curriculum.organismesDe(l.organisme) }));
  }

  @Post('certifications')
  async ajouterCertification(@Moi() u: Utilisateur, @Body() b: Record<string, unknown>) {
    const nom = String(b?.nom ?? '').trim().slice(0, 200);
    const organisme = String(b?.organisme ?? '').trim().slice(0, 200);
    const type = String(b?.type ?? '');
    const date = String(b?.obtenueLe ?? '');
    const lien = String(b?.lienVerification ?? '').trim();
    if (nom.length < 2) throw new BadRequestException('Indique le nom du badge ou de la certification.');
    if (organisme.length < 2) throw new BadRequestException("Indique l'organisme.");
    if (!['badge', 'certificat', 'certification'].includes(type)) throw new BadRequestException('Choisis le type : badge, certificat ou certification.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || Date.parse(date) > Date.now() + 86_400_000) {
      throw new BadRequestException("Indique une date d'obtention valide, pas dans le futur.");
    }
    if (lien && (!/^https?:\/\/\S+$/i.test(lien) || lien.length > 500)) throw new BadRequestException('Le lien de vérification doit commencer par https://');
    const [{ total }] = await this.db.query<{ total: number }>('SELECT count(*)::int AS total FROM certifications_obtenues WHERE utilisateur_id = $1', [u.id]);
    if (total >= 100) throw new BadRequestException('Tu as atteint la limite de 100 entrées.');
    const [c] = await this.db.query(
      `INSERT INTO certifications_obtenues (utilisateur_id, nom, organisme, type, obtenue_le, lien_verification)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`, [u.id, nom, organisme, type, date, lien || null]);
    return c;
  }

  @Delete('certifications/:id')
  async retirerCertification(@Moi() u: Utilisateur, @Param('id') id: string) {
    const [c] = await this.db.query('DELETE FROM certifications_obtenues WHERE id = $1 AND utilisateur_id = $2 RETURNING id', [Number(id) || 0, u.id]);
    if (!c) throw new NotFoundException('Entrée introuvable.');
    return { ok: true };
  }

  /** Toutes mes données, en JSON : profil, progression, activités et notes. */
  @Get('donnees')
  async donnees(@Moi() u: Utilisateur) {
    const profil = await this.auth.profil(u.id);
    const [extra] = await this.db.query('SELECT email_verifie AS "emailVerifie", confidentialite_acceptee_le AS "confidentialiteAccepteeLe" FROM utilisateurs WHERE id = $1', [u.id]);
    return {
      exporteLe: new Date().toISOString(),
      plateforme: 'MeredianStack',
      profil: { ...profil, ...extra },
      progression: await this.db.query('SELECT cours, statut, quiz_score AS "quizScore", quiz_total AS "quizTotal", quiz_essais AS "quizEssais", maj_le AS "majLe" FROM progression WHERE utilisateur_id = $1 ORDER BY cours', [u.id]),
      activites: await this.db.query('SELECT cours, type, detail, cree_le AS date FROM activites WHERE utilisateur_id = $1 ORDER BY cree_le', [u.id]),
      notes: await this.db.query('SELECT cours, contenu, maj_le AS "majLe" FROM notes WHERE utilisateur_id = $1 ORDER BY cours', [u.id]),
      certifications: await this.db.query('SELECT nom, organisme, type, obtenue_le AS "obtenueLe", lien_verification AS "lienVerification" FROM certifications_obtenues WHERE utilisateur_id = $1 ORDER BY obtenue_le', [u.id]),
      messagesEnvoyes: await this.db.query('SELECT sujet, message, cree_le AS date FROM messages WHERE utilisateur_id = $1 ORDER BY cree_le', [u.id]),
    };
  }

  /** Suppression définitive, en cascade. L'admin ne peut pas supprimer son propre compte. */
  @Delete()
  async supprimer(@Moi() u: Utilisateur, @Body() b: { confirmation?: string }) {
    if (b?.confirmation !== 'SUPPRIMER') throw new BadRequestException('Tape SUPPRIMER pour confirmer.');
    if (u.role === 'admin') throw new ForbiddenException("L'admin ne peut pas supprimer son propre compte.");
    const [row] = await this.db.query<{ photo: string | null }>('DELETE FROM utilisateurs WHERE id = $1 RETURNING photo', [u.id]);
    this.photos.effacer(row?.photo);
    return { message: 'Ton compte et toutes tes données ont été supprimés.' };
  }
}

/** Les photos de profil, servies avec un contrôle strict du nom et un cache d'un jour. */
@Controller('photos')
export class PhotosController {
  constructor(private readonly photos: PhotoService) {}

  @Get(':fichier')
  servir(@Param('fichier') fichier: string, @Res() res: Response) {
    if (!NOM_PHOTO.test(fichier)) throw new NotFoundException('Photo introuvable.');
    const chemin = this.photos.chemin(fichier);
    if (!fs.existsSync(chemin)) throw new NotFoundException('Photo introuvable.');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    fs.createReadStream(chemin).pipe(res);
  }
}
