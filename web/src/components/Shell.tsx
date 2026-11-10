'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { deconnecter, session, Utilisateur } from '@/lib/api';

function initiales(nom: string) {
  const mots = nom.trim().split(/\s+/).filter(Boolean);
  return ((mots[0]?.[0] ?? '') + (mots.length > 1 ? mots[mots.length - 1][0] : '')).toUpperCase() || '?';
}

/**
 * Cadre commun des pages connectées : en-tête et vérification de la session.
 * Avec `nu`, seule la session est vérifiée (mode présentation, sans en-tête).
 * Avec `plein`, le contenu occupe toute la largeur (la page gère ses marges).
 */
export default function Shell({ children, nu = false, plein = false }: { children: (u: Utilisateur) => ReactNode; nu?: boolean; plein?: boolean }) {
  const [u, setU] = useState<Utilisateur | null>(null);
  const router = useRouter();
  const chemin = usePathname();

  useEffect(() => {
    const s = session();
    if (!s) router.replace('/connexion'); else setU(s.utilisateur);
  }, [router]);

  if (!u) return nu ? <div className="pres" /> : <main className="page"><p className="muted">Chargement…</p></main>;
  if (nu) return <>{children(u)}</>;

  const liens = [
    { href: '/tableau-de-bord', label: 'Accueil' },
    { href: '/catalogue', label: 'Catalogue' },
    { href: '/programme', label: 'Programme' },
    ...(u.role === 'formateur' ? [{ href: '/formateur', label: 'Suivi du groupe' }] : []),
  ];

  return (
    <>
      <header className="topbar">
        <div className="topbar-in">
          <Link href="/tableau-de-bord" className="brand" aria-label="Saint Stack Academy, accueil">
            <span className="logo" aria-hidden="true">SS</span><span className="brand-name">Saint Stack Academy</span>
          </Link>
          <nav className="nav" aria-label="Navigation principale">
            {liens.map((l) => {
              const actif = chemin === l.href || chemin.startsWith(l.href + '/');
              return <Link key={l.href} href={l.href} aria-current={actif ? 'page' : undefined}>{l.label}</Link>;
            })}
          </nav>
          <div className="who">
            <span className="who-txt"><strong>{u.nom}</strong><small>{u.role === 'formateur' ? 'Formateur' : 'Apprenant'}</small></span>
            <span className="avatar" aria-hidden="true">{initiales(u.nom)}</span>
            <button className="btn sm" onClick={deconnecter}>Déconnexion</button>
          </div>
        </div>
      </header>
      <main className={plein ? undefined : 'page'}>{children(u)}</main>
    </>
  );
}
