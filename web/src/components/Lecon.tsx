'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Découpe le Markdown en sections « ## » ; les sections « Correction… » sont masquées jusqu'au clic. */
export default function Lecon({ markdown }: { markdown: string }) {
  const sections: { titre: string; corps: string }[] = [];
  let courante = { titre: '', corps: '' };
  let dansCode = false;               // on ne coupe pas sur un « ## » situé dans un bloc de code
  for (const ligne of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(ligne)) dansCode = !dansCode;
    if (!dansCode && ligne.startsWith('## ')) {
      if (courante.titre || courante.corps.trim()) sections.push(courante);
      courante = { titre: ligne.slice(3).trim(), corps: '' };
    } else courante.corps += ligne + '\n';
  }
  sections.push(courante);

  return (
    <article className="prose">
      {sections.map((s, i) =>
        /^correction/i.test(s.titre) ? <Correction key={i} titre={s.titre} corps={s.corps} /> : (
          <section key={i}>
            {s.titre && <h2>{s.titre}</h2>}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.corps}</ReactMarkdown>
          </section>
        ))}
    </article>
  );
}

function Correction({ titre, corps }: { titre: string; corps: string }) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <section className="correction">
      <h2>{titre}</h2>
      {!ouvert
        ? <button className="btn" onClick={() => setOuvert(true)}>Afficher la correction (après avoir essayé)</button>
        : <ReactMarkdown remarkPlugins={[remarkGfm]}>{corps}</ReactMarkdown>}
    </section>
  );
}
