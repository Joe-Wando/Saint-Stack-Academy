'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api, aujourdHui, dateFr, PISTES, Progression, ResumeCours, Utilisateur } from '@/lib/api';
import { niveau, parDomaine, pourcent } from '@/lib/stats';

function Contenu({ u }: { u: Utilisateur }) {
  const [programme, setProgramme] = useState<ResumeCours[] | null>(null);
  const [prog, setProg] = useState<Progression[]>([]);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    Promise.all([api<ResumeCours[]>('/programme'), api<Progression[]>('/progression')])
      .then(([p, g]) => { setProgramme(p); setProg(g); })
      .catch((e) => setErreur(e.message));
  }, []);

  if (erreur) return <p className="error">{erreur}</p>;
  if (!programme) return <p className="muted">Chargement…</p>;

  const idx = new Map(prog.map((p) => [p.cours, p]));
  const termines = programme.filter((c) => idx.get(c.slug)?.statut === 'termine').length;
  const auj = aujourdHui();
  const prochains = programme.filter((c) => c.date >= auj && idx.get(c.slug)?.statut !== 'termine').slice(0, 4);
  const enRetard = programme.filter((c) => c.date < auj && idx.get(c.slug)?.statut !== 'termine');
  const stats = parDomaine(programme, prog);
  const quizFaits = prog.filter((p) => p.quizTotal);
  const moyenne = quizFaits.length ? Math.round((100 * quizFaits.reduce((s, p) => s + (p.quizScore ?? 0) / (p.quizTotal ?? 1), 0)) / quizFaits.length) : null;

  return (
    <>
      <section className="hero">
        <p className="eyebrow">{u.role === 'formateur' ? 'Espace formateur' : 'Espace apprenant'}</p>
        <h1>Bonjour {u.nom.split(' ')[0]}</h1>
        <p className="muted">
          {u.role === 'formateur'
            ? 'Ton parcours complet : séances de groupe que tu prépares, parcours solo et compléments.'
            : 'Tes séances de groupe, ta progression et tes résultats aux quiz.'}
        </p>
      </section>

      <section className="tiles">
        <div className="tile"><span className="k">Avancement</span><span className="v">{pourcent(termines, programme.length)} %</span>
          <div className="bar"><span style={{ width: `${pourcent(termines, programme.length)}%` }} /></div>
          <span className="muted small">{termines} cours terminés sur {programme.length}</span></div>
        <div className="tile"><span className="k">Moyenne aux quiz</span><span className="v">{moyenne === null ? '–' : `${moyenne} %`}</span>
          <span className="muted small">{quizFaits.length} quiz passés</span></div>
        <div className={`tile ${enRetard.length ? 'warn' : ''}`}><span className="k">En retard</span><span className="v">{enRetard.length}</span>
          <span className="muted small">{enRetard.length ? 'cours dont la date est passée' : 'Tu es à jour'}</span></div>
      </section>

      <div className="grid2">
        <section className="card">
          <h2>À venir</h2>
          {prochains.length === 0 && <p className="muted">Rien de prévu pour l'instant.</p>}
          <ul className="list">
            {prochains.map((c) => (
              <li key={c.slug}>
                <Link href={`/cours/${c.slug}`}>
                  <span className={`chip ${c.piste}`}>{PISTES[c.piste]}</span>
                  <strong>{c.titre}</strong>
                  <span className="muted small">{dateFr(c.date)} · {c.domaine}</span>
                </Link>
              </li>
            ))}
          </ul>
          {enRetard.length > 0 && (
            <>
              <h3>À rattraper</h3>
              <ul className="list">
                {enRetard.slice(0, 5).map((c) => (
                  <li key={c.slug}><Link href={`/cours/${c.slug}`}><strong>{c.titre}</strong><span className="muted small">{dateFr(c.date)}</span></Link></li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="card">
          <h2>Mes compétences</h2>
          <table className="table">
            <thead><tr><th>Domaine</th><th>Avancement</th><th>Quiz</th><th>Niveau</th></tr></thead>
            <tbody>
              {stats.map((s) => {
                const n = niveau(s);
                return (
                  <tr key={s.domaine}>
                    <td>{s.domaine}</td>
                    <td><div className="bar sm"><span style={{ width: `${pourcent(s.termines, s.total)}%` }} /></div><span className="muted small">{s.termines}/{s.total}</span></td>
                    <td className="num">{s.quiz === null ? '–' : `${s.quiz} %`}</td>
                    <td><span className={`lvl ${n.cls}`}>{n.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="muted small">Niveaux : Découverte (commencé), Bases (au moins la moitié des cours et 60 % aux quiz), Opérationnel (90 % des cours et 80 % aux quiz).</p>
        </section>
      </div>
    </>
  );
}

export default function TableauDeBord() {
  return <Shell>{(u) => <Contenu u={u} />}</Shell>;
}
