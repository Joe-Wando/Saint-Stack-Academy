'use client';

import Link from 'next/link';
import { ShellOuvert } from '@/components/Shell';
import { api, indexer, pourcent, progressionSiConnecte, Referentiel } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';
import { slugsDe } from '@/lib/licence';

const ILLUS: Record<string, string> = { L1: 'systemes', L2: 'web', L3: 'data' };

function Contenu({ connecte }: { connecte: boolean }) {
  const { donnees, erreur } = useDonnees(() => Promise.all([api<Referentiel>('/referentiel'), progressionSiConnecte()]));
  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!donnees) return <p className="muted">Chargement…</p>;
  const [ref, prog] = donnees;
  const idx = indexer(prog);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Licence</p>
        <h1>La licence, semestre par semestre</h1>
        <p className="muted">Chaque niveau est découpé en semestres, puis en unités d’enseignement (UE). Les cours sont rangés dans l’ordre conseillé.</p>
      </section>
      <div className="grandes-cartes">
        {ref.niveaux.map((n) => {
          const slugs = slugsDe(n.semestres, n.troncCommun, ...n.options.map((o) => o.semestres));
          const faits = slugs.filter((s) => idx.get(s)?.statut === 'termine').length;
          const [code, ...reste] = n.titre.split(' · ');
          return (
            <Link key={n.code} href={`/licence/${n.code}`} className="grande-carte">
              <img src={`/illustrations/${ILLUS[n.code] ?? 'projet'}.svg`} alt="" width={960} height={540} />
              <div className="grande-carte-corps">
                <span className="tag">{code}</span>
                <h2>{reste.join(' · ') || n.titre}</h2>
                <p className="muted small">{slugs.length ? `${slugs.length} cours disponibles` : 'Cours en préparation'}
                  {n.options.length ? ` · ${n.options.length} options` : ''}</p>
                {slugs.length > 0 && connecte && (
                  <>
                    <div className="bar sm" aria-hidden="true"><span style={{ width: `${pourcent(faits, slugs.length)}%` }} /></div>
                    <span className="small muted">{faits} terminé{faits > 1 ? 's' : ''} sur {slugs.length}</span>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export default function Licence() {
  return <ShellOuvert>{(u) => <Contenu connecte={!!u} />}</ShellOuvert>;
}
