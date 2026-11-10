// Personnages v2 : proportions, ombrage, bras articulés, décors
const C = {
  vio: '#8B6CF0', blu: '#4C8DF6', tea: '#2BB3A3', ora: '#F08C3A', gold: '#F2C14E', mint: '#7FD6A4', ink: '#0F2A1F', navy: '#23324D',
  line: '#DCE5E0', soft: '#E8EFEB', skin1: '#8A5534', skin2: '#B07650', skin3: '#5E3820', hair: '#17140F', white: '#FFFFFF',
};
const shade = (hex, amt) => { // assombrit (amt<0) ou éclaircit (amt>0)
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join('');
};

// ---------- Personnage debout (boîte 240 x 640, pieds à y=630) ----------
const POSES = {
  down: { L: [[78, 170], [66, 252], [68, 330]], R: [[162, 170], [174, 252], [172, 330]] },
  point: { L: [[78, 170], [66, 252], [68, 330]], R: [[162, 170], [206, 128], [252, 92]] },
  present: { L: [[78, 170], [66, 252], [68, 330]], R: [[162, 170], [196, 236], [246, 228]] },
  hold: { L: [[78, 170], [64, 244], [106, 266]], R: [[162, 170], [176, 244], [134, 266]] },
  wave: { L: [[78, 170], [66, 252], [68, 330]], R: [[162, 170], [200, 118], [204, 58]] },
  phone: { L: [[78, 170], [66, 252], [68, 330]], R: [[162, 170], [180, 240], [140, 214]] },
};
function person(o = {}) {
  const { x = 0, y = 0, s = 1, skin = C.skin1, hair = 'short', shirt = C.vio, pants = C.navy, shoes = '#FFFFFF', pose = 'down', flip = false,
    beard = false, glasses = false, jacket = null, tie = null, held = '', skirt = false } = o;
  const P = POSES[pose];
  const sd = shade(shirt, -0.16), jd = jacket ? shade(jacket, -0.18) : null;
  const sleeve = jacket || shirt, sleeveD = jacket ? jd : sd;
  const arm = ([sh, el, ha], back) => `<path d="M${sh[0]} ${sh[1]} L${el[0]} ${el[1]}" stroke="${back ? sleeveD : sleeve}" stroke-width="27" stroke-linecap="round"/>
<path d="M${el[0]} ${el[1]} L${ha[0]} ${ha[1]}" stroke="${back ? sleeveD : sleeve}" stroke-width="23" stroke-linecap="round"/>
<ellipse cx="${ha[0] + (ha[0] - el[0]) * 0.12}" cy="${ha[1] + (ha[1] - el[1]) * 0.12}" rx="10.5" ry="12" fill="${skin}"/>`;
  const hairBack = { afro: `<circle cx="120" cy="78" r="48" fill="${C.hair}"/>`,
    long: `<path d="M80 92 Q76 40 120 40 Q166 40 160 94 L168 196 Q150 206 140 186 L142 100 L98 100 L100 186 Q90 206 72 196 Z" fill="${C.hair}"/>` }[hair] || '';
  const hairFront = {
    short: `<path d="M84 96 C78 50 102 42 122 42 C150 42 162 60 156 96 C152 76 138 68 120 70 C102 70 90 80 84 96Z" fill="${C.hair}"/><path d="M98 58 Q118 48 142 56" stroke="#3A332A" stroke-width="3" fill="none" opacity=".6"/>`,
    afro: `<path d="M86 92 Q92 64 120 64 Q148 64 154 92 Q144 76 120 76 Q96 76 86 92Z" fill="${C.hair}"/>`,
    long: `<path d="M84 98 C80 52 104 44 122 44 C150 44 162 62 156 98 C146 72 130 66 112 72 C100 76 90 84 84 98Z" fill="${C.hair}"/>`,
    bun: `<circle cx="120" cy="36" r="17" fill="${C.hair}"/><path d="M84 96 C80 54 102 48 120 48 C140 48 160 56 156 96 C150 74 138 66 120 66 C102 66 90 78 84 96Z" fill="${C.hair}"/>`,
  }[hair];
  const legs = skirt
    ? `<path d="M70 326 L170 326 L186 448 L54 448 Z" fill="${pants}"/><path d="M120 326 L170 326 L186 448 L120 448 Z" fill="#000" opacity=".1"/>
<path d="M92 448 L94 566" stroke="${skin}" stroke-width="18" stroke-linecap="round"/><path d="M148 448 L146 566" stroke="${skin}" stroke-width="18" stroke-linecap="round"/>`
    : `<path d="M68 330 L119 330 L113 566 L85 566 Z" fill="${pants}"/><path d="M121 330 L172 330 L155 566 L127 566 Z" fill="${shade(pants, -0.18)}"/>
<path d="M66 322 L174 322 L174 342 L66 342 Z" fill="${shade(pants, -0.3)}"/>`;
  const shoesSvg = `<path d="M84 562 L114 562 Q118 586 108 588 L64 588 Q58 572 84 562Z" fill="${shoes}" stroke="${C.ink}" stroke-width="2.5"/>
<path d="M126 562 L156 562 Q182 572 176 588 L132 588 Q122 586 126 562Z" fill="${shoes}" stroke="${C.ink}" stroke-width="2.5"/>`;
  const torso = `<path d="M70 176 Q72 154 98 150 L142 150 Q168 154 170 176 L176 334 Q120 346 64 334 Z" fill="${shirt}"/>
<path d="M120 150 L142 150 Q168 154 170 176 L176 334 Q150 342 120 344 Z" fill="#000" opacity=".08"/>
${jacket ? `<path d="M70 176 Q72 154 98 150 L108 150 L116 250 L112 340 Q88 340 64 334 Z" fill="${jacket}"/>
<path d="M172 176 Q168 154 142 150 L132 150 L124 250 L128 340 Q152 340 176 334 Z" fill="${jd}"/>
<path d="M108 150 L116 196 L100 186 Z" fill="${shade(jacket, 0.15)}"/><path d="M132 150 L124 196 L140 186 Z" fill="${shade(jacket, 0.05)}"/>` : ''}
<path d="M104 150 L120 174 L136 150 Z" fill="${C.white}"/>
${tie ? `<path d="M117 160 L123 160 L126 236 L120 246 L114 236 Z" fill="${tie}"/>` : ''}`;
  const head = `<rect x="108" y="122" width="24" height="34" rx="9" fill="${shade(skin, -0.12)}"/>
<circle cx="86" cy="98" r="8" fill="${skin}"/><circle cx="154" cy="98" r="8" fill="${skin}"/>
<path d="M86 92 Q86 52 120 52 Q154 52 154 92 Q154 132 120 136 Q86 132 86 92Z" fill="${skin}"/>
<path d="M104 88 q6 -4 12 0 M124 88 q6 -4 12 0" stroke="#2A1C12" stroke-width="2.6" fill="none" stroke-linecap="round"/>
<ellipse cx="110" cy="98" rx="3" ry="3.8" fill="#1C140D"/><ellipse cx="130" cy="98" rx="3" ry="3.8" fill="#1C140D"/>
<path d="M120 100 q-4 10 2 12" stroke="${shade(skin, -0.25)}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M110 118 q10 8 20 0" stroke="#3B2314" stroke-width="2.8" fill="none" stroke-linecap="round"/>
${beard ? `<path d="M88 104 Q92 140 120 140 Q148 140 152 104 Q146 128 120 128 Q94 128 88 104Z" fill="${C.hair}"/><path d="M108 120 q12 6 24 0" stroke="#fff" stroke-width="2.4" fill="none" opacity=".5"/>` : ''}
${glasses ? `<circle cx="110" cy="98" r="10" fill="#fff" fill-opacity=".15" stroke="#1E2B25" stroke-width="2.6"/><circle cx="130" cy="98" r="10" fill="#fff" fill-opacity=".15" stroke="#1E2B25" stroke-width="2.6"/><path d="M120 98 h0" stroke="#1E2B25" stroke-width="2.6"/>` : ''}`;
  const backArm = flip ? P.R : P.L;
  const body = `${hairBack}${legs}${shoesSvg}${arm(P.L, true)}${torso}${head}${hairFront}${arm(P.R, false)}${held}`;
  return `<g transform="translate(${x},${y + 40 * s}) scale(${s})"><g ${flip ? 'transform="translate(240,0) scale(-1,1)"' : ''}>${body}</g></g>`;
}

// ---------- Personnage assis de profil, avec bureau et ordinateur (boîte 520 x 420) ----------
function seated(o = {}) {
  const { x = 0, y = 0, s = 1, skin = C.skin1, shirt = C.vio, pants = C.navy, hair = 'short', flip = false, glasses = false, beard = false, screen = C.blu, mug = C.ora } = o;
  const sd = shade(shirt, -0.16);
  const hairSvg = hair === 'afro' ? `<circle cx="160" cy="70" r="46" fill="${C.hair}"/>`
    : hair === 'long' ? `<path d="M118 70 Q120 22 168 26 Q212 32 204 80 Q190 56 168 56 Q150 58 146 80 L150 150 Q128 156 118 140 Z" fill="${C.hair}"/>`
    : `<path d="M120 76 Q118 26 168 28 Q210 32 206 74 Q194 52 168 54 Q144 54 136 78 Z" fill="${C.hair}"/>`;
  const g = `
<ellipse cx="300" cy="404" rx="250" ry="12" fill="${C.ink}" opacity=".07"/>
<!-- chaise -->
<rect x="70" y="150" width="22" height="160" rx="11" fill="#2B3531"/>
<rect x="70" y="288" width="160" height="22" rx="11" fill="#2B3531"/>
<rect x="140" y="310" width="14" height="70" fill="#3E4A45"/><path d="M90 386 L206 386" stroke="#3E4A45" stroke-width="11" stroke-linecap="round"/>
<circle cx="94" cy="396" r="9" fill="#2B3531"/><circle cx="202" cy="396" r="9" fill="#2B3531"/>
<!-- bureau -->
<rect x="250" y="252" width="270" height="16" rx="6" fill="#C9A47A"/><rect x="250" y="264" width="270" height="6" fill="#A88358"/>
<rect x="272" y="270" width="12" height="134" fill="#A88358"/><rect x="490" y="270" width="12" height="134" fill="#A88358"/>
<!-- jambes -->
<path d="M120 292 L262 296" stroke="${pants}" stroke-width="44" stroke-linecap="round"/>
<path d="M262 296 L284 384" stroke="${shade(pants, -0.15)}" stroke-width="38" stroke-linecap="round"/>
<path d="M266 384 L312 384 Q322 400 310 404 L262 404 Q254 394 266 384Z" fill="#fff" stroke="${C.ink}" stroke-width="2.5"/>
<!-- ordinateur -->
<path d="M310 244 L430 244 L434 252 L306 252 Z" fill="#3E4A45"/>
<path d="M424 246 L456 132 L466 134 L436 250 Z" fill="#2B3531"/><path d="M430 240 L458 140" stroke="${screen}" stroke-width="3" opacity=".7"/>
<!-- tasse -->
<rect x="470" y="218" width="28" height="34" rx="6" fill="${mug}"/><path d="M498 226 q14 0 14 12 q0 10 -14 10" stroke="${mug}" stroke-width="5" fill="none"/>
<!-- buste -->
<path d="M110 150 Q126 120 168 126 Q204 134 206 178 L208 286 Q178 304 126 300 Q100 276 100 228 Z" fill="${shirt}"/>
<path d="M160 126 Q204 134 206 178 L208 286 Q186 298 164 300 Z" fill="#000" opacity=".07"/>
<!-- bras -->
<path d="M176 170 Q214 226 268 236" stroke="${sd}" stroke-width="30" stroke-linecap="round" fill="none"/>
<path d="M268 236 L326 244" stroke="${sd}" stroke-width="25" stroke-linecap="round"/>
<ellipse cx="338" cy="244" rx="12" ry="10" fill="${skin}"/>
<!-- tête -->
<rect x="150" y="98" width="26" height="36" rx="10" fill="${shade(skin, -0.12)}"/>
${hair === 'afro' ? hairSvg : ''}
<path d="M128 74 Q130 28 170 30 Q210 34 206 80 Q204 118 172 120 Q160 122 150 116 Q128 108 128 74Z" fill="${skin}"/>
${hair !== 'afro' ? hairSvg : `<path d="M126 70 Q134 40 170 40 Q200 42 206 70 Q190 56 170 56 Q146 56 126 70Z" fill="${C.hair}"/>`}
<circle cx="140" cy="80" r="8" fill="${shade(skin, -0.08)}"/>
<ellipse cx="190" cy="76" rx="3" ry="3.8" fill="#1C140D"/>
<path d="M184 66 q6 -3 12 0" stroke="#2A1C12" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M204 80 q6 6 1 10" stroke="${shade(skin, -0.25)}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M184 100 q8 6 16 0" stroke="#3B2314" stroke-width="2.6" fill="none" stroke-linecap="round"/>
${beard ? `<path d="M146 92 Q150 124 176 122 Q200 120 206 96 Q194 112 176 112 Q156 110 146 92Z" fill="${C.hair}"/>` : ''}
${glasses ? `<circle cx="192" cy="76" r="10" fill="#fff" fill-opacity=".15" stroke="#1E2B25" stroke-width="2.6"/><path d="M182 74 L160 70" stroke="#1E2B25" stroke-width="2.6"/>` : ''}`;
  return `<g transform="translate(${x},${y}) scale(${s})"><g ${flip ? 'transform="translate(520,0) scale(-1,1)"' : ''}>${g}</g></g>`;
}

// ---------- Objets et décors ----------
const browser = (x, y, w, h, accent = C.blu) => `<g transform="translate(${x},${y})">
<rect width="${w}" height="${h}" rx="16" fill="#fff" stroke="${C.line}" stroke-width="2"/>
<rect width="${w}" height="40" rx="16" fill="${C.soft}"/><rect y="24" width="${w}" height="16" fill="${C.soft}"/>
<circle cx="24" cy="20" r="6" fill="${C.gold}"/><circle cx="44" cy="20" r="6" fill="${C.mint}"/><circle cx="64" cy="20" r="6" fill="${C.blu}"/>
<rect x="88" y="11" width="${w - 116}" height="18" rx="9" fill="#fff"/>
<rect x="24" y="62" width="${w * 0.4}" height="${h * 0.07}" rx="6" fill="${accent}"/>
<rect x="24" y="${62 + h * 0.12}" width="${w * 0.52}" height="10" rx="5" fill="#CFDAD4"/><rect x="24" y="${80 + h * 0.12}" width="${w * 0.42}" height="10" rx="5" fill="#CFDAD4"/>
<rect x="24" y="${104 + h * 0.12}" width="${w * 0.22}" height="${h * 0.1}" rx="9" fill="${C.gold}"/>
<rect x="${w * 0.6}" y="62" width="${w * 0.34}" height="${h - 86}" rx="12" fill="${shade(accent, 0.8)}"/>
<circle cx="${w * 0.77}" cy="${62 + (h - 86) * 0.38}" r="${Math.min(w, h) * 0.08}" fill="${accent}"/>
<rect x="${w * 0.66}" y="${62 + (h - 86) * 0.68}" width="${w * 0.22}" height="9" rx="4" fill="${shade(accent, 0.45)}"/>
${h > 200 ? `<rect x="24" y="${h * 0.66}" width="${w * 0.25}" height="${h * 0.26}" rx="10" fill="${C.soft}"/><rect x="${24 + w * 0.28}" y="${h * 0.66}" width="${w * 0.25}" height="${h * 0.26}" rx="10" fill="${C.soft}"/>` : ''}</g>`;

const rack = (x, y, w, units = 4) => `<g transform="translate(${x},${y})">
<rect width="${w}" height="${units * 70 + 30}" rx="16" fill="#1E3A2F"/><rect x="${w - 22}" width="22" height="${units * 70 + 30}" rx="10" fill="#000" opacity=".15"/>
${Array.from({ length: units }, (_, i) => `<rect x="14" y="${16 + i * 70}" width="${w - 28}" height="58" rx="10" fill="#2B4E40"/>
<circle cx="36" cy="${45 + i * 70}" r="7" fill="${i === 1 ? C.gold : C.mint}"/><circle cx="58" cy="${45 + i * 70}" r="7" fill="${C.tea}"/>
${[0, 1, 2, 3].map(j => `<rect x="${84 + j * 16}" y="${34 + i * 70}" width="8" height="22" rx="3" fill="#3E6656"/>`).join('')}`).join('')}
<rect x="20" y="${units * 70 + 30}" width="24" height="14" fill="#1E3A2F"/><rect x="${w - 44}" y="${units * 70 + 30}" width="24" height="14" fill="#1E3A2F"/></g>`;

const plant = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})">
<path d="M20 0 q-46 -64 -12 -124 q26 58 12 124" fill="${C.tea}"/><path d="M20 0 q34 -58 72 -68 q-12 58 -72 68" fill="${C.mint}"/>
<path d="M20 0 q-58 -22 -82 -58 q58 0 82 58" fill="#21998B"/><path d="M20 0 q4 -60 30 -96 q8 50 -30 96" fill="#5EC79A"/>
<path d="M-4 0 L44 0 L36 72 L4 72 Z" fill="${C.gold}"/><path d="M20 0 L44 0 L36 72 L20 72 Z" fill="#000" opacity=".08"/></g>`;

const skyline = (x, y, w, h, color = '#D9E6DF') => { let out = '', cx = 0, i = 0; const ws = [70, 50, 90, 60, 80, 54, 96, 64, 72];
  while (cx < w) { const bw = ws[i % ws.length], bh = h * (0.45 + ((i * 37) % 50) / 100); out += `<rect x="${x + cx}" y="${y + h - bh}" width="${bw - 8}" height="${bh}" rx="4" fill="${color}"/>`;
    for (let r = 0; r < bh / 28 - 1; r++) out += `<rect x="${x + cx + 12}" y="${y + h - bh + 14 + r * 26}" width="${bw - 34}" height="8" rx="3" fill="#fff" opacity=".45"/>`; cx += bw; i++; } return out; };

const laptopHeld = (cx, cy) => `<g transform="translate(${cx - 58},${cy - 18})"><rect width="116" height="74" rx="8" fill="#2B3531"/><rect x="7" y="7" width="102" height="60" rx="4" fill="#13302A"/>
<rect x="16" y="18" width="48" height="7" rx="3" fill="${C.mint}"/><rect x="16" y="32" width="68" height="7" rx="3" fill="#3E6656"/><rect x="16" y="46" width="38" height="7" rx="3" fill="${C.gold}"/></g>`;
const phoneHeld = (cx, cy, accent = C.blu) => `<g transform="translate(${cx - 20},${cy - 36}) rotate(-8 20 36)"><rect width="40" height="72" rx="8" fill="#0B1A14"/><rect x="4" y="5" width="32" height="62" rx="5" fill="#fff"/><rect x="8" y="11" width="24" height="14" rx="3" fill="${accent}"/><rect x="8" y="30" width="24" height="7" rx="3" fill="${C.line}"/><rect x="8" y="41" width="24" height="7" rx="3" fill="${C.line}"/></g>`;
const suitcase = (x, y, hl = 66) => `<g transform="translate(${x},${y})"><path d="M38 0 L38 -${hl} M68 0 L68 -${hl}" stroke="#3E4A45" stroke-width="7" stroke-linecap="round"/><path d="M34 -${hl} L72 -${hl}" stroke="#3E4A45" stroke-width="9" stroke-linecap="round"/>
<rect width="106" height="146" rx="16" fill="${C.ora}"/><rect x="58" width="48" height="146" rx="16" fill="#000" opacity=".08"/>
<rect x="22" y="16" width="10" height="114" rx="5" fill="#D9762A"/><rect x="74" y="16" width="10" height="114" rx="5" fill="#D9762A"/>
<circle cx="20" cy="156" r="9" fill="#2B3531"/><circle cx="86" cy="156" r="9" fill="#2B3531"/></g>`;
const blob = (cx, cy, r, color, op = 0.18) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${op}"/>`;
const bubble = (x, y, w, text, color, mono = true) => `<g><rect x="${x}" y="${y}" width="${w}" height="50" rx="14" fill="#fff" stroke="${C.line}" stroke-width="2"/>
<text x="${x + w / 2}" y="${y + 32}" text-anchor="middle" font-family="${mono ? "'JetBrains Mono',monospace" : 'Inter'}" font-weight="600" font-size="19" fill="${color}">${text}</text></g>`;

module.exports = { C, shade, person, seated, browser, rack, plant, skyline, laptopHeld, phoneHeld, suitcase, blob, bubble };
