import Link from 'next/link';

/** En-tête des pages sans connexion : logo, Se connecter, Créer un compte. */
export default function EnTetePublic() {
  return (
    <header className="topbar">
      <div className="topbar-in">
        <Link href="/" className="brand" aria-label="Saint Stack Academy, page d’accueil">
          <span className="logo" aria-hidden="true">SS</span><span className="brand-name">Saint Stack Academy</span>
        </Link>
        <div className="actions-public">
          <Link href="/connexion" className="btn">Se connecter</Link>
          <Link href="/inscription" className="btn primary">Créer un compte</Link>
        </div>
      </div>
    </header>
  );
}
