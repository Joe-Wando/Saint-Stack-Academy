import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { config } from '../config';

const NOM = 'MeredianStack';

/** Échappe le texte inséré dans le HTML d'un e-mail. */
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/**
 * Envoi des e-mails (vérification, réinitialisation).
 * Sans SMTP_HOST, le lien est écrit dans le journal de l'API au lieu d'être envoyé :
 * on peut ainsi tester l'inscription sans serveur mail (docker compose logs api).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger('Mail');
  private readonly transport = config.smtp.host
    ? nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
      })
    : null;

  async verification(email: string, nom: string, jeton: string) {
    const lien = `${config.webUrl}/verification?jeton=${encodeURIComponent(jeton)}`;
    await this.envoyer(email, `Active ton compte ${NOM}`, nom,
      `Bienvenue sur ${NOM}. Pour activer ton compte, ouvre ce lien :`, lien, 'Activer mon compte', 'Ce lien est valable 24 heures.');
  }

  async reinitialisation(email: string, nom: string, jeton: string) {
    const lien = `${config.webUrl}/reinitialiser?jeton=${encodeURIComponent(jeton)}`;
    await this.envoyer(email, `Choisis un nouveau mot de passe ${NOM}`, nom,
      'Tu as demandé à changer ton mot de passe. Pour en choisir un nouveau, ouvre ce lien :', lien, 'Choisir un nouveau mot de passe', 'Ce lien est valable 1 heure.');
  }

  async changementEmail(email: string, nom: string, jeton: string) {
    const lien = `${config.webUrl}/confirmer-email?jeton=${encodeURIComponent(jeton)}`;
    await this.envoyer(email, `Confirme ta nouvelle adresse ${NOM}`, nom,
      'Tu as demandé à utiliser cette adresse pour ton compte. Pour confirmer, ouvre ce lien :', lien, 'Confirmer cette adresse', 'Ce lien est valable 24 heures.');
  }

  /** Copie d'un message de contact à l'admin. Sans SMTP, rien n'est envoyé : le message reste dans l'administration. */
  async copieContact(m: { nom: string; email: string; sujet: string; message: string }) {
    if (!this.transport || !config.adminEmail) return;
    try {
      await this.transport.sendMail({
        from: config.smtp.from, to: config.adminEmail, replyTo: m.email,
        subject: `[${NOM}] ${m.sujet} · ${m.nom}`,
        text: `Message reçu depuis la page Contact.\n\nDe : ${m.nom} <${m.email}>\nSujet : ${m.sujet}\n\n${m.message}\n\nRéponds directement à cet e-mail, ou consulte ${config.webUrl}/admin/messages`,
      });
    } catch (e) {
      this.logger.error(`Échec de la copie du message de contact : ${(e as Error).message}`);
    }
  }

  private async envoyer(a: string, sujet: string, nom: string, intro: string, lien: string, bouton: string, validite: string) {
    const ignorer = "Si tu n'es pas à l'origine de cette demande, ignore ce message.";
    const texte = `Bonjour ${nom},\n\n${intro}\n${lien}\n\n${validite}\n${ignorer}\n\n${NOM}`;
    const html = `<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#F7F7FA;font-family:system-ui,Segoe UI,Arial,sans-serif;color:#1D1B2E">
<div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #E6E5EE;border-radius:14px;padding:28px">
<p style="margin:0 0 20px;font-weight:700"><span style="display:inline-block;background:#534AB7;color:#fff;border-radius:8px;padding:4px 8px;margin-right:8px">SS</span>${NOM}</p>
<p>Bonjour ${esc(nom)},</p><p>${esc(intro)}</p>
<p style="margin:24px 0"><a href="${esc(lien)}" style="background:#534AB7;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">${esc(bouton)}</a></p>
<p style="font-size:14px;color:#5F5E6E">Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :<br><a href="${esc(lien)}" style="color:#534AB7;word-break:break-all">${esc(lien)}</a></p>
<p style="font-size:14px;color:#5F5E6E">${esc(validite)}<br>${esc(ignorer)}</p></div></body></html>`;

    if (!this.transport) {
      this.logger.warn(`SMTP_HOST vide : e-mail non envoyé. Destinataire ${a} · ${sujet} · lien : ${lien}`);
      return;
    }
    try {
      await this.transport.sendMail({ from: config.smtp.from, to: a, subject: sujet, text: texte, html });
    } catch (e) {
      // On ne révèle pas l'erreur au client : la réponse reste la même, l'incident est journalisé.
      this.logger.error(`Échec de l'envoi à ${a} : ${(e as Error).message}`);
    }
  }
}
