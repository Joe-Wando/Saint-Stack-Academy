'use client';

import Link from 'next/link';
import { useState } from 'react';
import Shell from '@/components/Shell';
import { api, NIVEAUX, Niveau } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';

interface Stats {
  inscrits: number; verifies: number;
  parNiveau: { niveau: string; nombre: number }[];
  parOption: { option: string; titre: string; nombre: number }[];
  plusCommences: { slug: string; titre: string; commences: number }[];
  cours: { slug: string; titre: string; domaine: string; visibilite: string; commences: number; termines: number; moyenneQuiz: number | null; tentatives: number; aRevoir: boolean }[];
}

type Tri = 'commences' | 'termines' | 'moyenneQuiz' | 'tentatives' | 'titre';

/** Statistiques agrégées et anonymes : aucun nom d'apprenant n'apparaît ici. */
function Contenu() {
  const { donnees: s, erreur } = useDonnees(() => api<Stats>('/admin/statistiques'));
  const [tri, setTri] = useState<Tri>('commences');
  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!s) return <p className="muted">Chargement…</p>;
  const aRevoir = s.cours.filter((c) => c.aRevoir).length;
  const cours = [...s.cours].sort((a, b) => tri === 'titre' ? a.titre.localeCompare(b.titre) : ((b[tri] ?? -1) as number) - ((a[tri] ?? -1) as number));
  const entete = (cle: Tri, label: string, num = true) => (
    <th className={num ? 'num' : undefined} aria-sort={tri === cle ? (cle === 'titre' ? 'ascending' : 'descending') : 'none'}>
      <button className="tri" onClick={() => setTri(cle)}>{label}</button>
    </th>
  );

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Administration</p>
        <h1>Statistiques de la plateforme</h1>
        <p className="muted">Données agrégées et anonymes, sur les comptes apprenants.</p>
      </section>

      <section className="chiffres chiffres-4" aria-label="Chiffres clés">
        <div className="chiffre"><span className="k">Inscrits</span><span className="v">{s.inscrits}</span></div>
        <div className="chiffre"><span className="k">Adresses vérifiées</span><span className="v">{s.verifies}</span></div>
        <div className="chiffre"><span className="k">Cours commencés au moins une fois</span><span className="v">{s.cours.filter((c) => c.commences).length}</span></div>
        <div className={`chiffre ${aRevoir ? 'warn' : ''}`}><span className="k">Cours à revoir</span><span className="v">{aRevoir}</span></div>
      </section>

      <div className="grid2">
        <section className="card">
          <h2>Répartition par niveau</h2>
          <table className="table">
            <thead><tr><th>Niveau</th><th className="num">Inscrits</th></tr></thead>
            <tbody>
              {s.parNiveau.map((n) => <tr key={n.niveau}><td>{NIVEAUX[n.niveau as Niveau] ?? n.niveau}</td><td className="num">{n.nombre}</td></tr>)}
              {s.parOption.map((o) => <tr key={o.option}><td className="muted">L3 · {o.titre}</td><td className="num">{o.nombre}</td></tr>)}
              {!s.parNiveau.length && <tr><td colSpan={2} className="muted">Aucun inscrit pour l’instant.</td></tr>}
            </tbody>
          </table>
        </section>
        <section className="card">
          <h2>Les 10 cours les plus commencés</h2>
          {s.plusCommences.length ? (
            <ol className="classement">{s.plusCommences.map((c) => <li key={c.slug}><Link href={`/cours/${c.slug}`}>{c.titre}</Link><span className="num">{c.commences}</span></li>)}</ol>
          ) : <p className="muted">Aucun cours commencé pour l’instant.</p>}
        </section>
      </div>

      <section className="card">
        <h2>Tous les cours</h2>
        <p className="muted small">« À revoir » : moyenne au quiz inférieure à 60 %, avec au moins 5 tentatives. Clique sur un en-tête pour trier.</p>
        <div className="scroll">
          <table className="table">
            <thead><tr>
              {entete('titre', 'Cours', false)}
              {entete('commences', 'Commencé')}
              {entete('termines', 'Terminé')}
              {entete('moyenneQuiz', 'Moyenne quiz')}
              {entete('tentatives', 'Tentatives')}
              <th>À revoir</th>
            </tr></thead>
            <tbody>
              {cours.map((c) => (
                <tr key={c.slug} className={c.aRevoir ? 'alert' : ''}>
                  <td><Link href={`/cours/${c.slug}`}>{c.titre}</Link><br /><span className="muted small">{c.domaine}{c.visibilite === 'prive' ? ' · privé' : ''}</span></td>
                  <td className="num">{c.commences}</td>
                  <td className="num">{c.termines}</td>
                  <td className="num">{c.moyenneQuiz === null ? '–' : `${c.moyenneQuiz} %`}</td>
                  <td className="num">{c.tentatives}</td>
                  <td>{c.aRevoir ? <span className="statut en_cours">À revoir</span> : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default function Statistiques() {
  return <Shell admin>{() => <Contenu />}</Shell>;
}
