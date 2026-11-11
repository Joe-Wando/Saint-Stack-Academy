'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';
import Monogramme from './Monogramme';

export interface LienMenu { href: string; label: string }

/**
 * En-tête de la charte (CHARTE.md § 4) : fond blanc, trait corail de 3 px en bas,
 * « MeredianStack » en bleu nuit et « Academy » en corail, lien actif souligné de corail.
 * Sous 1024 px, le menu se replie derrière un bouton à trois traits de 44 × 44 px.
 */
export default function EnTete({ accueil, liens, droite }: { accueil: string; liens: LienMenu[]; droite: ReactNode }) {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  useEffect(() => { setOuvert(false); }, [chemin]);
  useEffect(() => {
    if (!ouvert) return;
    const touche = (e: KeyboardEvent) => { if (e.key === 'Escape') setOuvert(false); };
    document.addEventListener('keydown', touche);
    return () => document.removeEventListener('keydown', touche);
  }, [ouvert]);
  const actif = (href: string) => (href === '/' ? chemin === '/' : chemin === href || chemin.startsWith(href + '/'));

  return (
    <header className={`topbar${ouvert ? ' menu-ouvert' : ''}`}>
      <div className="topbar-in">
        <Link href={accueil} className="brand" aria-label="MeredianStack, page d’accueil">
          <Monogramme /><span className="brand-name">Meredian<span className="brand-academy">Stack</span></span>
        </Link>
        <button type="button" className="menu-btn" aria-expanded={ouvert} aria-controls="menu-principal" onClick={() => setOuvert((o) => !o)}>
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          <span className="sr">{ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
        </button>
        <div className="topbar-menu" id="menu-principal">
          <nav className="nav" aria-label="Navigation principale">
            {liens.map((l) => <Link key={l.href} href={l.href} aria-current={actif(l.href) ? 'page' : undefined}>{l.label}</Link>)}
          </nav>
          <div className="topbar-droite">{droite}</div>
        </div>
      </div>
    </header>
  );
}
