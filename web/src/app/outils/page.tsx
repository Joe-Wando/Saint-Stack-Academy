'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShellOuvert } from '@/components/Shell';
import { FicheLogiciel } from '@/components/BlocOutils';
import { api, Logiciel } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';

interface PageOutils { familles: { nom: string; logiciels: (Logiciel & { sujets: { cle: string; libelle: string }[] })[] }[] }

const normal = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** « Installer ses outils » : tous les logiciels par famille, un filtre texte, et les sujets qui les utilisent. */
function Contenu() {
  const { donnees, erreur } = useDonnees(() => api<PageOutils>('/outils'));
  const [filtre, setFiltre] = useState('');
  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!donnees) return <p className="muted">Chargement…</p>;
  const mots = normal(filtre).split(/\s+/).filter(Boolean);
  const familles = donnees.familles
    .map((f) => ({ ...f, logiciels: f.logiciels.filter((l) => mots.every((m) => normal(`${l.nom} ${l.role} ${l.sujets.map((s) => s.libelle).join(' ')}`).includes(m))) }))
    .filter((f) => f.logiciels.length);
  const total = familles.reduce((t, f) => t + f.logiciels.length, 0);

  return (
    <>
      <section className="tete-page">
        <p className="eyebrow">Outils</p>
        <h1>Installer ses outils</h1>
        <p className="tete-page-sous">Les logiciels utilisés dans les cours, tous gratuits ou avec une version gratuite. Ceux qui marchent sous Windows d’abord, et une solution en ligne quand elle existe.</p>
      </section>
      <div className="recherche-charte" role="search">
        <label htmlFor="filtre-outils" className="sr">Filtrer les logiciels</label>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        <input id="filtre-outils" type="search" placeholder="Filtrer : Docker, Python, base de données…" value={filtre} onChange={(e) => setFiltre(e.target.value)} />
      </div>
      <p className="small muted resultats" aria-live="polite">{total} logiciel{total > 1 ? 's' : ''}</p>
      {!familles.length && <p className="muted">Aucun logiciel ne correspond.</p>}
      {familles.map((f) => (
        <section key={f.nom} className="section-charte famille-outils" aria-labelledby={`f-${normal(f.nom).replace(/\W+/g, '-')}`} style={{ marginTop: 32 }}>
          <h2 id={`f-${normal(f.nom).replace(/\W+/g, '-')}`}>{f.nom}</h2>
          <ul className="liste-logiciels grille-logiciels">
            {f.logiciels.map((l) => (
              <FicheLogiciel key={l.cle} l={l} pied={l.sujets.length > 0 && (
                <p className="small logiciel-sujets">Utilisé pour : {l.sujets.map((s, i) => <span key={s.cle}>{i ? ', ' : ''}<Link href={`/catalogue?sujet=${encodeURIComponent(s.cle)}`}>{s.libelle}</Link></span>)}</p>
              )} />
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

export default function PageOutils() {
  return <ShellOuvert>{() => <Contenu />}</ShellOuvert>;
}
