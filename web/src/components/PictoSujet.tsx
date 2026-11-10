import type { CSSProperties } from 'react';
import type { Sujet } from '@/lib/api';
import { infoDomaine } from '@/lib/domaines';
import { ICONES, LOGOS } from '@/lib/pictos-donnees';

/**
 * Pastille ronde blanche qui indique le sujet d'un cours.
 * - Avec un logo autorisé : le logo simple-icons dans sa couleur d'origine, sans modification.
 * - Sinon : l'icône Lucide (trait de 2 px) dans la couleur d'accent du domaine.
 * Décorative (aria-hidden) : le libellé du sujet est toujours écrit en texte à côté.
 * Sa taille reste inférieure ou égale à celle du titre du cours.
 */
export default function PictoSujet({ sujet, domaine, taille = 40, className = '' }: {
  sujet?: Sujet | null; domaine: string; taille?: number; className?: string;
}) {
  const logo = sujet?.logo ? LOGOS[sujet.logo] : undefined;
  const Icone = ICONES[sujet?.icone ?? ''] ?? ICONES['book-open'];
  const interieur = Math.round(taille * 0.56);
  const style: CSSProperties = { width: taille, height: taille };
  return (
    <span className={`picto-sujet ${className}`} style={style} aria-hidden="true">
      {logo ? (
        <svg viewBox="0 0 24 24" width={interieur} height={interieur} focusable="false">
          <path d={logo.trace} fill={logo.hex} />
        </svg>
      ) : (
        <Icone size={interieur} strokeWidth={2} color={infoDomaine(domaine).accent} focusable="false" />
      )}
    </span>
  );
}
