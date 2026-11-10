import { BadRequestException, Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Moi, SessionFacultativeGuard } from '../auth/auth.guard';
import { Utilisateur } from '../auth/auth.service';
import { Limite, LimiteGuard } from '../auth/limite.guard';
import { MailService } from '../auth/mail.service';
import { DbService } from '../db/db.service';

export const SUJETS = ['Question sur un cours', 'Signaler une erreur', 'Partenariat', 'Autre'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MERCI = { message: 'Merci, je te réponds au plus vite.' };

/** Formulaire de contact public : enregistré pour l'admin, avec une copie par e-mail si le SMTP est configuré. */
@Controller('contact')
export class ContactController {
  constructor(private readonly db: DbService, private readonly mail: MailService) {}

  @Post()
  @HttpCode(200)
  @Limite(3, 3_600_000)
  @UseGuards(SessionFacultativeGuard, LimiteGuard)
  async envoyer(@Body() b: Record<string, unknown>, @Moi() u?: Utilisateur) {
    // Champ piège, invisible pour les humains : s'il est rempli, c'est un robot. On répond comme d'habitude, sans rien enregistrer.
    if (String(b?.site_web ?? '').trim()) return MERCI;

    const nom = String(b?.nom ?? '').trim().slice(0, 80);
    const email = String(b?.email ?? '').trim().toLowerCase();
    const sujet = String(b?.sujet ?? '');
    const message = String(b?.message ?? '').trim();
    if (nom.length < 2) throw new BadRequestException('Indique ton nom.');
    if (!EMAIL.test(email) || email.length > 200) throw new BadRequestException('Adresse e-mail invalide.');
    if (!SUJETS.includes(sujet)) throw new BadRequestException('Choisis un sujet.');
    if (message.length < 20) throw new BadRequestException('Ton message doit contenir au moins 20 caractères.');
    if (message.length > 2000) throw new BadRequestException('Ton message ne doit pas dépasser 2 000 caractères.');

    await this.db.query('INSERT INTO messages (nom, email, sujet, message, utilisateur_id) VALUES ($1, $2, $3, $4, $5)',
      [nom, email, sujet, message, u?.id ?? null]);
    await this.mail.copieContact({ nom, email, sujet, message });
    return MERCI;
  }
}
