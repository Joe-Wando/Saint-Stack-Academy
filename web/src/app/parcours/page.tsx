'use client';

import Link from 'next/link';
import { ShellOuvert } from '@/components/Shell';
import { Souligne } from '@/components/Decor';
import { api, indexer, pourcent, progressionSiConnecte, Referentiel, session } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';
import { DOMAINES, styleDomaine } from '@/lib/domaines';

const PHRASES: Record<string, string> = {
  deploiement: 'GitHub Pages, Netlify, Vercel et ton propre nom de domaine : publier ses projets dès la L1.',
  web: 'Du maquettage au déploiement : React, Next.js, API, tests et intégration continue.',
  devops: 'Git, Docker, CI/CD, Kubernetes et supervision : livrer vite et de façon fiable.',
  data: 'SQL, Python, ETL, dbt, Airflow, Spark et Power BI : de la donnée brute au tableau de bord.',
  systemes: 'Linux, réseaux, Windows Server, Active Directory et automatisation.',
};

function Contenu() {
  const { donnees, erreur } = useDonnees(() => Promise.all([api<Referentiel>('/referentiel'), progressionSiConnecte()]));
  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!donnees) return <p className="muted">Chargement…</p>;
  const [ref, prog] = donnees;
  const idx = indexer(prog);
  const connecte = !!session();

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Parcours métiers</p>
        <h1>Vise un <Souligne>métier</Souligne>, cours après cours</h1>
        <p className="muted">Chaque parcours est une suite de cours dans l’ordre conseillé. Un même cours peut servir à plusieurs parcours.</p>
      </section>
      <div className="grandes-cartes">
        {ref.parcours.map((p) => {
          const dom = DOMAINES.find((d) => d.cle === p.domaine);
          const faits = p.cours.filter((c) => idx.get(c.slug)?.statut === 'termine').length;
          return (
            <Link key={p.code} href={`/parcours/${p.code}`} className="grande-carte" style={styleDomaine(dom?.nom ?? '')}>
              <img src={`/illustrations/${p.domaine}.svg`} alt="" width={960} height={540} />
              <div className="grande-carte-corps">
                <span className="tag dom">{p.cours.length} étapes</span>
                <h2>{p.titre}</h2>
                <p className="muted small">{PHRASES[p.code] ?? dom?.description}</p>
                {connecte && (
                  <>
                    <div className="bar sm" aria-hidden="true"><span style={{ width: `${pourcent(faits, p.cours.length)}%` }} /></div>
                    <span className="small muted">{faits} terminé{faits > 1 ? 's' : ''} sur {p.cours.length}</span>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export default function Parcours() {
  return <ShellOuvert>{() => <Contenu />}</ShellOuvert>;
}
