import type { ReactNode } from 'react';

/** Bloc « rien ici pour l'instant » : une petite illustration décorative et un texte qui porte l'information. */
export default function EtatVide({ image, titre, children }: { image: string; titre: string; children?: ReactNode }) {
  return (
    <div className="etat-vide">
      <img src={image} alt="" width={480} height={360} loading="lazy" />
      <div>
        <p className="etat-vide-titre">{titre}</p>
        {children}
      </div>
    </div>
  );
}
