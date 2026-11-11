import Link from 'next/link';

/** Pied de page de la charte : fond bleu nuit, trois colonnes (présentation, « Apprendre », « La plateforme »). */
export default function PiedDePage() {
  return (
    <footer className="pied">
      <div className="pied-in">
        <div className="pied-presentation">
          <span className="pied-nom">Saint Stack <span className="brand-academy">Academy</span></span>
          <p>Des cours d’informatique gratuits, de la L1 aux métiers, pour apprendre à ton rythme.</p>
        </div>
        <nav className="pied-colonne" aria-label="Apprendre">
          <span className="pied-titre">Apprendre</span>
          <Link href="/licence">Licence</Link>
          <Link href="/parcours">Parcours</Link>
          <Link href="/catalogue">Catalogue</Link>
          <Link href="/certifications">Certifications</Link>
        </nav>
        <nav className="pied-colonne" aria-label="La plateforme">
          <span className="pied-titre">La plateforme</span>
          <Link href="/contact">Contact</Link>
          <Link href="/confidentialite">Confidentialité</Link>
          <Link href="/marques">Marques</Link>
        </nav>
      </div>
      <p className="pied-copyright">© 2026 Saint Stack Academy</p>
    </footer>
  );
}
