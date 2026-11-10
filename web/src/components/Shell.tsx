'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { deconnecter, session, Utilisateur } from '@/lib/api';

/** Cadre commun des pages connectées : barre de navigation et vérification de la session. */
export default function Shell({ children }: { children: (u: Utilisateur) => ReactNode }) {
  const [u, setU] = useState<Utilisateur | null>(null);
  const router = useRouter();
  const chemin = usePathname();

  useEffect(() => {
    const s = session();
    if (!s) router.replace('/connexion'); else setU(s.utilisateur);
  }, [router]);

  if (!u) return <main className="page"><p className="muted">Chargement…</p></main>;

  const liens = [
    { href: '/tableau-de-bord', label: u.role === 'formateur' ? 'Mon espace' : 'Tableau de bord' },
    { href: '/programme', label: 'Programme' },
    ...(u.role === 'formateur' ? [{ href: '/formateur', label: 'Suivi du groupe' }] : []),
  ];

  return (
    <>
      <header className="topbar">
        <Link href="/tableau-de-bord" className="brand"><span className="logo">SS</span>Saint Stack Academy</Link>
        <nav>
          {liens.map((l) => (
            <Link key={l.href} href={l.href} className={chemin.startsWith(l.href) ? 'active' : ''}>{l.label}</Link>
          ))}
        </nav>
        <div className="who">
          <span>{u.nom}<small>{u.role === 'formateur' ? 'Formateur' : 'Apprenant'}</small></span>
          <button className="btn ghost" onClick={deconnecter}>Déconnexion</button>
        </div>
      </header>
      <main className="page">{children(u)}</main>
    </>
  );
}
