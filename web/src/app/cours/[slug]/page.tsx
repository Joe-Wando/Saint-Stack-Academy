'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Shell from '@/components/Shell';
import { Vague } from '@/components/Decor';
import Quiz from '@/components/Quiz';
import Markdown from '@/components/Markdown';
import PictoSujet from '@/components/PictoSujet';
import VisuelCours from '@/components/VisuelCours';
import { api, capitale, Cours, dureeH, Emplacement, Progression, STATUTS } from '@/lib/api';
import { ancreUe } from '@/lib/licence';
import { chapitres, estCorrection, infoDomaine, niveauCours, styleDomaine } from '@/lib/domaines';

type Etape = { type: 'objectifs' | 'section' | 'correction' | 'quiz'; titre: string; corps: string };

function lire(cle: string): number | null {
  try { const v = localStorage.getItem(cle); return v === null ? null : Number(v); } catch { return null; }
}
function ecrireLocal(cle: string, v: number) {
  try { localStorage.setItem(cle, String(v)); } catch { /* navigation privée */ }
}

/** Lien d'un emplacement : « L2 · S3 · Bases de données… » ou « Parcours Data engineer · étape 3 ». */
function lienEmplacement(e: Emplacement) {
  if (e.type === 'licence') {
    return { href: `/licence/${e.niveau}#${ancreUe(e.semestre, e.ue)}`, texte: `${e.niveau} · ${e.semestre} · ${e.ue}${e.optionTitre ? ` (option ${e.optionTitre})` : ''}` };
  }
  return { href: `/parcours/${e.code}`, texte: `Parcours ${e.titre} · étape ${e.etape}` };
}

/** Parcours d'où l'on vient (mémorisé par la page du parcours), pour conseiller le cours suivant. */
function parcoursDOrigine() {
  try { return sessionStorage.getItem('ssa-parcours') ?? ''; } catch { return ''; }
}


function Contenu({ slug }: { slug: string }) {
  const [cours, setCours] = useState<Cours | null>(null);
  const [prog, setProg] = useState<Progression | null>(null);
  const [toutes, setToutes] = useState<Progression[]>([]);
  const [progChargee, setProgChargee] = useState(false);
  const [actif, setActif] = useState(0);
  const [plusLoin, setPlusLoin] = useState(0);
  const [corrigees, setCorrigees] = useState<Set<number>>(new Set());
  const [note, setNote] = useState('');
  const [etatNote, setEtatNote] = useState('');
  const [erreur, setErreur] = useState('');
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lecon = useRef<HTMLDivElement>(null);
  const demarre = useRef(false);

  const chargerProg = useCallback(async () => {
    const l = await api<Progression[]>('/progression');
    const p = l.find((x) => x.cours === slug) ?? null;
    setProg(p); setToutes(l); setProgChargee(true);
    return p;
  }, [slug]);

  useEffect(() => {
    api<Cours>(`/cours/${slug}`)
      .then(async (c) => {
        setCours(c);
        api<{ contenu: string }>(`/notes/${slug}`).then((n) => setNote(n.contenu)).catch(() => {});
        const p = await chargerProg().catch(() => null);
        // Première ouverture : le cours passe automatiquement « en cours ».
        if (!demarre.current && (!p || p.statut === 'a_faire')) {
          demarre.current = true;
          await api(`/progression/${slug}`, { method: 'POST', body: JSON.stringify({ statut: 'en_cours' }) }).catch(() => {});
          chargerProg().catch(() => {});
        }
      })
      .catch((e) => setErreur(e.message));
  }, [slug, chargerProg]);

  const etapes = useMemo<Etape[]>(() => {
    if (!cours) return [];
    return [
      { type: 'objectifs', titre: 'Objectifs', corps: '' },
      ...chapitres(cours.contenu).map((c): Etape => ({ type: estCorrection(c.titre) ? 'correction' : 'section', titre: c.titre, corps: c.corps })),
      { type: 'quiz', titre: 'Quiz', corps: '' },
    ];
  }, [cours]);
  const n = etapes.length;

  // Reprise au dernier chapitre ouvert.
  useEffect(() => {
    if (!n) return;
    const dernier = Math.min(Math.max(lire(`ssa-chapitre-${slug}`) ?? 0, 0), n - 1);
    const loin = Math.min(Math.max(lire(`ssa-lu-${slug}`) ?? 0, dernier), n - 1);
    setActif(dernier); setPlusLoin(loin);
  }, [n, slug]);

  function aller(i: number) {
    const j = Math.min(Math.max(i, 0), n - 1);
    // Passer au chapitre suivant : celui qu'on quitte compte comme lu (enregistré une seule fois côté serveur).
    if (j > actif) api(`/progression/${slug}/chapitre`, { method: 'POST', body: JSON.stringify({ chapitre: actif }) }).catch(() => {});
    setActif(j);
    ecrireLocal(`ssa-chapitre-${slug}`, j);
    if (j > plusLoin) { setPlusLoin(j); ecrireLocal(`ssa-lu-${slug}`, j); }
    lecon.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function terminer() {
    await api(`/progression/${slug}`, { method: 'POST', body: JSON.stringify({ statut: 'termine' }) });
    await chargerProg();
  }

  function ecrire(v: string) {
    setNote(v); setEtatNote('…');
    if (minuteur.current) clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => {
      api(`/notes/${slug}`, { method: 'PUT', body: JSON.stringify({ contenu: v }) })
        .then(() => setEtatNote('Enregistré')).catch(() => setEtatNote("Échec de l'enregistrement"));
    }, 800);
  }

  if (erreur) return <div className="page"><p className="error">{erreur}</p><Link href="/catalogue">Retour au catalogue</Link></div>;
  if (!cours || !n) return <div className="page"><p className="muted">Chargement…</p></div>;

  const statut = prog?.statut ?? 'a_faire';
  const termine = statut === 'termine';
  const lu = (i: number) => termine || i < plusLoin;
  const avance = termine ? 100 : Math.round((100 * plusLoin) / n);
  const dom = infoDomaine(cours.domaine);
  const e = etapes[actif];
  const statutDe = (s: string) => toutes.find((p) => p.cours === s)?.statut ?? 'a_faire';
  const aFaireAvant = cours.prerequisCours.filter((p) => statutDe(p.slug) !== 'termine');
  // Cours suivant conseillé : dans le parcours d'où l'on vient, sinon dans la même UE, sinon dans un parcours.
  const origine = parcoursDOrigine();
  const suivant = cours.emplacements.find((x) => x.type === 'parcours' && x.code === origine)?.suivant
    ?? cours.emplacements.find((x) => x.type === 'licence' && x.suivant)?.suivant
    ?? cours.emplacements.find((x) => x.suivant)?.suivant ?? null;

  const licence = cours.emplacements.flatMap((x) => (x.type === 'licence' ? [{ niveau: x.niveau, semestre: x.semestre, option: x.option }] : []));
  const niveau = niveauCours(licence);

  return (
    <div style={styleDomaine(cours.domaine)}>
      <header className="banniere">
        <div className="banniere-in">
          <div>
            <Link href={`/catalogue#${dom.cle}`} className="retour">← {dom.nom}</Link>
            {cours.emplacements.length > 0 && (
              <ul className="emplacements" aria-label="Où trouver ce cours">
                {cours.emplacements.map((x, i) => { const l = lienEmplacement(x); return <li key={i}><Link href={l.href}>{l.texte}</Link></li>; })}
              </ul>
            )}
            <h1>{cours.titre}</h1>
            {cours.sujet && (
              <p className="banniere-sujet">
                <span className="ruban-niveau" style={{ background: niveau.couleur }}>{niveau.libelle}</span>
                <PictoSujet sujet={cours.sujet} domaine={cours.domaine} taille={30} />
                <span>{cours.sujet.libelle}</span>
              </p>
            )}
            <p className="meta" style={{ marginTop: 0 }}>{dureeH(cours.duree)} · {capitale(cours.difficulte)} · {n} chapitres{cours.visibilite === 'prive' ? ' · cours privé' : ''}</p>
            <div className="banniere-actions">
              <Link href={`/cours/${slug}/presenter`} className="btn primary">Présenter</Link>
              <a href={`/diaporamas/${slug}.pptx`} download className="btn">Télécharger le PowerPoint</a>
              {progChargee && <span className={`statut ${statut}`}>{STATUTS[statut]}</span>}
            </div>
          </div>
          <div className="banniere-visuel">
            <VisuelCours domaine={cours.domaine} sujet={cours.sujet} licence={licence} classeImage="banniere-img" taillePicto={52} prioritaire />
          </div>
        </div>
        <Vague />
      </header>

      <div className="page page-cours">
        <div className="lecon" ref={lecon}>
          <nav className="sommaire" aria-label="Sommaire du cours">
            <p className="sommaire-tete">Sommaire · {avance} %</p>
            <div className="bar" role="img" aria-label={`${avance} % du cours parcouru`}><span style={{ width: `${avance}%` }} /></div>
            <ol>
              {etapes.map((x, i) => (
                <li key={i}>
                  <button className="etape" onClick={() => aller(i)} aria-current={i === actif ? 'step' : undefined}>
                    <span className={`point ${lu(i) ? 'lu' : ''}`} aria-hidden="true">{lu(i) ? '✓' : i + 1}</span>
                    <span>{x.titre}{lu(i) && <span className="sr"> (lu)</span>}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div style={{ minWidth: 0 }}>
            <article className="card chapitre" aria-labelledby="titre-chapitre">
              <p className="chapitre-num">Chapitre {actif + 1} sur {n}</p>
              <h2 id="titre-chapitre">{e.titre}</h2>

              {e.type === 'objectifs' && (
                <>
                  <p>À la fin de ce cours, tu sauras :</p>
                  <ul className="coches">
                    {cours.objectifs.map((o, i) => <li key={i}><span className="coche" aria-hidden="true">✓</span><span>{o}</span></li>)}
                  </ul>
                  {cours.prerequisCours.length > 0 && (
                    <div className="encadre">
                      <h3>Cours à connaître avant</h3>
                      <ul className="prerequis">
                        {cours.prerequisCours.map((p) => (
                          <li key={p.slug}><Link href={`/cours/${p.slug}`}>{p.titre}</Link> <span className={`statut ${statutDe(p.slug)}`}>{STATUTS[statutDe(p.slug)]}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aFaireAvant.length > 0 && (
                    <div className="conseil" role="note">
                      <strong>Conseil :</strong> commence par {aFaireAvant.length > 1 ? 'les cours' : 'le cours'} {aFaireAvant.map((p, i) => <span key={p.slug}>{i ? ' et ' : ''}<Link href={`/cours/${p.slug}`}>« {p.titre} »</Link></span>)}. Ce cours s’appuie dessus.
                    </div>
                  )}
                  <div className="encadre">
                    <h3>Prérequis</h3>
                    {cours.prerequis.length ? <ul>{cours.prerequis.map((p, i) => <li key={i}>{p}</li>)}</ul> : <p className="small" style={{ margin: 0 }}>Aucun : ce cours peut être suivi directement.</p>}
                  </div>
                  {cours.referentiels.length > 0 && (
                    <div className="encadre">
                      <h3>Référentiels</h3>
                      <ul>{cours.referentiels.map((r, i) => <li key={i}>{r}</li>)}</ul>
                    </div>
                  )}
                </>
              )}

              {e.type === 'section' && <Markdown texte={e.corps} />}

              {e.type === 'correction' && (corrigees.has(actif) ? <Markdown texte={e.corps} /> : (
                <div className="masque">
                  <p>Essaie d’abord les exercices sur ta feuille.</p>
                  <button className="btn primary" onClick={() => setCorrigees((s) => new Set(s).add(actif))}>Afficher la correction</button>
                </div>
              ))}

              {e.type === 'quiz' && (
                <>
                  {cours.quiz.length ? <Quiz slug={slug} questions={cours.quiz} onFini={() => { chargerProg().catch(() => {}); }} /> : <p className="muted">Ce cours n’a pas de quiz.</p>}
                  {prog?.quizTotal ? <p className="small">Meilleur score : <strong>{prog.quizScore}/{prog.quizTotal}</strong> ({prog.quizEssais} essai{prog.quizEssais > 1 ? 's' : ''})</p> : null}
                  <div className="fin">
                    {termine
                      ? <><strong>✓ Cours terminé. Bravo !</strong><Link href="/accueil" className="btn">Retour à l’accueil</Link></>
                      : <><strong>Tu as fini ce cours ?</strong><button className="btn primary" onClick={() => terminer().catch(() => {})}>Marquer comme terminé</button></>}
                  </div>
                  {suivant && (
                    <Link href={`/cours/${suivant.slug}`} className="suivant-conseille">
                      <span className="small muted">Cours suivant conseillé</span>
                      <strong>{suivant.titre} →</strong>
                    </Link>
                  )}
                </>
              )}

              <div className="chapitre-nav">
                {actif > 0 && <button className="btn" onClick={() => aller(actif - 1)}>← {etapes[actif - 1].titre}</button>}
                {actif < n - 1 && <button className="btn primary suivant" onClick={() => aller(actif + 1)}>{etapes[actif + 1].titre} →</button>}
              </div>
            </article>

            <section className="card notes">
              <h2>Mes notes <span className="muted small" aria-live="polite">{etatNote}</span></h2>
              <label htmlFor="note" className="sr">Mes notes sur ce cours</label>
              <textarea id="note" value={note} onChange={(ev) => ecrire(ev.target.value)} placeholder="Ce que j’ai compris, mes questions, mes commandes utiles…" rows={6} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PageCours() {
  const { slug } = useParams<{ slug: string }>();
  return <Shell plein>{() => <Contenu slug={slug} />}</Shell>;
}
