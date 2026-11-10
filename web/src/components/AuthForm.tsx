'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { api, enregistrerSession, Utilisateur } from '@/lib/api';

export default function AuthForm({ mode }: { mode: 'connexion' | 'inscription' }) {
  const router = useRouter();
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(''); setEnvoi(true);
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      const s = await api<{ jeton: string; utilisateur: Utilisateur }>(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(f) });
      enregistrerSession(s);
      router.replace('/tableau-de-bord');
    } catch (err) {
      setErreur((err as Error).message);
      setEnvoi(false);
    }
  }

  return (
    <main className="auth">
      <div className="auth-card">
        <div className="brand big"><span className="logo">SS</span>Saint Stack Academy</div>
        <h1>{mode === 'connexion' ? 'Connexion' : 'Créer mon compte'}</h1>
        <form onSubmit={soumettre} className="form">
          {mode === 'inscription' && (
            <label htmlFor="nom">Nom complet<input id="nom" name="nom" required autoComplete="name" /></label>
          )}
          <label htmlFor="email">E-mail<input id="email" name="email" type="email" required autoComplete="email" /></label>
          <label htmlFor="motDePasse">Mot de passe
            <input id="motDePasse" name="motDePasse" type="password" required minLength={8} autoComplete={mode === 'connexion' ? 'current-password' : 'new-password'} />
          </label>
          {mode === 'inscription' && (
            <label htmlFor="codeInvitation">Code d'invitation<input id="codeInvitation" name="codeInvitation" placeholder="Donné par ton formateur" /></label>
          )}
          {erreur && <p className="error" role="alert">{erreur}</p>}
          <button className="btn primary" disabled={envoi}>{envoi ? 'Un instant…' : mode === 'connexion' ? 'Se connecter' : 'Créer mon compte'}</button>
        </form>
        <p className="muted small">
          {mode === 'connexion'
            ? <>Pas encore de compte ? <Link href="/inscription">Crée-le avec ton code d'invitation</Link></>
            : <>Déjà inscrit ? <Link href="/connexion">Connecte-toi</Link></>}
        </p>
      </div>
    </main>
  );
}
