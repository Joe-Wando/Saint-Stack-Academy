/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Anciennes adresses (v1) : les favoris et les liens déjà partagés continuent de fonctionner.
  async redirects() {
    return [
      { source: '/tableau-de-bord', destination: '/accueil', permanent: true },
      { source: '/programme', destination: '/licence', permanent: true },
      { source: '/formateur', destination: '/admin/statistiques', permanent: false },
    ];
  },
};
export default nextConfig;
