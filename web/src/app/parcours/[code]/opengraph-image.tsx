import { imageDefaut, imageGabarit, TAILLE_OG, TYPE_OG } from '@/lib/og';
import { gabaritParcours } from '@/lib/og-donnees';

export const alt = 'Aperçu d’un parcours métier de Saint Stack Academy';
export const size = TAILLE_OG;
export const contentType = TYPE_OG;

/** Image de partage, ou l'image par défaut si l'API ne répond pas. */
export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const g = await gabaritParcours((await params).code).catch(() => null);
  return g ? imageGabarit(g) : imageDefaut();
}
