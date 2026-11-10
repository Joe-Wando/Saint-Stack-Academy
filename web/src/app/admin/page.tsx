'use client';

import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AdminCadre from '@/components/AdminCadre';
import Avatar from '@/components/Avatar';
import { api, NIVEAUX, Niveau } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';

interface Tableau {
  chiffres: { inscrits: number; verifies: number; actifs7: number; actifs30: number; coursTermines: number; quizPasses: number; messagesNonLus: number };
  inscriptionsParSemaine: { semaine: string; nombre: number }[];
  activiteParSemaine: { semaine: string; nombre: number }[];
  parNiveau: { niveau: string; nombre: number }[];
  parOption: { option: string; titre: string; nombre: number }[];
  derniersInscrits: { id: number; nom: string; email: string; photo: string | null; niveau: string | null; inscritLe: string }[];
  derniersMessages: { id: number; nom: string; sujet: string; lu: boolean; date: string }[];
  journal: { id: number; action: string; cible: string; detail: Record<string, unknown>; date: string; admin: string | null }[];
}

const ACTIONS: Record<string, string> = {
  suspension: 'Suspension', reactivation: 'Réactivation', changement_role: 'Changement de rôle', suppression: 'Suppression',
  changement_niveau: 'Changement de niveau', verification_manuelle: 'Vérification manuelle', renvoi_verification: 'Renvoi de la vérification',
  rechargement_contenu: 'Rechargement des cours',
};
const jour = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
const quand = (iso: string) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function Histogramme({ titre, donnees, unite }: { titre: string; donnees: { libelle: string; nombre: number }[]; unite: string }) {
  return (
    <figure className="graphique">
      <figcaption><strong>{titre}</strong></figcaption>
      <div className="graphique-zone" aria-hidden="true">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={donnees} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E5EE" />
            <XAxis dataKey="libelle" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} width={32} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${Number(v ?? 0)} ${unite}`, '']} />
            <Bar dataKey="nombre" fill="#534AB7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details className="donnees-alt"><summary>Voir les données</summary>
        <table className="table"><tbody>{donnees.map((d) => <tr key={d.libelle}><td>{d.libelle}</td><td className="num">{d.nombre}</td></tr>)}</tbody></table>
      </details>
    </figure>
  );
}

function Contenu() {
  const { donnees: t, erreur } = useDonnees(() => api<Tableau>('/admin'));
  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!t) return <p className="muted">Chargement…</p>;
  const c = t.chiffres;
  const max = Math.max(1, ...t.parNiveau.map((n) => n.nombre));

  return (
    <>
      <h1>Tableau de bord</h1>
      <section className="chiffres chiffres-4" aria-label="Chiffres clés">
        <div className="chiffre"><span className="k">Inscrits</span><span className="v">{c.inscrits}</span><span className="muted small">{c.verifies} vérifié{c.verifies > 1 ? 's' : ''}</span></div>
        <div className="chiffre"><span className="k">Actifs</span><span className="v">{c.actifs7}</span><span className="muted small">sur 7 jours · {c.actifs30} sur 30 jours</span></div>
        <div className="chiffre"><span className="k">Cours terminés</span><span className="v">{c.coursTermines}</span><span className="muted small">{c.quizPasses} quiz passés</span></div>
        <div className={`chiffre ${c.messagesNonLus ? 'warn' : ''}`}><span className="k">Messages non lus</span><span className="v">{c.messagesNonLus}</span><Link className="small" href="/admin/messages">Voir les messages</Link></div>
      </section>

      <div className="grid2">
        <section className="card"><Histogramme titre="Inscriptions par semaine" unite="inscription(s)" donnees={t.inscriptionsParSemaine.map((s) => ({ libelle: jour(s.semaine), nombre: s.nombre }))} /></section>
        <section className="card"><Histogramme titre="Activité par semaine" unite="activité(s)" donnees={t.activiteParSemaine.map((s) => ({ libelle: jour(s.semaine), nombre: s.nombre }))} /></section>
      </div>

      <div className="grid2">
        <section className="card">
          <h2 className="h-petit">Répartition par niveau</h2>
          <ul className="barres-domaines">
            {t.parNiveau.map((n) => (
              <li key={n.niveau}>
                <span className="bd-nom">{NIVEAUX[n.niveau as Niveau] ?? 'Non renseigné'}</span>
                <div className="bar" aria-hidden="true"><span style={{ width: `${(100 * n.nombre) / max}%` }} /></div>
                <span className="small bd-chiffres">{n.nombre}</span>
              </li>
            ))}
            {t.parOption.map((o) => (
              <li key={o.option}>
                <span className="bd-nom muted">L3 · {o.titre}</span>
                <div className="bar" aria-hidden="true" style={{ opacity: .7 }}><span style={{ width: `${(100 * o.nombre) / max}%` }} /></div>
                <span className="small bd-chiffres">{o.nombre}</span>
              </li>
            ))}
            {!t.parNiveau.length && <li className="muted">Aucun inscrit pour l’instant.</li>}
          </ul>
        </section>
        <section className="card">
          <h2 className="h-petit">Derniers inscrits</h2>
          <ul className="liste-simple">
            {t.derniersInscrits.map((u) => (
              <li key={u.id}>
                <Avatar nom={u.nom} photo={u.photo} taille={32} />
                <Link href={`/admin/utilisateurs/${u.id}`}>{u.nom}</Link>
                <span className="small muted">{u.niveau ? NIVEAUX[u.niveau as Niveau] : '–'} · {jour(u.inscritLe)}</span>
              </li>
            ))}
          </ul>
          <h2 className="h-petit" style={{ marginTop: '1.4rem' }}>Derniers messages</h2>
          {t.derniersMessages.length ? (
            <ul className="liste-simple">
              {t.derniersMessages.map((m) => (
                <li key={m.id} className={m.lu ? '' : 'non-lu'}>
                  <Link href={`/admin/messages#m-${m.id}`}>{m.sujet}</Link><span className="small muted">{m.nom} · {jour(m.date)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="muted">Aucun message.</p>}
        </section>
      </div>

      <section className="card">
        <h2 className="h-petit">Journal d’administration</h2>
        <p className="small muted">Chaque action sur un compte est enregistrée ici.</p>
        {t.journal.length ? (
          <div className="scroll">
            <table className="table">
              <thead><tr><th>Date</th><th>Action</th><th>Compte</th><th>Détail</th><th>Par</th></tr></thead>
              <tbody>
                {t.journal.map((j) => (
                  <tr key={j.id}>
                    <td className="small">{quand(j.date)}</td>
                    <td>{ACTIONS[j.action] ?? j.action}</td>
                    <td className="small">{j.cible}</td>
                    <td className="small muted">{Object.entries(j.detail ?? {}).map(([k, v]) => `${k} : ${v}`).join(', ')}</td>
                    <td className="small">{j.admin ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="muted">Aucune action pour l’instant.</p>}
      </section>
    </>
  );
}

export default function TableauAdmin() {
  return <AdminCadre>{() => <Contenu />}</AdminCadre>;
}
