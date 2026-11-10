import type { MetadataRoute } from 'next';
import { MARQUE } from '@/lib/marque.mjs';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: MARQUE.nom,
    short_name: MARQUE.nomCourt,
    description: 'Apprends l’informatique à ton rythme, de la L1 aux métiers.',
    start_url: '/',
    display: 'standalone',
    lang: 'fr',
    theme_color: MARQUE.couleurTheme,
    background_color: MARQUE.couleurFond,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
