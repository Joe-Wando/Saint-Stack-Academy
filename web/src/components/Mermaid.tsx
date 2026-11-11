'use client';

import { CHARTE } from '@/lib/charte.mjs';
import { Component, type CSSProperties, type ReactNode, useEffect, useState } from 'react';

/** Thème des schémas : traits bleus de la charte (contraste 8,8:1 sur le blanc), fonds clairs, police du site. */
const THEME = {
  primaryColor: CHARTE['bleu-clair'], primaryTextColor: CHARTE.nuit, primaryBorderColor: CHARTE.bleu, lineColor: CHARTE.bleu,
  secondaryColor: CHARTE['bleu-clair'], tertiaryColor: CHARTE.fond, fontFamily: 'Manrope, sans-serif',
};

type MermaidApi = typeof import('mermaid').default;
let pret: Promise<MermaidApi> | null = null;

/**
 * Charge mermaid une seule fois, et seulement sur les pages qui contiennent un schéma.
 * Le fichier autonome est copié dans public/vendor/mermaid/ avant chaque build (scripts/copier-mermaid.mjs) :
 * webpack ne l'empaquette pas.
 */
function chargerMermaid() {
  pret ??= new Promise<MermaidApi>((ok, ko) => {
    const fenetre = window as unknown as { mermaid?: MermaidApi };
    if (fenetre.mermaid) { ok(fenetre.mermaid); return; }
    const script = document.createElement('script');
    script.src = '/vendor/mermaid/mermaid.min.js?v=11.17.2';
    script.async = true;
    script.onload = () => (fenetre.mermaid ? ok(fenetre.mermaid) : ko(new Error('mermaid absent')));
    script.onerror = () => { pret = null; ko(new Error('mermaid non chargé')); };
    document.head.appendChild(script);
  }).then((m) => {
    m.initialize({ startOnLoad: false, theme: 'base', themeVariables: THEME, securityLevel: 'strict', fontFamily: THEME.fontFamily });
    return m;
  });
  return pret;
}

/** Les rendus passent un par un : mermaid n'accepte pas deux dessins en même temps. */
let file: Promise<unknown> = Promise.resolve();
let compteur = 0;
function dessiner(code: string) {
  const id = `schema-${++compteur}`; // identifiant unique dans la page, même après un changement de chapitre
  const tache = file.then(() => chargerMermaid()).then((m) => m.render(id, code)).finally(() => document.getElementById(`d${id}`)?.remove());
  file = tache.catch(() => undefined);
  return tache;
}

/** Largeur naturelle du dessin, indiquée par mermaid (style max-width du SVG) : sur mobile, le schéma la garde et défile. */
const largeurNaturelle = (svg: string) => { const m = /max-width:\s*([\d.]+)px/.exec(svg); return m ? `${Math.round(Number(m[1]))}px` : '100%'; };

/** Le code du schéma, affiché tel quel (chargement, erreur de syntaxe ou plantage). */
function CodeSchema({ code, enCours = false }: { code: string; enCours?: boolean }) {
  return (
    <figure className="schema schema-code" aria-busy={enCours}>
      <pre><code className="language-mermaid">{code}</code></pre>
    </figure>
  );
}

/** Garde-fou : une erreur dans un schéma n'interrompt jamais le reste de la page. */
class GardeFou extends Component<{ code: string; children: ReactNode }, { erreur: boolean }> {
  state = { erreur: false };
  static getDerivedStateFromError() { return { erreur: true }; }
  render() { return this.state.erreur ? <CodeSchema code={this.props.code} /> : this.props.children; }
}

/**
 * Schéma Mermaid rendu en SVG dans une <figure>. En cas d'erreur de syntaxe, le code source est affiché tel quel.
 * La légende (« Figure : … ») est écrite en texte dans le cours, juste après le schéma.
 */
export default function Mermaid({ code }: { code: string }) {
  return <GardeFou key={code} code={code}><Schema code={code} /></GardeFou>;
}

function Schema({ code }: { code: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [echec, setEchec] = useState(false);

  useEffect(() => {
    let actif = true;
    setSvg(null); setEchec(false);
    dessiner(code)
      .then(({ svg: s }) => { if (actif) setSvg(s); })
      .catch(() => { if (actif) setEchec(true); });
    return () => { actif = false; };
  }, [code]);

  if (echec || svg === null) return <CodeSchema code={code} enCours={!echec} />;
  return (
    <figure className="schema">
      {/* Zone défilante au clavier (sur mobile, un grand schéma garde sa taille et défile de côté). */}
      <div className="schema-dessin" tabIndex={0} role="region" aria-label="Schéma, défilable horizontalement sur petit écran"
        style={{ '--largeur': largeurNaturelle(svg) } as CSSProperties} dangerouslySetInnerHTML={{ __html: svg }} />
      {/* Le code reste consultable : certains cours apprennent justement à écrire ces schémas. */}
      <details className="schema-source">
        <summary>Voir le code du schéma</summary>
        <pre><code className="language-mermaid">{code}</code></pre>
      </details>
    </figure>
  );
}
