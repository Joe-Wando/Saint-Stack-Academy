'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** En-tête des pages sans connexion : logo, Licence, Parcours métiers, Contact, Se connecter, Créer un compte. */
export default function EnTetePublic() {
  const chemin = usePathname();
  const liens = [
    { href: '/licence', label: 'Licence' },
    { href: '/parcours', label: 'Parcours métiers' },
    { href: '/certifications', label: 'Certifications' },
    { href: '/contact', label: 'Contact' },
  ];
  return (
    <header className="topbar">
      <div className="topbar-in">
        <Link href="/" className="brand" aria-label="Saint Stack Academy, page d’accueil">
          <span className="logo" aria-hidden="true">SS</span><span className="brand-name">Saint Stack Academy</span>
        </Link>
        <nav className="nav nav-public" aria-label="Navigation principale">
          {liens.map((l) => (
            <Link key={l.href} href={l.href} aria-current={chemin === l.href || chemin.startsWith(l.href + '/') ? 'page' : undefined}>{l.label}</Link>
          ))}
        </nav>
        <div className="actions-public">
          <Link href="/connexion" className="btn">Se connecter</Link>
          <Link href="/inscription" className="btn primary">Créer un compte</Link>
        </div>
      </div>
    </header>
  );
}
