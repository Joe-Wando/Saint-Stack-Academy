import type { OrganismeCertif } from '@/lib/api';
import { LOGOS } from '@/lib/pictos-donnees';

/**
 * Logo de l'organisme qui délivre une certification, sur le modèle de PictoSujet.
 * - Logo simple-icons dans sa couleur d'origine, sans modification, 24 px de haut au plus.
 * - Toujours accompagné du nom de l'organisme en texte ; sans logo disponible, le nom seul.
 * - Lien vers le site officiel, dans un nouvel onglet.
 * Il indique seulement OÙ se passe la certification : Saint Stack Academy n'est pas partenaire de l'organisme.
 */
export default function LogoOrganisme({ o, taille = 24 }: { o: OrganismeCertif; taille?: number }) {
  const logo = o.logo ? LOGOS[o.logo] : undefined;
  return (
    <a className="logo-organisme" href={o.site} target="_blank" rel="noopener noreferrer">
      {logo && (
        <svg viewBox="0 0 24 24" width={Math.min(taille, 24)} height={Math.min(taille, 24)} aria-hidden="true" focusable="false">
          <path d={logo.trace} fill={logo.hex} />
        </svg>
      )}
      <span>{o.nom}</span>
      <span className="sr"> (site officiel, nouvel onglet)</span>
    </a>
  );
}

/** « de Cisco », « d’OpenEDG Python Institute ». */
const de = (nom: string) => (/^[aeiouyéèh]/i.test(nom) ? `d’${nom}` : `de ${nom}`);

/** « Délivrée par Cisco et OpenEDG. Saint Stack Academy n’est partenaire ni de Cisco ni d’OpenEDG. » */
export function mentionOrganismes(noms: string[], feminin = true) {
  if (!noms.length) return '';
  const par = noms.length > 1 ? `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}` : noms[0];
  const partenaire = noms.length > 1 ? `n’est partenaire ${noms.map((n) => `ni ${de(n)}`).join(' ')}` : `n’est pas partenaire ${de(noms[0])}`;
  return `Délivré${feminin ? 'e' : ''} par ${par}. Saint Stack Academy ${partenaire}.`;
}
