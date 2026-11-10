// Génère une illustration (SVG 960 x 540) par domaine, avec la bibliothèque de personnages des conférences.
// Utilisation : node tools/illustrations.js  → web/public/illustrations/<cle>.svg
const fs = require('fs');
const path = require('path');
const { C, shade, person, seated, browser, rack, plant, laptopHeld, blob, bubble } = require('./characters2.js');

const W = 960, H = 540;
const fond = (couleur) => `<rect width="${W}" height="${H}" fill="${shade(couleur, 0.86)}"/>
${blob(830, 90, 150, couleur, 0.16)}${blob(110, 470, 130, couleur, 0.12)}
<rect x="0" y="470" width="${W}" height="70" fill="${shade(couleur, 0.74)}"/>`;
const svg = (contenu) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${contenu}</svg>`;

const fleche = (x1, y1, x2, y2, c = C.ink) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
<path d="M${x2 - 14} ${y2 - 12} L${x2} ${y2} L${x2 - 14} ${y2 + 12}" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const boite = (x, y, w, h, c, label) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#fff" stroke="${c}" stroke-width="4"/>
<rect x="${x}" y="${y}" width="${w}" height="14" rx="7" fill="${c}"/>
<text x="${x + w / 2}" y="${y + h / 2 + 12}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="700" font-size="26" fill="${shade(c, -0.35)}">${label}</text>`;
const cylindre = (x, y, w, h, c) => `<g transform="translate(${x},${y})">
<rect y="${w * 0.14}" width="${w}" height="${h}" fill="${c}"/><ellipse cx="${w / 2}" cy="${h + w * 0.14}" rx="${w / 2}" ry="${w * 0.14}" fill="${shade(c, -0.2)}"/>
<ellipse cx="${w / 2}" cy="${w * 0.14}" rx="${w / 2}" ry="${w * 0.14}" fill="${shade(c, 0.35)}"/>
<path d="M0 ${h * 0.45 + w * 0.14} q${w / 2} ${w * 0.28} ${w} 0" stroke="${shade(c, -0.18)}" stroke-width="5" fill="none"/></g>`;

const scenes = {
  systemes: () => fond(C.tea) + rack(90, 120, 190, 4) + rack(300, 190, 150, 3)
    + person({ x: 560, y: 70, s: 0.68, pose: 'hold', shirt: C.tea, skin: C.skin2, hair: 'short', held: laptopHeld(120, 260) })
    + bubble(480, 70, 300, '$ ssh admin@srv01', C.tea) + plant(850, 470, 0.9),

  devops: () => fond(C.vio)
    + boite(70, 110, 170, 110, C.blu, 'Code') + fleche(250, 165, 300, 165)
    + boite(310, 110, 170, 110, C.gold, 'Build') + fleche(490, 165, 540, 165)
    + boite(550, 110, 170, 110, C.tea, 'Test') + fleche(730, 165, 780, 165)
    + boite(790, 110, 140, 110, C.vio, 'Prod')
    + person({ x: 180, y: 160, s: 0.6, pose: 'point', shirt: C.vio, skin: C.skin1, hair: 'afro' })
    + person({ x: 560, y: 170, s: 0.58, pose: 'hold', flip: true, shirt: C.ora, skin: C.skin3, hair: 'bun', held: laptopHeld(120, 260) }),

  web: () => fond(C.blu) + browser(380, 60, 520, 360, C.blu)
    + seated({ x: 20, y: 120, s: 0.82, shirt: C.blu, skin: C.skin2, hair: 'long', glasses: true, screen: C.mint }) + plant(330, 470, 0.7),

  data: () => fond(C.gold)
    + `<g transform="translate(360,90)"><rect width="520" height="340" rx="22" fill="#fff" stroke="${C.line}" stroke-width="3"/>
${[90, 150, 120, 210, 260].map((h, i) => `<rect x="${50 + i * 90}" y="${300 - h}" width="56" height="${h}" rx="8" fill="${[C.tea, C.blu, C.vio, C.gold, C.ora][i]}"/>`).join('')}
<path d="M78 170 L168 120 L258 140 L348 70 L438 40" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>
${[[78, 170], [168, 120], [258, 140], [348, 70], [438, 40]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="9" fill="#fff" stroke="${C.ink}" stroke-width="4"/>`).join('')}</g>`
    + person({ x: 80, y: 80, s: 0.7, pose: 'point', shirt: C.gold, pants: C.ink, skin: C.skin1, hair: 'short', beard: true }),

  bdd: () => fond(C.tea) + cylindre(470, 120, 150, 170, C.tea) + cylindre(650, 170, 150, 140, C.blu) + cylindre(560, 300, 130, 110, C.vio)
    + bubble(440, 50, 380, 'SELECT * FROM ventes', C.tea)
    + person({ x: 110, y: 80, s: 0.7, pose: 'present', shirt: C.blu, skin: C.skin3, hair: 'long', glasses: true }),

  tests: () => fond(C.mint)
    + `<g transform="translate(470,70)"><rect width="380" height="370" rx="22" fill="#fff" stroke="${C.line}" stroke-width="3"/>
${[0, 1, 2, 3].map(i => `<circle cx="60" cy="${70 + i * 80}" r="24" fill="${i === 2 ? C.ora : C.tea}"/>
<path d="${i === 2 ? `M50 ${60 + i * 80} L70 ${80 + i * 80} M70 ${60 + i * 80} L50 ${80 + i * 80}` : `M48 ${70 + i * 80} L57 ${80 + i * 80} L74 ${60 + i * 80}`}" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="104" y="${60 + i * 80}" width="${[220, 180, 240, 160][i]}" height="18" rx="9" fill="#CFDAD4"/>`).join('')}</g>`
    + person({ x: 130, y: 80, s: 0.7, pose: 'hold', shirt: C.tea, skin: C.skin2, hair: 'bun', held: laptopHeld(120, 260) }),

  securite: () => fond(C.ora)
    + `<g transform="translate(560,70)"><path d="M150 0 L290 50 L290 170 Q290 300 150 370 Q10 300 10 170 L10 50 Z" fill="${C.ora}"/>
<path d="M150 0 L290 50 L290 170 Q290 300 150 370 Z" fill="#000" opacity=".08"/>
<rect x="100" y="170" width="100" height="90" rx="14" fill="#fff"/><path d="M118 172 L118 140 Q118 106 150 106 Q182 106 182 140 L182 172" stroke="#fff" stroke-width="16" fill="none"/>
<circle cx="150" cy="210" r="12" fill="${C.ora}"/><rect x="145" y="214" width="10" height="26" rx="4" fill="${C.ora}"/></g>`
    + person({ x: 160, y: 80, s: 0.7, pose: 'point', shirt: C.ink, skin: C.skin1, hair: 'short', glasses: true }),

  projet: () => fond(C.vio)
    + `<g transform="translate(400,70)"><rect width="500" height="360" rx="20" fill="#fff" stroke="${C.line}" stroke-width="3"/>
${['À faire', 'En cours', 'Terminé'].map((t, i) => `<text x="${30 + i * 160}" y="50" font-family="Inter,Arial,sans-serif" font-weight="700" font-size="22" fill="${C.ink}">${t}</text>
${[0, 1, 2].slice(0, 3 - (i === 2 ? 1 : 0)).map(j => `<rect x="${24 + i * 160}" y="${76 + j * 90}" width="136" height="72" rx="12" fill="${[C.gold, C.blu, C.mint][i]}" opacity=".85"/>
<rect x="${38 + i * 160}" y="${94 + j * 90}" width="90" height="10" rx="5" fill="#fff"/><rect x="${38 + i * 160}" y="${114 + j * 90}" width="60" height="10" rx="5" fill="#fff" opacity=".7"/>`).join('')}`).join('')}</g>`
    + person({ x: 120, y: 80, s: 0.7, pose: 'present', shirt: C.vio, skin: C.skin2, hair: 'afro', beard: true }),

  cloud: () => fond(C.blu)
    + `<g fill="#fff"><circle cx="560" cy="170" r="70"/><circle cx="650" cy="140" r="90"/><circle cx="750" cy="180" r="66"/><rect x="500" y="170" width="310" height="76" rx="38"/></g>`
    + `<g fill="${shade(C.blu, 0.55)}"><circle cx="760" cy="330" r="40"/><circle cx="810" cy="310" r="52"/><circle cx="860" cy="336" r="36"/><rect x="730" y="330" width="160" height="44" rx="22"/></g>`
    + rack(560, 260, 140, 2)
    + person({ x: 160, y: 80, s: 0.7, pose: 'wave', shirt: C.blu, skin: C.skin3, hair: 'long' }),
};

const dossier = path.join(__dirname, '..', 'web', 'public', 'illustrations');
fs.mkdirSync(dossier, { recursive: true });
for (const [cle, f] of Object.entries(scenes)) fs.writeFileSync(path.join(dossier, `${cle}.svg`), svg(f()));
console.log('Illustrations :', Object.keys(scenes).join(', '));
