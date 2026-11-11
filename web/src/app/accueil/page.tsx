'use client';

import Link from 'next/link';
import { CSSProperties } from 'react';
import Shell from '@/components/Shell';
import { Souligne } from '@/components/Decor';
import CarteCours from '@/components/CarteCours';
import VisuelCours from '@/components/VisuelCours';
import EtatVide from '@/components/EtatVide';
import { ILLUS } from '@/lib/illustrations-pages';
import { api, capitale, dureeH, indexer, libelleNiveau, MonNiveau, pourcent, Progression, ResumeCours, Utilisateur } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';
import { infoDomaine, styleDomaine } from '@/lib/domaines';
import { niveau as niveauStat, parDomaine } from '@/lib/stats';

/** Chapitres lus, mémorisés dans ce navigateur par la page de cours (clés ssa-lu-<slug>). */
function chapitresLus() {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) ?? '';
      if (k.startsWith('ssa-lu-')) total += Math.max(0, Number(localStorage.getItem(k)) || 0);
    }
  } catch { /* stockage indisponible */ }
  return total;
}

function Contenu({ u }: { u: Utilisateur }) {
  const { donnees, erreur } = useDonnees(() => Promise.all([
    api<MonNiveau>('/mon-niveau'), api<(Progression & { majLe?: string })[]>('/progression'), api<ResumeCours[]>('/cours'),
  ]));
  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!donnees) return <p className="muted">Chargement…</p>;
  const [mon, prog, tous] = donnees;

  const idx = indexer(prog);
  const statut = (slug: string) => idx.get(slug)?.statut ?? 'a_faire';
  const parSlug = new Map(tous.map((c) => [c.slug, c]));
  const coursNiveau = [...new Map(mon.ues.flatMap((ue) => ue.cours).map((c) => [c.slug, c])).values()];

  // Reprendre : le dernier cours « en cours », sinon le premier cours non terminé de mon niveau.
  const dernierEnCours = prog.filter((p) => p.statut === 'en_cours' && parSlug.has(p.cours))
    .sort((a, b) => String(b.majLe ?? '').localeCompare(String(a.majLe ?? '')))[0];
  const reprise = dernierEnCours ? parSlug.get(dernierEnCours.cours)! : coursNiveau.find((c) => statut(c.slug) !== 'termine');

  const termines = coursNiveau.filter((c) => statut(c.slug) === 'termine').length;
  const quizFaits = prog.filter((p) => p.quizTotal);
  const moyenne = quizFaits.length ? Math.round((100 * quizFaits.reduce((s, p) => s + (p.quizScore ?? 0) / (p.quizTotal ?? 1), 0)) / quizFaits.length) : null;
  const stats = parDomaine(tous, prog).filter((s) => s.termines > 0 || coursNiveau.some((c) => c.domaine === s.domaine));
  const sansNiveau = !mon.niveau || mon.niveau === 'autre' || !mon.ues.length;

  return (
    <>
      <section className="bonjour">
        <h1>Bonjour <Souligne>{u.nom.split(' ')[0]}</Souligne></h1>
        <p className="date">{libelleNiveau(u, mon.option?.titre)}{u.etablissement ? ` · ${u.etablissement}` : ''}</p>
      </section>

      {reprise ? (
        <Link href={`/cours/${reprise.slug}`} className="reprendre" style={styleDomaine(reprise.domaine)}>
          <VisuelCours domaine={reprise.domaine} sujet={reprise.sujet} licence={reprise.licence} classeImage="reprendre-img" prioritaire />
          <div className="reprendre-corps">
            <span className="tag">{statut(reprise.slug) === 'en_cours' ? 'Reprendre' : 'Cours conseillé'}</span>
            <h2>{reprise.titre}</h2>
            {reprise.sujet && <span className="cc-sujet">{reprise.sujet.libelle}</span>}
            <p className="muted small" style={{ margin: 0 }}>
              {infoDomaine(reprise.domaine).nom} · {dureeH(reprise.duree)} · {capitale(reprise.difficulte)} · {reprise.objectifs.length} objectif{reprise.objectifs.length > 1 ? 's' : ''}
            </p>
            <span className="btn primary">{statut(reprise.slug) === 'en_cours' ? 'Continuer le cours' : 'Commencer le cours'} →</span>
          </div>
        </Link>
      ) : sansNiveau ? (
        <section className="card invitation">
          <EtatVide image={ILLUS.videCours} titre="Par où commencer ?">
            <p>Choisis un parcours métier : une suite de cours dans l’ordre, pour viser un métier. Tu peux aussi indiquer ton niveau de licence dans ton profil.</p>
            <div className="banniere-actions"><Link href="/parcours" className="btn primary">Choisir un parcours</Link><Link href="/profil" className="btn">Indiquer mon niveau</Link></div>
          </EtatVide>
        </section>
      ) : (
        <section className="card"><h2>Bravo, ton niveau est terminé</h2><p className="muted" style={{ margin: 0 }}>Tu as terminé tous les cours de ton niveau. Les <Link href="/parcours">parcours métiers</Link> et le <Link href="/catalogue">catalogue</Link> t’attendent.</p></section>
      )}

      <section className="chiffres" aria-label="Chiffres clés">
        <div className="chiffre">
          <span className="k">Cours terminés de mon niveau</span>
          <span className="v">{termines} sur {coursNiveau.length}</span>
          <div className="bar" role="img" aria-label={`${pourcent(termines, coursNiveau.length)} % terminés`}><span style={{ width: `${pourcent(termines, coursNiveau.length)}%` }} /></div>
        </div>
        <div className="chiffre">
          <span className="k">Moyenne aux quiz</span>
          <span className="v">{moyenne === null ? '–' : `${moyenne} %`}</span>
          <span className="muted small">{quizFaits.length} quiz passé{quizFaits.length > 1 ? 's' : ''}</span>
        </div>
        <div className="chiffre">
          <span className="k">Chapitres lus</span>
          <span className="v">{chapitresLus()}</span>
          <span className="muted small">sur cet appareil</span>
        </div>
      </section>

      {!sansNiveau && (
        <>
          <div className="section-head">
            <h2>Mon niveau</h2>
            <Link href={`/licence/${mon.niveau}`} className="small">Voir toute la {mon.niveau} →</Link>
          </div>
          {mon.ues.map((ue) => {
            const faits = ue.cours.filter((c) => statut(c.slug) === 'termine').length;
            const prochains = ue.cours.filter((c) => statut(c.slug) !== 'termine').slice(0, 3);
            return (
              <section key={`${ue.semestre}-${ue.ue}`} className="ue" aria-label={ue.ue}>
                <div className="ue-tete">
                  <h3><span className="muted small">{ue.semestre} · </span>{ue.ue}</h3>
                  <span className="small muted">{ue.cours.length ? `${faits} sur ${ue.cours.length}` : 'Cours en préparation'}</span>
                </div>
                {ue.cours.length > 0 && <div className="bar sm ue-bar" aria-hidden="true"><span style={{ width: `${pourcent(faits, ue.cours.length)}%` }} /></div>}
                {prochains.length > 0 && <div className="grille">{prochains.map((c) => <CarteCours key={c.slug} cours={c} prog={idx.get(c.slug)} />)}</div>}
                {ue.cours.length > 0 && !prochains.length && <p className="succes small">UE terminée.</p>}
              </section>
            );
          })}
        </>
      )}

      {stats.length > 0 && (
        <>
          <div className="section-head"><h2>Mes compétences</h2></div>
          <section className="card">
            <div className="scroll">
              <table className="table">
                <thead><tr><th>Domaine</th><th>Avancement</th><th className="num">Quiz</th><th>Niveau</th></tr></thead>
                <tbody>
                  {stats.map((s) => {
                    const n = niveauStat(s);
                    const d = infoDomaine(s.domaine);
                    return (
                      <tr key={s.domaine}>
                        <td><span className="pastille-dom" style={{ background: d.accent }} aria-hidden="true" />{s.domaine}</td>
                        <td style={{ minWidth: 120 }}>
                          <div className="bar sm" style={{ '--bar': d.accent } as CSSProperties}><span style={{ width: `${pourcent(s.termines, s.total)}%` }} /></div>
                          <span className="muted small">{s.termines}/{s.total}</span>
                        </td>
                        <td className="num">{s.quiz === null ? '–' : `${s.quiz} %`}</td>
                        <td><span className={`lvl ${n.cls}`}>{n.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="muted small" style={{ marginBottom: 0 }}>Niveaux : Découverte (commencé), Bases (au moins la moitié des cours et 60 % aux quiz), Opérationnel (90 % des cours et 80 % aux quiz).</p>
          </section>
        </>
      )}
    </>
  );
}

export default function Accueil() {
  return <Shell>{(u) => <Contenu u={u} />}</Shell>;
}
