'use client';

import Link from 'next/link';
import { CSSProperties, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ShellOuvert } from '@/components/Shell';
import CarteCours, { statutCours } from '@/components/CarteCours';
import { api, indexer, pourcent, progressionSiConnecte, Referentiel, session } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';
import { illustrationParcours } from '@/lib/illustrations-pages';
import { DOMAINES, styleDomaine } from '@/lib/domaines';

function Contenu({ code, connecte }: { code: string; connecte: boolean }) {
  useEffect(() => { try { sessionStorage.setItem('ssa-parcours', code); } catch { /* indisponible */ } }, [code]);
  const { donnees, erreur } = useDonnees(() => Promise.all([api<Referentiel>('/referentiel'), progressionSiConnecte()]));
  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!donnees) return <p className="muted">Chargement…</p>;
  const [ref, prog] = donnees;
  const p = ref.parcours.find((x) => x.code === code);
  if (!p) return <p className="error" role="alert">Ce parcours n’existe pas. <Link href="/parcours">Retour aux parcours</Link></p>;
  const idx = indexer(prog);
  const dom = DOMAINES.find((d) => d.cle === p.domaine);
  const faits = p.cours.filter((c) => idx.get(c.slug)?.statut === 'termine').length;

  return (
    <div style={styleDomaine(dom?.nom ?? '')}>
      <Link href="/parcours" className="small">← Parcours métiers</Link>
      {/* Bandeau bleu nuit de la charte (parcours). */}
      <section className="dom-tete parcours-tete bandeau-sombre">
        <img src={illustrationParcours(p.code)} alt="" width={960} height={540} />
        <div className="dom-tete-corps">
          <p className="eyebrow">Parcours métier</p>
          <h1 className="h-dom">{p.titre}</h1>
          <p>{p.cours.length} étapes, dans l’ordre conseillé.</p>
          {session() && (
            <>
              <strong className="small">{faits} terminée{faits > 1 ? 's' : ''} sur {p.cours.length}</strong>
              <div className="bar" style={{ '--bar': dom?.accent } as CSSProperties} aria-hidden="true"><span style={{ width: `${pourcent(faits, p.cours.length)}%` }} /></div>
            </>
          )}
        </div>
      </section>
      <ol className="chemin">
        {p.cours.map((c, i) => {
          const pr = idx.get(c.slug);
          const st = statutCours(pr);
          const etat = pr?.statut ?? 'a_faire';
          return (
            <li key={c.slug} className={`etape-chemin ${etat}`}>
              <span className="numero" aria-hidden="true">{etat === 'termine' ? '✓' : i + 1}</span>
              <div className="etape-contenu">
                <p className="small etape-etat"><span className="sr">Étape {i + 1} : </span><span className={`statut ${st.cls}`}>{etat === 'termine' ? 'Terminé' : etat === 'en_cours' ? 'En cours' : 'À faire'}</span></p>
                <CarteCours cours={c} prog={pr} horizontal anonyme={!connecte} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function ParcoursDetail() {
  const { code } = useParams<{ code: string }>();
  return <ShellOuvert>{(u) => <Contenu code={code} connecte={!!u} />}</ShellOuvert>;
}
