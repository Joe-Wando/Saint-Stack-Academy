'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Shell from '@/components/Shell';
import Lecon from '@/components/Lecon';
import Quiz from '@/components/Quiz';
import { api, Cours, dateFr, PISTES, Progression, STATUTS } from '@/lib/api';

type Statut = Progression['statut'];

function Contenu({ slug }: { slug: string }) {
  const [cours, setCours] = useState<Cours | null>(null);
  const [prog, setProg] = useState<Progression | null>(null);
  const [note, setNote] = useState('');
  const [etatNote, setEtatNote] = useState('');
  const [erreur, setErreur] = useState('');
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chargerProg = useCallback(() => {
    api<Progression[]>('/progression').then((l) => setProg(l.find((p) => p.cours === slug) ?? null)).catch(() => {});
  }, [slug]);

  useEffect(() => {
    api<Cours>(`/cours/${slug}`).then(setCours).catch((e) => setErreur(e.message));
    api<{ contenu: string }>(`/notes/${slug}`).then((n) => setNote(n.contenu)).catch(() => {});
    chargerProg();
  }, [slug, chargerProg]);

  async function changerStatut(s: Statut) {
    await api(`/progression/${slug}`, { method: 'POST', body: JSON.stringify({ statut: s }) });
    chargerProg();
  }

  function ecrire(v: string) {
    setNote(v); setEtatNote('…');
    if (minuteur.current) clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => {
      api(`/notes/${slug}`, { method: 'PUT', body: JSON.stringify({ contenu: v }) })
        .then(() => setEtatNote('Enregistré')).catch(() => setEtatNote("Échec de l'enregistrement"));
    }, 800);
  }

  if (erreur) return <><p className="error">{erreur}</p><Link href="/programme">Retour au programme</Link></>;
  if (!cours) return <p className="muted">Chargement…</p>;
  const statut = prog?.statut ?? 'a_faire';

  return (
    <div className="lesson-page">
      <div className="main-col">
        <Link href="/programme" className="back">← Programme</Link>
        <p className="eyebrow">{PISTES[cours.piste]} · Semaine {cours.semaine} · {dateFr(cours.date)}</p>
        <h1>{cours.titre}</h1>
        <p className="muted">{cours.domaine} · {cours.duree} min · niveau visé : {cours.niveau}</p>

        <section className="card objectives">
          <h2>À la fin de cette séance, tu sais :</h2>
          <ul>{cours.objectifs.map((o, i) => <li key={i}>{o}</li>)}</ul>
          {cours.prerequis.length > 0 && <p className="small"><strong>Prérequis :</strong> {cours.prerequis.join(' ; ')}</p>}
        </section>

        <Lecon markdown={cours.contenu} />
        <Quiz slug={slug} questions={cours.quiz} onFini={chargerProg} />
      </div>

      <aside className="side-col">
        <section className="card">
          <h2>Ma progression</h2>
          <div className="seg" role="group" aria-label="Statut du cours">
            {(Object.keys(STATUTS) as Statut[]).map((s) => (
              <button key={s} className={statut === s ? 'on' : ''} aria-pressed={statut === s} onClick={() => changerStatut(s)}>{STATUTS[s]}</button>
            ))}
          </div>
          {prog?.quizTotal ? <p className="small">Meilleur score au quiz : <strong>{prog.quizScore}/{prog.quizTotal}</strong> ({prog.quizEssais} essai{prog.quizEssais > 1 ? 's' : ''})</p> : <p className="muted small">Quiz pas encore passé.</p>}
        </section>
        <section className="card">
          <h2>Mes notes <span className="muted small">{etatNote}</span></h2>
          <label htmlFor="note" className="sr">Mes notes sur ce cours</label>
          <textarea id="note" value={note} onChange={(e) => ecrire(e.target.value)} placeholder="Ce que j'ai compris, mes questions, mes commandes utiles…" rows={10} />
        </section>
        {cours.referentiels.length > 0 && (
          <section className="card">
            <h2>Référentiels</h2>
            <ul className="small">{cours.referentiels.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </section>
        )}
      </aside>
    </div>
  );
}

export default function PageCours() {
  const { slug } = useParams<{ slug: string }>();
  return <Shell>{() => <Contenu slug={slug} />}</Shell>;
}
