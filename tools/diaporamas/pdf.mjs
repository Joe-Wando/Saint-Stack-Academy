// Convertit les PowerPoint de web/public/diaporamas/ en PDF, à côté (même nom, extension .pdf).
// Le mode « Présenter » du site affiche ce PDF : c'est le PowerPoint lui-même, page par page.
// Usage : npm run diaporamas:pdf   (après npm run diaporamas ; Docker doit être lancé)
// En production, le web/Dockerfile fait la même conversion pendant la construction.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = dirname(fileURLToPath(import.meta.url));
const dossier = join(ici, '..', '..', 'web', 'public', 'diaporamas');
const IMAGE = 'meredianstack-libreoffice';
if (!existsSync(dossier) || !readdirSync(dossier).some((f) => f.endsWith('.pptx'))) {
  console.error('Aucun PowerPoint dans web/public/diaporamas/ : lance d\'abord npm run diaporamas.');
  process.exit(1);
}

// PDF dont le PowerPoint n'existe plus (cours devenu privé, cours supprimé) : retirés.
const pptx = new Set(readdirSync(dossier).filter((f) => f.endsWith('.pptx')).map((f) => f.slice(0, -5)));
for (const f of readdirSync(dossier).filter((x) => x.endsWith('.pdf'))) if (!pptx.has(f.slice(0, -4))) rmSync(join(dossier, f));

const docker = (args, message) => {
  const r = spawnSync('docker', args, { stdio: 'inherit' });
  if (r.status !== 0) { console.error(message); process.exit(1); }
};
console.log('Image LibreOffice (construite une seule fois, quelques minutes la première fois)…');
docker(['build', '-q', '-t', IMAGE, '-f', join(ici, 'libreoffice.Dockerfile'), ici], 'Construction de l\'image LibreOffice impossible : Docker est-il lancé ?');
console.log(`Conversion de ${pptx.size} PowerPoint en PDF…`);
const debut = Date.now();
docker(['run', '--rm', '-v', `${dossier.replace(/\\/g, '/')}:/d`, IMAGE, 'sh', '-c',
  'soffice -env:UserInstallation=file:///tmp/lo --headless --convert-to pdf --outdir /d /d/*.pptx >/dev/null'],
'Conversion en PDF impossible.');
const nb = readdirSync(dossier).filter((f) => f.endsWith('.pdf')).length;
console.log(`${nb} PDF dans web/public/diaporamas/ (${Math.round((Date.now() - debut) / 1000)} s).`);
if (nb < pptx.size) { console.error(`${pptx.size - nb} PowerPoint n'ont pas été convertis.`); process.exit(1); }
