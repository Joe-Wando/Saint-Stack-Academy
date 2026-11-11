import Link from 'next/link';
import { Award, BadgeCheck, FileBadge, type LucideIcon } from 'lucide-react';
import { ElementCertification, OrganismeCertif } from '@/lib/api';
import { couleurUtilisateur } from '@/lib/domaines';
import { Macaron } from './Decor';
import LogoOrganisme, { mentionOrganismes } from './LogoOrganisme';

export const TYPES_CERTIF: Record<ElementCertification['type'], { label: string; texte: string }> = {
  badge: { label: 'Badge', texte: 'Gratuit, il prouve qu’on a suivi un cours.' },
  certificat: { label: 'Certificat', texte: 'Délivré par une plateforme, gratuitement ou avec une aide financière.' },
  certification: { label: 'Certification', texte: 'Un examen officiel surveillé, payant, et le plus reconnu par les recruteurs.' },
};

/** Icône Lucide du macaron selon le type : badge, certificat, certification. */
export const ICONES_CERTIF: Record<ElementCertification['type'], LucideIcon> = { badge: Award, certificat: FileBadge, certification: BadgeCheck };

/** Organismes d'une certification : logos (ou noms seuls) liés au site officiel, puis la mention « Délivrée par… ». */
export function OrganismesCertif({ organisme, organismes, type }: { organisme: string; organismes?: OrganismeCertif[]; type: ElementCertification['type'] }) {
  const liste = organismes ?? [];
  return (
    <div className="certif-organismes">
      {liste.length ? <span className="certif-logos">{liste.map((o) => <LogoOrganisme key={o.cle} o={o} />)}</span> : null}
      {organisme.trim().toLowerCase() !== liste.map((o) => o.nom).join(' et ').toLowerCase() && <span className="muted small">{organisme}</span>}
      <span className="small muted certif-mention">{mentionOrganismes(liste.length ? liste.map((o) => o.nom) : [organisme], type === 'certification')}</span>
    </div>
  );
}

/** « gratuit » → Gratuit, « aide-financiere » → Aide financière possible, « payant (…) » → Payant (…). */
export function libelleCout(cout: string) {
  const c = String(cout ?? '').trim();
  if (c === 'gratuit') return { label: 'Gratuit', cls: 'gratuit' };
  if (c === 'aide-financiere') return { label: 'Aide financière possible', cls: 'aide' };
  if (/^payant/i.test(c)) return { label: c.charAt(0).toUpperCase() + c.slice(1), cls: 'payant' };
  if (/gratuit/i.test(c)) return { label: c.charAt(0).toUpperCase() + c.slice(1), cls: 'gratuit' };
  return { label: c.charAt(0).toUpperCase() + c.slice(1), cls: 'aide' };
}

/** Carte d'une certification. `couleur` : couleur du niveau (ou de l'option de L3) pour le macaron. */
export default function CarteCertification({ e, lienUe, couleur }: { e: ElementCertification; lienUe?: string | null; couleur?: string }) {
  const cout = libelleCout(e.cout);
  return (
    <article className="certif">
      <div className="certif-tete">
        <Macaron icone={ICONES_CERTIF[e.type] ?? Award} couleur={couleur ?? couleurUtilisateur(null)} taille={44} />
        <div className="certif-etiquettes">
          <span className={`type-certif ${e.type}`}>{TYPES_CERTIF[e.type]?.label ?? e.type}</span>
          <span className={`cout ${cout.cls}`}>{cout.label}</span>
          {e.facultatif && <span className="statut">Facultatif</span>}
        </div>
      </div>
      <h3>{e.nom}</h3>
      <OrganismesCertif organisme={e.organisme} organismes={e.organismes} type={e.type} />
      {e.ue && <p className="small" style={{ margin: 0 }}>UE qui y prépare : {lienUe ? <Link href={lienUe}>{e.ue}</Link> : e.ue}</p>}
      {e.prepare && <p className="small" style={{ margin: 0 }}>Prépare à : <strong>{e.prepare}</strong></p>}
      {e.lien && <a className="btn sm certif-lien" href={e.lien} target="_blank" rel="noopener noreferrer">Voir sur le site officiel<span className="sr"> (nouvel onglet)</span></a>}
    </article>
  );
}
