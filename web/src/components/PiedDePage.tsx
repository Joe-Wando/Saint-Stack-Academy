import Monogramme from './Monogramme';
import Link from 'next/link';
import { Vague } from './Decor';

export default function PiedDePage() {
  return (
    <>
      <div className="pied-vague" aria-hidden="true"><Vague /></div>
      <footer className="pied">
        <div className="pied-in">
          <div className="brand"><Monogramme />Saint Stack Academy</div>
          <nav aria-label="Pied de page">
            <Link href="/licence">Licence</Link>
            <Link href="/parcours">Parcours</Link>
            <Link href="/catalogue">Catalogue</Link>
            <Link href="/certifications">Certifications</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/confidentialite">Confidentialité</Link>
          </nav>
          <p className="small">© 2026 Saint Stack Academy · Apprendre l’informatique à son rythme, une notion à la fois.</p>
        </div>
      </footer>
    </>
  );
}
