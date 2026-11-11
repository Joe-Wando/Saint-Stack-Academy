import { urlPhoto } from '@/lib/api';
import { couleurUtilisateur } from '@/lib/domaines';

export function initiales(nom: string) {
  const mots = nom.trim().split(/\s+/).filter(Boolean);
  return ((mots[0]?.[0] ?? '') + (mots.length > 1 ? mots[mots.length - 1][0] : '')).toUpperCase() || '?';
}

/**
 * Photo de profil ronde, ou les initiales si aucune photo.
 * Sans photo : initiales blanches sur la couleur du niveau (L1 vert, L2 bleu, L3 violet, violet foncé sans niveau).
 */
export default function Avatar({ nom, photo, niveau, taille = 36 }: { nom: string; photo?: string | null; niveau?: string | null; taille?: number }) {
  const url = urlPhoto(photo);
  const style = { width: taille, height: taille, fontSize: Math.max(11, Math.round(taille * 0.36)) };
  return url
    ? <img className="avatar avatar-photo" src={url} alt="" width={taille} height={taille} style={style} />
    : <span className="avatar avatar-initiales" aria-hidden="true" style={{ ...style, background: couleurUtilisateur(niveau) }}>{initiales(nom)}</span>;
}
