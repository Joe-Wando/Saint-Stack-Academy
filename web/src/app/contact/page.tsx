'use client';

import { FormEvent, useState } from 'react';
import { ShellOuvert } from '@/components/Shell';
import PhotoFondateur from '@/components/PhotoFondateur';
import { api, Utilisateur } from '@/lib/api';
import { CONTACT, SUJETS_CONTACT } from '@/lib/contact';

function Formulaire({ u }: { u: Utilisateur | null }) {
  const [message, setMessage] = useState('');
  const [longueur, setLongueur] = useState(0);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur('');
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (f.message.trim().length < 20) { setErreur('Ton message doit contenir au moins 20 caractères.'); return; }
    setEnvoi(true);
    try {
      const r = await api<{ message: string }>('/contact', { method: 'POST', body: JSON.stringify(f) });
      setMessage(r.message);
    } catch (x) { setErreur((x as Error).message); } finally { setEnvoi(false); }
  }

  if (message) return <p className="succes" role="status">{message}</p>;
  return (
    <form className="form" onSubmit={soumettre} noValidate>
      <label htmlFor="nom">Ton nom<input id="nom" name="nom" required minLength={2} maxLength={80} defaultValue={u?.nom ?? ''} autoComplete="name" /></label>
      <label htmlFor="email">Ton e-mail<input id="email" name="email" type="email" required defaultValue={u?.email ?? ''} autoComplete="email" /></label>
      <label htmlFor="sujet">Sujet
        <select id="sujet" name="sujet" className="champ" required defaultValue={SUJETS_CONTACT[0]}>
          {SUJETS_CONTACT.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <label htmlFor="message">Message
        <textarea id="message" name="message" required minLength={20} maxLength={2000} rows={7}
          onChange={(e) => setLongueur(e.target.value.trim().length)} aria-describedby="aide-message" />
      </label>
      <span id="aide-message" className="small muted">{longueur} sur 2 000 caractères{longueur < 20 ? ` (au moins 20)` : ''}</span>
      {/* Champ piège pour les robots : caché aux humains et aux lecteurs d'écran. */}
      <div className="piege" aria-hidden="true">
        <label htmlFor="site_web">Ne remplis pas ce champ<input id="site_web" name="site_web" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {erreur && <p className="error" role="alert">{erreur}</p>}
      <button className="btn primary" disabled={envoi}>{envoi ? 'Envoi…' : 'Envoyer mon message'}</button>
    </form>
  );
}

export default function Contact() {
  return (
    <ShellOuvert>
      {(u) => (
        <>
          <section className="hero">
            <p className="eyebrow">Contact</p>
            <h1>Une question ? Écris-moi.</h1>
            <p className="muted">Une question sur un cours, une erreur à signaler ou une idée de partenariat : je lis tous les messages.</p>
          </section>
          <div className="contact-grille">
            <section className="card fondateur" aria-labelledby="t-fondateur">
              <PhotoFondateur className="fondateur-photo" taille={160} />
              <h2 id="t-fondateur">{CONTACT.fondateur}</h2>
              <p className="muted">{CONTACT.role}</p>
              <div className="moyens">
                <a className="btn" href={`tel:${CONTACT.telephone}`}>Téléphone · {CONTACT.telephoneAffiche}</a>
                <a className="btn" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <a className="btn" href={`mailto:${CONTACT.email}`}>E-mail · {CONTACT.email}</a>
              </div>
            </section>
            <section className="card" aria-labelledby="t-form">
              <h2 id="t-form">Envoyer un message</h2>
              <Formulaire u={u} />
            </section>
          </div>
        </>
      )}
    </ShellOuvert>
  );
}
