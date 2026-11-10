'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import CadreAuth, { parametre } from '@/components/CadreAuth';
import { api } from '@/lib/api';

/** Page ouverte depuis le lien de l'e-mail : /reinitialiser?jeton=… */
export default function Reinitialiser() {
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const motDePasse = String(f.get('motDePasse') ?? ''), confirmation = String(f.get('confirmation') ?? '');
    setErreur('');
    if (motDePasse.length < 8) { setErreur('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (motDePasse !== confirmation) { setErreur('Les deux mots de passe ne sont pas identiques.'); return; }
    setEnvoi(true);
    try {
      const r = await api<{ message: string }>('/auth/reinitialiser', { method: 'POST', body: JSON.stringify({ jeton: parametre('jeton'), motDePasse }) });
      setMessage(r.message);
    } catch (x) { setErreur((x as Error).message); } finally { setEnvoi(false); }
  }

  return (
    <CadreAuth titre="Nouveau mot de passe">
      {message ? (
        <>
          <p className="succes" role="status">{message}</p>
          <Link href="/connexion" className="btn primary">Se connecter</Link>
        </>
      ) : (
        <form className="form" onSubmit={soumettre} noValidate>
          <label htmlFor="motDePasse">Nouveau mot de passe<input id="motDePasse" name="motDePasse" type="password" required minLength={8} autoComplete="new-password" /></label>
          <label htmlFor="confirmation">Confirme-le<input id="confirmation" name="confirmation" type="password" required minLength={8} autoComplete="new-password" /></label>
          {erreur && <p className="error" role="alert">{erreur}{/expiré|invalide/.test(erreur) && <> <Link href="/mot-de-passe-oublie">Refaire une demande</Link></>}</p>}
          <button className="btn primary" disabled={envoi}>{envoi ? 'Un instant…' : 'Enregistrer'}</button>
        </form>
      )}
    </CadreAuth>
  );
}
