import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Pool, PoolClient, QueryResultRow } from 'pg';
import { config } from '../config';

/**
 * Accès à PostgreSQL. Les tables sont créées au démarrage, et les migrations
 * sont idempotentes : on peut redémarrer l'API autant de fois qu'on veut.
 */
@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('Db');
  readonly pool = new Pool({ connectionString: config.databaseUrl });

  async onModuleInit() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id            SERIAL PRIMARY KEY,
        nom           TEXT NOT NULL,
        email         TEXT NOT NULL UNIQUE,
        mot_de_passe  TEXT NOT NULL,
        role          TEXT NOT NULL,
        cree_le       TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS progression (
        utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
        cours          TEXT NOT NULL,
        statut         TEXT NOT NULL CHECK (statut IN ('a_faire', 'en_cours', 'termine')),
        quiz_score     INTEGER,
        quiz_total     INTEGER,
        quiz_essais    INTEGER NOT NULL DEFAULT 0,
        maj_le         TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (utilisateur_id, cours)
      );
      CREATE TABLE IF NOT EXISTS notes (
        utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
        cours          TEXT NOT NULL,
        contenu        TEXT NOT NULL,
        maj_le         TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (utilisateur_id, cours)
      );

      -- v2 : plateforme ouverte, niveaux et vérification de l'adresse e-mail
      ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS niveau text;
      ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS option_l3 text;
      ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS etablissement text;
      ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS email_verifie boolean NOT NULL DEFAULT false;
      ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS mes_cours_initialise boolean NOT NULL DEFAULT false;

      -- le rôle devient 'admin' ou 'apprenant'
      ALTER TABLE utilisateurs DROP CONSTRAINT IF EXISTS utilisateurs_role_check;
      UPDATE utilisateurs SET role = 'admin' WHERE role = 'formateur';
      ALTER TABLE utilisateurs ADD CONSTRAINT utilisateurs_role_check CHECK (role IN ('admin', 'apprenant'));

      CREATE TABLE IF NOT EXISTS jetons_email (
        jeton_hash     text PRIMARY KEY,
        utilisateur_id int NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
        type           text NOT NULL CHECK (type IN ('verification', 'reinitialisation')),
        expire_le      timestamptz NOT NULL,
        utilise        boolean NOT NULL DEFAULT false
      );
      CREATE TABLE IF NOT EXISTS mes_cours (
        utilisateur_id int NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
        cours          text NOT NULL,
        ordre          int NOT NULL,
        PRIMARY KEY (utilisateur_id, cours)
      );

      -- Complément : profil, photo, suspension, consentement, changement d'adresse
      ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS photo text;
      ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS suspendu boolean NOT NULL DEFAULT false;
      ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS confidentialite_acceptee_le timestamptz;
      ALTER TABLE jetons_email ADD COLUMN IF NOT EXISTS nouvel_email text;
      ALTER TABLE jetons_email DROP CONSTRAINT IF EXISTS jetons_email_type_check;
      ALTER TABLE jetons_email ADD CONSTRAINT jetons_email_type_check
        CHECK (type IN ('verification', 'reinitialisation', 'changement_email'));

      -- Historique : ce qui a été fait, avec sa date (jamais ce qui « devrait » être fait)
      CREATE TABLE IF NOT EXISTS activites (
        id             bigserial PRIMARY KEY,
        utilisateur_id int NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
        cours          text NOT NULL,
        type           text NOT NULL CHECK (type IN ('cours_commence', 'chapitre_lu', 'cours_termine', 'quiz')),
        detail         jsonb,
        cree_le        timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_activites_utilisateur ON activites (utilisateur_id, cree_le);
      -- Un chapitre n'est compté qu'une fois par cours
      CREATE UNIQUE INDEX IF NOT EXISTS idx_activites_chapitre_unique
        ON activites (utilisateur_id, cours, ((detail->>'chapitre'))) WHERE type = 'chapitre_lu';

      CREATE TABLE IF NOT EXISTS messages (
        id             serial PRIMARY KEY,
        nom            text NOT NULL,
        email          text NOT NULL,
        sujet          text NOT NULL,
        message        text NOT NULL,
        cree_le        timestamptz NOT NULL DEFAULT now(),
        lu             boolean NOT NULL DEFAULT false,
        utilisateur_id int NULL REFERENCES utilisateurs(id) ON DELETE SET NULL
      );

      -- Complément n° 2 : bienvenue, certifications déclarées, réglages du site
      ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS bienvenue_vue boolean NOT NULL DEFAULT false;
      CREATE TABLE IF NOT EXISTS certifications_obtenues (
        id                 serial PRIMARY KEY,
        utilisateur_id     int NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
        nom                text NOT NULL,
        organisme          text NOT NULL,
        type               text NOT NULL CHECK (type IN ('badge', 'certificat', 'certification')),
        obtenue_le         date NOT NULL,
        lien_verification  text NULL
      );
      CREATE TABLE IF NOT EXISTS parametres (
        cle     text PRIMARY KEY,
        valeur  text,
        maj_le  timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS journal_admin (
        id        bigserial PRIMARY KEY,
        admin_id  int NULL REFERENCES utilisateurs(id) ON DELETE SET NULL,
        action    text NOT NULL,
        cible     text,
        detail    jsonb,
        cree_le   timestamptz NOT NULL DEFAULT now()
      );
    `);
    if (config.adminEmail) {
      // Le compte de l'admin existe déjà : il est considéré comme vérifié.
      await this.pool.query(
        "UPDATE utilisateurs SET email_verifie = true, role = 'admin', bienvenue_vue = true WHERE email = $1", [config.adminEmail]);
    }
    await this.pool.query('DELETE FROM jetons_email WHERE expire_le < now() - interval \'7 days\'');
    this.logger.log('Base de données prête');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
    const res = await this.pool.query<T>(sql, params);
    return res.rows;
  }

  /** Exécute plusieurs requêtes dans une transaction. */
  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const res = await fn(client);
      await client.query('COMMIT');
      return res;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
