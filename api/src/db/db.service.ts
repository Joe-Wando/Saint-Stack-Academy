import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';
import { config } from '../config';

/** Accès à PostgreSQL. Les tables sont créées au démarrage si elles n'existent pas. */
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
        role          TEXT NOT NULL CHECK (role IN ('formateur', 'apprenant')),
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
    `);
    this.logger.log('Base de données prête');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
    const res = await this.pool.query<T>(sql, params);
    return res.rows;
  }
}
