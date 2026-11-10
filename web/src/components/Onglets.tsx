'use client';

import { KeyboardEvent, ReactNode, useRef } from 'react';

/**
 * Onglets accessibles : role="tablist", flèches gauche et droite, Début et Fin.
 * Seul l'onglet actif est dans l'ordre de tabulation.
 */
export default function Onglets({ id, onglets, actif, onChange, children, label }: {
  id: string; label: string; onglets: { cle: string; titre: ReactNode }[]; actif: string; onChange: (cle: string) => void; children: ReactNode;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const i = Math.max(0, onglets.findIndex((o) => o.cle === actif));
  function touche(e: KeyboardEvent) {
    const n = onglets.length;
    const cible = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
    if (cible < 0) return;
    e.preventDefault();
    onChange(onglets[cible].cle);
    refs.current[cible]?.focus();
  }
  return (
    <>
      <div className="onglets" role="tablist" aria-label={label} onKeyDown={touche}>
        {onglets.map((o, k) => (
          <button key={o.cle} ref={(el) => { refs.current[k] = el; }} role="tab" id={`${id}-tab-${o.cle}`}
            aria-selected={o.cle === actif} aria-controls={`${id}-panneau`} tabIndex={o.cle === actif ? 0 : -1}
            className={`onglet${o.cle === actif ? ' on' : ''}`} onClick={() => onChange(o.cle)}>
            {o.titre}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${id}-panneau`} aria-labelledby={`${id}-tab-${actif}`} tabIndex={0} className="panneau">
        {children}
      </div>
    </>
  );
}
