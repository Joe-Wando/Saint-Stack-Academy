'use client';

import { ChangeEvent, FormEvent, type JSX, useEffect, useRef, useState } from 'react';
import Shell from '@/components/Shell';
import Avatar from '@/components/Avatar';
import Onglets from '@/components/Onglets';
import Evolution, { DonneesEvolution } from '@/components/Evolution';
import { CarteNiveaux, OptionsL3, titreOption } from '@/components/ChoixNiveau';
import { API, api, deconnecter, enregistrerSession, libelleNiveau, Niveau, session, Utilisateur } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';

type Maj = (u: Utilisateur) => void;
const membreDepuis = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '');

function majSession(u: Utilisateur, maj: Maj) {
  const s = session();
  if (s) enregistrerSession({ jeton: s.jeton, utilisateur: u });
  maj(u);
}

// ----- Onglet « Mon évolution » ---------------------------------------------------------------
function OngletEvolution() {
  const { donnees, erreur } = useDonnees(() => api<DonneesEvolution>('/moi/evolution'));
  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!donnees) return <p className="muted">Chargement…</p>;
  return <Evolution e={donnees} />;
}

// ----- Photo de profil ------------------------------------------------------------------------
const TAILLE_MAX = 2 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function Photo({ u, maj }: { u: Utilisateur; maj: Maj }) {
  const [apercu, setApercu] = useState<string | null>(null);
  const [fichier, setFichier] = useState<File | null>(null);
  const [erreur, setErreur] = useState('');
  const [etat, setEtat] = useState('');
  const champ = useRef<HTMLInputElement>(null);
  useEffect(() => () => { if (apercu) URL.revokeObjectURL(apercu); }, [apercu]);

  function choisir(e: ChangeEvent<HTMLInputElement>) {
    setErreur(''); setEtat('');
    const f = e.target.files?.[0];
    if (!f) return;
    if (!TYPES.includes(f.type)) { setErreur('Format non accepté : choisis une image JPEG, PNG ou WebP.'); return; }
    if (f.size > TAILLE_MAX) { setErreur(`Cette image fait ${(f.size / 1024 / 1024).toFixed(1)} Mo : la limite est de 2 Mo.`); return; }
    setFichier(f);
    setApercu(URL.createObjectURL(f));
  }

  async function envoyer() {
    if (!fichier) return;
    setEtat('Envoi…'); setErreur('');
    const donnees = new FormData();
    donnees.append('photo', fichier);
    try {
      // Envoi en multipart : pas d'en-tête content-type JSON ici.
      const res = await fetch(`${API}/moi/photo`, { method: 'POST', body: donnees, headers: { authorization: `Bearer ${session()?.jeton ?? ''}` } });
      const corps = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(corps.message ?? 'Échec de l’envoi.');
      majSession({ ...u, photo: corps.photo }, maj);
      setFichier(null); setApercu(null); setEtat('Ta photo est enregistrée.');
      if (champ.current) champ.current.value = '';
    } catch (x) { setErreur((x as Error).message); setEtat(''); }
  }

  async function retirer() {
    setErreur('');
    try {
      await api('/moi/photo', { method: 'DELETE' });
      majSession({ ...u, photo: null }, maj);
      setEtat('Ta photo a été retirée.');
    } catch (x) { setErreur((x as Error).message); }
  }

  return (
    <section className="photo-profil" aria-labelledby="t-photo">
      <h2 id="t-photo" className="h-petit">Photo de profil</h2>
      <div className="photo-ligne">
        {apercu ? <img className="avatar avatar-photo" src={apercu} alt="Aperçu de la nouvelle photo" width={96} height={96} style={{ width: 96, height: 96 }} /> : <Avatar nom={u.nom} photo={u.photo} taille={96} />}
        <div className="photo-actions">
          <label className="btn" htmlFor="photo">Changer ma photo</label>
          <input id="photo" ref={champ} className="sr" type="file" accept="image/jpeg,image/png,image/webp" onChange={choisir} />
          {fichier && <button className="btn primary" onClick={envoyer}>Enregistrer cette photo</button>}
          {u.photo && !fichier && <button className="btn" onClick={retirer}>Retirer</button>}
          <span className="small muted">JPEG, PNG ou WebP, 2 Mo au plus. Recadrée en carré, sans les métadonnées (position GPS comprise).</span>
        </div>
      </div>
      {erreur && <p className="error" role="alert">{erreur}</p>}
      {etat && <p className="succes" role="status">{etat}</p>}
    </section>
  );
}

// ----- Onglet « Mes informations » ------------------------------------------------------------
function OngletInformations({ u, maj }: { u: Utilisateur; maj: Maj }) {
  const [niveau, setNiveau] = useState<Niveau | ''>(u.niveau ?? '');
  const [option, setOption] = useState(u.optionL3 ?? '');
  const [erreur, setErreur] = useState('');
  const [ok, setOk] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(''); setOk('');
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!niveau) { setErreur('Choisis ton niveau.'); return; }
    if (niveau === 'L3' && !option) { setErreur('En L3, choisis ton option.'); return; }
    setEnvoi(true);
    try {
      const r = await api<{ jeton: string; utilisateur: Utilisateur }>('/auth/moi', {
        method: 'PATCH',
        body: JSON.stringify({ nom: f.nom, niveau, optionL3: niveau === 'L3' ? option : null, etablissement: f.etablissement }),
      });
      if (session()) enregistrerSession(r);
      maj(r.utilisateur);
      setOk('Tes informations sont enregistrées.');
    } catch (x) { setErreur((x as Error).message); } finally { setEnvoi(false); }
  }

  return (
    <div className="card profil">
      <Photo u={u} maj={maj} />
      <hr className="separateur" />
      <form onSubmit={soumettre} className="form" noValidate>
        <label htmlFor="nom">Nom complet<input id="nom" name="nom" defaultValue={u.nom} required minLength={2} autoComplete="name" /></label>
        <CarteNiveaux valeur={niveau} onChange={(n) => { setNiveau(n); if (n !== 'L3') setOption(''); }} />
        {niveau === 'L3' && <OptionsL3 valeur={option} onChange={setOption} />}
        <label htmlFor="etablissement">Établissement <span className="muted small">(facultatif)</span>
          <input id="etablissement" name="etablissement" defaultValue={u.etablissement ?? ''} maxLength={120} autoComplete="organization" />
        </label>
        {erreur && <p className="error" role="alert">{erreur}</p>}
        {ok && <p className="succes" role="status">{ok}</p>}
        <button className="btn primary" disabled={envoi}>{envoi ? 'Un instant…' : 'Enregistrer'}</button>
      </form>
    </div>
  );
}

// ----- Onglet « Sécurité » --------------------------------------------------------------------
function Formulaire({ titre, envoyer, children, bouton }: { titre: string; bouton: string; envoyer: (f: Record<string, string>) => Promise<string>; children: JSX.Element }) {
  const [erreur, setErreur] = useState('');
  const [ok, setOk] = useState('');
  const [envoi, setEnvoi] = useState(false);
  async function soumettre(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setErreur(''); setOk(''); setEnvoi(true);
    try { setOk(await envoyer(Object.fromEntries(new FormData(form)) as Record<string, string>)); form.reset(); }
    catch (x) { setErreur((x as Error).message); } finally { setEnvoi(false); }
  }
  return (
    <section className="card profil" aria-label={titre}>
      <h2 className="h-petit">{titre}</h2>
      <form className="form" onSubmit={soumettre} noValidate>
        {children}
        {erreur && <p className="error" role="alert">{erreur}</p>}
        {ok && <p className="succes" role="status">{ok}</p>}
        <button className="btn primary" disabled={envoi}>{envoi ? 'Un instant…' : bouton}</button>
      </form>
    </section>
  );
}

function OngletSecurite({ u }: { u: Utilisateur }) {
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState('');

  async function telecharger() {
    const d = await api('/moi/donnees');
    const url = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'mes-donnees-saint-stack-academy.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
  async function supprimer() {
    setErreur('');
    try {
      await api('/moi', { method: 'DELETE', body: JSON.stringify({ confirmation }) });
      deconnecter();
    } catch (x) { setErreur((x as Error).message); }
  }

  return (
    <>
      <Formulaire titre="Changer mon mot de passe" bouton="Changer mon mot de passe"
        envoyer={async (f) => {
          if ((f.nouveau ?? '').length < 8) throw new Error('Le nouveau mot de passe doit contenir au moins 8 caractères.');
          if (f.nouveau !== f.confirmation) throw new Error('Les deux nouveaux mots de passe ne sont pas identiques.');
          return (await api<{ message: string }>('/moi/mot-de-passe', { method: 'PATCH', body: JSON.stringify({ ancien: f.ancien, nouveau: f.nouveau }) })).message;
        }}>
        <>
          <label htmlFor="ancien">Mot de passe actuel<input id="ancien" name="ancien" type="password" required autoComplete="current-password" /></label>
          <label htmlFor="nouveau">Nouveau mot de passe<input id="nouveau" name="nouveau" type="password" required minLength={8} autoComplete="new-password" /></label>
          <label htmlFor="confirmation">Confirme le nouveau<input id="confirmation" name="confirmation" type="password" required minLength={8} autoComplete="new-password" /></label>
        </>
      </Formulaire>

      <Formulaire titre="Changer mon adresse e-mail" bouton="Recevoir le lien de confirmation"
        envoyer={async (f) => (await api<{ message: string }>('/moi/email', { method: 'POST', body: JSON.stringify(f) })).message}>
        <>
          <p className="small muted" style={{ margin: 0 }}>Adresse actuelle : <strong>{u.email}</strong>. Un lien de confirmation part vers la nouvelle adresse ; elle ne change qu’après le clic.</p>
          <label htmlFor="nouvelEmail">Nouvelle adresse<input id="nouvelEmail" name="nouvelEmail" type="email" required autoComplete="email" /></label>
          <label htmlFor="mdp-email">Mot de passe actuel<input id="mdp-email" name="motDePasse" type="password" required autoComplete="current-password" /></label>
        </>
      </Formulaire>

      <section className="card profil">
        <h2 className="h-petit">Mes données</h2>
        <p className="muted">Un fichier JSON avec ton profil, ta progression, tes activités et tes notes.</p>
        <button className="btn" onClick={() => telecharger().catch((x) => setErreur((x as Error).message))}>Télécharger mes données</button>
      </section>

      <section className="card profil zone-danger">
        <h2 className="h-petit">Supprimer mon compte</h2>
        {u.role === 'admin' ? (
          <p className="muted">Le compte de l’administrateur ne peut pas être supprimé depuis la plateforme.</p>
        ) : (
          <>
            <p>La suppression est <strong>définitive</strong> : ton compte, ta progression, tes activités, tes notes et ta photo sont effacés.</p>
            <label htmlFor="confirmer" className="lbl">Pour confirmer, tape SUPPRIMER</label>
            <input id="confirmer" className="champ" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="off" />
            <button className="btn danger" disabled={confirmation !== 'SUPPRIMER'} onClick={supprimer}>Supprimer définitivement mon compte</button>
          </>
        )}
        {erreur && <p className="error" role="alert">{erreur}</p>}
      </section>
    </>
  );
}

function Contenu({ u, maj }: { u: Utilisateur; maj: Maj }) {
  const [onglet, setOnglet] = useState('evolution');
  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (['evolution', 'informations', 'securite'].includes(h)) setOnglet(h);
  }, []);
  return (
    <>
      <section className="profil-tete">
        <Avatar nom={u.nom} photo={u.photo} taille={88} />
        <div>
          <h1>{u.nom}</h1>
          <p className="muted" style={{ margin: 0 }}>{libelleNiveau(u, titreOption(u.optionL3))}{u.etablissement ? ` · ${u.etablissement}` : ''}</p>
          {u.inscritLe && <p className="small muted" style={{ margin: 0 }}>Membre depuis {membreDepuis(u.inscritLe)}</p>}
        </div>
      </section>
      <Onglets id="profil" label="Mon profil" actif={onglet} onChange={(o) => { setOnglet(o); history.replaceState(null, '', `#${o}`); }}
        onglets={[{ cle: 'evolution', titre: 'Mon évolution' }, { cle: 'informations', titre: 'Mes informations' }, { cle: 'securite', titre: 'Sécurité' }]}>
        {onglet === 'evolution' && <OngletEvolution />}
        {onglet === 'informations' && <OngletInformations u={u} maj={maj} />}
        {onglet === 'securite' && <OngletSecurite u={u} />}
      </Onglets>
    </>
  );
}

export default function Profil() {
  return <Shell>{(u, maj) => <Contenu u={u} maj={maj} />}</Shell>;
}
