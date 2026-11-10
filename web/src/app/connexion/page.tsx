'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import CadreAuth, { parametre, suiteSure } from '@/components/CadreAuth';
import { api, enregistrerSession, reprendreSuite, Utilisateur } from '@/lib/api';

export default function Connexion() {
  const router = useRouter();
  const [erreur, setErreur] = useState('');
  const [nonVerifie, setNonVerifie] = useState('');
  const [info, setInfo] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(''); setInfo(''); setNonVerifie(''); setEnvoi(true);
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      const s = await api<{ jeton: string; utilisateur: Utilisateur }>('/auth/connexion', { method: 'POST', body: JSON.stringify(f) });
      enregistrerSession(s);
      router.replace(suiteSure(parametre('suite') || reprendreSuite()));
    } catch (err) {
      const x = err as Error & { statut?: number };
      setErreur(x.message);
      if (x.statut === 403 && /Active ton compte/.test(x.message)) setNonVerifie(f.email);
      setEnvoi(false);
    }
  }

  async function renvoyer() {
    const r = await api<{ message: string }>('/auth/renvoyer-verification', { method: 'POST', body: JSON.stringify({ email: nonVerifie }) }).catch((e) => ({ message: (e as Error).message }));
    setErreur(''); setInfo(r.message);
  }

  return (
    <CadreAuth titre="Bon retour parmi nous">
      <form onSubmit={soumettre} className="form" noValidate>
        <label htmlFor="email">E-mail<input id="email" name="email" type="email" required autoComplete="email" /></label>
        <label htmlFor="motDePasse">Mot de passe
          <input id="motDePasse" name="motDePasse" type="password" required autoComplete="current-password" />
        </label>
        {erreur && <p className="error" role="alert">{erreur}</p>}
        {nonVerifie && <button type="button" className="btn" onClick={renvoyer}>Renvoyer le lien d’activation</button>}
        {info && <p className="succes" role="status">{info}</p>}
        <button className="btn primary" disabled={envoi}>{envoi ? 'Un instant…' : 'Se connecter'}</button>
      </form>
      <p className="small"><Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link></p>
      <p className="muted small">Pas encore de compte ? <Link href="/inscription">Crée-le gratuitement</Link></p>
    </CadreAuth>
  );
}
