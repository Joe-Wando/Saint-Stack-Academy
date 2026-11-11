import * as path from 'path';

const env = (cle: string) => (process.env[cle] ?? '').trim();

/** Configuration lue dans les variables d'environnement (voir .env.example). */
export const config = {
  port: Number(process.env.PORT ?? 4000),
  production: process.env.NODE_ENV === 'production',
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://academy:academy@localhost:5432/academy',
  jwtSecret: process.env.JWT_SECRET ?? 'change-moi-en-production',
  /** Le compte créé avec cette adresse reçoit le rôle admin. FORMATEUR_EMAIL reste accepté (ancien nom). */
  adminEmail: (env('ADMIN_EMAIL') || env('FORMATEUR_EMAIL')).toLowerCase(),
  contentDir: process.env.CONTENT_DIR ?? path.resolve(__dirname, '..', '..', 'content'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  /** Dossier des photos de profil (un volume Docker en production). */
  uploadsDir: env('UPLOADS_DIR') || '/data/uploads',
  /** Adresse publique du site web : sert à construire les liens envoyés par e-mail. */
  webUrl: (env('WEB_URL') || 'http://localhost:3000').replace(/\/+$/, ''),
  smtp: {
    host: env('SMTP_HOST'),
    port: Number(env('SMTP_PORT') || 587),
    user: env('SMTP_USER'),
    pass: env('SMTP_PASS'),
    from: env('SMTP_FROM') || 'MeredianStack <no-reply@localhost>',
  },
};

// En production seulement (NODE_ENV=production) : un secret faible ou laissé à l'exemple bloque le démarrage.
// En local (npm run dev, docker compose up sans compose.prod.yaml), rien ne change.
const SECRETS_EXEMPLES = ['change-moi-en-production', 'change-moi-secret-de-48-caracteres-minimum', 'developpement-local'];
if (config.production && (config.jwtSecret.length < 32 || SECRETS_EXEMPLES.includes(config.jwtSecret))) {
  throw new Error('JWT_SECRET doit faire au moins 32 caractères et ne pas reprendre l’exemple (openssl rand -base64 48).');
}
