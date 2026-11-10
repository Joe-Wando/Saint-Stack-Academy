'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import CadreAuth from '@/components/CadreAuth';
import { api } from '@/lib/api';

export default function MotDePasseOublie() {
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(''); setEnvoi(true);
    const email = String(new FormData(e.currentTarget).get('email') ?? '');
    try {
      const r = await api<{ message: string }>('/auth/mot-de-passe-oublie', { method: 'POST', body: JSON.stringify({ email }) });
      setMessage(r.message);
    } catch (x) { setErreur((x as Error).message); } finally { setEnvoi(false); }
  }

  return (
    <CadreAuth titre="Mot de passe oublié">
      {message ? (
        <>
          <p className="succes" role="status">{message}</p>
          <p className="muted small">Le lien est valable 1 heure.</p>
          <Link href="/connexion" className="btn">Retour à la connexion</Link>
        </>
      ) : (
        <form className="form" onSubmit={soumettre}>
          <p className="muted" style={{ margin: 0 }}>Indique ton adresse : tu recevras un lien pour choisir un nouveau mot de passe.</p>
          <label htmlFor="email">E-mail<input id="email" name="email" type="email" required autoComplete="email" /></label>
          {erreur && <p className="error" role="alert">{erreur}</p>}
          <button className="btn primary" disabled={envoi}>{envoi ? 'Un instant…' : 'Recevoir le lien'}</button>
          <Link href="/connexion" className="small">Retour à la connexion</Link>
        </form>
      )}
    </CadreAuth>
  );
}
