'use client';

import Monogramme from './Monogramme';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { CONTACT } from '@/lib/contact';

/** Pionniers de l'informatique : portraits du domaine public (Wikimedia Commons), recadrés dans web/public/pionniers/. */
// Ada Lovelace en haut, au centre ; Charles Babbage et Alan Turing en dessous (sur téléphone, les trois sur une ligne).
const PIONNIERS = [
  { nom: 'Ada Lovelace', role: 'Le premier programme, 1843', photo: '/pionniers/ada-lovelace.webp' },
  { nom: 'Charles Babbage', role: 'La machine analytique, 1837', photo: '/pionniers/charles-babbage.webp' },
  { nom: 'Alan Turing', role: 'La machine de Turing, 1936', photo: '/pionniers/alan-turing.webp' },
];

/** Écrans de compte : à gauche trois pionniers de l'informatique et la citation du fondateur, à droite le formulaire. */
export default function CadreAuth({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <main className="auth">
      <aside className="auth-art">
        <ul className="auth-pionniers" aria-label="Pionniers de l’informatique">
          {PIONNIERS.map((p) => (
            <li key={p.nom}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photo} alt="" width={140} height={140} />
              <span className="nom">{p.nom}</span>
              <span className="role">{p.role}</span>
            </li>
          ))}
        </ul>
        <figure className="auth-citation">
          <blockquote lang="en">« Think outside the box and build your future. »</blockquote>
          <figcaption>{CONTACT.fondateur}, {CONTACT.titre.toLowerCase()}, fondateur</figcaption>
        </figure>
      </aside>
      <div className="auth-col">
        <div className="auth-card">
          <Link href="/" className="brand" aria-label="MeredianStack, page d’accueil"><Monogramme /><span className="brand-name">Meredian<span className="brand-academy">Stack</span></span></Link>
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

/**
 * Lien vers `chemin` qui garde la page à rejoindre après la connexion ou l'inscription (paramètre « suite ») :
 * on peut passer de la connexion à l'inscription et inversement sans perdre le cours choisi.
 */
export function useLienAvecSuite(chemin: '/connexion' | '/inscription') {
  const [lien, setLien] = useState<string>(chemin);
  useEffect(() => {
    const suite = parametre('suite');
    if (suite && suiteSure(suite) === suite) setLien(`${chemin}?suite=${encodeURIComponent(suite)}`);
  }, [chemin]);
  return lien;
}
