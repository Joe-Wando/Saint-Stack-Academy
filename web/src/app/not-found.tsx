import Link from 'next/link';
import EnTetePublic from '@/components/EnTetePublic';
import PiedDePage from '@/components/PiedDePage';
import { ILLUS } from '@/lib/illustrations-pages';

export default function PageIntrouvable() {
  return (
    <>
      <EnTetePublic />
      <main className="page page-404">
        <img src={ILLUS.erreur404} alt="" width={960} height={540} />
        <div>
          <p className="eyebrow">Erreur 404</p>
          <h1>Cette page n’existe pas</h1>
          <p className="muted">Le lien est peut-être ancien, ou l’adresse contient une faute de frappe.</p>
          <div className="banniere-actions">
            <Link href="/" className="btn primary">Retour à l’accueil</Link>
            <Link href="/catalogue" className="btn">Voir le catalogue</Link>
          </div>
        </div>
      </main>
      <PiedDePage />
    </>
  );
}
