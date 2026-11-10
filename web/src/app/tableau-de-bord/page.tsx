'use client';

import Link from 'next/link';
import { CSSProperties, useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import CarteCours from '@/components/CarteCours';
import { api, aujourdHui, dateFr, dureeH, Progression, ResumeCours, Utilisateur } from '@/lib/api';
import { illustration, infoDomaine, styleDomaine } from '@/lib/domaines';
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
  const statut = (c: ResumeCours) => idx.get(c.slug)?.statut ?? 'a_faire';
  const auj = aujourdHui();
  const tries = [...programme].sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug));
  const nonTermines = tries.filter((c) => statut(c) !== 'termine');

  // Cours à reprendre : le premier « en cours », sinon le prochain non terminé, sinon le premier non terminé.
  const reprise = tries.find((c) => statut(c) === 'en_cours')
    ?? nonTermines.find((c) => c.date >= auj)
    ?? nonTermines[0];
  const etiquette = !reprise ? '' : statut(reprise) === 'en_cours' ? 'Reprendre'
    : reprise.date === auj ? 'Séance du jour' : `Prochain cours · ${dateFr(reprise.date)}`;

  const termines = programme.length - nonTermines.length;
  const quizFaits = prog.filter((p) => p.quizTotal && idx.has(p.cours));
  const moyenne = quizFaits.length ? Math.round((100 * quizFaits.reduce((s, p) => s + (p.quizScore ?? 0) / (p.quizTotal ?? 1), 0)) / quizFaits.length) : null;
  const enRetard = nonTermines.filter((c) => c.date < auj);
  const semaine = reprise ? tries.filter((c) => c.semaine === reprise.semaine) : [];
  const stats = parDomaine(programme, prog);
  const dateDuJour = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <section className="bonjour">
        <p className="date">{dateDuJour}</p>
        <h1>Bonjour {u.nom.split(' ')[0]}, on continue ?</h1>
      </section>

      {reprise ? (
        <Link href={`/cours/${reprise.slug}`} className="reprendre" style={styleDomaine(reprise.domaine)}>
          <div className="reprendre-img"><img src={illustration(reprise.domaine)} alt="" width={960} height={540} /></div>
          <div className="reprendre-corps">
            <span className="tag">{etiquette}</span>
            <h2>{reprise.titre}</h2>
            <p className="muted small" style={{ margin: 0 }}>
              {infoDomaine(reprise.domaine).nom} · {dureeH(reprise.duree)} · {reprise.objectifs.length} objectif{reprise.objectifs.length > 1 ? 's' : ''}
            </p>
            <span className="btn primary">{statut(reprise) === 'en_cours' ? 'Continuer le cours' : 'Commencer le cours'} →</span>
          </div>
        </Link>
      ) : (
        <section className="card"><h2>Bravo, tout est terminé</h2><p className="muted" style={{ margin: 0 }}>Tu as terminé tous les cours du programme. Le <Link href="/catalogue">catalogue</Link> reste disponible pour réviser.</p></section>
      )}

      <section className="chiffres" aria-label="Chiffres clés">
        <div className="chiffre">
          <span className="k">Cours terminés</span>
          <span className="v">{termines}/{programme.length}</span>
          <div className="bar" role="img" aria-label={`${pourcent(termines, programme.length)} % terminés`}><span style={{ width: `${pourcent(termines, programme.length)}%` }} /></div>
        </div>
        <div className="chiffre">
          <span className="k">Moyenne aux quiz</span>
          <span className="v">{moyenne === null ? '–' : `${moyenne} %`}</span>
          <span className="muted small">{quizFaits.length} quiz passé{quizFaits.length > 1 ? 's' : ''}</span>
        </div>
        <div className={`chiffre ${enRetard.length ? 'warn' : ''}`}>
          <span className="k">À rattraper</span>
          <span className="v">{enRetard.length}</span>
          <span className="muted small">{enRetard.length ? 'cours dont la date est passée' : 'Tu es à jour'}</span>
        </div>
      </section>

      {reprise && (
        <>
          <div className="section-head"><h2>Semaine {reprise.semaine}</h2><Link href="/programme" className="small">Tout le programme →</Link></div>
          <div className="grille">
            {semaine.map((c) => <CarteCours key={c.slug} cours={c} prog={idx.get(c.slug)} duJour={c.date === auj} />)}
          </div>
        </>
      )}

      {enRetard.length > 0 && (
        <>
          <div className="section-head"><h2>À rattraper</h2><span className="muted small">{enRetard.length} cours</span></div>
          <div className="grille">
            {enRetard.slice(0, 4).map((c) => <CarteCours key={c.slug} cours={c} prog={idx.get(c.slug)} />)}
          </div>
        </>
      )}

      <div className="section-head"><h2>Mes compétences</h2></div>
      <section className="card">
        <div className="scroll">
          <table className="table">
            <thead><tr><th>Domaine</th><th>Avancement</th><th className="num">Quiz</th><th>Niveau</th></tr></thead>
            <tbody>
              {stats.map((s) => {
                const n = niveau(s);
                const d = infoDomaine(s.domaine);
                return (
                  <tr key={s.domaine}>
                    <td><span className="pastille-dom" style={{ background: d.accent }} aria-hidden="true" />{s.domaine}</td>
                    <td style={{ minWidth: 120 }}>
                      <div className="bar sm" style={{ '--bar': d.accent } as CSSProperties}><span style={{ width: `${pourcent(s.termines, s.total)}%` }} /></div>
                      <span className="muted small">{s.termines}/{s.total}</span>
                    </td>
                    <td className="num">{s.quiz === null ? '–' : `${s.quiz} %`}</td>
                    <td><span className={`lvl ${n.cls}`}>{n.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="muted small" style={{ marginBottom: 0 }}>Niveaux : Découverte (commencé), Bases (au moins la moitié des cours et 60 % aux quiz), Opérationnel (90 % des cours et 80 % aux quiz).</p>
      </section>
    </>
  );
}

export default function TableauDeBord() {
  return <Shell>{(u) => <Contenu u={u} />}</Shell>;
}
