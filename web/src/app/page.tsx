'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import EnTetePublic from '@/components/EnTetePublic';
import PiedDePage from '@/components/PiedDePage';
import { session } from '@/lib/api';
import { illustration, styleDomaine } from '@/lib/domaines';

const PARCOURS = [
  { titre: 'Développeur web', domaine: 'Développement web' },
  { titre: 'Ingénieur DevOps', domaine: 'DevOps' },
  { titre: 'Data engineer', domaine: 'Data' },
  { titre: 'Administrateur systèmes et réseaux', domaine: 'Systèmes' },
];

/** Page d'accueil publique. Un utilisateur connecté est redirigé vers /accueil. */
export default function AccueilPublic() {
  const router = useRouter();
  const [pret, setPret] = useState(false);
  useEffect(() => {
    if (session()) router.replace('/accueil'); else setPret(true);
  }, [router]);
  if (!pret) return null;

  return (
    <>
      <EnTetePublic />
      <main>
        <section className="bandeau">
          <div className="bandeau-in">
            <div className="bandeau-txt">
              <p className="eyebrow">Plateforme d’apprentissage en informatique</p>
              <h1>Apprends l’informatique à ton rythme, de la L1 aux métiers.</h1>
              <p className="bandeau-sous">Des cours clairs, une notion à la fois, avec exercices corrigés et quiz.</p>
              <div className="bandeau-actions">
                <Link href="/inscription" className="btn primary">Créer un compte</Link>
                <Link href="/connexion" className="btn">Se connecter</Link>
              </div>
            </div>
            <img className="bandeau-img" src="/illustrations/devops.svg" alt="" width={960} height={540} />
          </div>
        </section>

        <div className="page">
          <section className="blocs" aria-label="Ce que tu trouveras ici">
            <article className="bloc">
              <h2>La licence, de la L1 à la L3</h2>
              <p className="muted">Les cours rangés par semestre et par unité d’enseignement, dans l’ordre conseillé.</p>
              <ul className="puces-niveaux">
                <li><strong>L1</strong> Fondamentaux de l’informatique</li>
                <li><strong>L2</strong> Programmation, données et réseaux</li>
                <li><strong>L3</strong> Spécialisation, avec trois options : Big Data et IA, Réseaux, systèmes et cloud, Développement logiciel</li>
              </ul>
            </article>
            <article className="bloc">
              <h2>Quatre parcours métiers</h2>
              <p className="muted">Une suite de cours ordonnée pour viser un métier précis.</p>
              <ul className="mini-parcours">
                {PARCOURS.map((p) => (
                  <li key={p.titre} style={styleDomaine(p.domaine)}>
                    <img src={illustration(p.domaine)} alt="" width={96} height={54} loading="lazy" />
                    <span>{p.titre}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="bloc">
              <h2>La méthode</h2>
              <ul className="coches">
                <li><span className="coche" aria-hidden="true">✓</span><span>Des cours en chapitres, une notion à la fois</span></li>
                <li><span className="coche" aria-hidden="true">✓</span><span>Des exercices guidés, puis autonomes, avec leur correction</span></li>
                <li><span className="coche" aria-hidden="true">✓</span><span>Un quiz corrigé à la fin de chaque cours</span></li>
                <li><span className="coche" aria-hidden="true">✓</span><span>Un mode présentation et le PowerPoint de chaque cours</span></li>
              </ul>
            </article>
          </section>

          <section className="appel">
            <h2>Prêt à commencer ?</h2>
            <p>L’inscription est gratuite. Indique ton niveau, et tes cours recommandés t’attendent.</p>
            <Link href="/inscription" className="btn primary">Créer mon compte</Link>
          </section>
        </div>
      </main>
      <PiedDePage />
    </>
  );
}
