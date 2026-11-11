import type { Sujet } from '@/lib/api';
import { illustration, niveauCours } from '@/lib/domaines';
import PictoSujet from './PictoSujet';

type PlaceLicence = { niveau: string; semestre: string; option?: string };

/**
 * Visuel d'un cours, composé de trois éléments :
 * 1. le fond : l'illustration du domaine (décorative, alt="") ;
 * 2. un ruban de niveau en haut à gauche (« L1 · S1 », « L3 · Big Data et IA », « Parcours »), en texte réel ;
 * 3. la pastille du sujet en bas à droite, à cheval sur le bord de l'image.
 * Aucun titre n'est écrit dans l'image : il reste en HTML à côté.
 */
export default function VisuelCours({ domaine, sujet, licence, classeImage, taillePicto = 44, prioritaire = false }: {
  domaine: string; sujet?: Sujet | null; licence?: PlaceLicence[] | null; classeImage: string; taillePicto?: number; prioritaire?: boolean;
}) {
  const n = niveauCours(licence);
  return (
    <div className="visuel-cours">
      <div className={classeImage}>
        <img src={illustration(domaine)} alt="" width={960} height={540} loading={prioritaire ? 'eager' : 'lazy'} />
      </div>
      <span className={`ruban-niveau${n.option ? ' ruban-option' : ''}`} style={{ background: n.couleur }}>{n.libelle}</span>
      <PictoSujet sujet={sujet} domaine={domaine} taille={taillePicto} className="visuel-picto" />
    </div>
  );
}
