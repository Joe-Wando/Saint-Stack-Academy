'use client';

import Link from 'next/link';
import { dateCourte, dureeH, PISTES, Progression, ResumeCours, STATUTS } from '@/lib/api';
import { illustration, styleDomaine } from '@/lib/domaines';

/** Libellé et classe du statut d'un cours : « Quiz x/5 » dès que le quiz a été passé. */
export function statutCours(p?: Progression | null): { label: string; cls: string } {
  if (p?.quizTotal) return { label: `Quiz ${p.quizScore}/${p.quizTotal}`, cls: 'quiz' };
  const s = p?.statut ?? 'a_faire';
  return { label: STATUTS[s], cls: s };
}

/** Carte entièrement cliquable vers un cours : illustration, piste, titre, date, durée et statut. */
export default function CarteCours({ cours, prog, duJour = false }: { cours: ResumeCours; prog?: Progression | null; duJour?: boolean }) {
  const st = statutCours(prog);
  return (
    <Link href={`/cours/${cours.slug}`} className={`cc${duJour ? ' today' : ''}`} style={styleDomaine(cours.domaine)}>
      <div className="cc-img"><img src={illustration(cours.domaine)} alt="" loading="lazy" width={960} height={540} /></div>
      <div className="cc-body">
        <span className={`tag ${cours.piste}`}>{PISTES[cours.piste]}</span>
        <span className="cc-titre">{cours.titre}</span>
        <div className="cc-pied">
          <span>{dateCourte(cours.date)} · {dureeH(cours.duree)}{duJour ? ' · aujourd’hui' : ''}</span>
          <span className={`statut ${st.cls}`}>{st.label}</span>
        </div>
      </div>
    </Link>
  );
}
