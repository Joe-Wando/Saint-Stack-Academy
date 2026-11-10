'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import AdminCadre from '@/components/AdminCadre';
import { statutCours } from '@/components/CarteCours';
import { api, dureeH, indexer, pourcent, Progression, ResumeCours } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';
import { infoDomaine } from '@/lib/domaines';

const normal = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Mon espace personnel : ma liste de cours à étudier, dans l'ordre que je choisis. Aucune date. */
function Contenu() {
  const { donnees, erreur } = useDonnees(() => Promise.all([
    api<{ cours: string; ordre: number }[]>('/admin/mes-cours'), api<ResumeCours[]>('/cours'), api<Progression[]>('/progression'),
  ]));
  const [liste, setListe] = useState<string[] | null>(null);
  const [recherche, setRecherche] = useState('');
  const [etat, setEtat] = useState('');
  const [focus, setFocus] = useState<{ slug: string; sens: 'monter' | 'descendre' } | null>(null);
  const boutons = useRef(new Map<string, HTMLButtonElement | null>());

  useEffect(() => { if (donnees && !liste) setListe(donnees[0].map((x) => x.cours)); }, [donnees, liste]);
  // Après un déplacement au clavier, le focus suit le cours déplacé.
  useEffect(() => { if (focus) boutons.current.get(`${focus.slug}-${focus.sens}`)?.focus(); }, [liste, focus]);

  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!donnees || !liste) return <p className="muted">Chargement…</p>;
  const [, tous, prog] = donnees;
  const parSlug = new Map(tous.map((c) => [c.slug, c]));
  const idx = indexer(prog);
  const termines = liste.filter((s) => idx.get(s)?.statut === 'termine').length;

  async function enregistrer(nouvelle: string[]) {
    setListe(nouvelle); setEtat('Enregistrement…');
    try {
      await api('/admin/mes-cours', { method: 'PUT', body: JSON.stringify(nouvelle.map((cours, i) => ({ cours, ordre: i + 1 }))) });
      setEtat('Enregistré');
    } catch (e) { setEtat(`Échec : ${(e as Error).message}`); }
  }
  function deplacer(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= liste!.length) return;
    const n = [...liste!];
    [n[i], n[j]] = [n[j], n[i]];
    setFocus({ slug: n[j], sens: d < 0 ? 'monter' : 'descendre' });
    enregistrer(n);
  }

  const mots = normal(recherche).split(/\s+/).filter(Boolean);
  const resultats = mots.length
    ? tous.filter((c) => !liste.includes(c.slug) && mots.every((m) => normal(`${c.titre} ${c.domaine}`).includes(m))).slice(0, 8)
    : [];

  return (
    <>
      <section className="hero">
        <h1>Mes cours</h1>
        <p className="muted">Ma liste de cours à étudier, dans l’ordre que je choisis. {termines} terminé{termines > 1 ? 's' : ''} sur {liste.length}.</p>
        <div className="bar" aria-hidden="true" style={{ maxWidth: 420 }}><span style={{ width: `${pourcent(termines, liste.length)}%` }} /></div>
      </section>

      <section className="card">
        <label htmlFor="ajout" className="lbl">Ajouter un cours</label>
        <input id="ajout" type="search" className="champ" placeholder="Rechercher par titre ou domaine…" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
        {resultats.length > 0 && (
          <ul className="resultats">
            {resultats.map((c) => (
              <li key={c.slug}>
                <span>{c.titre} <span className="muted small">· {infoDomaine(c.domaine).nom}</span></span>
                <button className="btn sm" onClick={() => { enregistrer([...liste, c.slug]); setRecherche(''); }}>Ajouter</button>
              </li>
            ))}
          </ul>
        )}
        {mots.length > 0 && !resultats.length && <p className="muted small">Aucun cours à ajouter pour cette recherche.</p>}
      </section>

      <p className="small muted" aria-live="polite">{etat}</p>
      <ol className="ma-liste">
        {liste.map((slug, i) => {
          const c = parSlug.get(slug);
          if (!c) return null;
          const st = statutCours(idx.get(slug));
          return (
            <li key={slug}>
              <span className="numero" aria-hidden="true">{i + 1}</span>
              <div className="ma-liste-corps">
                <Link href={`/cours/${slug}`}><strong>{c.titre}</strong></Link>
                <span className="muted small">{infoDomaine(c.domaine).nom} · {dureeH(c.duree)}{c.visibilite === 'prive' ? ' · privé' : ''}</span>
              </div>
              <span className={`statut ${st.cls}`}>{st.label}</span>
              <div className="ma-liste-actions">
                <button className="btn sm" ref={(el) => { boutons.current.set(`${slug}-monter`, el); }} onClick={() => deplacer(i, -1)} disabled={i === 0} aria-label={`Monter « ${c.titre} »`}>↑</button>
                <button className="btn sm" ref={(el) => { boutons.current.set(`${slug}-descendre`, el); }} onClick={() => deplacer(i, 1)} disabled={i === liste.length - 1} aria-label={`Descendre « ${c.titre} »`}>↓</button>
                <button className="btn sm" onClick={() => enregistrer(liste.filter((s) => s !== slug))} aria-label={`Retirer « ${c.titre} »`}>Retirer</button>
              </div>
            </li>
          );
        })}
      </ol>
      {!liste.length && <p className="card muted">Ta liste est vide. Ajoute des cours avec la recherche ci-dessus.</p>}
    </>
  );
}

export default function MesCours() {
  return <AdminCadre>{() => <Contenu />}</AdminCadre>;
}
