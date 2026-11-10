'use client';

import Link from 'next/link';
import { capitale, dureeH, Progression, ResumeCours, STATUTS } from '@/lib/api';
import { illustration, infoDomaine, styleDomaine } from '@/lib/domaines';

/** Libellé et classe du statut d'un cours : « Quiz x/5 » dès que le quiz a été passé. */
export function statutCours(p?: Progression | null): { label: string; cls: string } {
  if (p?.statut === 'termine') return { label: p.quizTotal ? `Terminé · ${p.quizScore}/${p.quizTotal}` : STATUTS.termine, cls: 'termine' };
  if (p?.quizTotal) return { label: `Quiz ${p.quizScore}/${p.quizTotal}`, cls: 'quiz' };
  const s = p?.statut ?? 'a_faire';
  return { label: STATUTS[s], cls: s };
}

/**
 * Carte entièrement cliquable vers un cours : illustration, domaine, titre, durée, difficulté et statut.
 * `horizontal` : l'illustration à gauche (étapes d'un parcours).
 */
export default function CarteCours({ cours, prog, horizontal = false, anonyme = false }: { cours: ResumeCours; prog?: Progression | null; horizontal?: boolean; anonyme?: boolean }) {
  const st = statutCours(prog);
  const dom = infoDomaine(cours.domaine);
  return (
    <Link href={anonyme ? `/inscription?suite=${encodeURIComponent(`/cours/${cours.slug}`)}` : `/cours/${cours.slug}`} className={`cc${horizontal ? ' cc-h' : ''}`} style={styleDomaine(cours.domaine)}>
      <div className="cc-img"><img src={illustration(cours.domaine)} alt="" loading="lazy" width={960} height={540} /></div>
      <div className="cc-body">
        <span className="tag dom">{dom.nom}{cours.visibilite === 'prive' ? ' · privé' : ''}</span>
        <span className="cc-titre">{cours.titre}</span>
        <div className="cc-pied">
          <span>{dureeH(cours.duree)} · {capitale(cours.difficulte)}</span>
          {anonyme ? <span className="statut">Commencer ce cours</span> : <span className={`statut ${st.cls}`}>{st.label}</span>}
        </div>
      </div>
    </Link>
  );
}

/** Carte grise d'une UE qui n'a pas encore de cours. */
export function CartePreparation() {
  return (
    <div className="cc cc-vide" aria-label="Cours en préparation">
      <div className="cc-body">
        <span className="cc-titre">Cours en préparation</span>
        <span className="muted small">Les cours de cette UE arrivent bientôt.</span>
      </div>
    </div>
  );
}
