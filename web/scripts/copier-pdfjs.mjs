// Copie pdf.js (licence Apache 2.0) dans public/vendor/pdfjs/ avant chaque build.
// Le mode « Présenter » l'importe seulement quand on l'ouvre, pour afficher le PDF du PowerPoint :
// webpack n'a pas à l'empaqueter. Les PDF produits par LibreOffice intègrent leurs polices :
// les dossiers cmaps/ et standard_fonts/ ne sont pas nécessaires.
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(web, 'node_modules', 'pdfjs-dist');
const cible = join(web, 'public', 'vendor', 'pdfjs');
mkdirSync(cible, { recursive: true });
for (const f of ['pdf.min.mjs', 'pdf.worker.min.mjs']) copyFileSync(join(source, 'build', f), join(cible, f));
copyFileSync(join(source, 'LICENSE'), join(cible, 'LICENSE'));
const { version } = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8'));
console.log(`pdf.js ${version} copié dans public/vendor/pdfjs/`);
