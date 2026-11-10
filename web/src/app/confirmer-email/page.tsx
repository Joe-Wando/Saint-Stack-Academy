'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import CadreAuth, { parametre } from '@/components/CadreAuth';
import { api, deconnecter, session } from '@/lib/api';

/** Lien reçu à la nouvelle adresse : /confirmer-email?jeton=… */
export default function ConfirmerEmail() {
  const [etat, setEtat] = useState<'attente' | 'ok' | 'erreur'>('attente');
  const [message, setMessage] = useState('');
  const fait = useRef(false);
  useEffect(() => {
    if (fait.current) return;
    fait.current = true;
    api<{ message: string }>(`/auth/confirmer-email?jeton=${encodeURIComponent(parametre('jeton'))}`)
      .then((r) => { setMessage(r.message); setEtat('ok'); })
      .catch((e) => { setMessage((e as Error).message); setEtat('erreur'); });
  }, []);
  if (etat === 'attente') return <CadreAuth titre="Confirmation…"><p className="muted">Un instant.</p></CadreAuth>;
  return (
    <CadreAuth titre={etat === 'ok' ? 'Adresse confirmée' : 'Lien invalide'}>
      <p className={etat === 'ok' ? 'succes' : 'error'} role={etat === 'ok' ? 'status' : 'alert'}>{message}</p>
      {etat === 'ok' && session()
        ? <button className="btn primary" onClick={deconnecter}>Me reconnecter</button>
        : <Link href="/connexion" className="btn primary">Aller à la connexion</Link>}
    </CadreAuth>
  );
}
