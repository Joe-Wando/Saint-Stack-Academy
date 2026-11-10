'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { api, deconnecter, enregistrerSession, session, Utilisateur } from '@/lib/api';
import Avatar from './Avatar';
import EnTetePublic from './EnTetePublic';
import PiedDePage from './PiedDePage';

export { initiales } from './Avatar';

/** Menu du compte : Mon profil, Déconnexion. Se ferme avec Échap ou un clic à l'extérieur. */
function MenuCompte({ u }: { u: Utilisateur }) {
  const [ouvert, setOuvert] = useState(false);
  const zone = useRef<HTMLDivElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!ouvert) return;
    const clic = (e: MouseEvent) => { if (!zone.current?.contains(e.target as Node)) setOuvert(false); };
    const touche = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOuvert(false); bouton.current?.focus(); } };
    document.addEventListener('mousedown', clic);
    document.addEventListener('keydown', touche);
    return () => { document.removeEventListener('mousedown', clic); document.removeEventListener('keydown', touche); };
  }, [ouvert]);
  return (
    <div className="compte" ref={zone}>
      <button ref={bouton} className="compte-btn" aria-expanded={ouvert} aria-haspopup="true" onClick={() => setOuvert((o) => !o)}>
        <span className="who-txt"><strong>{u.nom}</strong><small>{u.role === 'admin' ? 'Admin' : 'Apprenant'}</small></span>
        <Avatar nom={u.nom} photo={u.photo} />
        <span className="sr">Menu du compte</span>
      </button>
      {ouvert && (
        <div className="compte-menu">
          <Link href="/profil" onClick={() => setOuvert(false)}>Mon profil</Link>
          <Link href="/bienvenue" onClick={() => setOuvert(false)}>Revoir la visite</Link>
          <button onClick={deconnecter}>Déconnexion</button>
        </div>
      )}
    </div>
  );
}

function EnTeteConnecte({ u }: { u: Utilisateur }) {
  const chemin = usePathname();
  const liens = [
    { href: '/accueil', label: 'Accueil' },
    { href: '/licence', label: 'Licence' },
    { href: '/parcours', label: 'Parcours métiers' },
    { href: '/catalogue', label: 'Catalogue' },
    { href: '/certifications', label: 'Certifications' },
    { href: '/contact', label: 'Contact' },
    ...(u.role === 'admin' ? [{ href: '/admin', label: 'Administration' }] : []),
  ];
  return (
    <header className="topbar">
      <div className="topbar-in">
        <Link href="/accueil" className="brand" aria-label="Saint Stack Academy, accueil">
          <span className="logo" aria-hidden="true">SS</span><span className="brand-name">Saint Stack Academy</span>
        </Link>
        <nav className="nav" aria-label="Navigation principale">
          {liens.map((l) => {
            const actif = chemin === l.href || chemin.startsWith(l.href + '/');
            return <Link key={l.href} href={l.href} aria-current={actif ? 'page' : undefined}>{l.label}</Link>;
          })}
        </nav>
        <MenuCompte u={u} />
      </div>
    </header>
  );
}

/** Lit la session et relit le profil une fois (niveau, rôle et photo peuvent avoir changé). */
function useSession(exiger: boolean) {
  const [u, setU] = useState<Utilisateur | null>(null);
  const [pret, setPret] = useState(false);
  const router = useRouter();
  const chemin = usePathname();
  useEffect(() => {
    const s = session();
    if (!s) {
      if (exiger) router.replace(`/connexion?suite=${encodeURIComponent(chemin)}`);
      setPret(true);
      return;
    }
    setU(s.utilisateur); setPret(true);
    api<Utilisateur>('/auth/moi').then((p) => { enregistrerSession({ jeton: s.jeton, utilisateur: p }); setU(p); }).catch(() => {});
  }, [router, chemin, exiger]);
  return { u, pret, setU };
}

/**
 * Cadre des pages connectées : en-tête, vérification de la session et pied de page.
 * Avec `nu`, seule la session est vérifiée (mode présentation, sans en-tête).
 * Avec `plein`, le contenu occupe toute la largeur. Avec `admin`, la page est réservée à l'administrateur.
 */
export default function Shell({ children, nu = false, plein = false, admin = false }: {
  children: (u: Utilisateur, majProfil: (u: Utilisateur) => void) => ReactNode; nu?: boolean; plein?: boolean; admin?: boolean;
}) {
  const { u, setU } = useSession(true);
  if (!u) return nu ? <div className="pres" /> : <main className="page"><p className="muted">Chargement…</p></main>;
  if (admin && u.role !== 'admin') return <main className="page"><p className="error" role="alert">Cette page est réservée à l’administrateur.</p></main>;
  if (nu) return <>{children(u, setU)}</>;
  return (
    <>
      <EnTeteConnecte u={u} />
      <main className={plein ? undefined : 'page'}>{children(u, setU)}</main>
      <PiedDePage />
    </>
  );
}

/** Cadre des pages consultables sans compte (Licence, Parcours, Catalogue, Contact) : `u` vaut null sans session. */
export function ShellOuvert({ children, plein = false }: { children: (u: Utilisateur | null) => ReactNode; plein?: boolean }) {
  const { u, pret } = useSession(false);
  if (!pret) return <main className="page"><p className="muted">Chargement…</p></main>;
  return (
    <>
      {u ? <EnTeteConnecte u={u} /> : <EnTetePublic />}
      <main className={plein ? undefined : 'page'}>{children(u)}</main>
      <PiedDePage />
    </>
  );
}
