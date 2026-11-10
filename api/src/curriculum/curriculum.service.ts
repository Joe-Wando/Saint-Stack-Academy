import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import matter = require('gray-matter');
import { config } from '../config';
import { Role } from '../auth/auth.service';

/** Piste d'un cours : séance de groupe, parcours solo du formateur, ou complément. */
export type Piste = 'groupe' | 'solo' | 'complement';

export interface QuestionQuiz { question: string; choix: string[]; reponse: number; explication: string; }

export interface Cours {
  slug: string;
  titre: string;
  piste: Piste;
  semaine: number;
  date: string;          // AAAA-MM-JJ
  domaine: string;
  duree: number;         // minutes
  niveau: string;        // découverte, bases, opérationnel
  objectifs: string[];
  prerequis: string[];
  referentiels: string[];
  quiz: QuestionQuiz[];
  contenu: string;       // Markdown
}

export type ResumeCours = Omit<Cours, 'contenu' | 'quiz'> & { nbQuestions: number };

@Injectable()
export class CurriculumService {
  private readonly logger = new Logger('Curriculum');
  private cache: Cours[] | null = null;

  /** Lit tous les cours du dossier content/lessons (relu à chaque démarrage). */
  tous(): Cours[] {
    if (this.cache) return this.cache;
    const dir = path.join(config.contentDir, 'lessons');
    const fichiers = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')) : [];
    const cours = fichiers.map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), 'utf8'));
      const d = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? ''));
      return {
        slug: String(data.slug ?? f.replace(/\.md$/, '')),
        titre: String(data.titre ?? ''),
        piste: (data.piste ?? 'groupe') as Piste,
        semaine: Number(data.semaine ?? 0),
        date: d(data.date),
        domaine: String(data.domaine ?? ''),
        duree: Number(data.duree ?? 120),
        niveau: String(data.niveau ?? 'bases'),
        objectifs: (data.objectifs ?? []) as string[],
        prerequis: (data.prerequis ?? []) as string[],
        referentiels: (data.referentiels ?? []) as string[],
        quiz: (data.quiz ?? []) as QuestionQuiz[],
        contenu: content.trim(),
      } satisfies Cours;
    });
    cours.sort((a, b) => a.date.localeCompare(b.date) || a.piste.localeCompare(b.piste) || a.slug.localeCompare(b.slug));
    this.logger.log(`${cours.length} cours chargés`);
    this.cache = cours;
    return cours;
  }

  /** Les apprenants voient les séances de groupe ; le formateur voit tout. */
  visibles(role: Role): Cours[] {
    return this.tous().filter((c) => role === 'formateur' || c.piste === 'groupe');
  }

  programme(role: Role): ResumeCours[] {
    return this.visibles(role).map(({ contenu, quiz, ...r }) => ({ ...r, nbQuestions: quiz.length }));
  }

  /** Cours complet, sans les bonnes réponses du quiz (elles restent côté serveur). */
  un(slug: string, role: Role) {
    const c = this.tous().find((x) => x.slug === slug);
    if (!c) throw new NotFoundException('Cours introuvable.');
    if (role !== 'formateur' && c.piste !== 'groupe') throw new ForbiddenException('Ce cours est réservé au formateur.');
    return { ...c, quiz: c.quiz.map(({ question, choix }) => ({ question, choix })) };
  }

  /** Corrige un quiz : renvoie le score et, pour chaque question, la bonne réponse et l'explication. */
  corriger(slug: string, role: Role, reponses: number[]) {
    const c = this.tous().find((x) => x.slug === slug);
    if (!c) throw new NotFoundException('Cours introuvable.');
    if (role !== 'formateur' && c.piste !== 'groupe') throw new ForbiddenException('Ce cours est réservé au formateur.');
    const detail = c.quiz.map((q, i) => ({ correct: reponses[i] === q.reponse, reponse: q.reponse, explication: q.explication }));
    return { score: detail.filter((d) => d.correct).length, total: c.quiz.length, detail };
  }
}
