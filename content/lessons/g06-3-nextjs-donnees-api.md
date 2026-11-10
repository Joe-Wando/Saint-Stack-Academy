---
slug: g06-3-nextjs-donnees-api
titre: Next.js, données, Route Handlers et Server Actions
domaine: Développement web
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S5, ue: "Développement web avancé", option: developpement-logiciel }
parcours:
  - { parcours: web, ordre: 8 }
ordre: 2
prerequis_cours: []
visibilite: public
objectifs:
  - Charger des données dans un composant serveur avec async/await
  - Choisir entre rendu statique, dynamique et revalidation (cache)
  - Créer une API REST avec les Route Handlers (route.ts)
  - Modifier des données avec un formulaire et une Server Action, puis rafraîchir l'affichage
  - Valider les entrées et gérer les variables d'environnement côté serveur et côté client
prerequis:
  - Séance « Next.js, pages, layouts et routage »
referentiels:
  - Documentation officielle Next.js, sections « Data Fetching », « Caching » et « Route Handlers »
  - OWASP ASVS 4.0, chapitre V5 « Validation, Sanitization and Encoding »
  - RFC 9110 (sémantique HTTP)
quiz:
  - question: "Où peut-on lire directement une base de données dans Next.js sans exposer les identifiants ?"
    choix: ["Dans un composant client", "Dans un composant serveur, un Route Handler ou une Server Action", "Dans le navigateur avec localStorage", "Nulle part"]
    reponse: 1
    explication: "Ce code s'exécute sur le serveur : la chaîne de connexion ne part jamais au navigateur."
  - question: "Quel fichier crée l'API GET /api/produits ?"
    choix: ["app/api/produits/page.tsx", "app/api/produits/route.ts avec export async function GET()", "pages/api/produits.tsx", "api/produits.json"]
    reponse: 1
    explication: "route.ts exporte une fonction par méthode HTTP : GET, POST, PUT, PATCH, DELETE."
  - question: "Que fait l'option { next: { revalidate: 60 } } sur un fetch ?"
    choix: ["Elle refait la requête à chaque visite", "Elle met la réponse en cache et la régénère au plus toutes les 60 secondes", "Elle bloque la requête 60 s", "Elle supprime le cache"]
    reponse: 1
    explication: "C'est la revalidation incrémentale (ISR) : rapide comme du statique, mais régulièrement mise à jour."
  - question: "Quelle variable d'environnement est accessible dans le navigateur ?"
    choix: ["DATABASE_URL", "NEXT_PUBLIC_API_URL", "JWT_SECRET", "Toutes"]
    reponse: 1
    explication: "Seules les variables préfixées NEXT_PUBLIC_ sont intégrées au code envoyé au navigateur ; ne jamais y mettre un secret."
  - question: "Après une Server Action qui ajoute un produit, comment mettre à jour la liste affichée ?"
    choix: ["Recharger la page à la main", "Appeler revalidatePath('/produits')", "Vider le cache du navigateur", "Redémarrer le serveur"]
    reponse: 1
    explication: "revalidatePath invalide le cache de cette route : le prochain rendu relit les données."
---

## L'objectif

Mardi, nos pages affichaient des données écrites **en dur**. Aujourd'hui, on les lit dans une **vraie base de données**, on crée une **API** consommable par une application mobile, et on **modifie** les données avec des formulaires, le tout dans un seul projet Next.js.

```
Navigateur ──▶ Page (composant serveur) ──▶ PostgreSQL       (lecture)
Navigateur ──▶ Formulaire ──▶ Server Action ──▶ PostgreSQL    (écriture)
Mobile, Postman ──▶ /api/produits (Route Handler) ──▶ PostgreSQL
```

## Lire des données dans un composant serveur

Un composant serveur peut être **asynchrone** :

```ts
// src/lib/db.ts : ce code ne s'exécute QUE sur le serveur
import 'server-only';
import { Pool } from 'pg';
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

```tsx
// src/app/produits/page.tsx
import Link from 'next/link';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';      // relire la base à chaque requête

export default async function Produits() {
  const { rows: produits } = await pool.query('SELECT id, nom, prix FROM produits ORDER BY id');
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {produits.map((p) => (
        <li key={p.id} className="rounded-xl bg-white p-4 shadow">
          <Link href={`/produits/${p.id}`} className="font-semibold">{p.nom}</Link>
          <p>{p.prix.toLocaleString('fr-FR')} FCFA</p>
        </li>
      ))}
    </ul>
  );
}
```

Il n'y a ni `useEffect`, ni état de chargement à gérer à la main, ni API intermédiaire : le HTML arrive **déjà rempli**. Le fichier `loading.tsx` de mardi s'affiche pendant la requête.

Pour une **API externe**, c'est la même chose avec `fetch` :

```tsx
const res = await fetch('https://api.exemple.sn/taux', { next: { revalidate: 3600 } });
```

## Les stratégies de rendu et le cache

| Stratégie | Quand le HTML est-il produit ? | Exemple | Comment |
|---|---|---|---|
| **Statique** | une fois, au `build` | page « À propos » | par défaut, si rien de dynamique |
| **Revalidation (ISR)** | au build, puis régénéré au plus toutes les N secondes | catalogue produits | `export const revalidate = 60` |
| **Dynamique** | à chaque requête | tableau de bord personnel | `cookies()`, `headers()` ou `dynamic = 'force-dynamic'` |

Exemple chiffré : un catalogue reçoit 10 000 visites par heure. En rendu dynamique, la base reçoit **10 000** requêtes. Avec `revalidate = 60`, elle en reçoit au plus **60** (une par minute), et les visiteurs voient des données qui datent au plus d'une minute.

## Les Route Handlers : une API dans Next.js

```ts
// src/app/api/produits/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limite = Math.min(Number(searchParams.get('limite') ?? 20), 100);
  const { rows } = await pool.query('SELECT * FROM produits ORDER BY id LIMIT $1', [limite]);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const corps = await req.json().catch(() => null);
  const nom = typeof corps?.nom === 'string' ? corps.nom.trim() : '';
  const prix = Number(corps?.prix);
  if (nom.length < 2 || !Number.isInteger(prix) || prix <= 0) {
    return NextResponse.json({ erreur: 'nom (2 caractères minimum) et prix entier positif requis' }, { status: 400 });
  }
  const { rows } = await pool.query('INSERT INTO produits (nom, prix) VALUES ($1, $2) RETURNING *', [nom, prix]);
  return NextResponse.json(rows[0], { status: 201 });
}
```

```ts
// src/app/api/produits/[id]/route.ts
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { rowCount } = await pool.query('DELETE FROM produits WHERE id = $1', [Number(id)]);
  return rowCount ? new Response(null, { status: 204 }) : NextResponse.json({ erreur: 'Introuvable' }, { status: 404 });
}
```

Tout ce qui a été vu cette semaine s'applique : requêtes paramétrées (OWASP), codes de statut (semaine 1), tests Postman et Supertest.

## Les Server Actions : modifier les données depuis un formulaire

Une **Server Action** est une fonction exécutée **sur le serveur**, appelée directement par un formulaire, sans écrire d'API :

```tsx
// src/app/produits/nouveau/page.tsx
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';

async function creerProduit(formData: FormData) {
  'use server';
  const nom = String(formData.get('nom') ?? '').trim();
  const prix = Number(formData.get('prix'));
  if (nom.length < 2 || !Number.isInteger(prix) || prix <= 0) throw new Error('Données invalides');
  await pool.query('INSERT INTO produits (nom, prix) VALUES ($1, $2)', [nom, prix]);
  revalidatePath('/produits');              // invalide le cache de la liste
  redirect('/produits');
}

export default function NouveauProduit() {
  return (
    <form action={creerProduit} className="grid max-w-sm gap-3">
      <label>Nom <input name="nom" required minLength={2} className="w-full rounded border p-2" /></label>
      <label>Prix (FCFA) <input name="prix" type="number" min={1} required className="w-full rounded border p-2" /></label>
      <button className="rounded bg-emerald-700 py-2 text-white">Créer</button>
    </form>
  );
}
```

> **La validation côté serveur est obligatoire**, même avec `required` dans le HTML. N'importe qui peut envoyer une requête sans passer par ton formulaire. Une Server Action est une **route publique**, à protéger comme une API (authentification, droits). La bibliothèque **Zod** rend cette validation plus propre et plus sûre.

Pour afficher un état « envoi en cours » ou des erreurs, on utilise `useActionState` et `useFormStatus` dans un composant client.

## Les variables d'environnement

```
# .env.local (jamais commité)
DATABASE_URL=postgres://boutique:secret@localhost:5432/boutique   ← serveur uniquement
NEXT_PUBLIC_API_URL=https://api.boutique.sn                        ← visible dans le navigateur
```

Seules les variables qui commencent par `NEXT_PUBLIC_` sont intégrées au JavaScript du navigateur. **Un secret ne doit jamais porter ce préfixe.** Le paquet `server-only` fait échouer la construction si un fichier serveur est importé par erreur dans un composant client.

## Démonstration

1. On relie `boutique-web` à la base PostgreSQL de la semaine 2, lancée avec Docker Compose.
2. La liste `/produits` devient un composant serveur qui lit la base, et la page détail lit un produit par son `id`.
3. On crée `/api/produits` (GET, POST) et `/api/produits/[id]` (DELETE), testés avec Postman.
4. On ajoute le formulaire `/produits/nouveau` avec sa Server Action et `revalidatePath` : le nouveau produit apparaît immédiatement.
5. On compare `revalidate = 60` et `force-dynamic` en modifiant la base directement.

## Exercice guidé

1. Crée `GET /api/sante`, qui renvoie `{ statut: 'ok', heure: <ISO> }`.
2. Crée `GET /api/produits?q=chemise`, qui filtre les produits dont le nom contient le texte, sans tenir compte de la casse (`ILIKE`), avec une requête paramétrée.
3. Teste les deux avec `curl` ou Postman.

## Exercice autonome

Complète le mini-projet « annuaire » du groupe :

1. Une table `membres` (pseudo unique, nom, rôle, bio, créé le), créée dans PostgreSQL avec Docker Compose.
2. La page `/membres`, en composant serveur avec revalidation toutes les 30 secondes, et la page `/membres/[pseudo]` qui renvoie un 404 si le membre n'existe pas.
3. Un formulaire d'ajout avec une Server Action, une validation serveur (pseudo de 3 à 20 caractères alphanumériques, unique) et des messages d'erreur affichés.
4. Une API REST `/api/membres` (GET liste, GET un membre, POST), testée avec une collection Postman.
5. Un `.env.example` et un README qui explique comment lancer le projet.

## Correction

Exercice guidé :

```ts
// src/app/api/sante/route.ts
export function GET() {
  return Response.json({ statut: 'ok', heure: new Date().toISOString() });
}

// src/app/api/produits/route.ts (extrait du GET)
const q = searchParams.get('q');
const { rows } = q
  ? await pool.query('SELECT * FROM produits WHERE nom ILIKE $1 ORDER BY id', [`%${q}%`])
  : await pool.query('SELECT * FROM produits ORDER BY id');
```

Le `%` est ajouté **dans la valeur** passée en paramètre, et non dans le texte SQL. La requête reste protégée contre l'injection.

Exercice autonome, la validation et l'unicité :

```ts
'use server';
export async function ajouterMembre(_prec: unknown, formData: FormData) {
  const pseudo = String(formData.get('pseudo') ?? '');
  if (!/^[a-zA-Z0-9]{3,20}$/.test(pseudo)) return { erreur: 'Pseudo : 3 à 20 lettres ou chiffres' };
  try {
    await pool.query('INSERT INTO membres (pseudo, nom) VALUES ($1, $2)', [pseudo, formData.get('nom')]);
  } catch (e: any) {
    if (e.code === '23505') return { erreur: 'Ce pseudo est déjà pris' };   // violation d'unicité dans PostgreSQL
    throw e;
  }
  revalidatePath('/membres');
  return { erreur: null };
}
```

Le formulaire, côté client, utilise `const [etat, action] = useActionState(ajouterMembre, { erreur: null })` et affiche `etat.erreur`.

## Pour aller plus loin

- **Prisma** et **Drizzle** sont des ORM TypeScript, avec un typage des requêtes et des migrations.
- **Auth.js** (NextAuth) gère l'authentification : connexion Google, GitHub, ou par e-mail.
- Le déploiement sur Vercel est gratuit pour les projets personnels, avec une prévisualisation à chaque pull request. Une image Docker (`output: 'standalone'`) permet aussi de déployer n'importe où.
- Demain : tester ce parcours de bout en bout avec Cypress.
