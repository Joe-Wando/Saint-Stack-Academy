'use client';

import { FormEvent, useState } from 'react';
import { api, Certifications, ElementCertification } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';
import { TYPES_CERTIF } from './CarteCertification';
import EtatVide from './EtatVide';
import { ILLUS } from '@/lib/illustrations-pages';

export interface BadgeObtenu { id: number; nom: string; organisme: string; type: ElementCertification['type']; obtenueLe: string; lienVerification: string | null }

const date = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/** Liste des badges et certifications déclarés (lecture seule pour l'admin). */
export function ListeBadges({ badges, retirer }: { badges: BadgeObtenu[]; retirer?: (id: number) => void }) {
  if (!badges.length) {
    return (
      <EtatVide image={ILLUS.videBadges} titre="Aucun badge pour l’instant">
        <p className="muted small">Aucun badge ni certification déclaré pour l’instant.</p>
      </EtatVide>
    );
  }
  return (
    <ul className="badges">
      {badges.map((b) => (
        <li key={b.id}>
          <span className={`type-certif ${b.type}`}>{TYPES_CERTIF[b.type]?.label ?? b.type}</span>
          <span className="badge-texte">
            <strong>{b.nom}</strong>
            <span className="small muted">{b.organisme} · obtenu le {date(b.obtenueLe)}</span>
            {b.lienVerification && <a className="small" href={b.lienVerification} target="_blank" rel="noopener noreferrer">Vérifier ce badge<span className="sr"> (nouvel onglet)</span></a>}
          </span>
          {retirer && <button className="btn sm" onClick={() => retirer(b.id)} aria-label={`Retirer « ${b.nom} »`}>Retirer</button>}
        </li>
      ))}
    </ul>
  );
}

/** Bloc du profil : mes badges, avec un formulaire prérempli à partir de certifications.yaml. */
export default function MesBadges({ onChange }: { onChange?: () => void }) {
  const { donnees, erreur, recharger } = useDonnees(() => Promise.all([api<BadgeObtenu[]>('/moi/certifications'), api<Certifications>('/certifications')]));
  const [ouvert, setOuvert] = useState(false);
  const [modele, setModele] = useState('');
  const [champs, setChamps] = useState({ nom: '', organisme: '', type: 'badge' as ElementCertification['type'] });
  const [message, setMessage] = useState('');
  const [echec, setEchec] = useState('');

  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!donnees) return <p className="muted">Chargement…</p>;
  const [badges, c] = donnees;
  const catalogue = [
    ...c.niveaux.L1.elements.map((e) => ({ ...e, groupe: 'L1' })),
    ...c.niveaux.L2.elements.map((e) => ({ ...e, groupe: 'L2' })),
    ...Object.values(c.niveaux.L3.options).flat().map((e) => ({ ...e, groupe: 'L3' })),
  ];

  function choisirModele(v: string) {
    setModele(v);
    const e = catalogue[Number(v)];
    if (e) setChamps({ nom: e.nom, organisme: e.organisme, type: e.type });
  }

  async function ajouter(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setMessage(''); setEchec('');
    try {
      await api('/moi/certifications', { method: 'POST', body: JSON.stringify({ ...champs, obtenueLe: f.obtenueLe, lienVerification: f.lienVerification }) });
      setMessage('Ajouté à ton profil.'); setOuvert(false); setModele(''); setChamps({ nom: '', organisme: '', type: 'badge' });
      recharger(); onChange?.();
    } catch (x) { setEchec((x as Error).message); }
  }
  async function retirer(id: number) {
    await api(`/moi/certifications/${id}`, { method: 'DELETE' }).catch((x) => setEchec((x as Error).message));
    recharger(); onChange?.();
  }

  return (
    <section className="card">
      <div className="section-head" style={{ margin: '0 0 .9rem' }}>
        <h2 className="h-petit" style={{ margin: 0 }}>Mes badges et certifications</h2>
        <button className="btn sm" aria-expanded={ouvert} onClick={() => setOuvert((o) => !o)}>{ouvert ? 'Fermer' : 'Ajouter'}</button>
      </div>
      {ouvert && (
        <form className="form ajout-badge" onSubmit={ajouter} noValidate>
          <label htmlFor="modele">Choisir dans la liste (facultatif)
            <select id="modele" value={modele} onChange={(e) => choisirModele(e.target.value)}>
              <option value="">Saisie libre</option>
              {catalogue.map((e, i) => <option key={i} value={i}>{e.groupe} · {e.nom}</option>)}
            </select>
          </label>
          <label htmlFor="b-nom">Nom<input id="b-nom" required value={champs.nom} onChange={(e) => setChamps({ ...champs, nom: e.target.value })} /></label>
          <label htmlFor="b-org">Organisme<input id="b-org" required value={champs.organisme} onChange={(e) => setChamps({ ...champs, organisme: e.target.value })} /></label>
          <label htmlFor="b-type">Type
            <select id="b-type" value={champs.type} onChange={(e) => setChamps({ ...champs, type: e.target.value as ElementCertification['type'] })}>
              {(Object.keys(TYPES_CERTIF) as ElementCertification['type'][]).map((t) => <option key={t} value={t}>{TYPES_CERTIF[t].label}</option>)}
            </select>
          </label>
          <label htmlFor="b-date">Date d’obtention<input id="b-date" name="obtenueLe" type="date" required max={new Date().toISOString().slice(0, 10)} /></label>
          <label htmlFor="b-lien">Lien de vérification <span className="muted small">(facultatif, par exemple Credly)</span><input id="b-lien" name="lienVerification" type="url" placeholder="https://" /></label>
          {echec && <p className="error" role="alert">{echec}</p>}
          <button className="btn primary">Ajouter à mon profil</button>
        </form>
      )}
      {message && <p className="succes" role="status" style={{ marginBottom: '.8rem' }}>{message}</p>}
      <ListeBadges badges={badges} retirer={retirer} />
    </section>
  );
}
