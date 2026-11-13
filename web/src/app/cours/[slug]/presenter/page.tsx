'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

// ---------- PowerPoint du cours, affiché depuis sa copie PDF ----------
// npm run diaporamas génère web/public/diaporamas/<slug>.pptx, puis LibreOffice en fait <slug>.pdf
// (web/Dockerfile, ou npm run diaporamas:pdf en local). pdf.js est copié dans public/vendor/pdfjs/.
const PDFJS = '/vendor/pdfjs/pdf.min.mjs?v=4.10.38';
const PDFJS_WORKER = '/vendor/pdfjs/pdf.worker.min.mjs?v=4.10.38';
type Rendu = { promise: Promise<void>; cancel(): void };
type PagePdfJs = {
  getViewport(o: { scale: number }): { width: number; height: number };
  render(o: { canvasContext: CanvasRenderingContext2D; viewport: unknown }): Rendu;
  getTextContent(): Promise<{ items: { str?: string }[] }>;
};
type DocPdf = { numPages: number; getPage(n: number): Promise<PagePdfJs>; destroy(): Promise<void> };

/** Ouvre le PDF du cours ; null s'il n'existe pas (cours privé, ou PDF pas encore produit en local). */
async function ouvrirPdf(slug: string): Promise<DocPdf | null> {
  const url = `/diaporamas/${slug}.pdf`;
  const r = await fetch(url, { method: 'HEAD' }).catch(() => null);
  if (!r?.ok) return null;
  const pdfjs = await import(/* webpackIgnore: true */ PDFJS);
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  return pdfjs.getDocument({ url, isEvalSupported: false }).promise as Promise<DocPdf>;
}

/** Une page du PDF, dessinée à la largeur de la diapositive (et à la densité de l'écran). */
function PagePdf({ doc, i }: { doc: DocPdf; i: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [largeur, setLargeur] = useState(0);
  const [texte, setTexte] = useState('');

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const obs = new ResizeObserver(([e]) => setLargeur(Math.round(e.contentRect.width)));
    obs.observe(parent);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    let annule = false; let tache: Rendu | null = null;
    (async () => {
      const page = await doc.getPage(i + 1);
      const c = ref.current;
      if (annule || !c || !largeur) return;
      const base = page.getViewport({ scale: 1 });
      const vp = page.getViewport({ scale: (largeur * (window.devicePixelRatio || 1)) / base.width });
      // Dessin hors écran puis copie : pas de page blanche entre deux diapositives.
      const hors = document.createElement('canvas');
      hors.width = Math.round(vp.width); hors.height = Math.round(vp.height);
      tache = page.render({ canvasContext: hors.getContext('2d')!, viewport: vp });
      try { await tache.promise; } catch { return; }
      if (annule) return;
      c.width = hors.width; c.height = hors.height;
      c.getContext('2d')!.drawImage(hors, 0, 0);
      // Texte de la page pour les lecteurs d'écran (l'image du canvas est décorative pour eux).
      const t = await page.getTextContent();
      if (!annule) setTexte(t.items.map((x) => x.str ?? '').join(' ').replace(/\s+/g, ' ').trim());
      if (i + 1 < doc.numPages) doc.getPage(i + 2).catch(() => {}); // page suivante préparée
    })();
    return () => { annule = true; tache?.cancel(); };
  }, [doc, i, largeur]);

  return (
    <>
      <canvas ref={ref} className="diapo-pdf" aria-hidden="true" />
      <p className="sr">{texte}</p>
    </>
  );
}

function Contenu({ slug }: { slug: string }) {
  const router = useRouter();
  const [cours, setCours] = useState<Cours | null>(null);
  const [erreur, setErreur] = useState('');
  const [i, setI] = useState(0);
  // undefined : recherche du PDF en cours ; null : pas de PDF, affichage HTML de secours.
  const [doc, setDoc] = useState<DocPdf | null | undefined>(undefined);

  useEffect(() => { api<Cours>(`/cours/${slug}`).then(setCours).catch((e) => setErreur(e.message)); }, [slug]);
  useEffect(() => {
    let d: DocPdf | null = null;
    ouvrirPdf(slug).then((x) => { d = x; setDoc(x); }).catch(() => setDoc(null));
    return () => { d?.destroy().catch(() => {}); };
  }, [slug]);
  const diapos = useMemo(() => (cours ? plan(cours) : []), [cours]);
  const n = doc ? doc.numPages : diapos.length;
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
  if (!cours || doc === undefined || !n) return <div className="pres"><div className="pres-scene"><p>Chargement…</p></div></div>;

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
          {doc ? <PagePdf doc={doc} i={i} /> : <Diapo d={diapos[i]} cours={cours} i={i} n={n} />}
        </div>
      </div>
    </div>
  );
}

export default function Presenter() {
  const { slug } = useParams<{ slug: string }>();
  return <Shell nu>{() => <Contenu slug={slug} />}</Shell>;
}
