'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import EnTete from './EnTete';

/** En-tête des pages sans connexion : Accueil, Licence, Parcours, Catalogue, Certifications ; à droite Contact et « Se connecter ». */
export default function EnTetePublic() {
  const chemin = usePathname();
  const liens = [
    { href: '/', label: 'Accueil' },
    { href: '/licence', label: 'Licence' },
    { href: '/parcours', label: 'Parcours' },
    { href: '/catalogue', label: 'Catalogue' },
    { href: '/certifications', label: 'Certifications' },
  ];
  return (
    <EnTete accueil="/" liens={liens} droite={(
      <>
        <Link href="/contact" className="lien-nav" aria-current={chemin === '/contact' ? 'page' : undefined}>Contact</Link>
        <Link href="/connexion" className="btn bleu">Se connecter</Link>
      </>
    )} />
  );
}
