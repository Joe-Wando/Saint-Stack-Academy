---
slug: d01-github-pages
titre: Publier un site avec GitHub Pages
domaine: Développement web
duree: 90
difficulte: découverte
licence:
  - { niveau: L1, semestre: S2, ue: "Programmation web" }
parcours:
  - { parcours: deploiement, ordre: 1 }
  - { parcours: web, ordre: 4 }
ordre: 1
prerequis_cours: [g01-3-git-branches]
visibilite: public
objectifs:
  - Expliquer ce que signifie « déployer » un site et la différence entre site statique et site dynamique
  - Publier un site HTML/CSS sur GitHub Pages depuis une branche
  - Publier une application React (Vite) sur GitHub Pages avec un workflow GitHub Actions
  - Corriger les deux erreurs classiques (chemins de base et page blanche)
  - Mettre à jour le site en ligne par un simple git push
prerequis:
  - Un compte GitHub et Git installé
  - Savoir créer un dépôt, faire un commit et un push
referentiels:
  - Documentation officielle GitHub Pages (docs.github.com/pages)
  - GitHub Foundations, domaine « GitHub Products » (GitHub Pages, Actions)
  - ACM/IEEE CS2023, domaine « Software Development Fundamentals » (déploiement)
quiz:
  - question: "Qu'est-ce qu'un site statique ?"
    choix: ["Un site qui ne change jamais", "Un site composé de fichiers (HTML, CSS, JS, images) envoyés tels quels au navigateur, sans serveur qui calcule les pages", "Un site sans JavaScript", "Un site hébergé sur un seul serveur"]
    reponse: 1
    explication: "Le serveur se contente d'envoyer des fichiers. Un site React compilé est statique ; une API NestJS avec une base de données ne l'est pas."
  - question: "À quelle adresse est publié le dépôt « portfolio » de l'utilisateur awa221 ?"
    choix: ["awa221.github.com/portfolio", "https://awa221.github.io/portfolio/", "github.com/awa221/portfolio", "portfolio.github.io"]
    reponse: 1
    explication: "Le format est https://<utilisateur>.github.io/<dépôt>/. Un dépôt nommé awa221.github.io est publié à la racine https://awa221.github.io/."
  - question: "Ton application Vite s'affiche en page blanche sur GitHub Pages, avec des erreurs 404 sur les fichiers .js. Cause la plus probable ?"
    choix: ["GitHub Pages ne supporte pas React", "L'option base de Vite n'est pas réglée sur /nom-du-depot/", "Il manque un fichier README", "Le dépôt est trop gros"]
    reponse: 1
    explication: "Le site est servi dans un sous-dossier ; sans base: '/nom-du-depot/', le navigateur cherche les fichiers à la racine du domaine."
  - question: "Peut-on héberger une API NestJS avec sa base PostgreSQL sur GitHub Pages ?"
    choix: ["Oui, gratuitement", "Non : GitHub Pages ne sert que des fichiers statiques, il n'exécute pas de code serveur", "Oui, avec un fichier .nojekyll", "Seulement en version payante"]
    reponse: 1
    explication: "Pour un back-end, il faut un hébergeur qui exécute du code : Render, Railway, un VPS, ou les fonctions serverless de Vercel et Netlify."
  - question: "Comment mettre à jour un site déjà publié sur GitHub Pages ?"
    choix: ["Le supprimer puis le recréer", "Faire un commit et un git push sur la branche publiée : le site se met à jour automatiquement", "Envoyer les fichiers par e-mail à GitHub", "Attendre 24 heures"]
    reponse: 1
    explication: "Chaque push déclenche une nouvelle publication, en général en moins d'une minute."
---

## L'idée

Tant que ton site est sur ton ordinateur (`localhost`), toi seul le vois. **Déployer**, c'est le copier sur un serveur accessible depuis Internet, à une adresse publique, pour que n'importe qui puisse l'ouvrir. C'est ce qui transforme un exercice en **projet de portfolio**.

**GitHub Pages** est le moyen le plus simple de commencer : il est gratuit pour les dépôts publics, il n'y a rien à installer, et le site se met à jour à chaque `git push`.

## Site statique ou site dynamique

| | Site statique | Site dynamique |
|---|---|---|
| Ce que fait le serveur | il envoie des **fichiers** tels quels | il **exécute du code** pour fabriquer chaque réponse |
| Exemples | portfolio HTML/CSS, application React ou Vue compilée, documentation | API NestJS ou Express, site PHP avec base de données |
| Hébergement | GitHub Pages, Netlify, Vercel | Render, Railway, VPS, fonctions serverless |

> GitHub Pages ne sert **que du statique**. Ton front-end React y va très bien ; ton API et ta base de données, non.

## 1. Publier un site HTML/CSS (sans compilation)

```
mon-portfolio/
├── index.html      ← obligatoire : la page d'accueil
├── style.css
└── images/photo.jpg
```

1. Crée un dépôt **public** `mon-portfolio` et pousse tes fichiers sur `main`.
2. Dans le dépôt, ouvre *Settings*, puis *Pages*.
3. Dans *Build and deployment*, choisis la source *Deploy from a branch*, la branche `main` et le dossier `/ (root)`, puis *Save*.
4. Attends une minute environ. Dans l'onglet *Actions*, un workflow « pages build and deployment » s'exécute.
5. L'adresse apparaît en haut de *Settings*, puis *Pages* : `https://<ton-pseudo>.github.io/mon-portfolio/`.

**Le site principal** : un dépôt nommé exactement `<ton-pseudo>.github.io` est publié **à la racine**, à l'adresse `https://<ton-pseudo>.github.io/`. C'est l'emplacement idéal pour ton portfolio.

**Les liens** : dans tes pages, utilise des chemins **relatifs** (`style.css`, `images/photo.jpg`) et non absolus (`/style.css`), puisque le site vit dans le sous-dossier `/mon-portfolio/`.

## 2. Publier une application React (Vite) avec GitHub Actions

Une application React doit d'abord être **compilée** (`npm run build`), ce qui produit un dossier `dist/`. On confie cette compilation à GitHub Actions.

**Étape 1. Régler le chemin de base dans Vite :**

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/mon-app/',          // le nom EXACT de ton dépôt, entre deux barres obliques
});
```

**Étape 2. Ajouter le workflow :**

```yaml
# .github/workflows/deploy.yml
name: Déployer sur GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Étape 3.** Dans *Settings*, puis *Pages*, choisis *Source : GitHub Actions*.

**Étape 4.** Fais un `git push`. Suis l'exécution dans l'onglet *Actions* : quand les deux jobs sont verts, le site est en ligne.

On retrouve tout ce qu'on a vu sur les pipelines CI : déclencheur, jobs, `needs`, artefact.

### Le problème des routes (React Router)

Sur GitHub Pages, ouvrir directement `/mon-app/produits/3` renvoie une **404**, car aucun fichier `produits/3/index.html` n'existe. Il y a deux solutions :
- utiliser `HashRouter`, qui produit des adresses en `/#/produits/3` : c'est simple et ça marche partout ;
- ou, pour garder des adresses propres, copier `index.html` en `404.html` après la compilation (`cp dist/index.html dist/404.html`). C'est une astuce courante.

> Netlify et Vercel gèrent ce cas proprement : c'est l'une des raisons de les préférer pour une application monopage.

## Les limites à connaître

- Le site est **public**, même si le dépôt est privé (Pages sur un dépôt privé demande un abonnement payant).
- Il est prévu pour des sites **personnels, de projet ou de documentation**, pas pour une boutique en ligne commerciale.
- Il y a des limites de taille et de trafic, généreuses pour un portfolio. Consulte la documentation « GitHub Pages limits ».
- **Ne publie jamais de secret** : tout ce qui est dans le site est lisible par tout le monde, y compris une clé d'API placée dans le JavaScript.

## Démonstration

1. On crée le dépôt `<pseudo>.github.io`, avec un `index.html` de présentation, et on l'active : le portfolio est en ligne.
2. On crée une application Vite et React, on règle `base`, on ajoute le workflow, puis on fait un push.
3. On provoque l'erreur : sans `base`, on obtient une page blanche. On ouvre la console (F12), on voit les 404 sur `/assets/...`, on corrige, puis on refait un push.
4. On modifie un texte, puis on fait un push : le site est à jour en moins d'une minute.

## Exercice guidé

1. Publie une page HTML « Carte de visite » : ton nom, ton parcours et 3 compétences, dans le dépôt `<ton-pseudo>.github.io`.
2. Ajoute une feuille de style et une photo, avec des chemins relatifs.
3. Modifie un texte et vérifie que la mise à jour arrive en ligne.

## Exercice autonome

1. Publie une application React (Vite) de ton choix, par exemple l'annuaire du cours React, dans un dépôt `annuaire`, avec le workflow GitHub Actions.
2. Ajoute deux routes avec React Router, et rends-les accessibles par lien direct (`HashRouter`, ou l'astuce du `404.html`).
3. Ajoute dans le README un badge du workflow et le lien du site.
4. Explique sur ta feuille pourquoi on ne peut pas publier ainsi l'API boutique avec sa base de données, et où on pourrait la mettre.

## Correction

Exercice guidé : il suffit d'un dépôt public nommé `<ton-pseudo>.github.io` contenant `index.html`. Dans *Settings*, puis *Pages*, choisis la branche `main` et le dossier `/ (root)`. L'adresse est `https://<ton-pseudo>.github.io/`. Si la photo ne s'affiche pas, vérifie la **casse** du nom de fichier : `Photo.JPG` et `photo.jpg` sont deux fichiers différents sur le serveur, qui tourne sous Linux, même si Windows les confond.

Exercice autonome :

```ts
// vite.config.ts
base: '/annuaire/',
```

```json
// package.json : l'astuce 404 pour garder BrowserRouter
"scripts": { "build": "vite build && cp dist/index.html dist/404.html" }
```

Avec `BrowserRouter`, il faut aussi lui indiquer le sous-dossier : `<BrowserRouter basename="/annuaire">`.

Le badge : `![Déploiement](https://github.com/<pseudo>/annuaire/actions/workflows/deploy.yml/badge.svg)`.

Question 4 : l'API **exécute du code** (Node) et a besoin d'une **base de données**, alors que GitHub Pages ne sert que des fichiers. On l'héberge sur un service qui exécute des conteneurs ou du Node (Render, Railway, un VPS avec Docker Compose), et le front publié sur Pages l'appelle par son URL.

## Pour aller plus loin

- La documentation de GitHub Pages, section « Configuring a custom domain », pour utiliser ton propre nom de domaine (voir le cours « Nom de domaine, DNS et HTTPS »).
- `.nojekyll` : un fichier vide à la racine désactive Jekyll, le générateur que GitHub Pages applique par défaut aux sites publiés depuis une branche. C'est utile si tes dossiers commencent par `_`.
- Cours suivant conseillé : « Déployer avec Netlify ».
