'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { CONTACT } from '@/lib/contact';

// Une seule lecture du réglage par chargement de page, partagée par toutes les photos.
let promesse: Promise<string | null> | null = null;
export function lirePhotoFondateur(forcer = false) {
  if (!promesse || forcer) {
    promesse = fetch(`${API}/site`).then((r) => r.json()).then((s: { photoFondateur?: string | null }) => s.photoFondateur ?? null).catch(() => null);
  }
  return promesse;
}

/**
 * Portrait du fondateur : la photo choisie dans l'administration, sinon /olivier.jpg.
 * La photo personnalisée est servie par l'API (déjà recadrée et compressée) : next/image ne la retraite pas.
 */
export default function PhotoFondateur({ taille, className, priority = false, sizes, decorative = false }: {
  taille: number; className?: string; priority?: boolean; sizes?: string; decorative?: boolean;
}) {
  const [perso, setPerso] = useState<string | null | undefined>(undefined);
  useEffect(() => { lirePhotoFondateur().then(setPerso); }, []);
  const alt = decorative ? '' : `Portrait d’${CONTACT.fondateur}, développeur et data analyst, fondateur de MeredianStack`;
  if (perso === undefined) return <span className={className} style={{ width: taille, height: taille, display: 'inline-block', background: 'var(--p-clair)' }} aria-hidden="true" />;
  return perso
    ? <Image className={className} src={`${API}/photos/${perso}`} alt={alt} width={taille} height={taille} sizes={sizes ?? `${taille}px`} priority={priority} unoptimized />
    : <Image className={className} src={CONTACT.photo} alt={alt} width={taille} height={taille} sizes={sizes ?? `${taille}px`} priority={priority} />;
}
