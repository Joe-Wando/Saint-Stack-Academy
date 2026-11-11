'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShellOuvert } from '@/components/Shell';
import Onglets from '@/components/Onglets';
import CarteCours, { CartePreparation } from '@/components/CarteCours';
import { api, indexer, pourcent, progressionSiConnecte, Referentiel, SemestreRef, Utilisateur } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';
import { illustrationNiveau } from '@/lib/illustrations-pages';
import { ancreUe } from '@/lib/licence';

type Idx = ReturnType<typeof indexer>;

/** Une UE : titre, progression, cartes dans l'ordre, ou « Cours en préparation ». */
function Ue({ semestre, titre, cours, idx, anonyme }: { semestre: string; titre: string; cours: SemestreRef['ues'][number]['cours']; idx: Idx; anonyme: boolean }) {
  const faits = cours.filter((c) => idx.get(c.slug)?.statut === 'termine').length;
  return (
    <section className="ue" id={ancreUe(semestre, titre)} aria-labelledby={`t-${ancreUe(semestre, titre)}`}>
      <div className="ue-tete">
        <h3 id={`t-${ancreUe(semestre, titre)}`}>{titre}</h3>
        <span className="small muted">{!cours.length ? 'Cours en préparation' : anonyme ? `${cours.length} cours` : `${faits} terminé${faits > 1 ? 's' : ''} sur ${cours.length}`}</span>
      </div>
      {cours.length > 0 && !anonyme && <div className="bar sm ue-bar" aria-hidden="true"><span style={{ width: `${pourcent(faits, cours.length)}%` }} /></div>}
      <div className="grille">
        {cours.length ? cours.map((c) => <CarteCours key={c.slug} cours={c} prog={idx.get(c.slug)} anonyme={anonyme} />) : <CartePreparation />}
      </div>
    </section>
  );
}

function Semestres({ semestres, idx, anonyme }: { semestres: SemestreRef[]; idx: Idx; anonyme: boolean }) {
  return <>{semestres.map((s) => s.ues.map((ue) => <Ue key={`${s.code}-${ue.titre}`} semestre={s.code} titre={ue.titre} cours={ue.cours} idx={idx} anonyme={anonyme} />))}</>;
}

function Contenu({ code, u }: { code: string; u: Utilisateur | null }) {
  const { donnees, erreur } = useDonnees(() => Promise.all([api<Referentiel>('/referentiel'), progressionSiConnecte()]));
  const [onglet, setOnglet] = useState('');
  const [option, setOption] = useState(u?.niveau === 'L3' && u.optionL3 ? u.optionL3 : '');
  const niveau = donnees?.[0].niveaux.find((n) => n.code === code.toUpperCase());

  useEffect(() => {
    if (!niveau) return;
    if (!onglet && niveau.semestres.length) setOnglet(niveau.semestres[0].code);
    if (!option && niveau.options.length) setOption(niveau.options[0].code);
    // Arrivée depuis une ancre d'UE : on ouvre le bon semestre puis on y défile.
    const ancre = decodeURIComponent(window.location.hash.slice(1));
    const s = niveau.semestres.find((x) => x.ues.some((ue) => ancreUe(x.code, ue.titre) === ancre));
    if (s) { setOnglet(s.code); setTimeout(() => document.getElementById(ancre)?.scrollIntoView(), 50); }
  }, [niveau]); // eslint-disable-line react-hooks/exhaustive-deps

  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!donnees) return <p className="muted">Chargement…</p>;
  if (!niveau) return <p className="error" role="alert">Ce niveau n’existe pas. <Link href="/licence">Retour à la licence</Link></p>;
  const idx = indexer(donnees[1]);
  const [abrev, ...reste] = niveau.titre.split(' · ');
  const opt = niveau.options.find((o) => o.code === option);

  return (
    <>
      <Link href="/licence" className="small">← Licence</Link>
      <section className="hero hero-illus">
        <div>
          <p className="eyebrow">{abrev}</p>
          <h1>{reste.join(' · ') || niveau.titre}</h1>
          {opt && <p className="muted">Option : {opt.titre}</p>}
        </div>
        <img src={illustrationNiveau(niveau.code, niveau.options.length ? option : null)} alt="" width={960} height={540} />
      </section>

      {niveau.semestres.length > 0 && (
        <Onglets id="semestres" label="Semestres" actif={onglet} onChange={setOnglet}
          onglets={niveau.semestres.map((s) => ({ cle: s.code, titre: `Semestre ${s.code.slice(1)} (${s.code})` }))}>
          <Semestres semestres={niveau.semestres.filter((s) => s.code === onglet)} idx={idx} anonyme={!u} />
        </Onglets>
      )}

      {niveau.options.length > 0 && (
        <>
          <fieldset className="choix">
            <legend className="section-legend">Ton option</legend>
            <div className="choix-liste choix-3">
              {niveau.options.map((o) => (
                <label key={o.code} className={`choix-carte${option === o.code ? ' on' : ''}`}>
                  <input type="radio" name="option" value={o.code} checked={option === o.code} onChange={() => setOption(o.code)} />
                  <strong>{o.titre}</strong>
                  <span className="small muted">{o.semestres.flatMap((s) => s.ues.flatMap((x) => x.cours)).length} cours{u?.optionL3 === o.code ? ' · ton option' : ''}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="section-head"><h2>Tronc commun</h2><span className="muted small">pour toutes les options</span></div>
          <Semestres semestres={niveau.troncCommun} idx={idx} anonyme={!u} />
          {opt && (
            <>
              <div className="section-head"><h2>Option {opt.titre}</h2></div>
              {opt.semestres.map((s) => (
                <div key={s.code}>
                  <h3 className="semestre-titre">Semestre {s.code.slice(1)} ({s.code})</h3>
                  <Semestres semestres={[s]} idx={idx} anonyme={!u} />
                </div>
              ))}
            </>
          )}
        </>
      )}
    </>
  );
}

export default function LicenceNiveau() {
  const { niveau } = useParams<{ niveau: string }>();
  return <ShellOuvert>{(u) => <Contenu code={niveau} u={u} />}</ShellOuvert>;
}
