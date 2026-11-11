'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import AdminCadre from '@/components/AdminCadre';
import Avatar from '@/components/Avatar';
import Evolution, { DonneesEvolution } from '@/components/Evolution';
import { BadgeObtenu, ListeBadges } from '@/components/MesBadges';
import { CarteNiveaux, OptionsL3 } from '@/components/ChoixNiveau';
import { api, NIVEAUX, Niveau, Utilisateur } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';

interface Fiche {
  utilisateur: {
    id: number; nom: string; email: string; role: 'admin' | 'apprenant'; niveau: Niveau | null; optionL3: string | null; optionTitre: string | null;
    etablissement: string | null; photo: string | null; suspendu: boolean; emailVerifie: boolean; inscritLe: string; confidentialiteAccepteeLe: string | null;
  };
  evolution: DonneesEvolution;
  activites: { cours: string; titre: string; type: string; detail: { chapitre?: number; score?: number; total?: number } | null; date: string }[];
  certifications: BadgeObtenu[];
}

const TYPES: Record<string, string> = { cours_commence: 'Cours commencé', chapitre_lu: 'Chapitre lu', cours_termine: 'Cours terminé', quiz: 'Quiz' };
const quand = (iso: string) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '–');

function Contenu({ id, moi }: { id: string; moi: Utilisateur }) {
  const router = useRouter();
  const { donnees: f, erreur, recharger } = useDonnees(() => api<Fiche>(`/admin/utilisateurs/${id}`), [id]);
  const [message, setMessage] = useState('');
  const [echec, setEchec] = useState('');
  const [niveau, setNiveau] = useState<Niveau | ''>('');
  const [option, setOption] = useState('');
  const [edition, setEdition] = useState(false);

  if (erreur) return <p className="error" role="alert">{erreur} <Link href="/admin/utilisateurs">Retour à la liste</Link></p>;
  if (!f) return <p className="muted">Chargement…</p>;
  const u = f.utilisateur;
  const soiMeme = u.id === moi.id;

  async function agir(libelle: string, appel: () => Promise<unknown>, confirmation?: string) {
    if (confirmation && !window.confirm(confirmation)) return;
    setMessage(''); setEchec('');
    try { await appel(); setMessage(libelle); recharger(); } catch (x) { setEchec((x as Error).message); }
  }
  const post = (chemin: string, corps: unknown = {}) => api(`/admin/utilisateurs/${u.id}${chemin}`, { method: 'POST', body: JSON.stringify(corps) });

  return (
    <>
      <Link href="/admin/utilisateurs" className="small">← Utilisateurs</Link>
      <section className="profil-tete">
        <Avatar nom={u.nom} photo={u.photo} niveau={u.niveau} taille={88} />
        <div>
          <h1>{u.nom}</h1>
          <p className="muted" style={{ margin: 0 }}>{u.email} · {u.role === 'admin' ? 'Admin' : 'Apprenant'}</p>
          <p className="small muted" style={{ margin: 0 }}>
            {u.niveau ? NIVEAUX[u.niveau] : 'Niveau non renseigné'}{u.optionTitre ? ` · ${u.optionTitre}` : ''}{u.etablissement ? ` · ${u.etablissement}` : ''} · inscrit le {date(u.inscritLe)}
          </p>
          <p className="etiquettes">
            <span className={`statut ${u.emailVerifie ? 'termine' : ''}`}>{u.emailVerifie ? 'E-mail vérifié' : 'E-mail non vérifié'}</span>
            {u.suspendu && <span className="statut en_cours">Compte suspendu</span>}
            <span className="statut">{u.confidentialiteAccepteeLe ? `Confidentialité acceptée le ${date(u.confidentialiteAccepteeLe)}` : 'Confidentialité : compte antérieur'}</span>
          </p>
        </div>
      </section>

      <section className="card">
        <h2 className="h-petit">Actions</h2>
        {soiMeme && <p className="small muted">C’est ton compte : la suspension, le changement de rôle et la suppression sont désactivés.</p>}
        <div className="actions-admin">
          <button className="btn" onClick={() => { setEdition((e) => !e); setNiveau(u.niveau ?? ''); setOption(u.optionL3 ?? ''); }}>Changer le niveau</button>
          {!u.emailVerifie && <button className="btn" onClick={() => agir('Lien de vérification renvoyé.', () => post('/renvoyer-verification'))}>Renvoyer la vérification</button>}
          {!u.emailVerifie && <button className="btn" onClick={() => agir('Adresse marquée comme vérifiée.', () => post('/verifier'))}>Marquer comme vérifié</button>}
          {!soiMeme && (u.suspendu
            ? <button className="btn" onClick={() => agir('Compte réactivé.', () => post('/suspendre', { suspendu: false }))}>Réactiver</button>
            : <button className="btn" onClick={() => agir('Compte suspendu.', () => post('/suspendre', { suspendu: true }), `Suspendre le compte de ${u.nom} ? Il ne pourra plus se connecter.`)}>Suspendre</button>)}
          {!soiMeme && (u.role === 'admin'
            ? <button className="btn" onClick={() => agir('Rôle changé : apprenant.', () => post('/role', { role: 'apprenant' }), `Retirer le rôle admin à ${u.nom} ?`)}>Passer en apprenant</button>
            : <button className="btn" onClick={() => agir('Rôle changé : admin.', () => post('/role', { role: 'admin' }), `Donner le rôle admin à ${u.nom} ? Il pourra tout voir et tout modifier.`)}>Passer en admin</button>)}
          {!soiMeme && (
            <button className="btn danger" onClick={() => agir('', async () => {
              await api(`/admin/utilisateurs/${u.id}`, { method: 'DELETE' });
              router.replace('/admin/utilisateurs');
            }, `Supprimer définitivement le compte de ${u.nom} et toutes ses données ?`)}>Supprimer</button>
          )}
        </div>
        {edition && (
          <div className="form" style={{ marginTop: '1rem', maxWidth: 560 }}>
            <CarteNiveaux valeur={niveau} onChange={(n) => { setNiveau(n); if (n !== 'L3') setOption(''); }} />
            {niveau === 'L3' && <OptionsL3 valeur={option} onChange={setOption} />}
            <button className="btn primary" onClick={() => agir('Niveau enregistré.', async () => {
              await api(`/admin/utilisateurs/${u.id}`, { method: 'PATCH', body: JSON.stringify({ niveau, optionL3: niveau === 'L3' ? option : null }) });
              setEdition(false);
            })}>Enregistrer le niveau</button>
          </div>
        )}
        {message && <p className="succes" role="status" style={{ marginTop: '.8rem' }}>{message}</p>}
        {echec && <p className="error" role="alert" style={{ marginTop: '.8rem' }}>{echec}</p>}
      </section>

      <h2>Son évolution</h2>
      <Evolution e={f.evolution} moi={false} niveau={u.niveau} />

      <section className="card">
        <h2 className="h-petit">Ses badges et certifications</h2>
        <ListeBadges badges={f.certifications} niveau={u.niveau} />
      </section>

      <section className="card">
        <h2 className="h-petit">Historique des activités</h2>
        {f.activites.length ? (
          <div className="scroll">
            <table className="table">
              <thead><tr><th>Date</th><th>Activité</th><th>Cours</th><th>Détail</th></tr></thead>
              <tbody>
                {f.activites.map((a, i) => (
                  <tr key={i}>
                    <td className="small">{quand(a.date)}</td>
                    <td>{TYPES[a.type] ?? a.type}</td>
                    <td className="small"><Link href={`/cours/${a.cours}`}>{a.titre}</Link></td>
                    <td className="small muted">{a.type === 'quiz' && a.detail ? `${a.detail.score}/${a.detail.total}` : a.type === 'chapitre_lu' && a.detail ? `chapitre ${Number(a.detail.chapitre) + 1}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="muted">Aucune activité enregistrée.</p>}
      </section>
    </>
  );
}

export default function FicheUtilisateur() {
  const { id } = useParams<{ id: string }>();
  return <AdminCadre>{(moi) => <Contenu id={id} moi={moi} />}</AdminCadre>;
}
