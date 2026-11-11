// Illustrations des pages (niveaux, options de L3, parcours, bienvenue, pages vides, 404, contact, certifications).
// Même style que les illustrations existantes : personnages de tools/characters2.js, fond éclairci, deux blobs, un sol.
// Utilisation : node tools/illustrations-pages.js  → web/public/illustrations/pages/<nom>.svg
// Aucune bibliothèque d'illustrations externe, aucun logo, aucun emoji.
const fs = require('fs');
const path = require('path');
const { C, shade, person, seated, browser, rack, plant, laptopHeld, phoneHeld, blob, bubble } = require('./characters2.js');

const F = 'Inter,Arial,sans-serif';
const M = 'JetBrains Mono,Consolas,monospace';
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Couleurs des niveaux (les mêmes que web/src/lib/contenu.mjs).
const N = { L1: '#0F7B5F', L2: '#185FA5', L3: '#534AB7', bigdata: '#A04D08', reseaux: '#0E6A84', logiciel: '#9D2E5C' };

// ---------- Cadre commun ----------
const fond = (couleur, W = 960, H = 540) => `<rect width="${W}" height="${H}" fill="${shade(couleur, 0.86)}"/>
${blob(W * 0.865, H * 0.17, W * 0.156, couleur, 0.16)}${blob(W * 0.115, H * 0.87, W * 0.135, couleur, 0.12)}
<rect x="0" y="${H * 0.87}" width="${W}" height="${H * 0.13}" fill="${shade(couleur, 0.74)}"/>`;
const svg = (contenu, W = 960, H = 540) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${contenu}</svg>`;

// ---------- Objets ----------
/** Écran ou fenêtre avec des lignes de texte en police à chasse fixe. */
const fenetreTexte = (x, y, w, h, titre, lignes, accent, sombre = false) => {
  const fondF = sombre ? '#13302A' : '#fff';
  const barre = sombre ? '#0B1F1A' : shade(accent, 0.7);
  return `<g transform="translate(${x},${y})"><rect width="${w}" height="${h}" rx="16" fill="${fondF}" stroke="${sombre ? '#0B1F1A' : C.line}" stroke-width="3"/>
<rect width="${w}" height="38" rx="16" fill="${barre}"/><rect y="22" width="${w}" height="16" fill="${barre}"/>
<circle cx="24" cy="19" r="6.5" fill="${C.ora}"/><circle cx="45" cy="19" r="6.5" fill="${C.gold}"/><circle cx="66" cy="19" r="6.5" fill="${C.mint}"/>
${titre ? `<text x="${w / 2}" y="26" font-family="${F}" font-size="15" font-weight="600" fill="${sombre ? '#9FC9BB' : shade(accent, -0.4)}" text-anchor="middle">${esc(titre)}</text>` : ''}
${lignes.map((l, i) => `<text x="22" y="${74 + i * 32}" font-family="${M}" font-size="19" xml:space="preserve">${(Array.isArray(l) ? l : [[l, sombre ? C.mint : C.ink]]).map(([t, c]) => `<tspan fill="${c}">${esc(t)}</tspan>`).join('')}</text>`).join('')}</g>`;
};

/** Tour de PC ouverte (carte mère, processeur, mémoire, alimentation). */
const tour = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><rect width="240" height="320" rx="16" fill="${C.navy}"/>
<rect x="14" y="14" width="212" height="292" rx="10" fill="#2E3F5E"/>
<rect x="32" y="30" width="160" height="180" rx="8" fill="${C.tea}"/>
<rect x="70" y="54" width="58" height="58" rx="6" fill="#D7DEDB"/><rect x="80" y="64" width="38" height="38" rx="4" fill="#9AA6A1"/>
${[0, 1, 2, 3].map((i) => `<rect x="${142 + i * 11}" y="46" width="7" height="100" rx="3" fill="${i % 2 ? C.gold : '#1B2A44'}"/>`).join('')}
<rect x="50" y="138" width="80" height="18" rx="4" fill="#1B2A44"/><rect x="56" y="143" width="66" height="8" rx="3" fill="${C.mint}"/>
<rect x="32" y="230" width="176" height="60" rx="8" fill="#41526F"/><circle cx="84" cy="260" r="20" fill="#2E3F5E"/><circle cx="84" cy="260" r="6" fill="#41526F"/></g>`;

/** Tableau noir avec des chiffres binaires. */
const tableauBinaire = (x, y) => `<g transform="translate(${x},${y})"><rect width="260" height="170" rx="12" fill="#1F3D33" stroke="#A88358" stroke-width="8"/>
<g font-family="${M}" font-size="26" fill="#E6F2EC"><text x="24" y="52">0 1 1 0</text><text x="24" y="92">1 0 0 1</text><text x="24" y="132">1 1 0 1</text></g>
<text x="168" y="92" font-family="${M}" font-size="22" fill="${C.gold}">= 13</text></g>`;

/** Cylindre de base de données. */
const cylindre = (x, y, w, h, couleur) => `<g transform="translate(${x},${y})">
<path d="M0 ${w * 0.16} L0 ${h - w * 0.16} A${w / 2} ${w * 0.16} 0 0 0 ${w} ${h - w * 0.16} L${w} ${w * 0.16} Z" fill="${couleur}"/>
<path d="M0 ${h * 0.45} A${w / 2} ${w * 0.16} 0 0 0 ${w} ${h * 0.45}" stroke="${shade(couleur, -0.25)}" stroke-width="3" fill="none"/>
<ellipse cx="${w / 2}" cy="${w * 0.16}" rx="${w / 2}" ry="${w * 0.16}" fill="${shade(couleur, 0.35)}"/></g>`;

/** Schéma de classes : deux boîtes reliées. */
const schemaClasses = (x, y, accent) => {
  const boite = (bx, by, nom, attrs) => `<g transform="translate(${bx},${by})"><rect width="150" height="${44 + attrs.length * 24}" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
<rect width="150" height="34" rx="8" fill="${shade(accent, 0.7)}"/><rect y="26" width="150" height="8" fill="${shade(accent, 0.7)}"/>
<text x="75" y="23" font-family="${F}" font-size="16" font-weight="700" fill="${shade(accent, -0.4)}" text-anchor="middle">${nom}</text>
${attrs.map((a, i) => `<text x="12" y="${56 + i * 24}" font-family="${M}" font-size="14" fill="${C.ink}">${esc(a)}</text>`).join('')}</g>`;
  return `<g transform="translate(${x},${y})">${boite(0, 0, 'Etudiant', ['nom', 'email'])}${boite(200, 40, 'Cours', ['titre', 'duree'])}
<path d="M150 50 L200 80" stroke="${C.ink}" stroke-width="2.5"/><text x="160" y="56" font-family="${F}" font-size="13" fill="${C.ink}">*</text></g>`;
};

/** Tableau Kanban à trois colonnes. */
const kanban = (x, y, accent) => {
  const cols = [['A faire', 3], ['En cours', 2], ['Fait', 2]];
  return `<g transform="translate(${x},${y})"><rect width="420" height="270" rx="14" fill="#fff" stroke="${C.line}" stroke-width="3"/>
${cols.map(([t, n], i) => `<g transform="translate(${16 + i * 134},18)"><text x="0" y="16" font-family="${F}" font-size="15" font-weight="700" fill="${shade(accent, -0.35)}">${t}</text>
<rect y="26" width="122" height="214" rx="10" fill="${C.soft}"/>
${Array.from({ length: n }, (_, k) => `<rect x="10" y="${40 + k * 62}" width="102" height="50" rx="8" fill="${[C.gold, accent, C.mint][i]}" opacity="${i === 1 ? 0.85 : 1}"/>
<rect x="20" y="${52 + k * 62}" width="${60 + (k * 13) % 24}" height="7" rx="3" fill="#fff" opacity=".85"/><rect x="20" y="${66 + k * 62}" width="40" height="7" rx="3" fill="#fff" opacity=".6"/>`).join('')}</g>`).join('')}</g>`;
};

/** Macaron festonné (même forme que le composant Macaron de Decor.tsx). */
const FESTONS = (() => {
  const n = 16, r = 44, a = 6; const pts = [];
  for (let i = 0; i <= n * 8; i++) { const t = (i / (n * 8)) * Math.PI * 2; const rr = r + a * Math.cos(n * t); pts.push(`${(50 + rr * Math.cos(t)).toFixed(1)},${(50 + rr * Math.sin(t)).toFixed(1)}`); }
  return `M${pts.join('L')}Z`;
})();
const macaron = (cx, cy, taille, couleur, texte = '', rot = -10) => `<g transform="translate(${cx - taille / 2},${cy - taille / 2}) rotate(${rot} ${taille / 2} ${taille / 2}) scale(${taille / 100})">
<path d="${FESTONS}" fill="${couleur}"/><circle cx="50" cy="50" r="33" fill="none" stroke="${C.ink}" stroke-width="1.2" stroke-dasharray="3 3" opacity=".5"/>
${texte ? `<text x="50" y="55" font-family="${F}" font-size="13" font-weight="800" fill="${C.ink}" text-anchor="middle">${esc(texte)}</text>` : ''}</g>`;

/** Certificat générique, sans aucun logo. */
const certificat = (x, y, w, accent, rot = 0) => {
  const h = w * 0.72;
  return `<g transform="translate(${x},${y}) rotate(${rot} ${w / 2} ${h / 2})"><rect width="${w}" height="${h}" rx="10" fill="#fff" stroke="${shade(accent, 0.2)}" stroke-width="4"/>
<rect x="12" y="12" width="${w - 24}" height="${h - 24}" rx="6" fill="none" stroke="${shade(accent, 0.55)}" stroke-width="2"/>
<rect x="${w * 0.22}" y="${h * 0.18}" width="${w * 0.56}" height="${h * 0.08}" rx="4" fill="${shade(accent, -0.1)}"/>
<rect x="${w * 0.15}" y="${h * 0.36}" width="${w * 0.7}" height="${h * 0.05}" rx="3" fill="#CFDAD4"/><rect x="${w * 0.25}" y="${h * 0.46}" width="${w * 0.5}" height="${h * 0.05}" rx="3" fill="#CFDAD4"/>
<path d="M${w * 0.12} ${h * 0.78} L${w * 0.4} ${h * 0.78}" stroke="${C.ink}" stroke-width="2" opacity=".5"/>
${macaron(w * 0.76, h * 0.74, w * 0.22, C.gold, '', 0)}</g>`;
};

/** Petit graphique en barres et courbe pour un tableau de bord. */
const tableauDeBord = (x, y, w, h, accent) => `<g transform="translate(${x},${y})"><rect width="${w}" height="${h}" rx="16" fill="#fff" stroke="${C.line}" stroke-width="3"/>
<rect x="18" y="18" width="${w * 0.28}" height="54" rx="10" fill="${shade(accent, 0.8)}"/><rect x="30" y="32" width="50" height="10" rx="4" fill="${accent}"/><rect x="30" y="50" width="80" height="8" rx="4" fill="#CFDAD4"/>
<rect x="${w * 0.36}" y="18" width="${w * 0.28}" height="54" rx="10" fill="${shade(C.tea, 0.8)}"/><rect x="${w * 0.36 + 12}" y="32" width="50" height="10" rx="4" fill="${C.tea}"/>
<rect x="${w * 0.69}" y="18" width="${w * 0.27}" height="54" rx="10" fill="${shade(C.gold, 0.7)}"/><rect x="${w * 0.69 + 12}" y="32" width="50" height="10" rx="4" fill="${C.gold}"/>
${[0.45, 0.7, 0.55, 0.85, 0.65, 0.95].map((v, i) => `<rect x="${24 + i * (w * 0.5 / 6)}" y="${h - 24 - (h - 120) * v}" width="${w * 0.5 / 6 - 10}" height="${(h - 120) * v}" rx="5" fill="${i % 2 ? accent : shade(accent, 0.4)}"/>`).join('')}
<path d="M${w * 0.6} ${h - 50} L${w * 0.7} ${h - 90} L${w * 0.8} ${h - 70} L${w * 0.92} ${h - 130}" stroke="${C.tea}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
${[[0.6, 50], [0.7, 90], [0.8, 70], [0.92, 130]].map(([a, b]) => `<circle cx="${w * a}" cy="${h - b}" r="7" fill="#fff" stroke="${C.tea}" stroke-width="4"/>`).join('')}</g>`;

/** Petit réseau de neurones : trois couches reliées. */
const reseauNeurones = (x, y, accent) => {
  const couches = [[0, [30, 90, 150]], [110, [10, 70, 130, 190]], [220, [60, 120]]];
  let liens = '';
  for (let c = 0; c < couches.length - 1; c++) for (const a of couches[c][1]) for (const b of couches[c + 1][1]) liens += `<path d="M${couches[c][0]} ${a} L${couches[c + 1][0]} ${b}" stroke="${shade(accent, 0.3)}" stroke-width="2"/>`;
  const noeuds = couches.map(([cx, ys], c) => ys.map((cy) => `<circle cx="${cx}" cy="${cy}" r="15" fill="${c === 1 ? accent : '#fff'}" stroke="${accent}" stroke-width="4"/>`).join('')).join('');
  return `<g transform="translate(${x},${y})">${liens}${noeuds}</g>`;
};

/** Nuage. */
const nuage = (x, y, s, couleur) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M40 100 Q0 100 4 66 Q8 36 44 40 Q54 4 96 6 Q136 8 144 44 Q184 40 186 74 Q188 102 154 102 Z" fill="${couleur}"/></g>`;

/** Téléphone posé ou tenu, avec un écran d'application. */
const telephone = (x, y, s, accent, rot = 0) => `<g transform="translate(${x},${y}) scale(${s}) rotate(${rot} 60 110)"><rect width="120" height="220" rx="20" fill="#0B1A14"/><rect x="8" y="12" width="104" height="196" rx="12" fill="#fff"/>
<rect x="18" y="24" width="84" height="40" rx="8" fill="${accent}"/><rect x="18" y="74" width="84" height="12" rx="5" fill="${C.line}"/><rect x="18" y="94" width="60" height="12" rx="5" fill="${C.line}"/>
<rect x="18" y="118" width="38" height="38" rx="8" fill="${shade(accent, 0.6)}"/><rect x="64" y="118" width="38" height="38" rx="8" fill="${shade(C.gold, 0.4)}"/>
<rect x="30" y="172" width="60" height="22" rx="11" fill="${accent}"/></g>`;

/** Fusée. */
const fusee = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})">
<path d="M40 150 Q20 180 34 210 Q46 186 52 170 Z" fill="${C.ora}"/><path d="M60 150 Q80 180 66 210 Q54 186 48 170 Z" fill="${C.gold}"/>
<path d="M50 0 Q86 40 82 120 L18 120 Q14 40 50 0Z" fill="#fff" stroke="${C.navy}" stroke-width="4"/>
<circle cx="50" cy="62" r="15" fill="${C.blu}" stroke="${C.navy}" stroke-width="4"/>
<path d="M18 92 L0 132 L20 124 Z M82 92 L100 132 L80 124 Z" fill="${C.ora}"/><rect x="26" y="120" width="48" height="16" rx="6" fill="${C.navy}"/></g>`;

/** Flèche horizontale. */
const fleche = (x1, y1, x2, couleur = C.ink) => `<path d="M${x1} ${y1} L${x2 - 4} ${y1} M${x2 - 18} ${y1 - 12} L${x2} ${y1} L${x2 - 18} ${y1 + 12}" stroke="${couleur}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

/** Boîte d'étape (Code, Build...). */
const etape = (x, y, texte, couleur, w = 120) => `<g transform="translate(${x},${y})"><rect width="${w}" height="64" rx="12" fill="#fff" stroke="${couleur}" stroke-width="4"/><rect width="${w}" height="12" rx="6" fill="${couleur}"/>
<text x="${w / 2}" y="44" font-family="${F}" font-size="19" font-weight="700" fill="${shade(couleur, -0.35)}" text-anchor="middle">${texte}</text></g>`;

/** Marches L1, L2, L3. */
const marches = (x, y) => [['L1', N.L1, 0], ['L2', N.L2, 1], ['L3', N.L3, 2]].map(([t, c, i]) => `<g transform="translate(${x + i * 170},${y - i * 70})">
<rect width="170" height="${70 + i * 70}" fill="${c}"/><rect width="170" height="14" fill="${shade(c, 0.25)}"/>
<text x="85" y="56" font-family="${F}" font-size="30" font-weight="800" fill="#fff" text-anchor="middle">${t}</text></g>`).join('');

/** Feuille d'exercice, crayon, case « Correction » et quiz. */
const feuilleExercice = (x, y, accent) => `<g transform="translate(${x},${y}) rotate(-3)"><rect width="250" height="320" rx="12" fill="#fff" stroke="${C.line}" stroke-width="3"/>
<text x="24" y="44" font-family="${F}" font-size="20" font-weight="800" fill="${shade(accent, -0.35)}">Exercice 2</text>
${[0, 1, 2, 3].map((i) => `<rect x="24" y="${66 + i * 24}" width="${[200, 170, 190, 120][i]}" height="9" rx="4" fill="#CFDAD4"/>`).join('')}
<rect x="24" y="172" width="200" height="54" rx="10" fill="${shade(C.mint, 0.6)}" stroke="${C.tea}" stroke-width="2" stroke-dasharray="6 5"/>
<text x="124" y="206" font-family="${F}" font-size="18" font-weight="700" fill="${shade(C.tea, -0.45)}" text-anchor="middle">Correction</text>
${[0, 1, 2].map((i) => `<g transform="translate(24,${246 + i * 24})"><rect width="16" height="16" rx="4" fill="${i === 1 ? accent : '#fff'}" stroke="${accent}" stroke-width="2.5"/>
${i === 1 ? '<path d="M3 8 L7 12 L13 4" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>' : ''}<rect x="26" y="4" width="${[120, 150, 100][i]}" height="8" rx="4" fill="#CFDAD4"/></g>`).join('')}</g>`;
const crayon = (x, y, rot = 35) => `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="-9" y="-90" width="18" height="110" rx="3" fill="${C.gold}"/><rect x="-9" y="-104" width="18" height="16" rx="4" fill="${C.ora}"/>
<path d="M-9 20 L9 20 L0 40 Z" fill="#E8C9A0"/><path d="M-3 32 L3 32 L0 40 Z" fill="${C.ink}"/></g>`;

/** Panneau indicateur. */
const panneau = (x, y, texte, couleur) => `<g transform="translate(${x},${y})"><rect x="68" y="60" width="16" height="220" rx="4" fill="#A88358"/>
<path d="M0 0 L140 0 L170 40 L140 80 L0 80 Z" fill="${couleur}"/><text x="70" y="56" font-family="${F}" font-size="44" font-weight="800" fill="#fff" text-anchor="middle">${esc(texte)}</text></g>`;

/** Sac à dos et livre fermé (aucun cours commencé). */
const sacADos = (x, y, accent) => `<g transform="translate(${x},${y})"><path d="M40 20 Q40 0 80 0 Q120 0 120 20" stroke="${shade(accent, -0.3)}" stroke-width="10" fill="none"/>
<rect x="20" y="16" width="120" height="150" rx="30" fill="${accent}"/><rect x="40" y="86" width="80" height="60" rx="14" fill="${shade(accent, -0.18)}"/><rect x="60" y="80" width="40" height="10" rx="5" fill="${shade(accent, 0.4)}"/></g>`;
const livreFerme = (x, y, couleur) => `<g transform="translate(${x},${y}) rotate(-6)"><rect width="120" height="150" rx="8" fill="${couleur}"/><rect x="0" width="16" height="150" rx="6" fill="${shade(couleur, -0.25)}"/>
<rect x="104" y="6" width="12" height="138" fill="#fff" opacity=".9"/><rect x="34" y="40" width="58" height="10" rx="4" fill="#fff" opacity=".8"/><rect x="34" y="60" width="42" height="8" rx="4" fill="#fff" opacity=".6"/></g>`;

/** Loupe. */
const loupe = (x, y, s, couleur) => `<g transform="translate(${x},${y}) scale(${s})"><circle cx="50" cy="50" r="42" fill="#fff" fill-opacity=".5" stroke="${couleur}" stroke-width="12"/>
<path d="M82 82 L130 130" stroke="${shade(couleur, -0.3)}" stroke-width="18" stroke-linecap="round"/></g>`;

/** Bulle de discussion. */
const bulleDiscussion = (x, y, w, h, couleur, lignes = 2) => `<g transform="translate(${x},${y})"><path d="M0 16 Q0 0 16 0 L${w - 16} 0 Q${w} 0 ${w} 16 L${w} ${h - 16} Q${w} ${h} ${w - 16} ${h} L40 ${h} L16 ${h + 22} L20 ${h} L16 ${h} Q0 ${h} 0 ${h - 16} Z" fill="${couleur}"/>
${Array.from({ length: lignes }, (_, i) => `<rect x="20" y="${20 + i * 22}" width="${(w - 40) * (i === lignes - 1 ? 0.6 : 1)}" height="9" rx="4" fill="#fff" opacity=".85"/>`).join('')}</g>`;

/** Boucle infinie. */
const infini = (cx, cy, s, couleur) => `<g transform="translate(${cx},${cy}) scale(${s})"><path d="M0 0 C-40 -50 -100 -50 -100 0 C-100 50 -40 50 0 0 C40 -50 100 -50 100 0 C100 50 40 50 0 0Z" fill="none" stroke="${couleur}" stroke-width="14" stroke-linecap="round"/></g>`;

// ---------- Scènes ----------
const scenes = {
  'niveau-l1': () => fond(N.L1) + tour(680, 150, 0.9) + tableauBinaire(390, 250)
    + fenetreTexte(330, 70, 250, 150, 'main.c', [[['printf', C.blu], ['("Bonjour");', C.ink]]], N.L1)
    + person({ x: 40, y: 70, s: 0.68, pose: 'point', shirt: C.ora, skin: C.skin3, hair: 'long', skirt: true, pants: N.L1 })
    + person({ x: 200, y: 80, s: 0.66, pose: 'hold', shirt: N.L1, skin: C.skin1, hair: 'short', glasses: true, held: laptopHeld(120, 260) })
    + plant(890, 470, 0.6),

  'niveau-l2': () => fond(N.L2) + browser(330, 50, 330, 230, N.L2) + schemaClasses(560, 300, N.L2) + cylindre(800, 120, 110, 150, C.tea)
    + person({ x: 40, y: 80, s: 0.68, pose: 'present', shirt: N.L2, skin: C.skin2, hair: 'bun' })
    + person({ x: 190, y: 90, s: 0.64, pose: 'phone', shirt: C.gold, skin: C.skin3, hair: 'afro', held: phoneHeld(150, 214, N.L2) }),

  'niveau-l3': () => fond(N.L3) + kanban(380, 60, N.L3) + macaron(860, 110, 130, C.gold, 'DIPLOME')
    + person({ x: 160, y: 70, s: 0.7, pose: 'point', shirt: N.L3, skin: C.skin1, hair: 'long', glasses: true })
    + person({ x: 740, y: 120, s: 0.6, pose: 'hold', flip: true, shirt: C.tea, skin: C.skin3, hair: 'short', beard: true, held: laptopHeld(120, 260) }),

  'option-big-data-ia': () => fond(N.bigdata) + tableauDeBord(300, 50, 400, 260, N.bigdata) + reseauNeurones(740, 70, N.bigdata)
    + cylindre(330, 340, 90, 110, C.tea) + cylindre(440, 360, 80, 90, shade(N.bigdata, 0.2))
    + person({ x: 40, y: 80, s: 0.68, pose: 'point', shirt: N.bigdata, skin: C.skin3, hair: 'bun' }),

  'option-reseaux-systemes-cloud': () => fond(N.reseaux) + rack(60, 150, 170, 4) + rack(250, 220, 140, 3)
    + nuage(640, 30, 1.3, '#fff') + fenetreTexte(540, 230, 380, 150, 'terminal', ['$ kubectl get pods', [['web-6d9f   ', C.mint], ['Running', C.gold]]], N.reseaux, true)
    + person({ x: 380, y: 68, s: 0.6, pose: 'present', shirt: N.reseaux, skin: C.skin1, hair: 'long', skirt: true }),

  'option-developpement-logiciel': () => fond(N.logiciel)
    + fenetreTexte(470, 50, 400, 250, 'App.tsx', [[['function ', C.vio], ['App', C.blu], ['() {', C.ink]], [['  return ', C.vio], ['<Accueil />', N.logiciel]], ['}']], N.logiciel)
    + seated({ x: 30, y: 120, s: 0.8, shirt: N.logiciel, skin: C.skin2, hair: 'afro', screen: N.logiciel, beard: true })
    + telephone(770, 260, 0.9, N.logiciel, 8),

  'parcours-deploiement': () => fond(C.blu) + browser(380, 210, 420, 240, C.blu) + fusee(540, 20, 1.1)
    + bubble(120, 60, 260, 'mon-site.fr', C.blu)
    + person({ x: 70, y: 100, s: 0.66, pose: 'wave', shirt: C.gold, skin: C.skin3, hair: 'afro' }),

  'parcours-web': () => fond(C.blu) + browser(310, 50, 600, 400, C.blu)
    + person({ x: 70, y: 80, s: 0.7, pose: 'present', shirt: C.blu, skin: C.skin1, hair: 'long', glasses: true }),

  'parcours-devops': () => fond(C.vio) + etape(60, 90, 'Code', C.blu) + fleche(184, 122, 240) + etape(244, 90, 'Build', C.gold)
    + fleche(368, 122, 424) + etape(428, 90, 'Test', C.tea) + fleche(552, 122, 608) + etape(612, 90, 'Prod', C.vio)
    + infini(830, 140, 0.8, C.vio)
    + person({ x: 180, y: 140, s: 0.56, pose: 'point', shirt: C.vio, skin: C.skin3, hair: 'bun' })
    + person({ x: 520, y: 150, s: 0.54, pose: 'hold', shirt: C.ora, skin: C.skin2, hair: 'short', held: laptopHeld(120, 260) }),

  'parcours-data': () => fond(C.gold) + cylindre(60, 70, 90, 110, C.tea) + cylindre(60, 220, 90, 110, C.blu)
    + fleche(170, 132, 260, C.ink) + etape(270, 100, 'Transformer', C.ora, 170) + fleche(452, 132, 530, C.ink)
    + tableauDeBord(540, 60, 360, 260, shade(C.gold, -0.35))
    + person({ x: 300, y: 140, s: 0.5, pose: 'present', shirt: C.ora, skin: C.skin1, hair: 'long' }),

  'parcours-systemes': () => fond(C.tea) + rack(560, 110, 160, 4) + rack(740, 180, 150, 3)
    + fenetreTexte(250, 60, 300, 120, 'terminal', ['$ ssh admin@srv01'], C.tea, true)
    + person({ x: 60, y: 90, s: 0.68, pose: 'point', shirt: C.tea, skin: C.skin3, hair: 'bun', glasses: true }),

  'bienvenue-1-apprendre': () => fond(C.vio)
    + fenetreTexte(560, 70, 330, 280, 'Sommaire', ['1  Objectifs', '2  L’idée', '3  Exemple guidé', '4  Exercice', '5  Quiz'], C.vio)
    + seated({ x: 20, y: 120, s: 0.82, shirt: C.tea, skin: C.skin1, hair: 'short', screen: C.vio, glasses: true }),

  'bienvenue-2-niveau': () => fond(C.vio) + marches(330, 400)
    + person({ x: 343, y: 23, s: 0.6, pose: 'wave', shirt: C.gold, skin: C.skin3, hair: 'long', skirt: true, pants: C.vio })
    + plant(90, 470, 0.8),

  'bienvenue-3-certifications': () => fond(C.vio) + certificat(330, 90, 360, C.vio, -3)
    + macaron(780, 150, 150, C.gold, '', -12) + macaron(170, 130, 110, shade(C.vio, 0.4), '', 10),

  'bienvenue-4-methode': () => fond(C.vio) + feuilleExercice(300, 70, C.vio) + crayon(600, 300)
    + fenetreTexte(640, 80, 260, 190, 'Quiz', ['Question 3 sur 5', [['A  ', C.ink], ['vrai', C.tea]], [['B  ', C.ink], ['faux', C.ink]]], C.vio)
    + person({ x: 60, y: 90, s: 0.64, pose: 'present', shirt: C.ora, skin: C.skin2, hair: 'afro' }),

  'erreur-404': () => fond(C.vio) + panneau(590, 180, '404', C.vio)
    + fenetreTexte(520, 30, 400, 120, '', ['$ cd /page', [['No such file or directory', C.ora]]], C.vio, true)
    + person({ x: 220, y: 90, s: 0.66, pose: 'phone', shirt: C.tea, skin: C.skin1, hair: 'bun', held: phoneHeld(150, 214, C.vio) }),

  'vide-cours': () => fond(C.vio, 480, 360) + sacADos(110, 150, C.vio) + livreFerme(270, 170, C.tea),

  'vide-recherche': () => fond(C.vio, 480, 360) + `<g transform="translate(150,70)"><rect width="180" height="230" rx="12" fill="#fff" stroke="${C.line}" stroke-width="3"/></g>`
    + loupe(210, 120, 1, C.vio),

  'vide-badges': () => fond(C.gold, 480, 360) + `<g transform="translate(240,170)"><circle r="78" fill="none" stroke="${shade(C.gold, -0.45)}" stroke-width="5" stroke-dasharray="12 10"/>
<path d="M-40 70 L-56 150 L-20 128 L0 160 L10 80 M40 70 L56 150 L20 128" stroke="${shade(C.gold, -0.45)}" stroke-width="5" fill="none" stroke-dasharray="12 10" stroke-linejoin="round"/></g>`,

  contact: () => fond(C.ora) + bulleDiscussion(520, 90, 300, 110, C.ora, 3) + bulleDiscussion(600, 250, 220, 80, shade(C.tea, -0.05), 2)
    + person({ x: 220, y: 80, s: 0.7, pose: 'phone', shirt: C.ora, skin: C.skin3, hair: 'long', held: phoneHeld(150, 214, C.ora) })
    + plant(90, 470, 0.8),

  certifications: () => fond(C.gold) + macaron(720, 120, 140, C.ora, '', -12) + macaron(850, 260, 100, shade(C.vio, 0.35), '', 14)
    + person({ x: 260, y: 80, s: 0.7, pose: 'hold', shirt: C.vio, skin: C.skin1, hair: 'bun', held: '' })
    + certificat(270, 250, 210, C.vio, -4),
};

// Personnages par scène, pour vérifier l'équilibre femmes et hommes (cheveux longs ou chignon = femme ici).
const dossier = path.join(__dirname, '..', 'web', 'public', 'illustrations', 'pages');
fs.mkdirSync(dossier, { recursive: true });
const PETITES = new Set(['vide-cours', 'vide-recherche', 'vide-badges']);
let total = 0;
for (const [nom, f] of Object.entries(scenes)) {
  const contenu = PETITES.has(nom) ? svg(f(), 480, 360) : svg(f());
  fs.writeFileSync(path.join(dossier, `${nom}.svg`), contenu);
  total += contenu.length;
  if (contenu.length > 60 * 1024) console.warn(`ATTENTION : ${nom}.svg dépasse 60 Ko (${(contenu.length / 1024).toFixed(1)} Ko)`);
}
console.log(`${Object.keys(scenes).length} illustrations dans web/public/illustrations/pages (${(total / 1024).toFixed(1)} Ko au total)`);
