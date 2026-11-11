// Copie la version autonome de mermaid (licence MIT) dans public/vendor/mermaid/ avant chaque build.
// Le fichier est chargé par <script> uniquement sur les pages qui contiennent un schéma :
// webpack n'a pas à empaqueter mermaid et ses dizaines de dépendances (builds beaucoup plus rapides).
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(web, 'node_modules', 'mermaid');
const cible = join(web, 'public', 'vendor', 'mermaid');
mkdirSync(cible, { recursive: true });
copyFileSync(join(source, 'dist', 'mermaid.min.js'), join(cible, 'mermaid.min.js'));
copyFileSync(join(source, 'LICENSE'), join(cible, 'LICENSE'));
const { version } = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8'));
console.log(`mermaid ${version} copié dans public/vendor/mermaid/`);
