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
    `);
    if (config.adminEmail) {
      // Le compte de l'admin existe déjà : il est considéré comme vérifié.
      await this.pool.query(
        "UPDATE utilisateurs SET email_verifie = true, role = 'admin' WHERE email = $1", [config.adminEmail]);
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
