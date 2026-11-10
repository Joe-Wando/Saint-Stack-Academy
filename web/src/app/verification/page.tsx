'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import CadreAuth, { parametre } from '@/components/CadreAuth';
import { api } from '@/lib/api';

/** Page ouverte depuis le lien de l'e-mail : /verification?jeton=… */
export default function Verification() {
  const [etat, setEtat] = useState<'attente' | 'ok' | 'erreur'>('attente');
  const [message, setMessage] = useState('');
  const [info, setInfo] = useState('');
  const fait = useRef(false);

  useEffect(() => {
    if (fait.current) return;           // le jeton est à usage unique : un seul appel
    fait.current = true;
    const jeton = parametre('jeton');
    api<{ message: string }>(`/auth/verifier?jeton=${encodeURIComponent(jeton)}`)
      .then((r) => { setMessage(r.message); setEtat('ok'); })
      .catch((e) => { setMessage((e as Error).message); setEtat('erreur'); });
  }, []);

  async function renvoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email') ?? '');
    const r = await api<{ message: string }>('/auth/renvoyer-verification', { method: 'POST', body: JSON.stringify({ email }) })
      .catch((x) => ({ message: (x as Error).message }));
    setInfo(r.message);
  }

  if (etat === 'attente') return <CadreAuth titre="Vérification…"><p className="muted">Un instant, nous vérifions ton lien.</p></CadreAuth>;
  if (etat === 'ok') {
    return (
      <CadreAuth titre="Ton compte est activé">
        <p className="succes" role="status">{message}</p>
        <Link href="/connexion" className="btn primary">Se connecter</Link>
      </CadreAuth>
    );
  }
  return (
    <CadreAuth titre="Lien invalide">
      <p className="error" role="alert">{message}</p>
      <form className="form" onSubmit={renvoyer}>
        <label htmlFor="email">Ton e-mail, pour recevoir un nouveau lien<input id="email" name="email" type="email" required autoComplete="email" /></label>
        <button className="btn primary">Renvoyer le lien</button>
        {info && <p className="succes" role="status">{info}</p>}
      </form>
    </CadreAuth>
  );
}
