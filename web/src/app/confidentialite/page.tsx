'use client';

import Link from 'next/link';
import { ShellOuvert } from '@/components/Shell';

/** Politique de confidentialité, en langage simple. */
export default function Confidentialite() {
  return (
    <ShellOuvert>
      {() => (
        <article className="card texte-long">
          <p className="eyebrow">Confidentialité</p>
          <h1>Tes données sur MeredianStack</h1>
          <p className="muted">Dernière mise à jour : novembre 2026.</p>

          <h2>Ce que nous enregistrons</h2>
          <ul>
            <li><strong>Ton compte</strong> : ton nom, ton adresse e-mail, ton mot de passe (stocké chiffré, personne ne peut le lire) et, si tu le donnes, ton établissement.</li>
            <li><strong>Ton niveau</strong> : L1, L2, L3 (et ton option) ou autre.</li>
            <li><strong>Ta progression</strong> : les cours commencés et terminés, tes résultats aux quiz.</li>
            <li><strong>Tes activités</strong> : les chapitres lus, les cours terminés et les quiz passés, avec leur date.</li>
            <li><strong>Tes notes</strong> sur les cours.</li>
            <li><strong>Ta photo de profil</strong>, si tu en ajoutes une. Elle est recadrée et ses métadonnées (dont la position GPS éventuelle) sont supprimées.</li>
            <li><strong>Les messages</strong> envoyés depuis la page Contact.</li>
          </ul>

          <h2>À quoi elles servent</h2>
          <ul>
            <li>À suivre ta progression : te proposer le cours suivant, afficher ton évolution et tes jalons.</li>
            <li>À améliorer les cours : repérer les notions et les questions de quiz qui posent problème.</li>
          </ul>

          <h2>Qui peut les voir</h2>
          <p>
            Toi, depuis ton profil. L’<strong>administrateur de la plateforme</strong> peut aussi consulter les comptes et la progression
            de chacun, pour accompagner les apprenants et améliorer les cours. Chacune de ses actions sur un compte (suspension,
            changement de rôle, suppression) est enregistrée dans un journal.
          </p>
          <p><strong>Aucune donnée n’est vendue</strong>, ni transmise à des tiers à des fins commerciales.</p>

          <h2>Tes droits</h2>
          <ul>
            <li><strong>Télécharger tes données</strong> : depuis ton profil, onglet Sécurité, bouton « Télécharger mes données ».</li>
            <li><strong>Supprimer ton compte</strong> et toutes tes données : depuis ton profil, onglet Sécurité.</li>
            <li><strong>Corriger tes informations</strong> : depuis ton profil, onglet Mes informations.</li>
            <li>Pour toute autre demande (accès, rectification, opposition), écris-nous depuis la <Link href="/contact">page Contact</Link>.</li>
          </ul>

          <h2>Le cadre légal</h2>
          <p>
            Ces règles suivent la loi sénégalaise n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel,
            qui garantit notamment ton droit d’accès, de rectification, d’opposition et de suppression.
          </p>
        </article>
      )}
    </ShellOuvert>
  );
}
