'use client';

import { CSSProperties, useState } from 'react';
import { ShellOuvert } from '@/components/Shell';
import { Souligne } from '@/components/Decor';
import CarteCours from '@/components/CarteCours';
import { api, capitale, DIFFICULTES, indexer, pourcent, progressionSiConnecte, ResumeCours, session } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';
import { DOMAINES, illustration, infoDomaine, ORDRE_DOMAINES, styleDomaine } from '@/lib/domaines';

const normal = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function Contenu({ connecte }: { connecte: boolean }) {
  const { donnees, erreur } = useDonnees(() => Promise.all([api<ResumeCours[]>('/cours'), progressionSiConnecte()]));
  const [recherche, setRecherche] = useState('');
  const [difficulte, setDifficulte] = useState<string>('toutes');
  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!donnees) return <p className="muted">Chargement…</p>;
  const [tous, prog] = donnees;
  const idx = indexer(prog);

  // Recherche sur le titre et les objectifs, insensible aux accents et à la casse.
  const mots = normal(recherche).split(/\s+/).filter(Boolean);
  const filtres = tous.filter((c) =>
    (difficulte === 'toutes' || normal(c.difficulte) === normal(difficulte))
    && mots.every((m) => normal(`${c.titre} ${c.objectifs.join(' ')}`).includes(m)));
  const sections = ORDRE_DOMAINES
    .map((cle) => ({ d: DOMAINES.find((x) => x.cle === cle)!, cours: filtres.filter((c) => infoDomaine(c.domaine).cle === cle) }))
    .filter((g) => g.cours.length > 0);
  const nbDomaines = new Set(tous.map((c) => infoDomaine(c.domaine).cle)).size;

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Catalogue</p>
        <h1>Les cours, <Souligne>domaine par domaine</Souligne></h1>
        <p className="muted">{tous.length} cours répartis en {nbDomaines} domaines. Chaque cours se lit une notion à la fois.</p>
      </section>

      <div className="recherche" role="search">
        <label htmlFor="q" className="sr">Rechercher un cours</label>
        <input id="q" type="search" placeholder="Rechercher un cours, un outil, une notion…" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
        <div className="filtres" role="group" aria-label="Filtrer par difficulté">
          {['toutes', ...DIFFICULTES].map((d) => (
            <button key={d} className={`chipbtn ${difficulte === d ? 'on' : ''}`} aria-pressed={difficulte === d} onClick={() => setDifficulte(d)}>
              {d === 'toutes' ? 'Toutes les difficultés' : capitale(d)}
            </button>
          ))}
        </div>
        <p className="small muted" aria-live="polite">{filtres.length} cours trouvé{filtres.length > 1 ? 's' : ''}</p>
      </div>

      <nav aria-label="Domaines">
        <ul className="ancres">
          {sections.map(({ d, cours }) => (
            <li key={d.cle} style={styleDomaine(d.nom)}><a href={`#${d.cle}`}>{d.nom} · {cours.length}</a></li>
          ))}
        </ul>
      </nav>

      {!sections.length && <p className="card">Aucun cours ne correspond. Essaie un autre mot, ou retire le filtre de difficulté.</p>}

      {sections.map(({ d, cours }) => {
        const termines = cours.filter((c) => idx.get(c.slug)?.statut === 'termine').length;
        return (
          <section key={d.cle} id={d.cle} className="domaine" style={styleDomaine(d.nom)} aria-labelledby={`t-${d.cle}`}>
            <div className="dom-tete">
              <img src={illustration(d.nom)} alt="" width={960} height={540} loading="lazy" />
              <div className="dom-tete-corps">
                <h2 id={`t-${d.cle}`}>{d.nom}</h2>
                <p>{d.description}</p>
                {session() && (<>
                <strong className="small">{termines} cours terminé{termines > 1 ? 's' : ''} sur {cours.length}</strong>
                <div className="bar" style={{ '--bar': d.accent } as CSSProperties} role="img" aria-label={`${pourcent(termines, cours.length)} % terminés`}>
                  <span style={{ width: `${pourcent(termines, cours.length)}%` }} />
                </div>
                </>)}
              </div>
            </div>
            <div className="grille">
              {cours.map((c) => <CarteCours key={c.slug} cours={c} prog={idx.get(c.slug)} anonyme={!connecte} />)}
            </div>
          </section>
        );
      })}
    </>
  );
}

export default function Catalogue() {
  return <ShellOuvert>{(u) => <Contenu connecte={!!u} />}</ShellOuvert>;
}
