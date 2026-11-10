'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import CadreAuth from '@/components/CadreAuth';
import { api, Niveau } from '@/lib/api';
import { CarteNiveaux, OptionsL3 } from '@/components/ChoixNiveau';

export default function Inscription() {
  const [niveau, setNiveau] = useState<Niveau | ''>('');
  const [option, setOption] = useState('');
  const [mdp, setMdp] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoye, setEnvoye] = useState('');
  const [message, setMessage] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur('');
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!niveau) { setErreur('Choisis ton niveau.'); return; }
    if (niveau === 'L3' && !option) { setErreur('En L3, choisis ton option.'); return; }
    setEnvoi(true);
    try {
      const r = await api<{ message: string }>('/auth/inscription', {
        method: 'POST',
        body: JSON.stringify({ nom: f.nom, email: f.email, motDePasse: f.motDePasse, niveau, optionL3: niveau === 'L3' ? option : undefined, etablissement: f.etablissement }),
      });
      setMessage(r.message); setEnvoye(f.email);
    } catch (err) {
      setErreur((err as Error).message);
    } finally {
      setEnvoi(false);
    }
  }

  async function renvoyer() {
    const r = await api<{ message: string }>('/auth/renvoyer-verification', { method: 'POST', body: JSON.stringify({ email: envoye }) })
      .catch((e) => ({ message: (e as Error).message }));
    setMessage(`${r.message} Un nouveau lien vient d’être envoyé.`);
  }

  if (envoye) {
    return (
      <CadreAuth titre="Vérifie ta boîte mail">
        <p role="status">{message}</p>
        <p className="muted">Nous avons envoyé un lien d’activation à <strong>{envoye}</strong>. Il est valable 24 heures. Pense à regarder dans les courriers indésirables.</p>
        <div className="form">
          <button className="btn" onClick={renvoyer}>Renvoyer le lien</button>
          <Link href="/connexion" className="btn primary">Aller à la connexion</Link>
        </div>
      </CadreAuth>
    );
  }

  const longueur = mdp.length;
  return (
    <CadreAuth titre="Créer ton compte">
      <form onSubmit={soumettre} className="form" noValidate>
        <label htmlFor="nom">Nom complet<input id="nom" name="nom" required minLength={2} autoComplete="name" /></label>
        <label htmlFor="email">E-mail<input id="email" name="email" type="email" required autoComplete="email" /></label>
        <label htmlFor="motDePasse">Mot de passe
          <input id="motDePasse" name="motDePasse" type="password" required minLength={8} autoComplete="new-password"
            value={mdp} onChange={(e) => setMdp(e.target.value)} aria-describedby="aide-mdp" />
        </label>
        <div id="aide-mdp" className="force">
          <div className="bar sm" aria-hidden="true"><span style={{ width: `${Math.min(100, (longueur / 12) * 100)}%`, background: longueur >= 8 ? 'var(--succes)' : '#B4570B' }} /></div>
          <span className="small muted">{longueur >= 8 ? `${longueur} caractères : c’est bon.` : `Au moins 8 caractères (encore ${8 - longueur}).`}</span>
        </div>

        <CarteNiveaux valeur={niveau} onChange={(n) => { setNiveau(n); if (n !== 'L3') setOption(''); }} />
        {niveau === 'L3' && <OptionsL3 valeur={option} onChange={setOption} />}

        <label htmlFor="etablissement">Établissement <span className="muted small">(facultatif)</span>
          <input id="etablissement" name="etablissement" autoComplete="organization" maxLength={120} />
        </label>
        {erreur && <p className="error" role="alert">{erreur}</p>}
        <button className="btn primary" disabled={envoi}>{envoi ? 'Un instant…' : 'Créer mon compte'}</button>
      </form>
      <p className="muted small">Déjà inscrit ? <Link href="/connexion">Connecte-toi</Link></p>
    </CadreAuth>
  );
}
