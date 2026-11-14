// Images de partage (Open Graph) : un gabarit commun, rendu par next/og (Satori : flexbox seulement).
// Aplats de couleur, pas de dégradés : chaque PNG doit peser moins de 300 Ko (limite de WhatsApp).
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { CHARTE } from './charte.mjs';
import { MARQUE } from './marque.mjs';
import { LOGOS, TRACES_ICONES } from './pictos-donnees';

export const TAILLE_OG = { width: 1200, height: 630 };
export const TYPE_OG = 'image/png';
export const ALT_DEFAUT = 'MeredianStack : apprends l’informatique à ton rythme, de la L1 aux métiers';

const ENCRE = CHARTE.nuit;
const FOND = CHARTE.fond;
const DOUX = CHARTE.doux;

/** Dossier web/assets (copié dans l'image Docker à côté de server.js). */
const assets = (...p: string[]) => path.join(process.cwd(), 'assets', ...p);

/** Bricolage Grotesque 800 (titres) et Manrope 600 (texte), fichiers locaux .woff sous licence OFL. */
async function polices() {
  const [titre, texte] = await Promise.all([
    readFile(assets('fonts', 'bricolage-grotesque-latin-800-normal.woff')),
    readFile(assets('fonts', 'manrope-latin-600-normal.woff')),
  ]);
  return [
    { name: 'Bricolage', data: titre, weight: 800 as const, style: 'normal' as const },
    { name: 'Manrope', data: texte, weight: 600 as const, style: 'normal' as const },
  ];
}

const svgDataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

/** Lecture de l'API depuis le serveur (adresse interne du conteneur), mise en cache une journée. */
export async function apiServeur<T>(chemin: string): Promise<T | null> {
  const base = process.env.API_INTERNE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  try {
    const r = await fetch(`${base}${chemin}`, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(4000) });
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}

/** M du logo (web/assets/marque/m.png, 415 × 436 à l'origine), lu une fois. */
let mLogo: Promise<string> | null = null;
const lireM = () => (mLogo ??= readFile(assets('marque', 'm.png')).then((b) => `data:image/png;base64,${b.toString('base64')}`));

/** M du logo sur un carré blanc arrondi : le bleu nuit du M resterait invisible sur les fonds sombres. */
function Monogramme({ cote, m }: { cote: number; m: string }) {
  const h = Math.round(cote * 0.7);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: cote, height: cote, borderRadius: cote * MARQUE.rayon, background: '#fff' }}>
      <img src={m} height={h} width={Math.round((h * 415) / 436)} alt="" />
    </div>
  );
}

/** Pastille du sujet : logo simple-icons d'origine s'il est autorisé, sinon l'icône Lucide en couleur d'accent. */
function pastilleSujet(sujet: { logo: string | null; icone: string } | null | undefined, accent: string): string | null {
  const logo = sujet?.logo ? LOGOS[sujet.logo] : undefined;
  if (logo) return svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${logo.trace}" fill="${logo.hex}"/></svg>`);
  const traces = TRACES_ICONES[sujet?.icone ?? ''] ?? TRACES_ICONES['book-open'];
  if (!traces) return null;
  const corps = traces.map(([tag, a]) => `<${tag} ${Object.entries(a).map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}="${v}"`).join(' ')}/>`).join('');
  return svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${corps}</svg>`);
}

/** Image par défaut : fond bleu nuit, blobs, monogramme, nom, promesse et deux personnages. Aucun logo de technologie. */
export async function imageDefaut() {
  const personnages = svgDataUri(await readFile(assets('og', 'personnages.svg'), 'utf8'));
  const m = await lireM();
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: ENCRE, position: 'relative', fontFamily: 'Manrope' }}>
        <div style={{ position: 'absolute', left: -120, top: -160, width: 460, height: 460, borderRadius: 460, background: '#24395F' }} />
        <div style={{ position: 'absolute', left: 520, top: 470, width: 300, height: 300, borderRadius: 300, background: '#24395F' }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 0 0 84px', width: 720 }}>
          <Monogramme cote={96} m={m} />
          <div style={{ display: 'flex', marginTop: 40, fontFamily: 'Bricolage', fontWeight: 800, fontSize: 72, lineHeight: 1.05, color: '#fff', flexWrap: 'wrap' }}>Meredian<span style={{ color: CHARTE['ciel-sur-sombre'] }}>Stack</span></div>
          <div style={{ display: 'flex', marginTop: 24, fontSize: 34, lineHeight: 1.35, color: CHARTE['sur-sombre'] }}>Apprends l’informatique à ton rythme, de la L1 aux métiers</div>
          <div style={{ display: 'flex', marginTop: 34, width: 120, height: 8, borderRadius: 8, background: CHARTE.corail }} />
        </div>
        <img src={personnages} width={414} height={468} style={{ position: 'absolute', right: 60, bottom: 40 }} alt="" />
      </div>
    ),
    { ...TAILLE_OG, fonts: await polices() },
  );
}

export interface Gabarit {
  /** Bandeau : « L1 · S1 », « Parcours métier »… et sa couleur (couleur du niveau). */
  bandeau: string; couleur: string;
  titre: string;
  /** Ligne sous le bandeau : libellé du sujet, nombre d'étapes… */
  sousTitre?: string;
  /** Nom du domaine (ou complément). */
  detail?: string;
  /** Sujet du cours pour la pastille (logo d'origine ou icône générique). */
  sujet?: { logo: string | null; icone: string } | null;
  accent?: string;
}

/** Gabarit des cours, parcours, niveaux, certifications et catalogue. */
export async function imageGabarit(g: Gabarit) {
  const accent = g.accent ?? g.couleur;
  const pastille = g.sujet !== undefined ? pastilleSujet(g.sujet, accent) : null;
  const m = await lireM();
  const taille = g.titre.length > 80 ? 50 : g.titre.length > 50 ? 58 : 68;
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: FOND, fontFamily: 'Manrope' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 104, padding: '0 72px', background: g.couleur, color: '#fff', fontSize: 38 }}>{g.bandeau}</div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, padding: '0 72px', position: 'relative' }}>
          <div style={{ position: 'absolute', right: -90, top: -60, width: 360, height: 360, borderRadius: 360, background: g.couleur, opacity: 0.08 }} />
          {(g.sousTitre || pastille) && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 26 }}>
              {pastille && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 76, height: 76, borderRadius: 76, background: '#fff', border: `2px solid ${CHARTE.bord}`, marginRight: 22 }}>
                  <img src={pastille} width={42} height={42} alt="" />
                </div>
              )}
              {g.sousTitre && <div style={{ display: 'flex', fontSize: 32, color: accent }}>{g.sousTitre}</div>}
            </div>
          )}
          <div style={{ display: 'flex', fontFamily: 'Bricolage', fontWeight: 800, fontSize: taille, lineHeight: 1.1, color: ENCRE, maxWidth: 1040 }}>{g.titre}</div>
          {g.detail && <div style={{ display: 'flex', marginTop: 24, fontSize: 30, color: DOUX }}>{g.detail}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', height: 100, padding: '0 72px', background: ENCRE }}>
          <Monogramme cote={54} m={m} />
          <div style={{ display: 'flex', marginLeft: 20, fontFamily: 'Bricolage', fontWeight: 800, fontSize: 32, color: '#fff' }}>Meredian<span style={{ color: CHARTE['ciel-sur-sombre'] }}>Stack</span></div>
          <div style={{ display: 'flex', marginLeft: 'auto', fontSize: 24, color: CHARTE['sur-sombre'] }}>Apprends l’informatique à ton rythme</div>
        </div>
      </div>
    ),
    { ...TAILLE_OG, fonts: await polices() },
  );
}
