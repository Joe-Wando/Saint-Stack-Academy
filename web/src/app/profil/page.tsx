'use client';

import { FormEvent, useState } from 'react';
import Shell from '@/components/Shell';
import { CarteNiveaux, OptionsL3 } from '@/components/ChoixNiveau';
import { api, enregistrerSession, Niveau, session, Utilisateur } from '@/lib/api';

function Contenu({ u }: { u: Utilisateur }) {
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
      setOk('Ton profil est enregistré.');
    } catch (x) {
      setErreur((x as Error).message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Mon profil</p>
        <h1>{u.nom}</h1>
        <p className="muted">{u.email}</p>
      </section>
      <section className="card profil">
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
      </section>
    </>
  );
}

export default function Profil() {
  return <Shell>{(u) => <Contenu u={u} />}</Shell>;
}
