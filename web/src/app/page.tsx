'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import EnTetePublic from '@/components/EnTetePublic';
import PiedDePage from '@/components/PiedDePage';
import CarteCours from '@/components/CarteCours';
import PhotoFondateur from '@/components/PhotoFondateur';
import { Macaron, Souligne, Vague } from '@/components/Decor';
import { api, Referentiel, ResumeCours, session } from '@/lib/api';
import { infoDomaine } from '@/lib/domaines';
import { CONTACT } from '@/lib/contact';

const OFFRES = [
  { titre: 'Licence L1 à L3', texte: 'Les cours rangés par semestre et par unité d’enseignement, dans l’ordre conseillé, avec les trois options de L3.', illus: 'systemes', href: '/licence' },
  { titre: 'Parcours métiers', texte: 'Développeur web, DevOps, Data engineer et Administrateur systèmes : une suite de cours pour viser un métier.', illus: 'devops', href: '/parcours' },
  { titre: 'Cours en chapitres', texte: 'Une notion par chapitre, des exercices corrigés, un quiz à la fin et un mode présentation.', illus: 'tests', href: '/catalogue' },
  { titre: 'Mettre ton site en ligne', texte: 'GitHub Pages, Netlify, Vercel et ton propre nom de domaine : publie tes projets dès la L1.', illus: 'web', href: '/parcours/deploiement' },
];
const ETAPES = [
  'Je crée mon compte et je choisis mon niveau.',
  'Je suis mes cours, chapitre par chapitre.',
  'Je m’exerce, puis je passe le quiz.',
  'Je suis mon évolution dans mon profil.',
];

/** Les cours du référentiel (sans doublon) : UE de licence et parcours. */
function coursDuReferentiel(r: Referentiel): ResumeCours[] {
  const tous = [
    ...r.niveaux.flatMap((n) => [...n.semestres, ...n.troncCommun, ...n.options.flatMap((o) => o.semestres)].flatMap((s) => s.ues.flatMap((u) => u.cours))),
    ...r.parcours.flatMap((p) => p.cours),
  ];
  return [...new Map(tous.map((c) => [c.slug, c])).values()];
}

/** Page d'accueil publique. Un utilisateur connecté est redirigé vers /accueil. */
export default function AccueilPublic() {
  const router = useRouter();
  const [pret, setPret] = useState(false);
  const [ref, setRef] = useState<Referentiel | null>(null);
  useEffect(() => {
    if (session()) { router.replace('/accueil'); return; }
    setPret(true);
    api<Referentiel>('/referentiel').then(setRef).catch(() => {});
  }, [router]);
  if (!pret) return null;

  const cours = ref ? coursDuReferentiel(ref) : [];
  const domaines = new Set(cours.map((c) => infoDomaine(c.domaine).cle));
  // Aperçu : un cours par domaine, six au plus.
  const apercu = [...new Map(cours.map((c) => [infoDomaine(c.domaine).cle, c])).values()].slice(0, 6);

  return (
    <>
      <EnTetePublic />
      <main>
        <section className="hero-accueil">
          <div className="hero-accueil-in">
            <div className="hero-texte">
              <p className="eyebrow">Plateforme d’apprentissage en informatique</p>
              <h1>Apprends l’informatique <Souligne>à ton rythme</Souligne>, de la L1 aux métiers.</h1>
              <p className="hero-sous">Des cours clairs, une notion à la fois, avec exercices corrigés, quiz et suivi de ta progression.</p>
              <div className="bandeau-actions">
                <Link href="/inscription" className="btn soleil">Commencer gratuitement</Link>
                <Link href="/catalogue" className="btn contour-clair">Voir les cours</Link>
              </div>
              {ref && (
                <dl className="hero-chiffres">
                  <div><dt>cours</dt><dd>{cours.length}</dd></div>
                  <div><dt>domaines</dt><dd>{domaines.size}</dd></div>
                  <div><dt>parcours métiers</dt><dd>{ref.parcours.length}</dd></div>
                </dl>
              )}
            </div>
            <div className="hero-portrait">
              <div className="portrait-forme" aria-hidden="true" />
              <PhotoFondateur className="portrait" taille={360} priority sizes="(max-width: 900px) 240px, 360px" />
              <div className="carte-flottante carte-fondateur">
                <strong>{CONTACT.fondateur}</strong>
                <span>Fondateur et formateur</span>
              </div>
              <div className="carte-flottante carte-progres" aria-hidden="true">
                <span>Chapitre 3 sur 8 · Les réseaux</span>
                <div className="bar sm"><span style={{ width: '37.5%' }} /></div>
              </div>
            </div>
            <Macaron className="hero-macaron">Gratuit, à ton rythme</Macaron>
          </div>
          <Vague />
        </section>

        <div className="page">
          <section aria-labelledby="t-offre">
            <h2 id="t-offre" className="titre-section">Ce que tu trouveras ici</h2>
            <div className="offres">
              {OFFRES.map((o) => (
                <Link key={o.titre} href={o.href} className="offre">
                  <img src={`/illustrations/${o.illus}.svg`} alt="" width={960} height={540} loading="lazy" />
                  <div><h3>{o.titre}</h3><p className="muted">{o.texte}</p></div>
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="t-comment">
            <h2 id="t-comment" className="titre-section">Comment ça marche</h2>
            <ol className="etapes-accueil">
              {ETAPES.map((e, i) => <li key={i}><span className="numero" aria-hidden="true">{i + 1}</span><span>{e}</span></li>)}
            </ol>
          </section>

          <section className="mot-fondateur" aria-labelledby="t-mot">
            <PhotoFondateur className="mot-photo" taille={96} decorative />
            <div>
              <h2 id="t-mot" className="titre-section" style={{ margin: 0 }}>Le mot du fondateur</h2>
              <blockquote>« J’ai créé Saint Stack Academy pour que chacun puisse apprendre les outils du métier, pas à pas, sans pression. Les cours suivent les références internationales et sont faits pour être compris. »</blockquote>
              <p className="signature">{CONTACT.fondateur} · <Link href="/contact">Me contacter</Link></p>
            </div>
          </section>

          {apercu.length > 0 && (
            <section aria-labelledby="t-apercu">
              <div className="section-head"><h2 id="t-apercu" className="titre-section" style={{ margin: 0 }}>Un aperçu du catalogue</h2><Link href="/catalogue">Voir tout le catalogue →</Link></div>
              <div className="grille scotch">{apercu.map((c) => <CarteCours key={c.slug} cours={c} anonyme />)}</div>
            </section>
          )}

          <section className="appel">
            <h2>Prêt à commencer ?</h2>
            <p>L’inscription est gratuite. Indique ton niveau, et tes cours recommandés t’attendent.</p>
            <Link href="/inscription" className="btn soleil">Créer mon compte</Link>
          </section>
        </div>
      </main>
      <PiedDePage />
    </>
  );
}
