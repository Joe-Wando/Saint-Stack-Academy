'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { plugins } from '@/components/Markdown';
import Shell from '@/components/Shell';
import VisuelCours from '@/components/VisuelCours';
import { api, capitale, Cours, dureeH } from '@/lib/api';
import { Diapositive, infoDomaine, plan, styleDomaine } from '@/lib/domaines';

const AUTEUR = 'Olivier Jonathan DIPO WANDO';
const LETTRES = ['A', 'B', 'C', 'D', 'E', 'F'];

function Diapo({ d, cours, i, n }: { d: Diapositive; cours: Cours; i: number; n: number }) {
  const dom = infoDomaine(cours.domaine);
  const licence = cours.emplacements.flatMap((x) => (x.type === 'licence' ? [{ niveau: x.niveau, semestre: x.semestre, option: x.option }] : []));
  if (d.type === 'couverture') {
    return (
      <div className="d-couverture">
        <div className="d-couverture-txt">
          <span className="tag">{dom.nom}</span>
          <h1>{cours.titre}</h1>
          {cours.sujet && <p className="d-sujet">{cours.sujet.libelle}</p>}
          <p className="d-info">{dureeH(cours.duree)} · {capitale(cours.difficulte)}</p>
          <p className="d-auteur">{AUTEUR}</p>
        </div>
        <VisuelCours domaine={cours.domaine} sujet={cours.sujet} licence={licence} classeImage="d-couverture-img" taillePicto={64} prioritaire />
      </div>
    );
  }
  let surtitre = cours.titre, titre = '', corps = null;
  if (d.type === 'objectifs') {
    surtitre = 'Objectifs';
    titre = 'À la fin de ce cours, tu sauras';
    corps = <ul className="d-coches">{d.objectifs.map((o, k) => <li key={k}><span className="coche" aria-hidden="true">✓</span><span>{o}</span></li>)}</ul>;
  } else if (d.type === 'contenu') {
    surtitre = d.titre;
    titre = d.sousTitre ?? d.titre;
    corps = <ReactMarkdown {...plugins}>{d.blocs.join('\n\n')}</ReactMarkdown>;
  } else if (d.type === 'question') {
    surtitre = `Quiz · question ${d.numero} sur ${d.total}`;
    titre = 'À toi de répondre';
    corps = (
      <>
        <p className="d-question">{d.question}</p>
        <ol className="d-choix">{d.choix.map((c, k) => <li key={k}><b aria-hidden="true">{LETTRES[k]}</b><span><span className="sr">{LETTRES[k]}. </span>{c}</span></li>)}</ol>
      </>
    );
  }
  return (
    <div className="d-in">
      <p className="d-surtitre">{surtitre}</p>
      <h2 className="d-titre">{titre}</h2>
      <div className="d-corps">{corps}</div>
      <div className="d-pied"><span>MeredianStack · {cours.titre}</span><span>{i + 1} / {n}</span></div>
    </div>
  );
}

function Contenu({ slug }: { slug: string }) {
  const router = useRouter();
  const [cours, setCours] = useState<Cours | null>(null);
  const [erreur, setErreur] = useState('');
  const [i, setI] = useState(0);

  useEffect(() => { api<Cours>(`/cours/${slug}`).then(setCours).catch((e) => setErreur(e.message)); }, [slug]);
  const diapos = useMemo(() => (cours ? plan(cours) : []), [cours]);
  const n = diapos.length;
  const aller = useCallback((j: number) => setI(Math.min(Math.max(j, 0), Math.max(n - 1, 0))), [n]);

  useEffect(() => {
    function touche(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const cible = e.target as HTMLElement | null;
      if (cible?.closest('button, a, input, textarea') && (e.key === ' ' || e.key === 'Enter')) return;
      if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); setI((x) => Math.min(x + 1, n - 1)); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); setI((x) => Math.max(x - 1, 0)); }
      else if (e.key === 'Home') { e.preventDefault(); setI(0); }
      else if (e.key === 'End') { e.preventDefault(); setI(n - 1); }
      else if (e.key === 'Escape' && !document.fullscreenElement) router.push(`/cours/${slug}`);
    }
    window.addEventListener('keydown', touche);
    return () => window.removeEventListener('keydown', touche);
  }, [n, router, slug]);

  function pleinEcran() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }

  if (erreur) return <div className="pres"><div className="pres-scene"><p>{erreur} <Link href="/catalogue" style={{ color: '#fff' }}>Retour au catalogue</Link></p></div></div>;
  if (!cours || !n) return <div className="pres"><div className="pres-scene"><p>Chargement…</p></div></div>;

  return (
    <div className="pres" style={styleDomaine(cours.domaine)}>
      <div className="pres-barre">
        <Link href={`/cours/${slug}`} className="btn sm quitter">Quitter</Link>
        <span className="pres-titre">{cours.titre}</span>
        <span className="pres-num" aria-live="polite">{i + 1} / {n}</span>
        <button className="btn sm" onClick={() => aller(i - 1)} disabled={i === 0} aria-label="Diapositive précédente">←</button>
        <button className="btn sm" onClick={() => aller(i + 1)} disabled={i === n - 1} aria-label="Diapositive suivante">→</button>
        <button className="btn sm" onClick={pleinEcran}>Plein écran</button>
      </div>
      <div className="pres-scene">
        <div className="diapo" onClick={() => aller(i + 1)} role="region" aria-roledescription="diapositive" aria-label={`Diapositive ${i + 1} sur ${n}`}>
          <Diapo d={diapos[i]} cours={cours} i={i} n={n} />
        </div>
      </div>
    </div>
  );
}

export default function Presenter() {
  const { slug } = useParams<{ slug: string }>();
  return <Shell nu>{() => <Contenu slug={slug} />}</Shell>;
}
