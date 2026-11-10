import Link from 'next/link';
import { ReactNode } from 'react';
import { CONTACT } from '@/lib/contact';
import PhotoFondateur from './PhotoFondateur';

/** Écrans de compte : à gauche le portrait du fondateur et sa citation, à droite le formulaire. */
export default function CadreAuth({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <main className="auth">
      <aside className="auth-art">
        <PhotoFondateur className="auth-photo" taille={280} sizes="(max-width: 860px) 96px, 280px" priority />
        <figure className="auth-citation">
          <blockquote>« Une notion à la fois. Chaque chapitre compris est une victoire. »</blockquote>
          <figcaption>{CONTACT.fondateur}, fondateur</figcaption>
        </figure>
        <ul className="auth-puces">
          <li>Cours gratuits</li>
          <li>Exercices corrigés</li>
          <li>Suivi de progression</li>
        </ul>
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
