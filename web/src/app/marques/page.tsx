'use client';

import Link from 'next/link';
import { ShellOuvert } from '@/components/Shell';
import { api } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';

interface Marques {
  sujets: { libelle: string; marque: string }[];
  organismes: { nom: string; marque: string }[];
}

/** Mentions de marque : générées depuis content/sujets.yaml et content/organismes.yaml (champ « marque »). */
function Mentions() {
  const { donnees, erreur } = useDonnees(() => api<Marques>('/marques'));
  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!donnees) return <p className="muted">Chargement…</p>;
  return (
    <>
      <h2>Technologies</h2>
      <ul className="liste-marques">{donnees.sujets.map((m) => <li key={m.marque}>{m.marque}</li>)}</ul>

      <h2>Organismes de certification</h2>
      {donnees.organismes.length > 0 && (
        <ul className="liste-marques">{donnees.organismes.map((m) => <li key={m.nom}>{m.marque}</li>)}</ul>
      )}
      <p>
        Ces logos indiquent uniquement l’organisme auprès duquel chaque certification se passe. Saint Stack Academy ne délivre pas
        ces certifications, n’est partenaire d’aucun de ces organismes et n’est pas soutenue par eux. Pour toute demande de retrait
        d’un logo, utilisez la <Link href="/contact">page Contact</Link>.
      </p>
      <p>
        Les noms des organismes de certification cités (Cisco, Coursera, Microsoft, OpenEDG Python Institute, Google, IBM, Meta,
        freeCodeCamp, GitHub) sont des marques de leurs titulaires.
      </p>
    </>
  );
}

export default function PageMarques() {
  return (
    <ShellOuvert>
      {() => (
        <article className="card texte-long">
          <p className="eyebrow">Marques</p>
          <h1>Marques et logos</h1>
          <p>Les noms et logos de technologies affichés sur Saint Stack Academy servent uniquement à indiquer le sujet des cours.</p>
          <Mentions />
          <p><strong>Saint Stack Academy n’est affiliée à aucun de ces éditeurs ni soutenue par eux.</strong></p>
          <h2>Demande de retrait</h2>
          <p>
            Si vous représentez l’un de ces éditeurs ou organismes et souhaitez le retrait d’un nom ou d’un logo, écrivez-nous depuis
            la <Link href="/contact">page Contact</Link> (sujet « Autre »). Le logo est retiré rapidement.
          </p>
          <p className="small muted">
            Logos : paquet simple-icons (licence CC0 1.0, qui couvre les fichiers et non les marques), affichés dans leur couleur
            d’origine et sans modification. Détail des licences : fichier THIRD_PARTY_NOTICES.md du dépôt.
          </p>
        </article>
      )}
    </ShellOuvert>
  );
}
