'use client';

import { useState } from 'react';
import { ShellOuvert } from '@/components/Shell';
import CarteCours from '@/components/CarteCours';
import { api, indexer, progressionSiConnecte, ResumeCours } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';
import EtatVide from '@/components/EtatVide';
import { ILLUS } from '@/lib/illustrations-pages';
import { DOMAINES, infoDomaine, ORDRE_DOMAINES } from '@/lib/domaines';

const normal = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const NIVEAUX = [{ cle: 'tous', label: 'Tous les niveaux' }, { cle: 'L1', label: 'L1' }, { cle: 'L2', label: 'L2' }, { cle: 'L3', label: 'L3' }, { cle: 'hors', label: 'Hors licence' }];

/** Catalogue (maquette Catalogue) : recherche, puces de niveau et de domaine, une grille de cartes. */
function Contenu({ connecte }: { connecte: boolean }) {
  const { donnees, erreur } = useDonnees(() => Promise.all([api<ResumeCours[]>('/cours'), progressionSiConnecte()]));
  const [recherche, setRecherche] = useState('');
  const [niveau, setNiveau] = useState('tous');
  const [domaine, setDomaine] = useState('tous');
  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!donnees) return <p className="muted">Chargement…</p>;
  const [tous, prog] = donnees;
  const idx = indexer(prog);

  const nbDomaines = new Set(tous.map((c) => infoDomaine(c.domaine).cle)).size;
  const domaines = ORDRE_DOMAINES.map((cle) => DOMAINES.find((d) => d.cle === cle)!).filter((d) => tous.some((c) => infoDomaine(c.domaine).cle === d.cle));
  const ordre = new Map(ORDRE_DOMAINES.map((c, i) => [c, i]));

  // Recherche sur le titre, le sujet et les objectifs, insensible aux accents et à la casse.
  const mots = normal(recherche).split(/\s+/).filter(Boolean);
  const filtres = tous
    .filter((c) => niveau === 'tous' || (niveau === 'hors' ? !c.licence?.length : c.licence?.some((l) => l.niveau === niveau)))
    .filter((c) => domaine === 'tous' || infoDomaine(c.domaine).cle === domaine)
    .filter((c) => mots.every((m) => normal(`${c.titre} ${c.sujet?.libelle ?? ''} ${c.objectifs.join(' ')}`).includes(m)))
    .sort((a, b) => (ordre.get(infoDomaine(a.domaine).cle) ?? 99) - (ordre.get(infoDomaine(b.domaine).cle) ?? 99) || a.ordre - b.ordre);

  return (
    <>
      <section className="tete-page">
        <p className="eyebrow">Catalogue</p>
        <h1>Tous les cours</h1>
        <p className="tete-page-sous">{tous.length} cours, domaine par domaine ({nbDomaines} domaines). Filtre par niveau ou par sujet.</p>
      </section>

      <div className="recherche-charte" role="search">
        <label htmlFor="q" className="sr">Rechercher un cours</label>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        <input id="q" type="search" placeholder="Rechercher : Docker, SQL, pointeurs…" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
      </div>
      <div className="filtres" role="group" aria-label="Filtrer par niveau">
        {NIVEAUX.map((n) => (
          <button key={n.cle} className={`chipbtn ${niveau === n.cle ? 'on' : ''}`} aria-pressed={niveau === n.cle} onClick={() => setNiveau(n.cle)}>{n.label}</button>
        ))}
      </div>
      <div className="filtres filtres-2" role="group" aria-label="Filtrer par domaine">
        <button className={`chipbtn ${domaine === 'tous' ? 'on' : ''}`} aria-pressed={domaine === 'tous'} onClick={() => setDomaine('tous')}>Tous</button>
        {domaines.map((d) => (
          <button key={d.cle} className={`chipbtn ${domaine === d.cle ? 'on' : ''}`} aria-pressed={domaine === d.cle} onClick={() => setDomaine(d.cle)}>{d.nom}</button>
        ))}
      </div>
      <p className="small muted resultats" aria-live="polite">{filtres.length} cours trouvé{filtres.length > 1 ? 's' : ''}</p>

      {filtres.length ? (
        <div className="grille">
          {filtres.map((c) => <CarteCours key={c.slug} cours={c} prog={idx.get(c.slug)} anonyme={!connecte} />)}
        </div>
      ) : (
        <EtatVide image={ILLUS.videRecherche} titre="Aucun cours ne correspond">
          <p className="muted">Essaie un autre mot, ou retire un filtre.</p>
        </EtatVide>
      )}
    </>
  );
}

export default function Catalogue() {
  return <ShellOuvert>{(u) => <Contenu connecte={!!u} />}</ShellOuvert>;
}
