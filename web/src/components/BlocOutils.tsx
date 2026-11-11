'use client';

import type React from 'react';
import type { Logiciel, OutilsCours } from '@/lib/api';

const SYSTEMES: Record<string, string> = { windows: 'Windows', linux: 'Linux', macos: 'macOS', en_ligne: 'En ligne' };

/** Un logiciel : nom en gras, rôle, systèmes en étiquettes texte, consigne d'installation et lien vers le site officiel. */
export function FicheLogiciel({ l, pied }: { l: Logiciel; pied?: React.ReactNode }) {
  return (
    <li className="logiciel">
      <div className="logiciel-tete">
        <strong>{l.nom}</strong>
        <span className="logiciel-systemes">{l.systemes.map((s) => <span key={s} className="etiquette-systeme">{SYSTEMES[s] ?? s}</span>)}</span>
      </div>
      <p className="logiciel-role">{l.role}</p>
      <p className="logiciel-installer">{l.installer}</p>
      <a href={l.site} target="_blank" rel="noopener noreferrer">Site officiel<span className="sr"> de {l.nom} (nouvel onglet)</span></a>
      {pied}
    </li>
  );
}

function Groupe({ titre, liste }: { titre: string; liste: Logiciel[] }) {
  if (!liste.length) return null;
  return (
    <div className="outils-groupe">
      <h4>{titre}</h4>
      <ul className="liste-logiciels">{liste.map((l) => <FicheLogiciel key={l.cle} l={l} />)}</ul>
    </div>
  );
}

function Contenu({ o }: { o: OutilsCours }) {
  return (
    <>
      <Groupe titre="À installer" liste={o.principal} />
      <Groupe titre="Autres possibilités" liste={o.autres} />
      <Groupe titre="Sans installation" liste={o.enLigne} />
      <p className="small muted" style={{ margin: 0 }}>Tous les logiciels, sujet par sujet : <a href="/outils">Installer ses outils</a>.</p>
    </>
  );
}

/**
 * « Avant de commencer : tes outils ». Complet sur la première leçon d'un sujet ;
 * sur les leçons suivantes, une ligne discrète qui déplie la même liste.
 */
export default function BlocOutils({ outils }: { outils?: OutilsCours | null }) {
  if (!outils || !outils.principal.length) return null;
  if (outils.premier) {
    return (
      <section className="bloc-outils" aria-labelledby="t-outils">
        <h3 id="t-outils">Avant de commencer : tes outils</h3>
        <Contenu o={outils} />
      </section>
    );
  }
  return (
    <details className="bloc-outils bloc-outils-replie">
      <summary>Outils : {outils.principal.map((l) => l.nom).join(' · ')} · <span className="lien-voir">voir la liste</span></summary>
      <Contenu o={outils} />
    </details>
  );
}
