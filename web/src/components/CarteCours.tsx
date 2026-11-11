'use client';

import Link from 'next/link';
import { capitale, dureeH, Progression, ResumeCours, STATUTS } from '@/lib/api';
import { infoDomaine, styleDomaine } from '@/lib/domaines';
import VisuelCours from './VisuelCours';

/** Libellé et classe du statut d'un cours : « Quiz x/5 » dès que le quiz a été passé. */
export function statutCours(p?: Progression | null): { label: string; cls: string } {
  if (p?.statut === 'termine') return { label: p.quizTotal ? `Terminé · ${p.quizScore}/${p.quizTotal}` : STATUTS.termine, cls: 'termine' };
  if (p?.quizTotal) return { label: `Quiz ${p.quizScore}/${p.quizTotal}`, cls: 'quiz' };
  const s = p?.statut ?? 'a_faire';
  return { label: STATUTS[s], cls: s };
}

/**
 * Carte entièrement cliquable vers un cours : visuel (illustration, ruban de niveau, pastille du sujet),
 * sujet en surtitre corail, titre, durée, difficulté et statut (s'il est commencé).
 * `horizontal` : l'illustration à gauche (étapes d'un parcours).
 */
export default function CarteCours({ cours, prog, horizontal = false, anonyme = false }: { cours: ResumeCours; prog?: Progression | null; horizontal?: boolean; anonyme?: boolean }) {
  const st = statutCours(prog);
  const dom = infoDomaine(cours.domaine);
  return (
    <Link href={anonyme ? `/inscription?suite=${encodeURIComponent(`/cours/${cours.slug}`)}` : `/cours/${cours.slug}`} className={`cc${horizontal ? ' cc-h' : ''}`} style={styleDomaine(cours.domaine)}>
      <VisuelCours domaine={cours.domaine} sujet={cours.sujet} licence={cours.licence} classeImage="cc-img" />
      <div className="cc-body">
        {/* Surtitre corail : le sujet (ou le domaine), puis le titre et la durée (CHARTE.md § 4, carte de cours). */}
        <span className="cc-surtitre">{cours.sujet?.libelle ?? dom.nom}{cours.visibilite === 'prive' ? ' · privé' : ''}</span>
        <span className="cc-titre">{cours.titre}</span>
        <div className="cc-pied">
          <span className="cc-duree">
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            {dureeH(cours.duree)} · {capitale(cours.difficulte)}
          </span>
          {anonyme ? null : st.cls !== 'a_faire' && <span className={`statut ${st.cls}`}>{st.label}</span>}
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
