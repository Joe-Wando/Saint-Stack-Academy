import { imageDefaut, imageGabarit, TAILLE_OG, TYPE_OG } from '@/lib/og';
import { gabaritNiveau } from '@/lib/og-donnees';

export const alt = 'Aperçu d’un niveau de licence sur MeredianStack';
export const size = TAILLE_OG;
export const contentType = TYPE_OG;

/** Image de partage, ou l'image par défaut si l'API ne répond pas. */
export default async function Image({ params }: { params: Promise<{ niveau: string }> }) {
  const g = await gabaritNiveau((await params).niveau).catch(() => null);
  return g ? imageGabarit(g) : imageDefaut();
}
