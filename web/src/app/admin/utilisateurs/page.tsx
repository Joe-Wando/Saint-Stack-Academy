'use client';

import { useEffect, useState } from 'react';
import Shell, { initiales } from '@/components/Shell';
import { api, NIVEAUX, Niveau } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';

interface Ligne {
  id: number; nom: string; email: string; role: 'admin' | 'apprenant';
  niveau: Niveau | null; optionL3: string | null; optionTitre: string | null; etablissement: string | null;
  emailVerifie: boolean; inscritLe: string; derniereActivite: string | null;
  commences: number; termines: number; moyenneQuiz: number | null;
}
interface Reponse { total: number; page: number; pages: number; parPage: number; utilisateurs: Ligne[] }

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '–');

/** Liste des comptes inscrits, réservée à l'admin. */
function Contenu() {
  const [q, setQ] = useState('');
  const [recherche, setRecherche] = useState('');
  const [niveau, setNiveau] = useState('');
  const [verifie, setVerifie] = useState('');
  const [tri, setTri] = useState('inscription');
  const [page, setPage] = useState(1);

  // La recherche part 300 ms après la dernière frappe.
  useEffect(() => { const t = setTimeout(() => { setRecherche(q); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);

  const params = new URLSearchParams({ q: recherche, niveau, verifie, tri, page: String(page) }).toString();
  const { donnees: r, erreur } = useDonnees(() => api<Reponse>(`/admin/utilisateurs?${params}`), [params]);

  const filtre = (setter: (v: string) => void) => (e: { target: { value: string } }) => { setter(e.target.value); setPage(1); };

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Administration</p>
        <h1>Utilisateurs</h1>
        <p className="muted">Les comptes inscrits et leur avancement.{r ? ` ${r.total} compte${r.total > 1 ? 's' : ''}.` : ''}</p>
      </section>

      <section className="card filtres-admin" aria-label="Rechercher et filtrer">
        <label htmlFor="q">Rechercher<input id="q" type="search" className="champ" placeholder="Nom ou e-mail" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <label htmlFor="niveau">Niveau
          <select id="niveau" className="champ" value={niveau} onChange={filtre(setNiveau)}>
            <option value="">Tous</option>
            {(Object.keys(NIVEAUX) as Niveau[]).map((n) => <option key={n} value={n}>{NIVEAUX[n]}</option>)}
            <option value="aucun">Non renseigné</option>
          </select>
        </label>
        <label htmlFor="verifie">E-mail
          <select id="verifie" className="champ" value={verifie} onChange={filtre(setVerifie)}>
            <option value="">Tous</option><option value="oui">Vérifié</option><option value="non">Non vérifié</option>
          </select>
        </label>
        <label htmlFor="tri">Trier par
          <select id="tri" className="champ" value={tri} onChange={filtre(setTri)}>
            <option value="inscription">Inscription récente</option>
            <option value="activite">Dernière activité</option>
            <option value="nom">Nom</option>
            <option value="termines">Cours terminés</option>
          </select>
        </label>
      </section>

      {erreur && <p className="error" role="alert">{erreur}</p>}
      {!r && !erreur && <p className="muted">Chargement…</p>}
      {r && (
        <section className="card">
          <div className="scroll">
            <table className="table">
              <thead><tr><th>Nom</th><th>Niveau</th><th>Inscription</th><th>Dernière activité</th><th className="num">Commencés</th><th className="num">Terminés</th><th className="num">Moyenne quiz</th></tr></thead>
              <tbody>
                {r.utilisateurs.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="personne">
                        <span className="avatar" aria-hidden="true">{initiales(u.nom)}</span>
                        <span>
                          <strong>{u.nom}</strong>{u.role === 'admin' && <span className="tag" style={{ marginLeft: '.4rem' }}>Admin</span>}<br />
                          <span className="muted small">{u.email}</span>
                          {!u.emailVerifie && <> <span className="statut en_cours">E-mail non vérifié</span></>}
                          {u.etablissement && <><br /><span className="muted small">{u.etablissement}</span></>}
                        </span>
                      </div>
                    </td>
                    <td className="small">{u.niveau ? NIVEAUX[u.niveau] : '–'}{u.optionTitre && <><br /><span className="muted">{u.optionTitre}</span></>}</td>
                    <td className="small">{date(u.inscritLe)}</td>
                    <td className="small">{date(u.derniereActivite)}</td>
                    <td className="num">{u.commences}</td>
                    <td className="num">{u.termines}</td>
                    <td className="num">{u.moyenneQuiz === null ? '–' : `${u.moyenneQuiz} %`}</td>
                  </tr>
                ))}
                {!r.utilisateurs.length && <tr><td colSpan={7} className="muted">Aucun compte ne correspond.</td></tr>}
              </tbody>
            </table>
          </div>
          {r.pages > 1 && (
            <nav className="pagination" aria-label="Pages">
              <button className="btn sm" disabled={r.page <= 1} onClick={() => setPage(r.page - 1)}>← Précédente</button>
              <span className="small">Page {r.page} sur {r.pages}</span>
              <button className="btn sm" disabled={r.page >= r.pages} onClick={() => setPage(r.page + 1)}>Suivante →</button>
            </nav>
          )}
        </section>
      )}
    </>
  );
}

export default function Utilisateurs() {
  return <Shell admin>{() => <Contenu />}</Shell>;
}
