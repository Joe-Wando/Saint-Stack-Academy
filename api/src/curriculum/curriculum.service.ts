import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import matter = require('gray-matter');
import { config } from '../config';

export interface QuestionQuiz { question: string; choix: string[]; reponse: number; explication: string }
export interface PlaceLicence { niveau: string; semestre: string; ue: string; option?: string }
export interface PlaceParcours { parcours: string; ordre: number }
type RoleOuAnonyme = { role: string } | undefined | null;

export interface Cours {
  slug: string;
  titre: string;
  domaine: string;
  duree: number;            // minutes
  difficulte: string;       // découverte, bases, opérationnel
  licence: PlaceLicence[];
  parcours: PlaceParcours[];
  ordre: number;            // ordre conseillé dans l'UE
  prerequisCours: string[]; // slugs
  visibilite: 'public' | 'prive';
  objectifs: string[];
  prerequis: string[];
  referentiels: string[];
  quiz: QuestionQuiz[];
  contenu: string;          // Markdown
}

export interface ResumeCours {
  slug: string; titre: string; domaine: string; duree: number; difficulte: string; ordre: number;
  objectifs: string[]; nbQuestions: number; visibilite: 'public' | 'prive';
  licence: PlaceLicence[]; parcours: PlaceParcours[];
}

interface Referentiel {
  niveaux: {
    code: string; titre: string;
    semestres?: { code: string; ues: string[] }[];
    tronc_commun?: { code: string; ues: string[] }[];
    options?: { code: string; titre: string; semestres: { code: string; ues: string[] }[] }[];
  }[];
  parcours: { code: string; titre: string; domaine: string }[];
}

const texte = (v: unknown) => (typeof v === 'string' ? v : v && typeof v === 'object' ? Object.entries(v).map(([k, x]) => `${k} : ${x}`).join(' ') : String(v ?? ''));
const liste = (v: unknown) => (Array.isArray(v) ? v.map(texte) : []);

@Injectable()
export class CurriculumService {
  private readonly logger = new Logger('Curriculum');
  private cache: Cours[] | null = null;
  private ref: Referentiel | null = null;

  /** Lit tous les cours de content/lessons (une fois, au premier appel). */
  tous(): Cours[] {
    if (this.cache) return this.cache;
    const dir = path.join(config.contentDir, 'lessons');
    const fichiers = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')) : [];
    const cours = fichiers.map((f): Cours => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), 'utf8'));
      return {
        slug: String(data.slug ?? f.replace(/\.md$/, '')),
        titre: String(data.titre ?? ''),
        domaine: String(data.domaine ?? ''),
        duree: Number(data.duree ?? 120),
        difficulte: String(data.difficulte ?? data.niveau ?? 'bases'),
        licence: Array.isArray(data.licence) ? data.licence.map((l: PlaceLicence) => ({ niveau: String(l.niveau), semestre: String(l.semestre), ue: String(l.ue), ...(l.option ? { option: String(l.option) } : {}) })) : [],
        parcours: Array.isArray(data.parcours) ? data.parcours.map((p: PlaceParcours) => ({ parcours: String(p.parcours), ordre: Number(p.ordre) })) : [],
        ordre: Number(data.ordre ?? 1),
        prerequisCours: Array.isArray(data.prerequis_cours) ? data.prerequis_cours.map(String) : [],
        visibilite: data.visibilite === 'prive' ? 'prive' : 'public',
        objectifs: liste(data.objectifs),
        prerequis: liste(data.prerequis),
        referentiels: liste(data.referentiels),
        quiz: (data.quiz ?? []) as QuestionQuiz[],
        contenu: content.trim(),
      };
    });
    cours.sort((a, b) => a.ordre - b.ordre || a.slug.localeCompare(b.slug));
    this.logger.log(`${cours.length} cours chargés`);
    this.cache = cours;
    return cours;
  }

  /** Lit content/referentiel.yaml, la source de vérité de la structure L1, L2, L3 et des parcours. */
  referentielBrut(): Referentiel {
    if (this.ref) return this.ref;
    const f = path.join(config.contentDir, 'referentiel.yaml');
    this.ref = (matter as unknown as { engines: { yaml: { parse: (s: string) => Referentiel } } }).engines.yaml.parse(fs.readFileSync(f, 'utf8'));
    return this.ref;
  }

  optionsL3() {
    return this.referentielBrut().niveaux.find((n) => n.code === 'L3')?.options ?? [];
  }

  private visible(c: Cours, u: RoleOuAnonyme) {
    return c.visibilite === 'public' || u?.role === 'admin';
  }

  resume(c: Cours): ResumeCours {
    return {
      slug: c.slug, titre: c.titre, domaine: c.domaine, duree: c.duree, difficulte: c.difficulte, ordre: c.ordre,
      objectifs: c.objectifs, nbQuestions: c.quiz.length, visibilite: c.visibilite, licence: c.licence, parcours: c.parcours,
    };
  }

  /** Tous les résumés visibles : les cours publics, et les privés pour l'admin. */
  liste(u: RoleOuAnonyme): ResumeCours[] {
    return this.tous().filter((c) => this.visible(c, u)).map((c) => this.resume(c));
  }

  /** Cours d'une UE, dans l'ordre conseillé. */
  private coursUe(u: RoleOuAnonyme, niveau: string, semestre: string, ue: string, option?: string) {
    return this.tous()
      .filter((c) => this.visible(c, u) && c.licence.some((l) => l.niveau === niveau && l.semestre === semestre && l.ue === ue && (l.option ?? '') === (option ?? '')))
      .map((c) => this.resume(c));
  }

  /** Étapes d'un parcours métier, dans l'ordre. */
  coursParcours(u: RoleOuAnonyme, code: string) {
    return this.tous()
      .flatMap((c) => (this.visible(c, u) ? c.parcours.filter((p) => p.parcours === code).map((p) => ({ ...this.resume(c), etape: p.ordre })) : []))
      .sort((a, b) => a.etape - b.etape);
  }

  /** La structure du référentiel, avec les cours de chaque UE et de chaque parcours. */
  referentiel(u: RoleOuAnonyme) {
    const r = this.referentielBrut();
    const semestres = (niveau: string, s: { code: string; ues: string[] }[] = [], option?: string) =>
      s.map((x) => ({ code: x.code, ues: x.ues.map((titre) => ({ titre, cours: this.coursUe(u, niveau, x.code, titre, option) })) }));
    return {
      niveaux: r.niveaux.map((n) => ({
        code: n.code,
        titre: n.titre,
        semestres: semestres(n.code, n.semestres),
        troncCommun: semestres(n.code, n.tronc_commun),
        options: (n.options ?? []).map((o) => ({ code: o.code, titre: o.titre, semestres: semestres(n.code, o.semestres, o.code) })),
      })),
      parcours: r.parcours.map((p) => ({ ...p, cours: this.coursParcours(u, p.code) })),
    };
  }

  /** Les UE et les cours d'un niveau, dans l'ordre (en L3 : tronc commun, puis l'option). */
  monNiveau(u: RoleOuAnonyme, niveau: string | null, optionL3: string | null) {
    const ref = this.referentiel(u);
    const n = ref.niveaux.find((x) => x.code === niveau);
    if (!n) return { niveau: niveau ?? null, option: null, titre: null, ues: [] };
    const aplatir = (sems: { code: string; ues: { titre: string; cours: ResumeCours[] }[] }[], option?: string) =>
      sems.flatMap((s) => s.ues.map((ue) => ({ niveau: n.code, semestre: s.code, ue: ue.titre, option: option ?? null, cours: ue.cours })));
    const option = n.options.find((o) => o.code === optionL3) ?? null;
    const ues = n.code === 'L3'
      ? [...aplatir(n.troncCommun), ...(option ? aplatir(option.semestres, option.code) : [])]
      : aplatir(n.semestres);
    return { niveau: n.code, option: option ? { code: option.code, titre: option.titre } : null, titre: n.titre, ues };
  }

  /** Cours complet, sans les bonnes réponses du quiz. Un cours privé n'existe pas pour un non-admin (404). */
  un(slug: string, u: RoleOuAnonyme) {
    const c = this.tous().find((x) => x.slug === slug);
    if (!c || !this.visible(c, u)) throw new NotFoundException('Cours introuvable.');
    const ref = this.referentielBrut();
    const titreDe = (s: string) => this.tous().find((x) => x.slug === s && this.visible(x, u));
    const emplacements = [
      ...c.licence.map((l) => {
        const freres = this.coursUe(u, l.niveau, l.semestre, l.ue, l.option);
        const suivant = freres[freres.findIndex((x) => x.slug === c.slug) + 1];
        const option = l.option ? this.optionsL3().find((o) => o.code === l.option) : undefined;
        return { type: 'licence' as const, ...l, optionTitre: option?.titre ?? null, suivant: suivant ? { slug: suivant.slug, titre: suivant.titre } : null };
      }),
      ...c.parcours.map((p) => {
        const etapes = this.coursParcours(u, p.parcours);
        const suivant = etapes.find((x) => x.etape > p.ordre);
        const def = ref.parcours.find((x) => x.code === p.parcours);
        return { type: 'parcours' as const, code: p.parcours, titre: def?.titre ?? p.parcours, etape: p.ordre, total: etapes.length, suivant: suivant ? { slug: suivant.slug, titre: suivant.titre } : null };
      }),
    ];
    const { quiz, prerequisCours, ...reste } = c;
    return {
      ...reste,
      prerequisCours: prerequisCours.map(titreDe).filter((x): x is Cours => !!x).map((x) => ({ slug: x.slug, titre: x.titre })),
      emplacements,
      quiz: quiz.map(({ question, choix }) => ({ question, choix })),
    };
  }

  /** Corrige un quiz : le score et, pour chaque question, la bonne réponse et l'explication. */
  corriger(slug: string, u: RoleOuAnonyme, reponses: number[]) {
    const c = this.tous().find((x) => x.slug === slug);
    if (!c || !this.visible(c, u)) throw new NotFoundException('Cours introuvable.');
    const detail = c.quiz.map((q, i) => ({ correct: reponses[i] === q.reponse, reponse: q.reponse, explication: q.explication }));
    return { score: detail.filter((d) => d.correct).length, total: c.quiz.length, detail };
  }
}
