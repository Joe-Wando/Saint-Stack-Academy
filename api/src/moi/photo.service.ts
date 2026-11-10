import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import sharp = require('sharp');
import { config } from '../config';
import { DbService } from '../db/db.service';

export const TAILLE_MAX = 2 * 1024 * 1024;
export const NOM_PHOTO = /^[0-9a-f-]{36}\.webp$/;

/** Le vrai format du fichier, lu dans ses premiers octets (l'extension et le type déclaré ne comptent pas). */
export function formatReel(b: Buffer): 'jpeg' | 'png' | 'webp' | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.length >= 12 && b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  return null;
}

/** Photos de profil : recadrées en 512 × 512, converties en WebP, sans métadonnées EXIF. */
@Injectable()
export class PhotoService {
  private readonly logger = new Logger('Photo');
  constructor(private readonly db: DbService) {}

  chemin(fichier: string) {
    return path.join(config.uploadsDir, fichier);
  }

  async enregistrer(utilisateurId: number, fichier: { buffer: Buffer; size: number; mimetype: string } | undefined) {
    if (!fichier?.buffer?.length) throw new BadRequestException('Choisis une image.');
    if (fichier.size > TAILLE_MAX) throw new BadRequestException('La photo dépasse 2 Mo. Choisis une image plus légère.');
    if (!formatReel(fichier.buffer)) throw new BadRequestException('Ce fichier n’est pas une image JPEG, PNG ou WebP.');

    let sortie: Buffer;
    try {
      // rotate() applique l'orientation EXIF avant de la perdre ; sharp ne recopie aucune métadonnée par défaut.
      sortie = await sharp(fichier.buffer, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize(512, 512, { fit: 'cover', position: 'centre' })
        .webp({ quality: 82 })
        .toBuffer();
    } catch {
      throw new BadRequestException('Cette image est illisible ou abîmée.');
    }
    fs.mkdirSync(config.uploadsDir, { recursive: true });
    const nom = `${randomUUID()}.webp`;
    fs.writeFileSync(this.chemin(nom), sortie);

    const [avant] = await this.db.query<{ photo: string | null }>('SELECT photo FROM utilisateurs WHERE id = $1', [utilisateurId]);
    await this.db.query('UPDATE utilisateurs SET photo = $1 WHERE id = $2', [nom, utilisateurId]);
    this.effacer(avant?.photo);
    return { photo: nom };
  }

  async retirer(utilisateurId: number) {
    const [avant] = await this.db.query<{ photo: string | null }>('SELECT photo FROM utilisateurs WHERE id = $1', [utilisateurId]);
    await this.db.query('UPDATE utilisateurs SET photo = NULL WHERE id = $1', [utilisateurId]);
    this.effacer(avant?.photo);
    return { photo: null };
  }

  /** Supprime un fichier de photo (nom contrôlé : jamais de chemin arbitraire). */
  effacer(nom: string | null | undefined) {
    if (!nom || !NOM_PHOTO.test(nom)) return;
    try { fs.unlinkSync(this.chemin(nom)); } catch (e) { this.logger.warn(`Photo ${nom} non supprimée : ${(e as Error).message}`); }
  }
}
