import Link from 'next/link';
import { ReactNode } from 'react';

/** Mise en page des écrans de compte : illustration à gauche, formulaire à droite. */
export default function CadreAuth({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <main className="auth">
      <aside className="auth-art">
        <img src="/illustrations/devops.svg" alt="" width={960} height={540} />
        <p>Apprendre les outils du métier, une notion à la fois, à ton rythme.</p>
      </aside>
      <div className="auth-col">
        <div className="auth-card">
          <Link href="/" className="brand"><span className="logo" aria-hidden="true">SS</span>Saint Stack Academy</Link>
          <h1>{titre}</h1>
          {children}
        </div>
      </div>
    </main>
  );
}

/** Lit un paramètre de l'adresse (sans useSearchParams, qui demanderait un Suspense). */
export function parametre(nom: string) {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get(nom) ?? '';
}

/** Chemin de retour après connexion : seulement un chemin interne. */
export function suiteSure(s: string) {
  return /^\/(?!\/)[\w\-/?=&#.%]*$/.test(s) ? s : '/accueil';
}
