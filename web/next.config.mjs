import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Le dépôt a aussi un package-lock.json à la racine (outils) : la racine de l'application reste web/.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  reactStrictMode: true,
  // Anciennes adresses (v1) : les favoris et les liens déjà partagés continuent de fonctionner.
  async redirects() {
    return [
      { source: '/tableau-de-bord', destination: '/accueil', permanent: true },
      { source: '/programme', destination: '/licence', permanent: true },
      { source: '/formateur', destination: '/admin', permanent: false },
      { source: '/admin/statistiques', destination: '/admin/cours', permanent: false },
    ];
  },
};
export default nextConfig;
