---
slug: g06-2-nextjs-pages-routage
titre: Next.js, pages, layouts et routage (App Router)
domaine: Développement web
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S5, ue: "Développement web avancé", option: developpement-logiciel }
parcours:
  - { parcours: web, ordre: 8 }
ordre: 1
prerequis_cours: []
visibilite: public
objectifs:
  - Expliquer ce que Next.js ajoute à React (rendu serveur, routage par fichiers, optimisations)
  - Créer un projet Next.js avec TypeScript et Tailwind
  - Créer des pages, des layouts imbriqués et des routes dynamiques avec l'App Router
  - Naviguer avec Link et useRouter, et gérer les pages 404 et de chargement
  - Distinguer composants serveur et composants client
prerequis:
  - Cours « React, composants, props, état et routes » et « Tailwind CSS, styler avec des classes utilitaires »
referentiels:
  - Documentation officielle Next.js (App Router)
  - Meta Front-End Developer Professional Certificate, cours « Advanced React »
  - W3C, WCAG 2.2 (accessibilité de la navigation)
quiz:
  - question: "Dans l'App Router, quel fichier crée la page accessible à l'adresse /cours ?"
    choix: ["pages/cours.js", "app/cours/page.tsx", "app/cours.tsx", "routes/cours.tsx"]
    reponse: 1
    explication: "Chaque dossier de app/ est un segment d'URL ; le fichier page.tsx rend ce segment accessible."
  - question: "À quoi sert un fichier layout.tsx ?"
    choix: ["À définir le style CSS", "À entourer toutes les pages de son dossier d'une structure commune (en-tête, menu) qui persiste à la navigation", "À créer une API", "À tester les pages"]
    reponse: 1
    explication: "Le layout n'est pas re-rendu quand on passe d'une page à l'autre du même dossier : le menu garde son état."
  - question: "Comment créer une route /cours/git-branches où le dernier segment varie ?"
    choix: ["app/cours/git-branches/page.tsx pour chaque cours", "app/cours/[slug]/page.tsx", "app/cours/*.tsx", "Avec React Router"]
    reponse: 1
    explication: "Les crochets déclarent un segment dynamique ; sa valeur arrive dans params.slug."
  - question: "Quand faut-il écrire 'use client' en haut d'un composant ?"
    choix: ["Toujours", "Quand il utilise de l'état, des effets, des gestionnaires d'événements ou des API du navigateur", "Jamais", "Seulement pour les layouts"]
    reponse: 1
    explication: "Par défaut, les composants sont des composants serveur : rendus sur le serveur, sans JavaScript envoyé au navigateur."
  - question: "Quel est l'avantage principal du rendu côté serveur pour un site public ?"
    choix: ["Moins de code", "Le HTML arrive déjà rempli : affichage plus rapide et meilleur référencement (SEO)", "Pas besoin de serveur", "Plus de JavaScript"]
    reponse: 1
    explication: "Avec une SPA React classique, le navigateur reçoit une page vide et doit attendre le JavaScript."
---

## Ce que Next.js ajoute à React

React (voir le cours « React, composants, props, état et routes ») est une **bibliothèque** d'interface. Pour une vraie application, il manque :

- **le routage**, qu'on gérait avec React Router ;
- **le rendu côté serveur** : avec une SPA React, le navigateur reçoit une page vide puis attend le JavaScript, ce qui ralentit l'affichage et nuit au référencement ;
- **la récupération des données**, **les API**, **l'optimisation des images**, **le déploiement**.

**Next.js**, développé par Vercel, est un **framework** React qui fournit tout cela.

| | React avec Vite (SPA) | Next.js |
|---|---|---|
| Routage | bibliothèque externe | par fichiers, intégré |
| Rendu | dans le navigateur | serveur, statique ou client, au choix par page |
| Référencement | faible | bon |
| API | serveur séparé | Route Handlers intégrés |

## Créer le projet

```bash
npx create-next-app@latest boutique-web --typescript --tailwind --eslint --app --src-dir
cd boutique-web && npm run dev      # http://localhost:3000
```

## Le routage par fichiers

**L'arborescence du dossier `app/` est la carte du site.**

```
src/app/
├── layout.tsx                  layout racine : <html>, <body>, en-tête commun
├── page.tsx                    /
├── not-found.tsx               page 404
├── produits/
│   ├── page.tsx                /produits
│   ├── loading.tsx             affiché pendant le chargement de /produits
│   └── [id]/
│       └── page.tsx            /produits/12, /produits/45…
├── (compte)/                   groupe de routes : les parenthèses n'apparaissent pas dans l'URL
│   ├── connexion/page.tsx      /connexion
│   └── inscription/page.tsx    /inscription
└── tableau-de-bord/
    ├── layout.tsx              menu latéral du tableau de bord
    ├── page.tsx                /tableau-de-bord
    └── commandes/page.tsx      /tableau-de-bord/commandes
```

| Fichier | Rôle |
|---|---|
| `page.tsx` | rend le segment accessible : c'est la page |
| `layout.tsx` | structure commune qui persiste pendant la navigation |
| `loading.tsx` | interface affichée pendant le chargement |
| `error.tsx` | interface affichée en cas d'erreur (composant client) |
| `not-found.tsx` | page 404 |
| `route.ts` | API (voir le cours « Next.js, données, Route Handlers et Server Actions ») |

## Pages et layouts

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = { title: 'Boutique MeredianStack', description: 'Mode et accessoires à Dakar' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="flex items-center justify-between bg-emerald-900 px-6 py-4 text-white">
          <Link href="/" className="text-lg font-bold">Boutique</Link>
          <nav className="flex gap-4">
            <Link href="/produits">Produits</Link>
            <Link href="/tableau-de-bord">Mon compte</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl p-6">{children}</main>
      </body>
    </html>
  );
}
```

```tsx
// src/app/page.tsx
export default function Accueil() {
  return <h1 className="text-3xl font-bold">Bienvenue à la boutique</h1>;
}
```

Les layouts **s'imbriquent** : `/tableau-de-bord/commandes` est rendu dans le layout racine, **puis** dans le layout du tableau de bord.

## Les routes dynamiques

```tsx
// src/app/produits/[id]/page.tsx
import { notFound } from 'next/navigation';

const produits = [{ id: '1', nom: 'Chemise wax', prix: 12000 }, { id: '2', nom: 'Sac en cuir', prix: 25000 }];

export default async function PageProduit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;                 // dans Next.js 15, params est une promesse
  const produit = produits.find((p) => p.id === id);
  if (!produit) notFound();                    // affiche not-found.tsx
  return (
    <article>
      <h1 className="text-2xl font-bold">{produit.nom}</h1>
      <p>{produit.prix.toLocaleString('fr-FR')} FCFA</p>
    </article>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: produits.find((p) => p.id === id)?.nom ?? 'Produit' };   // titre de l'onglet, utile au SEO
}
```

D'autres segments existent : `[...chemin]` capture plusieurs niveaux (`/docs/a/b/c`), et `[[...chemin]]` fait la même chose en rendant le segment facultatif.

## Naviguer

```tsx
import Link from 'next/link';
<Link href={`/produits/${p.id}`}>{p.nom}</Link>      // navigation sans rechargement, avec préchargement
```

```tsx
'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
const router = useRouter();
router.push('/tableau-de-bord');            // navigation dans le code, après une connexion par exemple
const chemin = usePathname();               // pour surligner le lien actif
const recherche = useSearchParams().get('q');
```

## Composants serveur et composants client

Dans l'App Router, **les composants sont des composants serveur par défaut** :

- ils sont rendus **sur le serveur** et n'envoient **aucun JavaScript** au navigateur ;
- ils peuvent lire directement une base de données ou un secret, qui ne partent jamais chez le client ;
- ils **ne peuvent pas** utiliser `useState`, `useEffect`, `onClick` ou `localStorage`.

Pour l'interactivité, on écrit `'use client'` en tête du fichier :

```tsx
// src/components/BoutonPanier.tsx
'use client';
import { useState } from 'react';
export default function BoutonPanier() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)} className="rounded bg-emerald-700 px-4 py-2 text-white">Ajouter ({n})</button>;
}
```

**La bonne pratique** : garder la page en composant serveur, et n'isoler en composant client que les **petites parties interactives** (bouton, formulaire, filtre).

> Beaucoup d'applications font de leurs pages des composants **client**, parce qu'elles lisent la session dans `localStorage`. Une évolution consisterait à passer la session dans un cookie, pour faire le rendu côté serveur.

## Démonstration

1. On crée `boutique-web` avec le layout racine, l'en-tête et la navigation.
2. On ajoute la liste `/produits` avec une grille Tailwind, puis la page dynamique `/produits/[id]` avec `notFound`.
3. On ajoute le groupe `(compte)` et le layout du tableau de bord avec un menu latéral dont le lien actif est surligné grâce à `usePathname`.
4. On fait `npm run build` et on lit le rapport : quelles pages sont statiques (○), lesquelles sont dynamiques (ƒ) ?

## Exercice guidé

1. Crée la page `/a-propos` avec un titre et un paragraphe.
2. Crée `/blog/[slug]`, qui affiche « Article : <slug> », et une page 404 personnalisée.
3. Ajoute un lien vers `/a-propos` dans l'en-tête et vérifie que la navigation ne recharge pas la page (onglet Réseau des outils de développement).

## Exercice autonome

Construis la structure du site de ton mini-projet (l'annuaire défini dans Jira, (voir le cours « Scrum en pratique avec Jira »)) :

1. `/` (accueil), `/membres` (liste), `/membres/[pseudo]` (profil), `/a-propos`.
2. Un layout racine avec la navigation, et le lien actif surligné.
3. `loading.tsx` et `not-found.tsx` pour `/membres`.
4. Un composant client « Suivre », avec un compteur, sur la page de profil. Le reste de la page reste un composant serveur.
5. Des métadonnées dynamiques : le titre de l'onglet est le nom du membre.
6. Une navigation **accessible** : vérifie que tout se parcourt au clavier (Tab, Entrée) avec un focus visible.

## Correction

Exercice guidé :

```tsx
// src/app/blog/[slug]/page.tsx
export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <h1 className="text-2xl font-bold">Article : {slug}</h1>;
}
// src/app/not-found.tsx
import Link from 'next/link';
export default function Introuvable() {
  return <div><h1 className="text-2xl font-bold">Page introuvable</h1><Link href="/">Retour à l'accueil</Link></div>;
}
```

Exercice autonome, le lien actif :

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
export function LienNav({ href, children }: { href: string; children: React.ReactNode }) {
  const actif = usePathname().startsWith(href);
  return <Link href={href} aria-current={actif ? 'page' : undefined}
    className={actif ? 'font-bold underline' : 'opacity-80 hover:opacity-100'}>{children}</Link>;
}
```

`aria-current="page"` indique aux lecteurs d'écran la page courante : c'est un point d'accessibilité.

## Pour aller plus loin

- Les **routes parallèles** (`@modal`) et les **routes d'interception** permettent d'afficher un produit dans une fenêtre modale tout en gardant une URL partageable.
- `next/image` optimise automatiquement les images (formats modernes, tailles adaptées, chargement différé).
- Cours suivant conseillé : « Next.js, données, Route Handlers et Server Actions » : charger des données côté serveur, les mettre en cache, et créer des API avec les Route Handlers et les Server Actions.
