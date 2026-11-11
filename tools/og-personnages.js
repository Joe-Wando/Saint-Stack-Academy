// Personnages de l'image de partage par défaut (même style que les illustrations : tools/characters2.js).
// Utilisation : node tools/og-personnages.js  → web/assets/og/personnages.svg
// Aucun logo, aucun emoji. Fond transparent : l'image de partage fournit le fond #211F4D.
const fs = require('fs');
const path = require('path');
const { C, person, laptopHeld, blob } = require('./characters2.js');

const W = 460, H = 520;
const contenu = blob(250, 250, 200, C.vio, 0.22)
  + `<ellipse cx="230" cy="500" rx="200" ry="16" fill="#000" opacity=".18"/>`
  + person({ x: 30, y: 60, s: 0.7, pose: 'wave', shirt: C.tea, skin: C.skin3, hair: 'bun', pants: '#3C3489' })
  + person({ x: 220, y: 70, s: 0.68, pose: 'hold', shirt: C.ora, skin: C.skin1, hair: 'short', glasses: true, held: laptopHeld(120, 260) });
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${contenu}</svg>`;
const sortie = path.join(__dirname, '..', 'web', 'assets', 'og', 'personnages.svg');
fs.writeFileSync(sortie, svg);
console.log(`${sortie} : ${(svg.length / 1024).toFixed(1)} Ko`);
