// Développement SANS reconstruire d'image Docker : seule la base PostgreSQL tourne dans Docker.
// Usage : npm run dev   (à la racine)
//   1. démarre la base (docker compose up -d db), joignable sur 127.0.0.1:5432 ;
//   2. lance l'API en mode surveillance (recompile et redémarre à chaque modification) sur le port 4000 ;
//   3. lance le site Next.js en mode développement (modifications visibles en 1 à 2 secondes) sur le port 3000.
// Les secrets sont lus dans .env (jamais affichés, jamais commités).
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const fichierEnv = join(racine, '.env');
if (!existsSync(fichierEnv)) { console.error('Fichier .env absent : copie .env.example en .env et remplis-le.'); process.exit(1); }
const env = Object.fromEntries(readFileSync(fichierEnv, 'utf8').split(/\r?\n/)
  .map((l) => /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(l)).filter(Boolean).map(([, k, v]) => [k, v.replace(/^["']|["']$/g, '')]));

// 1. Base de données seule dans Docker.
console.log('[dev] Démarrage de la base de données (Docker)…');
const db = spawnSync('docker', ['compose', 'up', '-d', 'db'], { cwd: racine, stdio: 'inherit', shell: true });
if (db.status !== 0) { console.error('[dev] Impossible de démarrer la base : Docker Desktop est-il lancé ?'); process.exit(1); }
// Les conteneurs api et web libèrent les ports 3000 et 4000.
spawnSync('docker', ['compose', 'stop', 'api', 'web'], { cwd: racine, stdio: 'ignore', shell: true });

const uploads = join(racine, '.donnees', 'uploads');
mkdirSync(uploads, { recursive: true });
const envApi = {
  ...process.env,
  PORT: '4000',
  DATABASE_URL: `postgres://academy:${encodeURIComponent(env.DB_PASSWORD ?? '')}@127.0.0.1:5432/academy`,
  JWT_SECRET: env.JWT_SECRET ?? 'developpement-local',
  ADMIN_EMAIL: env.ADMIN_EMAIL ?? '', FORMATEUR_EMAIL: env.FORMATEUR_EMAIL ?? '',
  SMTP_HOST: env.SMTP_HOST ?? '', SMTP_PORT: env.SMTP_PORT ?? '587', SMTP_USER: env.SMTP_USER ?? '', SMTP_PASS: env.SMTP_PASS ?? '', SMTP_FROM: env.SMTP_FROM ?? '',
  WEB_URL: 'http://localhost:3000', CORS_ORIGIN: 'http://localhost:3000',
  CONTENT_DIR: join(racine, 'content'),
  UPLOADS_DIR: uploads,
};

const lancer = (nom, commande, args, cwd, envProc) => {
  const p = spawn(commande, args, { cwd, env: envProc, shell: true });
  const prefixe = (flux) => flux.on('data', (d) => String(d).split(/\r?\n/).filter(Boolean).forEach((l) => console.log(`[${nom}] ${l}`)));
  prefixe(p.stdout); prefixe(p.stderr);
  p.on('exit', (c) => console.log(`[${nom}] arrêté (code ${c})`));
  return p;
};

// 2. API : compilation TypeScript en continu, puis node --watch qui redémarre quand dist/ change.
const api = join(racine, 'api');
const procs = [lancer('api-tsc', 'npx', ['tsc', '-p', 'tsconfig.json', '--watch', '--preserveWatchOutput'], api, envApi)];
const attendreMain = setInterval(() => {
  if (!existsSync(join(api, 'dist', 'main.js'))) return;
  clearInterval(attendreMain);
  procs.push(lancer('api', 'node', ['--watch-path=dist', 'dist/main.js'], api, envApi));
}, 1000);

// 3. Site : Next.js en mode développement.
procs.push(lancer('web', 'npm', ['run', 'dev'], join(racine, 'web'), { ...process.env, NEXT_PUBLIC_API_URL: 'http://localhost:4000/api', NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' }));

console.log('[dev] Site : http://localhost:3000 · API : http://localhost:4000/api · Ctrl+C pour tout arrêter.');
const arreter = () => { procs.forEach((p) => p.kill()); process.exit(0); };
process.on('SIGINT', arreter);
process.on('SIGTERM', arreter);
