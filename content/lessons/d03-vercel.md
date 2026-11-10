---
slug: d03-vercel
titre: Déployer avec Vercel
domaine: Développement web
duree: 90
difficulte: bases
licence:
  - { niveau: L2, semestre: S3, ue: "Développement front-end et infographie" }
  - { niveau: L3, semestre: S6, ue: "Livraison des applications", option: developpement-logiciel }
parcours:
  - { parcours: deploiement, ordre: 3 }
  - { parcours: web, ordre: 10 }
ordre: 5
prerequis_cours: [d02-netlify, g06-2-nextjs-pages-routage]
visibilite: public
objectifs:
  - Déployer une application Next.js ou Vite sur Vercel depuis GitHub
  - Distinguer les environnements Production, Preview et Development
  - Gérer les variables d'environnement côté serveur et côté navigateur
  - Lire les journaux de build et d'exécution pour corriger un déploiement en échec
  - Déployer depuis le terminal avec la CLI Vercel
prerequis:
  - Avoir suivi « Déployer avec Netlify »
  - Connaître les bases de Next.js (pages, Route Handlers)
referentiels:
  - Documentation officielle Vercel (vercel.com/docs)
  - Documentation Next.js, « Deploying »
  - The Twelve-Factor App, facteurs III « Config » et X « Dev/prod parity »
quiz:
  - question: "Qu'est-ce qui distingue Vercel de GitHub Pages pour un projet Next.js ?"
    choix: ["Rien", "Vercel exécute aussi la partie serveur de Next.js (rendu serveur, Route Handlers, Server Actions)", "Vercel ne supporte que le HTML", "GitHub Pages est plus rapide pour Next.js"]
    reponse: 1
    explication: "GitHub Pages ne sert que des fichiers ; Vercel exécute le code serveur sous forme de fonctions."
  - question: "Une variable DATABASE_URL est définie dans Vercel. Où peut-on la lire ?"
    choix: ["Partout, y compris dans le navigateur", "Seulement dans le code serveur (composants serveur, Route Handlers, Server Actions)", "Nulle part", "Seulement dans les composants client"]
    reponse: 1
    explication: "Seules les variables préfixées NEXT_PUBLIC_ sont intégrées au JavaScript du navigateur."
  - question: "À quoi correspond l'environnement Preview ?"
    choix: ["À la production", "Aux déploiements des branches autres que la branche de production, notamment les pull requests", "À ton ordinateur", "À une sauvegarde"]
    reponse: 1
    explication: "Chaque branche ou PR a son URL ; on peut y définir des variables différentes (par exemple une base de test)."
  - question: "Le déploiement échoue avec « Module not found: Can't resolve './Composants/Carte' ». Il fonctionne pourtant sur ton PC Windows. Cause probable ?"
    choix: ["Vercel est en panne", "Une différence de casse dans le nom du dossier ou du fichier : Linux distingue majuscules et minuscules", "Il manque une variable d'environnement", "Le dépôt est privé"]
    reponse: 1
    explication: "Windows et macOS ignorent souvent la casse, pas les serveurs Linux : composants/ et Composants/ sont deux dossiers différents."
  - question: "Quelle commande déploie en production depuis le terminal ?"
    choix: ["vercel --prod", "git push vercel", "npm run vercel", "vercel start"]
    reponse: 0
    explication: "vercel crée un déploiement de prévisualisation ; vercel --prod publie en production."
---

## L'idée

**Vercel** est l'entreprise qui développe Next.js, et sa plateforme d'hébergement. Comme Netlify, elle se relie à GitHub et redéploie à chaque push. Elle a un point fort : elle **exécute la partie serveur de Next.js** (rendu côté serveur, Route Handlers, Server Actions), sans configuration.

| Besoin | Meilleur choix |
|---|---|
| Portfolio HTML/CSS | GitHub Pages |
| Application React ou Vue (Vite), avec formulaires | Netlify ou Vercel |
| Application **Next.js** avec du code serveur | **Vercel** |
| API avec base de données et tâches longues | un hébergeur de conteneurs (Render, Railway, VPS avec Docker) |

## 1. Déployer depuis GitHub

1. Crée un compte sur vercel.com avec ton compte GitHub. L'offre gratuite, *Hobby*, est réservée aux projets **personnels et non commerciaux**.
2. Ouvre *Add New*, puis *Project*, et importe ton dépôt.
3. Vercel détecte le framework (Next.js, Vite…) et propose les réglages :

| Réglage | Next.js | Vite |
|---|---|---|
| Framework Preset | Next.js | Vite |
| Root Directory | `web/` si c'est un mono-repo | idem |
| Build Command | `next build` (par défaut) | `npm run build` |
| Output Directory | (automatique) | `dist` |

4. Clique sur *Deploy*. Le site est en ligne à `https://<projet>.vercel.app`.

Ensuite, chaque push sur `main` déploie en **production**, et chaque autre branche ou pull request reçoit une **URL de prévisualisation**, commentée automatiquement dans la PR.

Pour une application Vite avec React Router, il faut ajouter la réécriture vers `index.html` :

```json
// vercel.json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Ce n'est pas nécessaire pour Next.js, qui gère lui-même ses routes.

## 2. Les trois environnements

| Environnement | Quand | Exemple d'usage |
|---|---|---|
| **Production** | les déploiements de la branche principale | la vraie base de données, le vrai domaine |
| **Preview** | toutes les autres branches et les PR | une base de test |
| **Development** | ton ordinateur, avec `vercel dev` ou `vercel env pull` | les variables récupérées en local dans `.env.local` |

## 3. Les variables d'environnement

Elles se règlent dans *Project*, puis *Settings* et *Environment Variables*, en cochant le ou les environnements concernés.

| Variable | Où elle est lisible |
|---|---|
| `DATABASE_URL`, `JWT_SECRET` | **serveur uniquement** : composants serveur, Route Handlers, Server Actions |
| `NEXT_PUBLIC_API_URL` | **partout**, y compris dans le navigateur, donc **jamais de secret** |

C'est exactement la règle vue dans le cours « Next.js, données, Route Handlers et Server Actions ». Après avoir modifié une variable, il faut **redéployer** (*Deployments*, puis *Redeploy*).

## 4. Lire les journaux et corriger

- **Les journaux de build**, dans *Deployments*, puis le déploiement et *Building* : les erreurs de compilation, comme un type TypeScript ou un module introuvable.
- **Les journaux d'exécution**, dans *Logs* : les erreurs des Route Handlers et du rendu serveur (`console.error`, exceptions).

Les erreurs les plus fréquentes :

| Message | Cause | Solution |
|---|---|---|
| `Module not found` alors que tout marche en local | la **casse** du nom de fichier diffère (Linux la distingue) | renommer avec `git mv`, en deux étapes si besoin |
| `Type error` au build | `next build` vérifie les types, pas `next dev` | lancer `npm run build` en local avant de pousser |
| 500 sur une page serveur | une variable d'environnement manque en production | l'ajouter dans *Settings*, puis redéployer |
| La base de données refuse la connexion | la base est sur `localhost` ou n'accepte pas les connexions extérieures | utiliser une base hébergée (Neon, Supabase, Render) |

> **Le réflexe** : lance `npm run build` sur ton PC avant chaque push. Une erreur de build locale est une erreur de déploiement évitée.

## 5. La CLI Vercel

```bash
npm i -g vercel
vercel login
vercel              # crée un déploiement de prévisualisation et affiche son URL
vercel --prod       # publie en production
vercel env pull     # récupère les variables de l'environnement Development dans .env.local
vercel logs <url>   # journaux d'un déploiement
```

## 6. Les fonctions serverless et leurs limites

Le code serveur de Next.js tourne sous forme de **fonctions** : elles démarrent à la demande et s'arrêtent après la réponse. Conséquences :
- pas de processus qui tourne en permanence, donc pas de tâche planifiée maison (Vercel propose des *Cron Jobs*) ;
- une **durée maximale** d'exécution par requête ;
- pas de stockage de fichiers local durable : utilise un stockage externe pour les photos téléversées ;
- une base de données **hébergée** est nécessaire.

C'est pourquoi l'API NestJS de la plateforme Saint Stack Academy, avec son serveur permanent et ses fichiers, est plutôt destinée à un VPS avec Docker Compose. Son front-end Next.js, lui, pourrait aller sur Vercel.

## Démonstration

1. On importe un projet Next.js (la boutique du cours Next.js) : il est en ligne en 1 minute.
2. On ajoute `DATABASE_URL`, qui pointe vers une base PostgreSQL gratuite chez Neon, et `NEXT_PUBLIC_API_URL`.
3. On provoque une erreur de casse (`import Carte from './Composants/Carte'` alors que le dossier s'appelle `composants`) : le build échoue, on lit le journal, on corrige.
4. On ouvre une PR, on teste l'URL de prévisualisation, puis on fusionne : la production est mise à jour.
5. On fait `vercel --prod` depuis le terminal.

## Exercice guidé

1. Déploie une application Next.js minimale (`npx create-next-app`) sur Vercel.
2. Ajoute une Route Handler `/api/sante` qui renvoie `{ statut: 'ok', env: process.env.VERCEL_ENV }`. Compare la réponse en production et sur une URL de prévisualisation.
3. Ajoute la variable `MESSAGE_ACCUEIL`, uniquement pour la production, et affiche-la dans un composant serveur.

## Exercice autonome

1. Déploie le mini-projet « annuaire » en Next.js avec une base PostgreSQL hébergée (Neon ou Supabase, offre gratuite), avec `DATABASE_URL` côté serveur seulement.
2. Configure des variables différentes pour Production et Preview, avec deux bases distinctes.
3. Fais échouer volontairement un build (une erreur TypeScript), lis le journal, corrige, et écris en 3 lignes ta démarche de diagnostic.
4. Installe la CLI et déploie une prévisualisation depuis le terminal.
5. Rédige un tableau de 4 lignes : quel hébergeur pour un portfolio HTML, une SPA React, une application Next.js, une API NestJS avec PostgreSQL ? Justifie chaque choix.

## Correction

Exercice guidé :

```ts
// app/api/sante/route.ts
export function GET() {
  return Response.json({ statut: 'ok', env: process.env.VERCEL_ENV ?? 'local' });
}
```

En production, la route renvoie `"env": "production"` ; sur une URL de prévisualisation, `"env": "preview"`. Si tu ne cochais que *Production* pour `MESSAGE_ACCUEIL`, la variable est absente (`undefined`) en prévisualisation : prévois une valeur par défaut.

Exercice autonome, question 5 :

| Projet | Hébergeur | Raison |
|---|---|---|
| Portfolio HTML | GitHub Pages | gratuit, aucun build, mise à jour par push |
| SPA React (Vite) | Netlify ou Vercel | build automatique, réécriture des routes, prévisualisations |
| Application Next.js | Vercel | exécute le rendu serveur et les Route Handlers sans configuration |
| API NestJS et PostgreSQL | VPS avec Docker Compose, ou Render ou Railway | processus permanent, base de données, fichiers |

## Pour aller plus loin

- *Vercel Analytics* et *Speed Insights* mesurent les performances réelles vues par les visiteurs.
- Le **monorepo** : un projet Vercel par application, chacun avec son *Root Directory*.
- Cours suivant conseillé : « Nom de domaine, DNS et HTTPS pour son site ».
