'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { common } from 'lowlight';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import groovy from 'highlight.js/lib/languages/groovy';
import powershell from 'highlight.js/lib/languages/powershell';

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

export default function Markdown({ texte, className = 'prose' }: { texte: string; className?: string }) {
  return <div className={className}><ReactMarkdown {...plugins}>{texte}</ReactMarkdown></div>;
}
