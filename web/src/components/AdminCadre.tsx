'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Shell from './Shell';
import { Utilisateur } from '@/lib/api';

const MENU = [
  { href: '/admin', label: 'Tableau de bord' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs' },
  { href: '/admin/cours', label: 'Cours' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/mes-cours', label: 'Mes cours' },
];

/** Section d'administration : menu latéral et contenu. Le rôle est aussi vérifié par l'API à chaque requête. */
export default function AdminCadre({ children }: { children: (u: Utilisateur) => ReactNode }) {
  const chemin = usePathname();
  return (
    <Shell admin>
      {(u) => (
        <div className="admin">
          <nav className="admin-menu" aria-label="Administration">
            <p className="eyebrow">Administration</p>
            <ul>
              {MENU.map((m) => {
                const actif = m.href === '/admin' ? chemin === '/admin' : chemin === m.href || chemin.startsWith(m.href + '/');
                return <li key={m.href}><Link href={m.href} aria-current={actif ? 'page' : undefined}>{m.label}</Link></li>;
              })}
            </ul>
          </nav>
          <div className="admin-contenu">{children(u)}</div>
        </div>
      )}
    </Shell>
  );
}
