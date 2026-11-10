'use client';

import { CSSProperties, useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import CarteCours from '@/components/CarteCours';
import { api, aujourdHui, Progression, ResumeCours } from '@/lib/api';
import { DOMAINES, illustration, infoDomaine, ORDRE_DOMAINES, styleDomaine } from '@/lib/domaines';
import { pourcent } from '@/lib/stats';

function Contenu() {
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

  // L'API ne renvoie que les cours visibles pour cet utilisateur : on se contente de les regrouper.
  const idx = new Map(prog.map((p) => [p.cours, p]));
  const auj = aujourdHui();
  const groupes = ORDRE_DOMAINES
    .map((cle) => ({
      d: DOMAINES.find((x) => x.cle === cle)!,
      cours: programme.filter((c) => infoDomaine(c.domaine).cle === cle)
        .sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug)),
    }))
    .filter((g) => g.cours.length > 0);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Catalogue</p>
        <h1>Les cours, domaine par domaine</h1>
        <p className="muted">{programme.length} cours répartis en {groupes.length} domaines. Choisis un domaine, puis un cours : il se lit une notion à la fois.</p>
      </section>

      <nav aria-label="Domaines">
        <ul className="ancres">
          {groupes.map(({ d, cours }) => (
            <li key={d.cle} style={styleDomaine(d.nom)}><a href={`#${d.cle}`}>{d.nom} · {cours.length}</a></li>
          ))}
        </ul>
      </nav>

      {groupes.map(({ d, cours }) => {
        const termines = cours.filter((c) => idx.get(c.slug)?.statut === 'termine').length;
        return (
          <section key={d.cle} id={d.cle} className="domaine" style={styleDomaine(d.nom)} aria-labelledby={`t-${d.cle}`}>
            <div className="dom-tete">
              <img src={illustration(d.nom)} alt="" width={960} height={540} loading="lazy" />
              <div className="dom-tete-corps">
                <h2 id={`t-${d.cle}`}>{d.nom}</h2>
                <p>{d.description}</p>
                <strong className="small">{termines} cours terminé{termines > 1 ? 's' : ''} sur {cours.length}</strong>
                <div className="bar" style={{ '--bar': d.accent } as CSSProperties} role="img" aria-label={`${pourcent(termines, cours.length)} % terminés`}>
                  <span style={{ width: `${pourcent(termines, cours.length)}%` }} />
                </div>
              </div>
            </div>
            <div className="grille">
              {cours.map((c) => <CarteCours key={c.slug} cours={c} prog={idx.get(c.slug)} duJour={c.date === auj} />)}
            </div>
          </section>
        );
      })}
    </>
  );
}

export default function Catalogue() {
  return <Shell>{() => <Contenu />}</Shell>;
}
