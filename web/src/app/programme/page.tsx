'use client';

import { useEffect, useMemo, useState } from 'react';
import Shell from '@/components/Shell';
import CarteCours from '@/components/CarteCours';
import { api, aujourdHui, dateCourte, Piste, PISTES, Progression, ResumeCours, Utilisateur } from '@/lib/api';

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
    const liste = (programme ?? []).filter((c) => piste === 'toutes' || c.piste === piste)
      .sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug));
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
        <div className="filtres" role="group" aria-label="Filtrer par piste">
          {(['toutes', 'groupe', 'solo', 'complement'] as const).map((p) => (
            <button key={p} className={`chipbtn ${piste === p ? 'on' : ''}`} onClick={() => setPiste(p)} aria-pressed={piste === p}>
              {p === 'toutes' ? 'Tout' : PISTES[p]}
            </button>
          ))}
        </div>
      )}

      {semaines.map(([s, cours]) => (
        <section key={s} aria-labelledby={`sem-${s}`}>
          <div className="semaine-tete">
            <h2 id={`sem-${s}`}>Semaine {s}</h2>
            <span className="muted small">
              {dateCourte(cours[0].date)}{cours[cours.length - 1].date !== cours[0].date ? ` – ${dateCourte(cours[cours.length - 1].date)}` : ''} · {cours.length} cours
            </span>
          </div>
          <div className="grille">
            {cours.map((c) => <CarteCours key={c.slug} cours={c} prog={idx.get(c.slug)} duJour={c.date === auj} />)}
          </div>
        </section>
      ))}
    </>
  );
}

export default function Programme() {
  return <Shell>{(u) => <Contenu u={u} />}</Shell>;
}
