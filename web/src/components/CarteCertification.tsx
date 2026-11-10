import Link from 'next/link';
import { ElementCertification } from '@/lib/api';

export const TYPES_CERTIF: Record<ElementCertification['type'], { label: string; texte: string }> = {
  badge: { label: 'Badge', texte: 'Gratuit, il prouve qu’on a suivi un cours.' },
  certificat: { label: 'Certificat', texte: 'Délivré par une plateforme, gratuitement ou avec une aide financière.' },
  certification: { label: 'Certification', texte: 'Un examen officiel surveillé, payant, et le plus reconnu par les recruteurs.' },
};

/** « gratuit » → Gratuit, « aide-financiere » → Aide financière possible, « payant (…) » → Payant (…). */
export function libelleCout(cout: string) {
  const c = String(cout ?? '').trim();
  if (c === 'gratuit') return { label: 'Gratuit', cls: 'gratuit' };
  if (c === 'aide-financiere') return { label: 'Aide financière possible', cls: 'aide' };
  if (/^payant/i.test(c)) return { label: c.charAt(0).toUpperCase() + c.slice(1), cls: 'payant' };
  if (/gratuit/i.test(c)) return { label: c.charAt(0).toUpperCase() + c.slice(1), cls: 'gratuit' };
  return { label: c.charAt(0).toUpperCase() + c.slice(1), cls: 'aide' };
}

export default function CarteCertification({ e, lienUe }: { e: ElementCertification; lienUe?: string | null }) {
  const cout = libelleCout(e.cout);
  return (
    <article className="certif">
      <div className="certif-etiquettes">
        <span className={`type-certif ${e.type}`}>{TYPES_CERTIF[e.type]?.label ?? e.type}</span>
        <span className={`cout ${cout.cls}`}>{cout.label}</span>
        {e.facultatif && <span className="statut">Facultatif</span>}
      </div>
      <h3>{e.nom}</h3>
      <p className="muted small" style={{ margin: 0 }}>{e.organisme}</p>
      {e.ue && <p className="small" style={{ margin: 0 }}>UE qui y prépare : {lienUe ? <Link href={lienUe}>{e.ue}</Link> : e.ue}</p>}
      {e.prepare && <p className="small" style={{ margin: 0 }}>Prépare à : <strong>{e.prepare}</strong></p>}
      {e.lien && <a className="btn sm certif-lien" href={e.lien} target="_blank" rel="noopener noreferrer">Voir sur le site officiel<span className="sr"> (nouvel onglet)</span></a>}
    </article>
  );
}
