'use client';

import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { common } from 'lowlight';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import groovy from 'highlight.js/lib/languages/groovy';
import powershell from 'highlight.js/lib/languages/powershell';
import Mermaid from './Mermaid';

/**
 * Coloration syntaxique des blocs de code : les langages courants (c, java, python, sql, bash, yaml,
 * javascript, typescript, markdown…) plus ceux des cours DevOps. Seule la langue annoncée après ```
 * est colorée (pas de détection automatique) ; une langue inconnue, comme mermaid, reste du code simple.
 */
const LANGAGES = { ...common, dockerfile, groovy, powershell };
const ALIAS = { bash: ['sh', 'shell', 'console'], plaintext: ['text', 'txt'], typescript: ['tsx'], javascript: ['jsx'], ini: ['toml'] };

export const plugins = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [[rehypeHighlight, { detect: false, languages: LANGAGES, aliases: ALIAS }]] as never,
};

/** Nœud de l'arbre HTML (hast) produit par react-markdown. */
interface NoeudHast { type: string; tagName?: string; value?: string; properties?: { className?: unknown }; children?: NoeudHast[] }

/** Texte brut d'un nœud hast (contenu d'un bloc de code, avant toute coloration). */
const texteHast = (n: NoeudHast): string => (n.type === 'text' ? n.value ?? '' : (n.children ?? []).map(texteHast).join(''));

/** Le bloc <pre> contient-il un <code class="language-mermaid"> ? Lu dans l'arbre d'origine, plus fiable que l'élément React. */
function codeMermaid(pre?: NoeudHast): string | null {
  const code = pre?.children?.find((c) => c.type === 'element' && c.tagName === 'code');
  const classes = code?.properties?.className;
  const liste = Array.isArray(classes) ? classes.map(String) : typeof classes === 'string' ? classes.split(/\s+/) : [];
  return code && liste.includes('language-mermaid') ? texteHast(code).replace(/\n$/, '') : null;
}

/**
 * Un bloc ```mermaid devient un schéma (pages de cours seulement : le mode Présenter et l'export .pptx
 * utilisent `plugins` sans ces composants, le schéma y reste affiché comme du code).
 */
const COMPOSANTS: Components = {
  pre({ children, node, ...props }) {
    const code = codeMermaid(node as NoeudHast | undefined);
    if (code !== null) return <Mermaid code={code} />;
    return <pre {...props}>{children}</pre>;
  },
};

export default function Markdown({ texte, className = 'prose' }: { texte: string; className?: string }) {
  return <div className={className}><ReactMarkdown {...plugins} components={COMPOSANTS}>{texte}</ReactMarkdown></div>;
}
