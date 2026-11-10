import { Controller, Delete, Get, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard, Moi, Roles } from '../auth/auth.guard';
import { Utilisateur } from '../auth/auth.service';
import { DbService } from '../db/db.service';
import { PhotoService } from '../moi/photo.service';

const PHOTO_FONDATEUR = 'photo_fondateur';

/**
 * Réglages du site. La photo du fondateur (connexion, inscription, accueil, contact, bienvenue)
 * se change depuis l'administration ; sans réglage, le site affiche /olivier.jpg.
 */
@Controller()
export class SiteController {
  constructor(private readonly db: DbService, private readonly photos: PhotoService) {}

  private async lire(): Promise<string | null> {
    const [p] = await this.db.query<{ valeur: string | null }>('SELECT valeur FROM parametres WHERE cle = $1', [PHOTO_FONDATEUR]);
    return p?.valeur ?? null;
  }

  /** Publique : le nom du fichier de la photo du fondateur, ou null pour la photo d'origine. */
  @Get('site')
  async site() {
    return { photoFondateur: await this.lire() };
  }

  @Post('admin/site/photo-fondateur')
  @UseGuards(AuthGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('photo', { limits: { fileSize: 10 * 1024 * 1024, files: 1 } }))
  async changer(@Moi() admin: Utilisateur, @UploadedFile() fichier?: Express.Multer.File) {
    const nom = await this.photos.convertir(fichier, 720);
    const avant = await this.lire();
    await this.db.query(
      `INSERT INTO parametres (cle, valeur) VALUES ($1, $2)
       ON CONFLICT (cle) DO UPDATE SET valeur = EXCLUDED.valeur, maj_le = now()`, [PHOTO_FONDATEUR, nom]);
    this.photos.effacer(avant);
    await this.db.query('INSERT INTO journal_admin (admin_id, action, cible) VALUES ($1, $2, $3)', [admin.id, 'photo_fondateur', 'site']);
    return { photoFondateur: nom };
  }

  @Delete('admin/site/photo-fondateur')
  @UseGuards(AuthGuard)
  @Roles('admin')
  async retirer(@Moi() admin: Utilisateur) {
    const avant = await this.lire();
    await this.db.query('DELETE FROM parametres WHERE cle = $1', [PHOTO_FONDATEUR]);
    this.photos.effacer(avant);
    await this.db.query('INSERT INTO journal_admin (admin_id, action, cible) VALUES ($1, $2, $3)', [admin.id, 'photo_fondateur_origine', 'site']);
    return { photoFondateur: null };
  }
}
