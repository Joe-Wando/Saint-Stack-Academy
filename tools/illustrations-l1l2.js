// Illustrations (SVG 960 x 540) des quatre domaines ajoutés avec les cours de L1 et L2.
// Utilisation : node tools/illustrations-l1l2.js  → web/public/illustrations/<cle>.svg
const fs = require('fs');
const path = require('path');
const { C, shade, person, seated, plant, laptopHeld, blob, bubble } = require('./characters2.js');

const W = 960, H = 540;
const F = 'Inter,Arial,sans-serif';
const M = 'JetBrains Mono,Consolas,monospace';
const fond = (couleur) => `<rect width="${W}" height="${H}" fill="${shade(couleur, 0.86)}"/>
${blob(830, 90, 150, couleur, 0.16)}${blob(110, 470, 130, couleur, 0.12)}
<rect x="0" y="470" width="${W}" height="70" fill="${shade(couleur, 0.74)}"/>`;
const svg = (contenu) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${contenu}</svg>`;

// Un éditeur de code avec quelques lignes de C colorées
const editeur = (x, y, w, h, accent) => {
  const lignes = [
    [['#include <stdio.h>', C.tea]],
    [],
    [['int ', C.vio], ['main', C.blu], ['(void) {', C.ink]],
    [['    for ', C.vio], ['(int i = 0; i < 3; i++)', C.ink]],
    [['        printf', C.blu], ['(', C.ink], ['"Bonjour\\n"', C.ora], [');', C.ink]],
    [['    return ', C.vio], ['0;', C.ink]],
    [['}', C.ink]],
  ];
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const texte = lignes.map((l, i) => `<text x="74" y="${92 + i * 36}" font-family="${M}" font-size="21" xml:space="preserve">${l.map(([t, c]) => `<tspan fill="${c}">${esc(t)}</tspan>`).join('')}</text>`).join('');
  const numeros = lignes.map((_, i) => `<text x="40" y="${92 + i * 36}" font-family="${M}" font-size="18" fill="#9AAAA3" text-anchor="end">${i + 1}</text>`).join('');
  return `<g transform="translate(${x},${y})"><rect width="${w}" height="${h}" rx="18" fill="#fff" stroke="${C.line}" stroke-width="3"/>
<rect width="${w}" height="40" rx="18" fill="${shade(accent, 0.7)}"/><rect y="22" width="${w}" height="18" fill="${shade(accent, 0.7)}"/>
<circle cx="26" cy="20" r="7" fill="${C.ora}"/><circle cx="48" cy="20" r="7" fill="${C.gold}"/><circle cx="70" cy="20" r="7" fill="${C.mint}"/>
<text x="${w / 2}" y="27" font-family="${F}" font-size="16" font-weight="600" fill="${shade(accent, -0.4)}" text-anchor="middle">main.c</text>
<rect x="0" y="40" width="54" height="${h - 40}" fill="${C.soft}"/>${numeros}${texte}</g>`;
};

// Un tableau blanc avec un diagramme de Venn, une table de vérité et une formule
const tableau = (x, y) => `<g transform="translate(${x},${y})"><rect width="500" height="330" rx="16" fill="#fff" stroke="${C.line}" stroke-width="4"/>
<rect x="-10" y="318" width="520" height="16" rx="8" fill="${C.navy}"/>
<circle cx="120" cy="120" r="70" fill="${C.blu}" opacity=".35"/><circle cx="200" cy="120" r="70" fill="${C.gold}" opacity=".45"/>
<text x="90" y="128" font-family="${F}" font-size="28" font-weight="700" fill="${C.ink}">A</text><text x="218" y="128" font-family="${F}" font-size="28" font-weight="700" fill="${C.ink}">B</text>
<g font-family="${M}" font-size="20" fill="${C.ink}"><text x="320" y="70">A B |A·B</text><text x="320" y="102">0 0 | 0</text><text x="320" y="132">0 1 | 0</text><text x="320" y="162">1 0 | 0</text><text x="320" y="192">1 1 | 1</text></g>
<text x="40" y="270" font-family="${F}" font-size="30" font-weight="700" fill="${shade(C.vio, -0.3)}">C(n, k) = n! / (k!(n − k)!)</text></g>`;

// Une tour de PC ouverte : carte mère, processeur, RAM, SSD, alimentation
const tour = (x, y) => `<g transform="translate(${x},${y})"><rect width="300" height="390" rx="18" fill="${C.navy}"/>
<rect x="18" y="18" width="264" height="354" rx="10" fill="#2E3F5E"/>
<rect x="40" y="36" width="200" height="220" rx="8" fill="${C.tea}"/>
<rect x="88" y="66" width="70" height="70" rx="6" fill="#D7DEDB"/><rect x="100" y="78" width="46" height="46" rx="4" fill="#9AA6A1"/>
${[0, 1, 2, 3].map(i => `<rect x="${178 + i * 14}" y="56" width="9" height="120" rx="3" fill="${i % 2 ? C.gold : '#1B2A44'}"/>`).join('')}
<rect x="62" y="166" width="96" height="22" rx="4" fill="#1B2A44"/><rect x="70" y="172" width="80" height="10" rx="3" fill="${C.mint}"/>
<rect x="60" y="206" width="170" height="26" rx="5" fill="#1B2A44"/>
<rect x="40" y="280" width="220" height="74" rx="8" fill="#41526F"/><circle cx="104" cy="317" r="26" fill="#2E3F5E"/><circle cx="104" cy="317" r="8" fill="#41526F"/>
<text x="196" y="324" font-family="${F}" font-size="16" font-weight="700" fill="#C9D3E3" text-anchor="middle">PSU</text></g>`;

// Un tournevis tenu en main
const tournevis = (cx, cy) => `<g transform="translate(${cx},${cy}) rotate(-35)"><rect x="-10" y="-60" width="20" height="62" rx="8" fill="${C.ora}"/><rect x="-3" y="0" width="6" height="58" rx="2" fill="#9AA6A1"/></g>`;

// Un CV et une bulle de dialogue pour les compétences professionnelles
const cv = (x, y) => `<g transform="translate(${x},${y}) rotate(4)"><rect width="230" height="300" rx="14" fill="#fff" stroke="${C.line}" stroke-width="3"/>
<circle cx="56" cy="62" r="30" fill="${shade(C.tea, 0.4)}"/><circle cx="56" cy="54" r="12" fill="${C.skin2}"/><path d="M34 84 Q56 64 78 84" fill="${C.tea}"/>
<rect x="102" y="44" width="104" height="14" rx="7" fill="${C.ink}"/><rect x="102" y="68" width="74" height="10" rx="5" fill="#B9C6C0"/>
${[0, 1, 2, 3, 4].map(i => `<rect x="26" y="${118 + i * 34}" width="${[178, 150, 168, 120, 160][i]}" height="12" rx="6" fill="${i === 0 || i === 3 ? C.tea : '#D3DDD8'}"/>`).join('')}</g>`;

const scenes = {
  programmation: () => fond(C.vio) + editeur(360, 70, 540, 330, C.vio)
    + seated({ x: 10, y: 120, s: 0.82, shirt: C.vio, skin: C.skin1, hair: 'afro', screen: C.blu })
    + plant(880, 470, 0.7),

  mathematiques: () => fond(C.blu) + tableau(400, 60)
    + person({ x: 130, y: 80, s: 0.7, pose: 'point', shirt: C.blu, skin: C.skin3, hair: 'bun', glasses: true }),

  materiel: () => fond(C.tea) + tour(560, 70)
    + person({ x: 200, y: 80, s: 0.7, pose: 'present', shirt: C.tea, skin: C.skin2, hair: 'short', beard: true })
    + tournevis(378, 236) + bubble(380, 50, 150, 'POST OK', C.tea) + plant(90, 470, 0.8),

  competences: () => fond(C.ora) + cv(640, 90)
    + person({ x: 90, y: 80, s: 0.66, pose: 'present', shirt: C.ora, skin: C.skin1, hair: 'long' })
    + person({ x: 380, y: 90, s: 0.64, pose: 'hold', flip: true, shirt: C.navy, skin: C.skin3, hair: 'short', glasses: true, held: laptopHeld(120, 260) })
    + bubble(250, 40, 280, 'Tell me about yourself', C.ora, false),
};

const dossier = path.join(__dirname, '..', 'web', 'public', 'illustrations');
fs.mkdirSync(dossier, { recursive: true });
for (const [cle, f] of Object.entries(scenes)) fs.writeFileSync(path.join(dossier, `${cle}.svg`), svg(f()));
console.log('Illustrations :', Object.keys(scenes).join(', '));
