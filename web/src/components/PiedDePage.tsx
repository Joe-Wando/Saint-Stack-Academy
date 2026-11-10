import Link from 'next/link';

export default function PiedDePage() {
  return (
    <footer className="pied">
      <div className="pied-in">
        <div className="brand"><span className="logo" aria-hidden="true">SS</span>Saint Stack Academy</div>
        <nav aria-label="Pied de page">
          <Link href="/licence">Licence</Link>
          <Link href="/parcours">Parcours métiers</Link>
          <Link href="/catalogue">Catalogue</Link>
        </nav>
        <p className="muted small">Apprendre l’informatique à son rythme, une notion à la fois. © 2026 Saint Stack Academy</p>
      </div>
    </footer>
  );
}
