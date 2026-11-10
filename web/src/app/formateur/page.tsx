'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api, dateFr, Utilisateur } from '@/lib/api';
import { pourcent } from '@/lib/stats';

interface Apercu {
  apprenants: { id: number; nom: string; email: string; termines: number; total: number; moyenneQuiz: number | null;
    cours: Record<string, { statut: string; score: number | null; total: number | null }> }[];
  seances: { slug: string; titre: string; date: string; semaine: number; domaine: string; termines: number; moyenneQuiz: number | null }[];
}

function Contenu({ u }: { u: Utilisateur }) {
  const [a, setA] = useState<Apercu | null>(null);
  const [erreur, setErreur] = useState('');
  useEffect(() => { api<Apercu>('/formateur/apercu').then(setA).catch((e) => setErreur(e.message)); }, []);

  if (u.role !== 'formateur') return <p className="error">Cette page est réservée au formateur.</p>;
  if (erreur) return <p className="error">{erreur}</p>;
  if (!a) return <p className="muted">Chargement…</p>;
  const n = a.apprenants.length;

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Suivi du groupe</p>
        <h1>{n} apprenant{n > 1 ? 's' : ''}</h1>
        <p className="muted">Avancement de chacun sur les séances de groupe. Une séance avec une moyenne faible au quiz mérite d'être reprise.</p>
      </section>

      <section className="card">
        <h2>Apprenants</h2>
        {n === 0 ? <p className="muted">Personne n'est encore inscrit. Donne le code d'invitation à tes amis pour qu'ils créent leur compte.</p> : (
          <table className="table">
            <thead><tr><th>Nom</th><th>Avancement</th><th className="num">Moyenne quiz</th></tr></thead>
            <tbody>
              {a.apprenants.map((p) => (
                <tr key={p.id}>
                  <td>{p.nom}<br /><span className="muted small">{p.email}</span></td>
                  <td><div className="bar sm"><span style={{ width: `${pourcent(p.termines, p.total)}%` }} /></div><span className="small">{p.termines}/{p.total} séances</span></td>
                  <td className="num">{p.moyenneQuiz === null ? '–' : `${p.moyenneQuiz} %`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <h2>Séances</h2>
        <div className="scroll">
          <table className="table">
            <thead><tr><th>Date</th><th>Séance</th><th className="num">Terminée par</th><th className="num">Moyenne quiz</th></tr></thead>
            <tbody>
              {a.seances.map((s) => (
                <tr key={s.slug} className={s.moyenneQuiz !== null && s.moyenneQuiz < 60 ? 'alert' : ''}>
                  <td className="small">{dateFr(s.date)}</td>
                  <td><Link href={`/cours/${s.slug}`}>{s.titre}</Link><br /><span className="muted small">{s.domaine}</span></td>
                  <td className="num">{s.termines}/{n}</td>
                  <td className="num">{s.moyenneQuiz === null ? '–' : `${s.moyenneQuiz} %`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default function Formateur() {
  return <Shell>{(u) => <Contenu u={u} />}</Shell>;
}
