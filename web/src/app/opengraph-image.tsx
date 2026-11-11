import { ALT_DEFAUT, imageDefaut, TAILLE_OG, TYPE_OG } from '@/lib/og';

export const alt = ALT_DEFAUT;
export const size = TAILLE_OG;
export const contentType = TYPE_OG;

export default function Image() {
  return imageDefaut();
}
