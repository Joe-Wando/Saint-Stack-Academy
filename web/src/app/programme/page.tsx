'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Shell from '@/components/Shell';
import { api, aujourdHui, dateFr, Piste, PISTES, Progression, ResumeCours, STATUTS, Utilisateur } from '@/lib/api';

function Contenu({ u }: { u: Utilisateur }) {
  const [programme, setProgramme] = useState<ResumeCours[] | null>(null);
  const [prog, setProg] = useState<Progression[]>([]);
  const [piste, setPiste] = useState<Piste | 'toutes'>('toutes');
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    Promise.all([api<ResumeCours[]>('/programme'), api<Progression[]>('/progression')])
      .then(([p, g]) => { setProgramme(p); setProg(g); })
      .catch((e) => setErreur(e.message));
  }, []);

  const semaines = useMemo(() => {
    const liste = (programme ?? []).filter((c) => piste === 'toutes' || c.piste === piste);
    const m = new Map<number, ResumeCours[]>();
    liste.forEach((c) => m.set(c.semaine, [...(m.get(c.semaine) ?? []), c]));
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [programme, piste]);

  if (erreur) return <p className="error">{erreur}</p>;
  if (!programme) return <p className="muted">Chargement…</p>;
  const idx = new Map(prog.map((p) => [p.cours, p]));
  const auj = aujourdHui();

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Programme</p>
        <h1>Du 8 novembre au 31 décembre 2026</h1>
        <p className="muted">Chaque cours suit la même structure : objectifs, cours, démonstration, exercice guidé, exercice autonome, correction et quiz.</p>
      </section>

      {u.role === 'formateur' && (
        <div className="filters" role="group" aria-label="Filtrer par piste">
          {(['toutes', 'groupe', 'solo', 'complement'] as const).map((p) => (
            <button key={p} className={`chipbtn ${piste === p ? 'on' : ''}`} onClick={() => setPiste(p)} aria-pressed={piste === p}>
              {p === 'toutes' ? 'Tout' : PISTES[p]}
            </button>
          ))}
        </div>
      )}

      {semaines.map(([s, cours]) => (
        <section key={s} className="week">
          <h2>Semaine {s}</h2>
          <div className="lessons">
            {cours.map((c) => {
              const p = idx.get(c.slug);
              const statut = p?.statut ?? 'a_faire';
              return (
                <Link key={c.slug} href={`/cours/${c.slug}`} className={`lesson ${statut} ${c.date === auj ? 'today' : ''}`}>
                  <div className="lesson-top">
                    <span className={`chip ${c.piste}`}>{PISTES[c.piste]}</span>
                    <span className="muted small">{dateFr(c.date)}</span>
                  </div>
                  <strong>{c.titre}</strong>
                  <span className="muted small">{c.domaine} · {c.duree} min · {c.niveau}</span>
                  <div className="lesson-bottom">
                    <span className={`status ${statut}`}>{STATUTS[statut]}</span>
                    {p?.quizTotal ? <span className="small">Quiz {p.quizScore}/{p.quizTotal}</span> : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

export default function Programme() {
  return <Shell>{(u) => <Contenu u={u} />}</Shell>;
}
