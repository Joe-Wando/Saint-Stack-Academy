import { MARQUE } from '@/lib/marque.mjs';

/** Monogramme provisoire du site (carré violet « SS »). Ses valeurs viennent de lib/marque.mjs, seul endroit à changer. */
export default function Monogramme() {
  return <span className="logo" aria-hidden="true" style={{ background: MARQUE.fond, color: MARQUE.texte }}>{MARQUE.lettres}</span>;
}
