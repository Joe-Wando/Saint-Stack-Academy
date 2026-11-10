import type { ReactNode } from 'react';

/* Éléments décoratifs de la charte Saint Stack : vague, macaron festonné, trait de pinceau, étincelles.
   Tous sont purement décoratifs (aria-hidden) et suivent la couleur du texte (currentColor). */

/** Vague de transition entre deux sections. `haut` : la vague est en haut de la section suivante. */
export function Vague({ className = '', haut = false }: { className?: string; haut?: boolean }) {
  return (
    <svg className={`vague${haut ? ' vague-haut' : ''} ${className}`} viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M0 44c180-38 360-38 540 0s360 38 540 0 270-28 360-14V90H0Z" />
      <path fill="currentColor" opacity=".35" d="M0 60c200-30 420-22 620 4s420 26 560 2 200-22 260-18V90H0Z" />
    </svg>
  );
}

/** Contour à festons arrondis, généré une fois (16 lobes). */
const FESTONS = (() => {
  const n = 16, r = 44, a = 6;
  const pts: string[] = [];
  for (let i = 0; i <= n * 8; i++) {
    const t = (i / (n * 8)) * Math.PI * 2;
    const rr = r + a * Math.cos(n * t);
    pts.push(`${(50 + rr * Math.cos(t)).toFixed(2)},${(50 + rr * Math.sin(t)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
})();

/** Macaron festonné, avec un court texte. */
export function Macaron({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`macaron ${className}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <path d={FESTONS} className="macaron-fond" />
        <circle cx="50" cy="50" r="33" className="macaron-cercle" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

/** Mot souligné d'un trait de pinceau (bleu ciel par défaut). */
export function Souligne({ children }: { children: ReactNode }) {
  return (
    <span className="souligne">
      {children}
      <svg viewBox="0 0 220 16" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M4 11C60 5 150 3 216 8" />
        <path d="M18 14C80 10 150 9 200 12" opacity=".55" />
      </svg>
    </span>
  );
}

/** Trois petites étincelles, pour animer un coin de section. */
export function Etincelles({ className = '' }: { className?: string }) {
  return (
    <svg className={`etincelles ${className}`} viewBox="0 0 60 60" aria-hidden="true" focusable="false">
      <path d="M30 4v14M30 42v14M4 30h14M42 30h14" />
      <path d="M12 12l7 7M41 41l7 7M48 12l-7 7M19 41l-7 7" opacity=".6" />
    </svg>
  );
}
