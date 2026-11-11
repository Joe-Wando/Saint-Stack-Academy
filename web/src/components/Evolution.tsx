'use client';

import Link from 'next/link';
import type { CSSProperties, JSX } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { pourcent } from '@/lib/api';
import EtatVide from './EtatVide';
import { ILLUS } from '@/lib/illustrations-pages';
import { couleurUtilisateur, infoDomaine } from '@/lib/domaines';
import { Award, Medal } from 'lucide-react';
import { Macaron } from './Decor';

export interface DonneesEvolution {
  totaux: { coursTermines: number; coursCommences: number; chapitresLus: number; quizPasses: number; moyenneQuiz: number | null };
  parSemaine: { semaine: string; termines: number; chapitres: number }[];
  quiz: { cours: string; titre: string; score: number; total: number; date: string }[];
  domaines: { domaine: string; total: number; termines: number; moyenneQuiz: number | null; niveau: string }[];
  jalons: { code: string; titre: string; atteint: boolean; date: string | null; detail?: string }[];
  notes: { cours: string; titre: string; majLe: string }[];
}

const jour = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
const date = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const COULEUR = '#534AB7';

/** Macaron des badges de la plateforme : médaille pour un parcours terminé, sinon la récompense. Gris tant qu'il n'est pas atteint. */
function MacaronJalon({ code, atteint, couleur }: { code: string; atteint: boolean; couleur: string }) {
  return <Macaron icone={code === 'parcours' ? Medal : Award} couleur={couleur} taille={44} className={atteint ? '' : 'eteint'} />;
}

/** Graphique accompagné d'un tableau de données, lisible par les lecteurs d'écran. */
function Graphique({ titre, description, children, tableau }: { titre: string; description: string; children: JSX.Element; tableau: JSX.Element }) {
  return (
    <figure className="graphique">
      <figcaption><strong>{titre}</strong><span className="muted small">{description}</span></figcaption>
      <div className="graphique-zone" aria-hidden="true">
        <ResponsiveContainer width="100%" height={240}>{children}</ResponsiveContainer>
      </div>
      <details className="donnees-alt">
        <summary>Voir les données sous forme de tableau</summary>
        <div className="scroll">{tableau}</div>
      </details>
    </figure>
  );
}

export default function Evolution({ e, moi = true, niveau }: { e: DonneesEvolution; moi?: boolean; niveau?: string | null }) {
  const semaines = e.parSemaine.map((s) => ({ ...s, libelle: jour(s.semaine) }));
  const quiz = e.quiz.map((q, i) => ({ ...q, n: i + 1, pct: Math.round((100 * q.score) / q.total) }));
  const domaines = e.domaines.filter((d) => d.termines > 0 || d.moyenneQuiz !== null);
  const t = e.totaux;

  return (
    <div className="evolution">
      {moi && t.coursCommences === 0 && t.chapitresLus === 0 && (
        <EtatVide image={ILLUS.videCours} titre="Tu n’as pas encore commencé de cours">
          <p className="muted">Ton évolution apparaîtra ici dès ton premier chapitre lu. <Link href="/licence">Choisir un cours</Link></p>
        </EtatVide>
      )}
      <section className="chiffres chiffres-4" aria-label="Chiffres clés">
        <div className="chiffre"><span className="k">Cours terminés</span><span className="v">{t.coursTermines}</span><span className="muted small">{t.coursCommences} commencé{t.coursCommences > 1 ? 's' : ''}</span></div>
        <div className="chiffre"><span className="k">Chapitres lus</span><span className="v">{t.chapitresLus}</span></div>
        <div className="chiffre"><span className="k">Quiz passés</span><span className="v">{t.quizPasses}</span></div>
        <div className="chiffre"><span className="k">Moyenne aux quiz</span><span className="v">{t.moyenneQuiz === null ? '–' : `${t.moyenneQuiz} %`}</span></div>
      </section>

      <div className="grid2">
        <section className="card">
          <Graphique titre={moi ? 'Mon activité sur 12 semaines' : 'Activité sur 12 semaines'} description="Chapitres lus par semaine (semaine du lundi)."
            tableau={(
              <table className="table"><thead><tr><th>Semaine du</th><th className="num">Chapitres lus</th><th className="num">Cours terminés</th></tr></thead>
                <tbody>{semaines.map((s) => <tr key={s.semaine}><td>{date(s.semaine)}</td><td className="num">{s.chapitres}</td><td className="num">{s.termines}</td></tr>)}</tbody></table>
            )}>
            <BarChart data={semaines} margin={{ top: 8, right: 8, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E5EE" />
              <XAxis dataKey="libelle" tick={{ fontSize: 11 }} interval="preserveStartEnd" label={{ value: 'Semaine du', position: 'insideBottom', offset: -12, fontSize: 12 }} />
              <YAxis allowDecimals={false} width={36} tick={{ fontSize: 11 }} label={{ value: 'Chapitres', angle: -90, position: 'insideLeft', fontSize: 12 }} />
              <Tooltip formatter={(v) => { const n = Number(v ?? 0); return [`${n} chapitre${n > 1 ? 's' : ''}`, 'Lus']; }} labelFormatter={(l) => `Semaine du ${l}`} />
              <Bar dataKey="chapitres" name="Chapitres lus" fill={COULEUR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </Graphique>
        </section>

        <section className="card">
          {quiz.length ? (
            <Graphique titre={moi ? 'Mes résultats aux quiz' : 'Résultats aux quiz'} description="Score de chaque tentative, en pourcentage, dans l’ordre. Ligne de repère à 60 %."
              tableau={(
                <table className="table"><thead><tr><th>Date</th><th>Cours</th><th className="num">Score</th></tr></thead>
                  <tbody>{quiz.map((q) => <tr key={q.n}><td>{date(q.date)}</td><td>{q.titre}</td><td className="num">{q.score}/{q.total} ({q.pct} %)</td></tr>)}</tbody></table>
              )}>
              <LineChart data={quiz} margin={{ top: 8, right: 12, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E5EE" />
                <XAxis dataKey="n" tick={{ fontSize: 11 }} label={{ value: 'Tentative', position: 'insideBottom', offset: -12, fontSize: 12 }} />
                <YAxis domain={[0, 100]} width={40} tick={{ fontSize: 11 }} unit=" %" />
                <ReferenceLine y={60} stroke="#B4570B" strokeDasharray="5 4" label={{ value: '60 %', position: 'right', fontSize: 11, fill: '#633806' }} />
                <Tooltip formatter={(v) => [`${Number(v ?? 0)} %`, 'Score']} labelFormatter={(n) => { const q = quiz[Number(n) - 1]; return q ? `${q.titre} · ${jour(q.date)}` : ''; }} />
                <Line type="monotone" dataKey="pct" name="Score" stroke={COULEUR} strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </Graphique>
          ) : (
            <><h2 className="h-petit">{moi ? 'Mes résultats aux quiz' : 'Résultats aux quiz'}</h2><p className="muted">Aucun quiz passé pour l’instant. Le quiz se trouve au dernier chapitre de chaque cours.</p></>
          )}
        </section>
      </div>

      <section className="card">
        <h2 className="h-petit">{moi ? 'Mes compétences par domaine' : 'Compétences par domaine'}</h2>
        {domaines.length ? (
          <ul className="barres-domaines">
            {domaines.map((d) => {
              const dom = infoDomaine(d.domaine);
              return (
                <li key={d.domaine}>
                  <span className="bd-nom">{d.domaine}</span>
                  <div className="bar" style={{ '--bar': dom.accent } as CSSProperties} role="img" aria-label={`${d.termines} cours terminés sur ${d.total}`}>
                    <span style={{ width: `${pourcent(d.termines, d.total)}%` }} />
                  </div>
                  <span className="small muted bd-chiffres">{d.termines}/{d.total}{d.moyenneQuiz !== null ? ` · quiz ${d.moyenneQuiz} %` : ''}</span>
                  <span className={`lvl ${({ 'Pas commencé': 'lvl-0', Découverte: 'lvl-1', Bases: 'lvl-2', Opérationnel: 'lvl-3' } as Record<string, string>)[d.niveau]}`}>{d.niveau}</span>
                </li>
              );
            })}
          </ul>
        ) : <p className="muted">Termine un premier cours pour voir apparaître tes domaines.</p>}
      </section>

      <section className="card">
        <h2 className="h-petit">{moi ? 'Mes jalons' : 'Jalons'}</h2>
        <ul className="jalons">
          {e.jalons.map((j) => (
            <li key={j.code} className={j.atteint ? 'atteint' : ''}>
              <MacaronJalon code={j.code} atteint={j.atteint} couleur={couleurUtilisateur(niveau)} />
              <span>
                <strong>{j.titre}</strong>
                <span className="small muted">{j.atteint && j.date ? `Le ${date(j.date)}${j.detail ? ` · ${j.detail}` : ''}` : 'Pas encore atteint'}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="h-petit">{moi ? 'Mes notes' : 'Notes'}</h2>
        {e.notes.length ? (
          <ul className="liste-notes">
            {e.notes.map((n) => <li key={n.cours}>{moi ? <Link href={`/cours/${n.cours}`}>{n.titre}</Link> : n.titre}<span className="small muted"> · {date(n.majLe)}</span></li>)}
          </ul>
        ) : <p className="muted">{moi ? 'Tu n’as pas encore écrit de notes. Le bloc « Mes notes » se trouve sous chaque chapitre.' : 'Aucune note.'}</p>}
      </section>
    </div>
  );
}
