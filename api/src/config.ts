import * as path from 'path';

/** Configuration lue dans les variables d'environnement (voir .env.example). */
export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://academy:academy@localhost:5432/academy',
  jwtSecret: process.env.JWT_SECRET ?? 'change-moi-en-production',
  /** Code à donner aux amis pour qu'ils puissent créer leur compte apprenant. */
  inviteCode: process.env.INVITE_CODE ?? 'SAINTSTACK2026',
  /** Adresse e-mail du formateur : le compte créé avec cette adresse reçoit le rôle formateur. */
  formateurEmail: (process.env.FORMATEUR_EMAIL ?? '').toLowerCase(),
  contentDir: process.env.CONTENT_DIR ?? path.resolve(__dirname, '..', '..', 'content'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
};

if (process.env.NODE_ENV === 'production' && config.jwtSecret === 'change-moi-en-production') {
  throw new Error('JWT_SECRET doit être défini en production.');
}
