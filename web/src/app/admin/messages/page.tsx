'use client';

import { useEffect, useState } from 'react';
import AdminCadre from '@/components/AdminCadre';
import { api } from '@/lib/api';
import { useDonnees } from '@/lib/donnees';

interface Message { id: number; nom: string; email: string; sujet: string; message: string; lu: boolean; date: string; utilisateurId: number | null }

const quand = (iso: string) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function Contenu() {
  const { donnees, erreur } = useDonnees(() => api<Message[]>('/admin/messages'));
  const [liste, setListe] = useState<Message[] | null>(null);
  const [ouvert, setOuvert] = useState<number | null>(null);
  useEffect(() => { if (donnees) setListe(donnees); }, [donnees]);
  // Arrivée depuis le tableau de bord : on ouvre le message demandé.
  useEffect(() => {
    const m = /^#m-(\d+)$/.exec(window.location.hash);
    if (m && liste) ouvrir(Number(m[1]));
  }, [liste === null]); // eslint-disable-line react-hooks/exhaustive-deps

  if (erreur) return <p className="error" role="alert">{erreur}</p>;
  if (!liste) return <p className="muted">Chargement…</p>;

  async function marquer(id: number, lu: boolean) {
    await api(`/admin/messages/${id}/lu`, { method: 'POST', body: JSON.stringify({ lu }) }).catch(() => {});
    setListe((l) => l?.map((m) => (m.id === id ? { ...m, lu } : m)) ?? l);
  }
  function ouvrir(id: number) {
    setOuvert((o) => (o === id ? null : id));
    const m = liste?.find((x) => x.id === id);
    if (m && !m.lu) marquer(id, true);
  }
  const nonLus = liste.filter((m) => !m.lu).length;

  return (
    <>
      <h1>Messages</h1>
      <p className="muted">{liste.length} message{liste.length > 1 ? 's' : ''}, dont {nonLus} non lu{nonLus > 1 ? 's' : ''}. Ouvrir un message le marque comme lu.</p>
      {!liste.length && <p className="card muted">Aucun message pour l’instant.</p>}
      <ul className="messages">
        {liste.map((m) => {
          const reponse = `mailto:${m.email}?subject=${encodeURIComponent(`Re : ${m.sujet}`)}&body=${encodeURIComponent(`Bonjour ${m.nom},\n\n\n\n---\nTon message du ${quand(m.date)} :\n${m.message}`)}`;
          return (
            <li key={m.id} id={`m-${m.id}`} className={`message${m.lu ? '' : ' non-lu'}`}>
              <button className="message-tete" aria-expanded={ouvert === m.id} onClick={() => ouvrir(m.id)}>
                <span className="message-sujet">{m.lu ? '' : <span className="sr">Non lu : </span>}{m.sujet}</span>
                <span className="small muted">{m.nom} · {quand(m.date)}</span>
              </button>
              {ouvert === m.id && (
                <div className="message-corps">
                  <p className="small muted" style={{ marginTop: 0 }}>De {m.nom} &lt;{m.email}&gt;{m.utilisateurId ? ' · compte inscrit' : ''}</p>
                  <p className="message-texte">{m.message}</p>
                  <div className="actions-admin">
                    <a className="btn primary" href={reponse}>Répondre par e-mail</a>
                    <button className="btn" onClick={() => marquer(m.id, !m.lu)}>{m.lu ? 'Marquer comme non lu' : 'Marquer comme lu'}</button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function Messages() {
  return <AdminCadre>{() => <Contenu />}</AdminCadre>;
}
