// Module pur (ni React ni Next) : partagé par le site et par tools/generer-diaporamas.mjs.
// Il décrit les domaines et découpe un cours en chapitres et en diapositives.

/** Les domaines du programme, avec leurs couleurs et leur description. */
export const DOMAINES = [
  { cle: 'systemes', nom: 'Systèmes', noms: ['Systèmes', 'Systèmes et outils'], fond: '#E1F5EE', texte: '#085041', accent: '#0F6E56',
    description: 'Linux, réseaux, Windows Server, Active Directory et scripts : le socle de toute infrastructure.' },
  { cle: 'devops', nom: 'DevOps', noms: ['DevOps'], fond: '#EEEDFE', texte: '#3C3489', accent: '#534AB7',
    description: 'Git, Docker, CI/CD, Kubernetes et supervision : livrer vite et de façon fiable.' },
  { cle: 'web', nom: 'Développement web', noms: ['Développement web'], fond: '#E6F1FB', texte: '#0C447C', accent: '#185FA5',
    description: 'React, Tailwind, Next.js, API et maquettes : construire des applications web modernes.' },
  { cle: 'data', nom: 'Data', noms: ['Data'], fond: '#FAEEDA', texte: '#633806', accent: '#854F0B',
    description: 'SQL, pandas, ETL, dbt, Airflow, Spark et Power BI : transformer les données en décisions.' },
  { cle: 'bdd', nom: 'Bases de données', noms: ['Bases de données'], fond: '#EAF3DE', texte: '#27500A', accent: '#3B6D11',
    description: 'Modéliser, interroger et optimiser PostgreSQL, MySQL, MongoDB et Redis.' },
  { cle: 'tests', nom: 'Qualité et tests', noms: ['Qualité et tests'], fond: '#FBEAF0', texte: '#72243E', accent: '#993556',
    description: 'Postman, Jest, Supertest et Cypress : prouver que le code fonctionne.' },
  { cle: 'securite', nom: 'Sécurité', noms: ['Sécurité'], fond: '#FAECE7', texte: '#712B13', accent: '#993C1D',
    description: 'OWASP Top 10 et bonnes pratiques : protéger les applications et les données.' },
  { cle: 'projet', nom: 'Gestion de projet', noms: ['Gestion de projet'], fond: '#F1EFE8', texte: '#444441', accent: '#5F5E5A',
    description: "Scrum et Jira : organiser le travail d'une équipe." },
  { cle: 'cloud', nom: 'Cloud', noms: ['Cloud'], fond: '#E6F1FB', texte: '#0C447C', accent: '#185FA5',
    description: 'AWS et les services gérés : héberger et faire grandir ses applications.' },
];

export const ORDRE_DOMAINES = ['systemes', 'devops', 'tests', 'securite', 'projet', 'web', 'bdd', 'data', 'cloud'];

const sansAccent = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Renvoie la fiche du domaine à partir du champ `domaine` du YAML (repli : Gestion de projet, en gris). */
export function infoDomaine(nomDomaine) {
  const n = sansAccent(nomDomaine ?? '');
  return DOMAINES.find((d) => d.cle === n || d.noms.some((x) => sansAccent(x) === n))
    ?? DOMAINES.find((d) => d.cle === 'projet');
}

/** Chemin public de l'illustration d'un domaine. */
export function illustration(nomDomaine) {
  return `/illustrations/${infoDomaine(nomDomaine).cle}.svg`;
}

const FENCE = /^\s*(```|~~~)/;

/**
 * Découpe le corps Markdown d'un cours en sections, à chaque ligne qui commence par « ## ».
 * Les « ## » situés dans un bloc de code (``` ou ~~~) sont ignorés.
 * Le texte placé avant le premier « ## » forme une section sans titre (titre vide).
 */
export function chapitres(markdown) {
  const sections = [];
  let courante = { titre: '', corps: '' };
  let dansCode = false;
  for (const ligne of (markdown ?? '').replace(/\r\n?/g, '\n').split('\n')) {
    if (FENCE.test(ligne)) dansCode = !dansCode;
    if (!dansCode && ligne.startsWith('## ')) {
      if (courante.titre || courante.corps.trim()) sections.push(courante);
      courante = { titre: ligne.slice(3).trim(), corps: '' };
    } else courante.corps += ligne + '\n';
  }
  if (courante.titre || courante.corps.trim()) sections.push(courante);
  return sections.map((s) => ({ titre: s.titre || 'Introduction', corps: s.corps.trim() }));
}

/** Vrai pour les chapitres de correction (masqués à l'écran, jamais projetés). */
export function estCorrection(titre) {
  return /^correction/i.test((titre ?? '').trim());
}

/** Découpe un texte en blocs séparés par une ligne vide, sans jamais couper un bloc de code. */
export function blocs(corps) {
  const res = [];
  let courant = [];
  let dansCode = false;
  const pousser = () => { if (courant.some((l) => l.trim())) res.push(courant.join('\n').replace(/\s+$/, '')); courant = []; };
  for (const ligne of (corps ?? '').replace(/\r\n?/g, '\n').split('\n')) {
    if (FENCE.test(ligne)) {
      if (!dansCode) { pousser(); dansCode = true; courant.push(ligne); continue; }
      courant.push(ligne); dansCode = false; pousser(); continue;
    }
    if (dansCode) { courant.push(ligne); continue; }
    if (!ligne.trim()) { pousser(); continue; }
    if (/^#{3,6}\s/.test(ligne)) { pousser(); res.push(ligne.trim()); continue; }
    courant.push(ligne);
  }
  pousser();
  return res;
}

/** Nombre de lignes qu'occupe un bloc sur une diapositive (estimation : 90 caractères par ligne). */
export function poidsBloc(bloc) {
  const estCode = FENCE.test(bloc);
  return bloc.split('\n').reduce((n, l) => {
    if (estCode && FENCE.test(l)) return n;
    return n + Math.max(1, Math.ceil(l.length / (estCode ? 80 : 90)));
  }, 0) + (estCode ? 1 : 0.5);
}

export const LIGNES_PAR_DIAPO = 16;

/**
 * Découpe un chapitre en diapositives :
 * - chaque « ### » ouvre une diapositive avec ce sous-titre ;
 * - au-delà d'environ 16 lignes de contenu, on passe à la diapositive suivante (« (suite) ») ;
 * - un bloc de code n'est jamais coupé par le découpage en blocs.
 * Renvoie [{ titre, sousTitre, blocs: string[] }].
 */
export function diapos(chapitre, lignesMax = LIGNES_PAR_DIAPO) {
  const res = [];
  let sousTitre = null;
  let courante = null;
  const nouvelle = (st) => { courante = { titre: chapitre.titre, sousTitre: st, blocs: [], poids: 0 }; res.push(courante); };
  for (const b of blocs(chapitre.corps)) {
    const h = /^#{3,6}\s+(.*)$/.exec(b);
    if (h && /^###\s/.test(b)) { sousTitre = h[1].trim(); nouvelle(sousTitre); continue; }
    const p = poidsBloc(b);
    if (!courante) nouvelle(sousTitre);
    else if (courante.blocs.length && courante.poids + p > lignesMax) {
      nouvelle(`${courante.sousTitre ?? chapitre.titre} (suite)`.replace(/( \(suite\))+$/, ' (suite)'));
    }
    courante.blocs.push(b);
    courante.poids += p;
  }
  return res.filter((d) => d.blocs.length || d.sousTitre).map(({ titre, sousTitre, blocs: bl }) => ({ titre, sousTitre, blocs: bl }));
}

/**
 * Plan complet d'une présentation, identique à l'écran et dans le PowerPoint :
 * couverture, objectifs, diapositives de contenu (sans les corrections), une diapositive par question du quiz.
 * `cours` : { titre, domaine, contenu, objectifs[], quiz[{ question, choix[] }] }.
 */
export function plan(cours) {
  const res = [{ type: 'couverture' }, { type: 'objectifs', objectifs: cours.objectifs ?? [] }];
  for (const ch of chapitres(cours.contenu)) {
    if (estCorrection(ch.titre)) continue;
    for (const d of diapos(ch)) res.push({ type: 'contenu', ...d });
  }
  (cours.quiz ?? []).forEach((q, i) => res.push({ type: 'question', numero: i + 1, total: cours.quiz.length, question: q.question, choix: q.choix }));
  return res;
}
