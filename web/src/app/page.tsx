'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Award, BookOpen, Map as Carte, Rocket } from 'lucide-react';
import EnTetePublic from '@/components/EnTetePublic';
import { EnTeteConnecte } from '@/components/Shell';
import PiedDePage from '@/components/PiedDePage';
import CarteCours from '@/components/CarteCours';
import PhotoFondateur from '@/components/PhotoFondateur';
import { api, Referentiel, ResumeCours, session, sessionValide, Utilisateur } from '@/lib/api';
import { COULEURS_NIVEAUX } from '@/lib/domaines';
import { CONTACT } from '@/lib/contact';

const OFFRES = [
  { Icone: BookOpen, titre: 'Des cours complets', texte: 'Chaque cours a ses chapitres, un exercice corrigé et un quiz.' },
  { Icone: Carte, titre: 'Les cours de ton niveau', texte: 'La licence L1, L2, L3 par semestre et par UE, avec trois options en L3.' },
  { Icone: Rocket, titre: 'Des parcours métiers', texte: 'Web, DevOps, data, systèmes, et mettre ton site en ligne.' },
  { Icone: Award, titre: 'Les certifications à viser', texte: 'Les badges gratuits et les certifications reconnues, niveau par niveau.' },
];

const NIVEAUX = [
  { code: 'L1', titre: 'Les fondamentaux', texte: 'Langage C, architecture, mathématiques, web, réseaux.' },
  { code: 'L2', titre: 'Construire des applications', texte: 'Java, Python, bases de données, front-end, back-end, cloud.' },
  { code: 'L3', titre: 'Se spécialiser', texte: 'Big Data et IA, réseaux et cloud, ou développement logiciel.' },
];

/** Les cours du référentiel (sans doublon) : UE de licence et parcours. */
function coursDuReferentiel(r: Referentiel): ResumeCours[] {
  const tous = [
    ...r.niveaux.flatMap((n) => [...n.semestres, ...n.troncCommun, ...n.options.flatMap((o) => o.semestres)].flatMap((s) => s.ues.flatMap((u) => u.cours))),
    ...r.parcours.flatMap((p) => p.cours),
  ];
  return [...new Map(tous.map((c) => [c.slug, c])).values()];
}

/**
 * Page d'accueil du site (maquette Main.html) : c'est toujours la première page, connecté ou non.
 * Connecté : l'en-tête montre le compte et le bouton principal mène à ses cours.
 * Une session expirée est effacée sans quitter la page.
 */
export default function AccueilPublic() {
  const [u, setU] = useState<Utilisateur | null>(null);
  const [ref, setRef] = useState<Referentiel | null>(null);
  useEffect(() => {
    let actif = true;
    if (session()) sessionValide().then((ok) => { if (actif && ok) setU(session()?.utilisateur ?? null); });
    api<Referentiel>('/referentiel').then((r) => { if (actif) setRef(r); }).catch(() => {});
    return () => { actif = false; };
  }, []);

  const cours = ref ? coursDuReferentiel(ref) : [];
  // Cours populaires : les premiers cours de L1, un par domaine, trois au plus.
  const populaires = [...new Map(cours.filter((c) => c.licence?.[0]?.niveau === 'L1').map((c) => [c.domaine, c])).values()].slice(0, 3);

  return (
    <>
      {u ? <EnTeteConnecte u={u} /> : <EnTetePublic />}
      <main>
        <section className="bandeau-sombre bandeau-accueil">
          <div className="conteneur bandeau-accueil-in">
            <div className="bandeau-accueil-texte">
              <span className="pastille-corail">Gratuit et ouvert à tous les étudiants</span>
              <h1>Apprends l’informatique à ton rythme, de la L1 aux métiers</h1>
              <p className="bandeau-accueil-sous">
                {cours.length || 'Des'} cours, des exercices corrigés et des parcours pour devenir développeur web, ingénieur DevOps, data engineer ou administrateur systèmes.
              </p>
              <div className="bandeau-actions">
                {u
                  ? <Link href="/accueil" className="btn primary">Continuer mes cours</Link>
                  : <Link href="/inscription" className="btn primary">Commencer gratuitement</Link>}
                <Link href="/catalogue" className="btn sur-sombre">Voir le catalogue</Link>
              </div>
            </div>
            <figure className="bandeau-accueil-photo">
              <PhotoFondateur className="photo-fondateur-hero" taille={280} priority sizes="(max-width: 700px) 200px, 280px" />
              <figcaption>{CONTACT.fondateur}, fondateur</figcaption>
            </figure>
          </div>
        </section>

        <section className="bande-chiffres" aria-label="Chiffres clés">
          <div className="conteneur bande-chiffres-in">
            <div><span className="chiffre-v">{cours.length || '–'}</span><span>cours</span></div>
            <div><span className="chiffre-v">3</span><span>niveaux de licence</span></div>
            <div><span className="chiffre-v">{ref?.parcours.length ?? '–'}</span><span>parcours métiers</span></div>
            <div><span className="chiffre-v corail">0 FCFA</span><span>pour apprendre</span></div>
          </div>
        </section>

        <div className="conteneur">
          <section className="section-charte" aria-labelledby="t-offre">
            <h2 id="t-offre">Ce que tu trouveras ici</h2>
            <div className="grille-offres">
              {OFFRES.map(({ Icone, titre, texte }) => (
                <div key={titre} className="card carte-offre">
                  <span className="pastille-icone" aria-hidden="true"><Icone size={22} strokeWidth={2} /></span>
                  <h3>{titre}</h3>
                  <p>{texte}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="section-charte" aria-labelledby="t-niveau">
            <h2 id="t-niveau">Choisis ton niveau</h2>
            <div className="grille-niveaux">
              {NIVEAUX.map((n) => (
                <Link key={n.code} href={`/licence/${n.code}`} className="card carte-niveau" style={{ borderTopColor: COULEURS_NIVEAUX[n.code] }}>
                  <span className="carte-niveau-code" style={{ color: COULEURS_NIVEAUX[n.code] }}>{n.code}</span>
                  <span className="carte-niveau-titre">{n.titre}</span>
                  <span className="carte-niveau-texte">{n.texte}</span>
                </Link>
              ))}
            </div>
          </section>

          {populaires.length > 0 && (
            <section className="section-charte" aria-labelledby="t-populaires">
              <div className="section-head"><h2 id="t-populaires" style={{ margin: 0 }}>Cours populaires</h2><Link href="/catalogue" className="lien-fort">Tout le catalogue</Link></div>
              <div className="grille">{populaires.map((c) => <CarteCours key={c.slug} cours={c} anonyme />)}</div>
            </section>
          )}

          <section className="section-charte card carte-enseignant" aria-labelledby="t-enseignant">
            <PhotoFondateur className="photo-enseignant" taille={120} decorative />
            <div className="carte-enseignant-texte">
              <p className="eyebrow">Qui enseigne ?</p>
              <h2 id="t-enseignant">{CONTACT.fondateur}</h2>
              <p>Développeur full-stack à Dakar. J’ai créé Saint Stack Academy pour que chaque étudiant en informatique trouve des cours clairs, gratuits et proches des métiers.</p>
            </div>
            <Link href="/contact" className="btn">Me contacter</Link>
          </section>
        </div>
      </main>
      <PiedDePage />
    </>
  );
}
