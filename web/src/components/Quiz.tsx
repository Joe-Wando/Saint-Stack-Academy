'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

type Resultat = { score: number; total: number; detail: { correct: boolean; reponse: number; explication: string }[] };

export default function Quiz({ slug, questions, onFini }: { slug: string; questions: { question: string; choix: string[] }[]; onFini: () => void }) {
  const [reponses, setReponses] = useState<number[]>(Array(questions.length).fill(-1));
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [erreur, setErreur] = useState('');

  if (!questions.length) return null;
  const complet = reponses.every((r) => r >= 0);

  async function valider() {
    setErreur('');
    try {
      const r = await api<Resultat>(`/progression/${slug}/quiz`, { method: 'POST', body: JSON.stringify({ reponses }) });
      setResultat(r); onFini();
    } catch (e) { setErreur((e as Error).message); }
  }

  return (
    <section className="card quiz">
      <h2>Quiz</h2>
      <p className="muted small">Réponds à toutes les questions, puis valide. Ton meilleur score est conservé.</p>
      {questions.map((q, i) => {
        const d = resultat?.detail[i];
        return (
          <fieldset key={i} className={d ? (d.correct ? 'ok' : 'ko') : ''}>
            <legend>{i + 1}. {q.question}</legend>
            {q.choix.map((c, j) => (
              <label key={j} className={d && j === d.reponse ? 'good' : ''}>
                <input type="radio" name={`q${i}`} id={`q${i}-${j}`} checked={reponses[i] === j} disabled={!!resultat}
                  onChange={() => setReponses((r) => r.map((x, k) => (k === i ? j : x)))} />
                {c}
              </label>
            ))}
            {d && <p className="explication">{d.correct ? 'Bonne réponse. ' : 'Pas tout à fait. '}{d.explication}</p>}
          </fieldset>
        );
      })}
      {erreur && <p className="error">{erreur}</p>}
      {!resultat
        ? <button className="btn primary" disabled={!complet} onClick={valider}>Valider mes réponses</button>
        : (
          <div className="score">
            <strong>{resultat.score} / {resultat.total}</strong>
            <button className="btn" onClick={() => { setResultat(null); setReponses(Array(questions.length).fill(-1)); }}>Recommencer</button>
          </div>
        )}
    </section>
  );
}
