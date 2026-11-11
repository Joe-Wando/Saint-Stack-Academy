// Couleurs d'un diaporama à partir de son sujet (PROMPT-CHARTE-UNIPRO, phase 6 § 5).
// - champ `diaporama` de content/sujets.yaml s'il existe ;
// - sinon à partir de la couleur du logo (simple-icons) : principale (assombrie jusqu'à 3:1 sur blanc),
//   sombre = principale + 65 % de noir, claire = principale + 88 % de blanc ;
// - sujet sans logo : bleu nuit, bleu et bleu clair de la charte du site.

const hex = (h) => h.replace('#', '').toUpperCase();
const rgb = (h) => { const n = parseInt(hex(h), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const versHex = ([r, g, b]) => [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();

/** Luminance relative WCAG. */
export function luminance(h) {
  const [r, g, b] = rgb(h).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
/** Rapport de contraste WCAG entre deux couleurs. */
export function contraste(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
/** Mélange `h` avec `autre` (0 = h, 1 = autre). */
export const melange = (h, autre, part) => versHex(rgb(h).map((v, i) => v + (rgb(autre)[i] - v) * part));

/** Assombrit progressivement jusqu'à un contraste de 3:1 avec le blanc. */
function assez(h) {
  let c = hex(h);
  for (let i = 0; i < 40 && contraste(c, 'FFFFFF') < 3; i++) c = melange(c, '000000', 0.05);
  return c;
}

export const DEFAUT = { principale: '1B2F52', sombre: '0D1A30', claire: 'E8EEF7' };
// Sans logo : bleu nuit en principale, bleu en appui (charte du site).
export const SANS_LOGO = { principale: '2B4C7E', sombre: '1B2F52', claire: 'E8EEF7' };

/** Couleurs d'un sujet : { principale, sombre, claire } en hexadécimal sans #. */
export function couleursSujet(sujet, hexLogo) {
  if (sujet?.diaporama) {
    const d = sujet.diaporama;
    return { principale: hex(d.principale), sombre: hex(d.sombre), claire: hex(d.claire) };
  }
  if (!hexLogo) return { ...SANS_LOGO };
  const principale = assez(hexLogo);
  return { principale, sombre: melange(principale, '000000', 0.65), claire: melange(principale, 'FFFFFF', 0.88) };
}

/** Couleur de texte lisible sur un fond : blanc ou bleu nuit, celle qui contraste le plus. */
export const texteSur = (fond) => (contraste(fond, 'FFFFFF') >= contraste(fond, '14213D') ? 'FFFFFF' : '14213D');
