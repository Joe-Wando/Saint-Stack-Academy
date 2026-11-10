'use client';

import Link from 'next/link';
import { useState } from 'react';
import AdminCadre from '@/components/AdminCadre';
import { api } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';

interface Ligne {
  slug: string; titre: string; domaine: string; visibilite: string; commences: number; termines: number;
  moyenneQuiz: number | null; tentatives: number; aRevoir: boolean;
  questionPlusRatee: { numero: number; question: string; echecs: number } | null;
}
type Tri = 'commences' | 'termines' | 'moyenneQuiz' | 'tentatives' | 'titre';

function Contenu() {
  const { donnees, erreur, recharger } = useDonnees(() => api<Ligne[]>('/admin/cours'));
  const [tri, setTri] = useState<Tri>('commences');
  const [filtre, setFiltre] = useState('');
  const [etat, setEtat] = useState('');
  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!donnees) return <p className="muted">Chargement…</p>;

  async function rechargerCours() {
    setEtat('Rechargement…');
    try {
      const r = await api<{ message: string }>('/admin/contenu/recharger', { method: 'POST' });
      setEtat(r.message); recharger();
    } catch (x) { setEtat((x as Error).message); }
  }

  const aRevoir = donnees.filter((c) => c.aRevoir).length;
  const liste = donnees
    .filter((c) => !filtre || (filtre === 'revoir' ? c.aRevoir : filtre === 'prive' ? c.visibilite === 'prive' : true))
    .sort((a, b) => tri === 'titre' ? a.titre.localeCompare(b.titre) : ((b[tri] ?? -1) as number) - ((a[tri] ?? -1) as number));
  const entete = (cle: Tri, label: string, num = true) => (
    <th className={num ? 'num' : undefined} aria-sort={tri === cle ? (cle === 'titre' ? 'ascending' : 'descending') : 'none'}>
      <button className="tri" onClick={() => setTri(cle)}>{label}</button>
    </th>
  );

  return (
    <>
      <h1>Cours</h1>
      <p className="muted">{donnees.length} cours, dont {aRevoir} à revoir. « À revoir » : moyenne au quiz sous 60 %, avec au moins 5 tentatives.</p>
      <section className="card barre-outils">
        <div className="filtres" role="group" aria-label="Filtrer">
          {[['', 'Tous'], ['revoir', 'À revoir'], ['prive', 'Privés']].map(([v, l]) => (
            <button key={v} className={`chipbtn ${filtre === v ? 'on' : ''}`} aria-pressed={filtre === v} onClick={() => setFiltre(v)}>{l}</button>
          ))}
        </div>
        <div>
          <button className="btn" onClick={rechargerCours}>Recharger les cours</button>
          <p className="small muted" style={{ margin: '.3rem 0 0' }} aria-live="polite">{etat || 'Relit le dossier content/ sans redémarrer l’API.'}</p>
        </div>
      </section>
      <section className="card">
        <div className="scroll">
          <table className="table">
            <thead><tr>
              {entete('titre', 'Cours', false)}
              {entete('commences', 'Commencé')}
              {entete('termines', 'Terminé')}
              {entete('moyenneQuiz', 'Moyenne quiz')}
              {entete('tentatives', 'Tentatives')}
              <th>Question la plus ratée</th>
            </tr></thead>
            <tbody>
              {liste.map((c) => (
                <tr key={c.slug} className={c.aRevoir ? 'alert' : ''}>
                  <td>
                    <Link href={`/cours/${c.slug}`}>{c.titre}</Link><br />
                    <span className="muted small">{c.domaine}{c.visibilite === 'prive' ? ' · privé' : ''}</span>
                    {c.aRevoir && <> <span className="statut en_cours">À revoir</span></>}
                  </td>
                  <td className="num">{c.commences}</td>
                  <td className="num">{c.termines}</td>
                  <td className="num">{c.moyenneQuiz === null ? '–' : `${c.moyenneQuiz} %`}</td>
                  <td className="num">{c.tentatives}</td>
                  <td className="small">{c.questionPlusRatee ? <>Q{c.questionPlusRatee.numero} · {c.questionPlusRatee.question} <span className="muted">({c.questionPlusRatee.echecs} échec{c.questionPlusRatee.echecs > 1 ? 's' : ''})</span></> : <span className="muted">–</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default function AdminCours() {
  return <AdminCadre>{() => <Contenu />}</AdminCadre>;
}
