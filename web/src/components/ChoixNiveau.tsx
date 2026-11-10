'use client';

import { Niveau } from '@/lib/api';

export const OPTIONS_L3 = [
  { code: 'big-data-ia', titre: 'Big Data et intelligence artificielle' },
  { code: 'reseaux-systemes-cloud', titre: 'Réseaux, systèmes et cloud' },
  { code: 'developpement-logiciel', titre: 'Développement logiciel (web et mobile)' },
];
export const titreOption = (code: string | null | undefined) => OPTIONS_L3.find((o) => o.code === code)?.titre ?? null;

const CHOIX: { v: Niveau; titre: string; detail: string }[] = [
  { v: 'L1', titre: 'L1', detail: 'Fondamentaux' },
  { v: 'L2', titre: 'L2', detail: 'Programmation, données, réseaux' },
  { v: 'L3', titre: 'L3', detail: 'Spécialisation' },
  { v: 'autre', titre: 'Autre', detail: 'Autodidacte, reconversion…' },
];

/** Quatre cartes à choisir (boutons radio natifs, donc accessibles au clavier). */
export function CarteNiveaux({ valeur, onChange }: { valeur: Niveau | ''; onChange: (n: Niveau) => void }) {
  return (
    <fieldset className="choix">
      <legend>Ton niveau</legend>
      <div className="choix-grille">
        {CHOIX.map((c) => (
          <label key={c.v} className={`choix-carte${valeur === c.v ? ' on' : ''}`}>
            <input type="radio" name="niveau" value={c.v} checked={valeur === c.v} onChange={() => onChange(c.v)} />
            <strong>{c.titre}</strong>
            <span className="small muted">{c.detail}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function OptionsL3({ valeur, onChange }: { valeur: string; onChange: (o: string) => void }) {
  return (
    <fieldset className="choix">
      <legend>Ton option en L3</legend>
      <div className="choix-liste">
        {OPTIONS_L3.map((o) => (
          <label key={o.code} className={`choix-carte${valeur === o.code ? ' on' : ''}`}>
            <input type="radio" name="optionL3" value={o.code} checked={valeur === o.code} onChange={() => onChange(o.code)} />
            <strong>{o.titre}</strong>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
