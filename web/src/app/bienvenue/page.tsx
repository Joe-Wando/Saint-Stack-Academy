'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import Shell from '@/components/Shell';
import PhotoFondateur from '@/components/PhotoFondateur';
import CarteCertification from '@/components/CarteCertification';
import { CarteNiveaux, OptionsL3, titreOption } from '@/components/ChoixNiveau';
import { parametre, suiteSure } from '@/components/CadreAuth';
import { api, enregistrerSession, libelleNiveau, MonNiveau, Niveau, session, Utilisateur } from '@/lib/api';

const TITRES = ['Bienvenue', 'Ton niveau', 'Ce que tu vas apprendre', 'Bien utiliser la plateforme'];

/** Petites icônes SVG des quatre usages (aucun emoji). */
function Icone({ n }: { n: number }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const d = [
    <><path {...p} d="M4 6h16M4 12h16M4 18h10" /></>,
    <><path {...p} d="M5 19c4-1 3-6 7-7s3-6 7-7" /><circle {...p} cx="5" cy="19" r="1.5" /><circle {...p} cx="19" cy="5" r="1.5" /></>,
    <><rect {...p} x="4" y="4" width="16" height="16" rx="3" /><path {...p} d="M8 12l3 3 5-6" /></>,
    <><path {...p} d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></>,
  ][n];
  return <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">{d}</svg>;
}

function Contenu({ u, maj }: { u: Utilisateur; maj: (u: Utilisateur) => void }) {
  const router = useRouter();
  const [ecran, setEcran] = useState(0);
  const [mon, setMon] = useState<MonNiveau | null>(null);
  const [niveau, setNiveau] = useState<Niveau | ''>(u.niveau ?? '');
  const [option, setOption] = useState(u.optionL3 ?? '');
  const [modif, setModif] = useState(false);
  const [message, setMessage] = useState('');
  const titre = useRef<HTMLHeadingElement>(null);

  const charger = () => api<MonNiveau>('/mon-niveau').then(setMon).catch(() => setMon({ niveau: null, option: null, titre: null, ues: [], certifications: [] }));
  useEffect(() => { charger(); }, []);
  // À chaque écran, le focus va sur son titre : les lecteurs d'écran annoncent le changement.
  useEffect(() => { titre.current?.focus(); }, [ecran]);

  async function terminer(vers: string) {
    try {
      const r = await api<{ jeton: string; utilisateur: Utilisateur }>('/auth/moi', { method: 'PATCH', body: JSON.stringify({ bienvenueVue: true }) });
      if (session()) enregistrerSession({ jeton: r.jeton, utilisateur: { ...r.utilisateur, bienvenueVue: true } });
    } catch { /* on continue quand même */ }
    router.replace(vers);
  }

  async function enregistrerNiveau() {
    setMessage('');
    if (!niveau || (niveau === 'L3' && !option)) { setMessage(niveau ? 'En L3, choisis ton option.' : 'Choisis ton niveau.'); return; }
    try {
      const r = await api<{ jeton: string; utilisateur: Utilisateur }>('/auth/moi', { method: 'PATCH', body: JSON.stringify({ niveau, optionL3: niveau === 'L3' ? option : null }) });
      if (session()) enregistrerSession(r);
      maj(r.utilisateur); setModif(false); setMon(null); charger();
    } catch (x) { setMessage((x as Error).message); }
  }

  const suite = suiteSure(parametre('suite') || '/accueil');
  const coursNiveau = mon ? [...new Map(mon.ues.flatMap((x) => x.cours).map((c) => [c.slug, c])).values()] : [];
  const premier = coursNiveau[0] ?? null;
  const competences = mon ? [...new Set(mon.ues.filter((x) => x.cours.length).map((x) => x.ue))].slice(0, 5) : [];
  const certifs = (mon?.certifications ?? []).slice(0, 4);
  const dernier = ecran === TITRES.length - 1;

  function touche(e: KeyboardEvent) {
    if ((e.target as HTMLElement).closest('input, textarea, select, button, a')) return;
    if (e.key === 'ArrowRight' && !dernier) setEcran((x) => x + 1);
    if (e.key === 'ArrowLeft' && ecran > 0) setEcran((x) => x - 1);
  }

  return (
    <div className="bienvenue" onKeyDown={touche}>
      <div className="bienvenue-haut">
        <div className="bienvenue-progres">
          <span className="small muted">Étape {ecran + 1} sur {TITRES.length} · {TITRES[ecran]}</span>
          <div className="bar" role="progressbar" aria-valuemin={1} aria-valuemax={TITRES.length} aria-valuenow={ecran + 1} aria-label="Progression de la visite">
            <span style={{ width: `${((ecran + 1) / TITRES.length) * 100}%` }} />
          </div>
        </div>
        <button className="lien-passer" onClick={() => terminer(suite)}>Passer</button>
      </div>

      <section className="card bienvenue-ecran" aria-live="polite">
        {ecran === 0 && (
          <>
            <div className="bienvenue-intro">
              <PhotoFondateur className="bienvenue-photo" taille={120} decorative />
              <div>
                <h1 ref={titre} tabIndex={-1}>Bienvenue, {u.nom.split(' ')[0]}</h1>
                <p>Je suis Olivier, fondateur de Saint Stack Academy. Ici, tu apprends à ton rythme, sans pression ni calendrier. Voici ce que tu peux faire.</p>
              </div>
            </div>
            <ul className="usages">
              {['Suivre les cours de ton niveau', 'Explorer les parcours métiers', 'T’entraîner avec des exercices corrigés et des quiz', 'Suivre ton évolution dans ton profil']
                .map((t, i) => <li key={t}><span className="usage-icone"><Icone n={i} /></span>{t}</li>)}
            </ul>
          </>
        )}

        {ecran === 1 && (
          <>
            <h1 ref={titre} tabIndex={-1}>Ton niveau</h1>
            <p>Tu as indiqué : <strong>{libelleNiveau(u, titreOption(u.optionL3))}</strong>. <button className="lien" onClick={() => setModif((m) => !m)}>{modif ? 'Annuler' : 'Modifier'}</button></p>
            {modif && (
              <div className="form" style={{ maxWidth: 560 }}>
                <CarteNiveaux valeur={niveau} onChange={(n) => { setNiveau(n); if (n !== 'L3') setOption(''); }} />
                {niveau === 'L3' && <OptionsL3 valeur={option} onChange={setOption} />}
                {message && <p className="error" role="alert">{message}</p>}
                <button className="btn primary" onClick={enregistrerNiveau}>Enregistrer mon niveau</button>
              </div>
            )}
            {!mon ? <p className="muted">Chargement…</p> : mon.ues.length ? (
              <>
                <ul className="ues-bienvenue">
                  {mon.ues.map((x) => (
                    <li key={`${x.semestre}-${x.ue}`}><span className="muted small">{x.semestre}</span> {x.ue} <span className="small muted">· {x.cours.length ? `${x.cours.length} cours` : 'en préparation'}</span></li>
                  ))}
                </ul>
                {premier && (
                  <div className="premier-cours">
                    <span className="small muted">Ton premier cours conseillé</span>
                    <strong>{premier.titre}</strong>
                  </div>
                )}
              </>
            ) : (
              <p className="muted">Sans niveau de licence, commence par un parcours métier : par exemple « Mettre son site en ligne », accessible dès le début.</p>
            )}
          </>
        )}

        {ecran === 2 && (
          <>
            <h1 ref={titre} tabIndex={-1}>Ce que tu vas apprendre et les certifications à viser</h1>
            {competences.length > 0 && (
              <ul className="coches">{competences.map((c) => <li key={c}><span className="coche" aria-hidden="true">✓</span><span>{c}</span></li>)}</ul>
            )}
            {certifs.length ? (
              <>
                <h2 className="h-petit">Les premières certifications à viser</h2>
                <div className="grille-certifs">{certifs.map((e) => <CarteCertification key={e.nom} e={e} />)}</div>
              </>
            ) : <p className="muted">Choisis un niveau pour voir les certifications adaptées.</p>}
            <p><Link href="/certifications">Voir toutes les certifications</Link></p>
          </>
        )}

        {ecran === 3 && (
          <>
            <h1 ref={titre} tabIndex={-1}>Comment bien utiliser la plateforme</h1>
            <ul className="coches">
              {['Un cours = des chapitres : une notion par chapitre.',
                'Essaie l’exercice sur ta feuille avant d’afficher la correction.',
                'Passe le quiz à la fin de chaque cours.',
                'Ajoute ta photo et suis ton évolution dans ton profil.',
                'Une question ? Passe par la page Contact.'].map((t) => <li key={t}><span className="coche" aria-hidden="true">✓</span><span>{t}</span></li>)}
            </ul>
            <div className="banniere-actions">
              <button className="btn primary" onClick={() => terminer(premier ? `/cours/${premier.slug}` : '/parcours/deploiement')}>Commencer mon premier cours</button>
              <button className="btn" onClick={() => terminer('/accueil')}>Aller à mon accueil</button>
            </div>
          </>
        )}
      </section>

      <div className="bienvenue-nav">
        <button className="btn" onClick={() => setEcran((x) => x - 1)} disabled={ecran === 0}>← Précédent</button>
        {!dernier && <button className="btn primary" onClick={() => setEcran((x) => x + 1)}>Suivant →</button>}
      </div>
    </div>
  );
}

export default function Bienvenue() {
  return <Shell>{(u, maj) => <Contenu u={u} maj={maj} />}</Shell>;
}
