'use client';

import { useEffect, useState } from 'react';
import { ShellOuvert } from '@/components/Shell';
import { Souligne } from '@/components/Decor';
import Onglets from '@/components/Onglets';
import CarteCertification, { TYPES_CERTIF } from '@/components/CarteCertification';
import { api, Certifications, Referentiel, Utilisateur } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';
import { lienUeDepuis } from '@/lib/licence';
import { ILLUS } from '@/lib/illustrations-pages';
import { COULEURS_NIVEAUX } from '@/lib/domaines';

function Contenu({ u }: { u: Utilisateur | null }) {
  const { donnees, erreur } = useDonnees(() => Promise.all([api<Certifications>('/certifications'), api<Referentiel>('/referentiel').catch(() => null)]));
  const [niveau, setNiveau] = useState('L1');
  const [option, setOption] = useState('');
  useEffect(() => {
    if (u?.niveau === 'L1' || u?.niveau === 'L2' || u?.niveau === 'L3') setNiveau(u.niveau);
    if (u?.optionL3) setOption(u.optionL3);
  }, [u]);
  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!donnees) return <p className="muted">Chargement…</p>;
  const [c, ref] = donnees;
  const optionsL3 = ref?.niveaux.find((n) => n.code === 'L3')?.options ?? [];
  const opt = option || optionsL3[0]?.code || Object.keys(c.niveaux.L3.options)[0];
  const elements = niveau === 'L3' ? c.niveaux.L3.options[opt] ?? [] : c.niveaux[niveau as 'L1' | 'L2'].elements;
  const intro = c.niveaux[niveau as 'L1' | 'L2' | 'L3'].intro;
  const couleur = (niveau === 'L3' ? COULEURS_NIVEAUX[opt] : undefined) ?? COULEURS_NIVEAUX[niveau];

  return (
    <>
      <section className="hero hero-illus">
        <div>
          <p className="eyebrow">Certifications</p>
          <h1>Les certifications à viser, <Souligne>niveau par niveau</Souligne></h1>
          <p className="muted">Des badges gratuits pour valider les bases, puis des certifications reconnues par les recruteurs.</p>
        </div>
        <img src={ILLUS.certifications} alt="" width={960} height={540} />
      </section>

      <section className="card encadre-types" aria-labelledby="t-types">
        <h2 id="t-types" className="h-petit">Badge, certificat ou certification ?</h2>
        <ul>
          {(Object.keys(TYPES_CERTIF) as (keyof typeof TYPES_CERTIF)[]).map((t) => (
            <li key={t}><span className={`type-certif ${t}`}>{TYPES_CERTIF[t].label}</span><span>{TYPES_CERTIF[t].texte}</span></li>
          ))}
        </ul>
      </section>

      <Onglets id="niveaux-certif" label="Niveaux" actif={niveau} onChange={setNiveau}
        onglets={[{ cle: 'L1', titre: 'Licence 1' }, { cle: 'L2', titre: 'Licence 2' }, { cle: 'L3', titre: 'Licence 3' }]}>
        <p className="intro-niveau">{intro}</p>
        {niveau === 'L3' && (
          <div className="filtres" role="group" aria-label="Option de L3">
            {optionsL3.map((o) => (
              <button key={o.code} className={`chipbtn ${opt === o.code ? 'on' : ''}`} aria-pressed={opt === o.code} onClick={() => setOption(o.code)}>{o.titre}</button>
            ))}
          </div>
        )}
        <div className="grille-certifs">
          {elements.map((e) => <CarteCertification key={e.nom} e={e} lienUe={lienUeDepuis(ref, niveau, e.ue)} couleur={couleur} />)}
        </div>
      </Onglets>

      <section className="card" aria-labelledby="t-conseils" style={{ marginTop: '1.6rem' }}>
        <h2 id="t-conseils" className="h-petit">Conseils</h2>
        <ul className="conseils">{c.conseils.map((x, i) => <li key={i}>{x}</li>)}</ul>
      </section>
      <p className="small muted mention">Les offres et les tarifs évoluent. Vérifie toujours sur le site officiel avant de t’inscrire. Dernière vérification : novembre 2026.</p>
    </>
  );
}

export default function PageCertifications() {
  return <ShellOuvert>{(u) => <Contenu u={u} />}</ShellOuvert>;
}
