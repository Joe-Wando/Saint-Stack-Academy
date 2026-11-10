'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { API, session } from '@/lib/api';
import PhotoFondateur, { lirePhotoFondateur } from './PhotoFondateur';

const TAILLE_MAX = 2 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Tableau de bord de l'admin : changer la photo affichée sur la connexion, l'inscription, l'accueil et le contact. */
export default function ReglagePhotoFondateur() {
  const [version, setVersion] = useState(0);
  const [perso, setPerso] = useState<string | null>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [fichier, setFichier] = useState<File | null>(null);
  const [erreur, setErreur] = useState('');
  const [etat, setEtat] = useState('');
  const champ = useRef<HTMLInputElement>(null);
  useEffect(() => { lirePhotoFondateur().then(setPerso); }, [version]);
  useEffect(() => () => { if (apercu) URL.revokeObjectURL(apercu); }, [apercu]);

  function choisir(e: ChangeEvent<HTMLInputElement>) {
    setErreur(''); setEtat('');
    const f = e.target.files?.[0];
    if (!f) return;
    if (!TYPES.includes(f.type)) { setErreur('Format non accepté : choisis une image JPEG, PNG ou WebP.'); return; }
    if (f.size > TAILLE_MAX) { setErreur(`Cette image fait ${(f.size / 1024 / 1024).toFixed(1)} Mo : la limite est de 2 Mo.`); return; }
    setFichier(f); setApercu(URL.createObjectURL(f));
  }

  async function appeler(methode: 'POST' | 'DELETE', corps?: FormData) {
    const res = await fetch(`${API}/admin/site/photo-fondateur`, { method: methode, body: corps, headers: { authorization: `Bearer ${session()?.jeton ?? ''}` } });
    const r = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(r.message ?? 'Échec de l’opération.');
  }

  async function enregistrer() {
    if (!fichier) return;
    setErreur(''); setEtat('Envoi…');
    const d = new FormData();
    d.append('photo', fichier);
    try {
      await appeler('POST', d);
      await lirePhotoFondateur(true);
      setFichier(null); setApercu(null); setVersion((v) => v + 1);
      if (champ.current) champ.current.value = '';
      setEtat('La nouvelle photo est en ligne sur la page de connexion, l’inscription, l’accueil et le contact.');
    } catch (x) { setErreur((x as Error).message); setEtat(''); }
  }

  async function origine() {
    setErreur(''); setEtat('');
    try {
      await appeler('DELETE');
      await lirePhotoFondateur(true);
      setVersion((v) => v + 1);
      setEtat('La photo d’origine est de retour.');
    } catch (x) { setErreur((x as Error).message); }
  }

  return (
    <section className="card" aria-labelledby="t-photo-fondateur">
      <h2 id="t-photo-fondateur" className="h-petit">Photo de la page de connexion</h2>
      <p className="small muted">Ton portrait affiché sur la connexion, l’inscription, la page d’accueil, le contact et la bienvenue. JPEG, PNG ou WebP, 2 Mo au plus ; elle est recadrée en carré.</p>
      <div className="photo-ligne">
        {apercu
          ? <img className="avatar avatar-photo" src={apercu} alt="Aperçu de la nouvelle photo" width={112} height={112} style={{ width: 112, height: 112 }} />
          : <PhotoFondateur key={version} className="avatar avatar-photo photo-reglage" taille={112} />}
        <div className="photo-actions">
          <label className="btn" htmlFor="photo-fondateur">Choisir une photo</label>
          <input id="photo-fondateur" ref={champ} className="sr" type="file" accept="image/jpeg,image/png,image/webp" onChange={choisir} />
          {fichier && <button className="btn primary" onClick={enregistrer}>Mettre cette photo en ligne</button>}
          {fichier && <button className="btn" onClick={() => { setFichier(null); setApercu(null); if (champ.current) champ.current.value = ''; }}>Annuler</button>}
          {!fichier && perso && <button className="btn" onClick={origine}>Revenir à la photo d’origine</button>}
          <span className="small muted">{perso ? 'Photo personnalisée en ligne.' : 'Photo d’origine (olivier.jpg) en ligne.'}</span>
        </div>
      </div>
      {erreur && <p className="error" role="alert">{erreur}</p>}
      {etat && <p className="succes" role="status">{etat}</p>}
    </section>
  );
}
