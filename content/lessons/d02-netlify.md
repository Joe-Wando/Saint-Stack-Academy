---
slug: d02-netlify
titre: Déployer avec Netlify
domaine: Développement web
duree: 90
difficulte: découverte
licence:
  - { niveau: L2, semestre: S3, ue: "Développement front-end et infographie" }
parcours:
  - { parcours: deploiement, ordre: 2 }
ordre: 4
prerequis_cours: [d01-github-pages]
visibilite: public
objectifs:
  - Déployer un site par glisser-déposer, puis en reliant un dépôt GitHub
  - Régler la commande de build et le dossier de publication
  - Gérer les routes d'une application monopage avec les redirections
  - Utiliser les variables d'environnement et les déploiements de prévisualisation
  - Recevoir les messages d'un formulaire sans écrire de back-end
prerequis:
  - Avoir publié un site sur GitHub Pages, ou savoir pousser un projet sur GitHub
referentiels:
  - Documentation officielle Netlify (docs.netlify.com)
  - The Twelve-Factor App, facteurs III « Config » et V « Build, release, run »
  - ACM/IEEE CS2023, domaine « Software Engineering » (déploiement continu)
quiz:
  - question: "Pour une application Vite, quel est le dossier de publication à indiquer à Netlify ?"
    choix: ["src", "public", "dist", "node_modules"]
    reponse: 2
    explication: "npm run build produit dist/ : c'est ce dossier, et lui seul, qui est mis en ligne."
  - question: "À quoi sert la règle /* /index.html 200 dans un fichier _redirects ?"
    choix: ["À rediriger vers la page d'accueil avec une erreur", "À renvoyer index.html pour toutes les adresses, afin que React Router gère les routes", "À bloquer les robots", "À forcer HTTPS"]
    reponse: 1
    explication: "Le code 200 signifie une réécriture : l'adresse reste /produits/3, mais Netlify sert index.html et React affiche la bonne page."
  - question: "Qu'est-ce qu'un deploy preview sur Netlify ?"
    choix: ["Une capture d'écran du site", "Une version du site publiée à une adresse temporaire pour chaque pull request", "La version de production", "Une sauvegarde"]
    reponse: 1
    explication: "On peut tester et faire relire une modification en ligne avant de fusionner sur main."
  - question: "Une variable VITE_API_URL définie dans Netlify est-elle secrète une fois le site compilé ?"
    choix: ["Oui, toujours", "Non : elle est intégrée au JavaScript envoyé au navigateur, donc lisible par tous", "Seulement en production", "Seulement si elle commence par SECRET_"]
    reponse: 1
    explication: "Côté front-end, une variable ne contient jamais de secret ; elle sert pour des adresses publiques (URL de l'API, etc.)."
  - question: "Quel avantage principal Netlify apporte-t-il par rapport à GitHub Pages pour une application React ?"
    choix: ["Il est le seul gratuit", "Il gère simplement les routes d'une SPA, les variables d'environnement et les prévisualisations par pull request", "Il héberge les bases de données", "Il n'a pas besoin de Git"]
    reponse: 1
    explication: "GitHub Pages reste parfait pour un site simple ; Netlify devient plus confortable dès qu'il y a un build, des routes et plusieurs environnements."
---

## L'idée

**Netlify** est une plateforme d'hébergement pour les sites statiques et les applications front-end. On la relie à son dépôt GitHub, et à chaque `git push`, elle **compile** le projet, le **publie**, et fournit le **HTTPS**, un **CDN** (des copies du site près des visiteurs, partout dans le monde) et des **prévisualisations** pour chaque pull request.

C'est l'étape suivante après GitHub Pages, quand le projet a une étape de build, des routes et des variables d'environnement.

## 1. Le déploiement en glisser-déposer

C'est la méthode la plus rapide, idéale pour un premier essai :

1. Crée un compte sur netlify.com. Tu peux te connecter avec GitHub.
2. Compile ton projet en local : `npm run build`, qui produit `dist/`.
3. Dans l'interface, ouvre *Add new site*, puis *Deploy manually*, et **glisse le dossier `dist/`**.
4. Le site est en ligne à une adresse du type `https://nom-aleatoire.netlify.app`. Tu peux renommer ce sous-domaine dans *Site configuration*, puis *Change site name*.

Limite : à chaque modification, il faut recompiler et redéposer le dossier. On automatise donc avec Git.

## 2. Le déploiement continu depuis GitHub

1. Ouvre *Add new site*, puis *Import an existing project*, choisis *GitHub*, et autorise l'accès au dépôt.
2. Vérifie les réglages de compilation. Netlify détecte Vite, React ou Next.js, mais **vérifie toujours** :

| Réglage | Valeur pour Vite et React |
|---|---|
| Base directory | (vide, ou `web/` si l'application est dans un sous-dossier d'un mono-repo) |
| Build command | `npm run build` |
| Publish directory | `dist` |

3. Clique sur *Deploy*. Ensuite, **chaque push sur `main`** redéploie le site, et chaque déploiement est conservé : on peut **revenir à une version précédente** en un clic (*Deploys*, puis *Publish deploy*).

**Configurer dans le code**, ce qui est plus fiable que l'interface, car c'est versionné :

```toml
# netlify.toml, à la racine du dépôt
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"

[[redirects]]                 # application monopage : toutes les routes servent index.html
  from = "/*"
  to = "/index.html"
  status = 200
```

La redirection `status = 200` est une **réécriture** : l'adresse `/produits/3` reste affichée, mais Netlify sert `index.html`, et React Router affiche la bonne page. Sans elle, recharger `/produits/3` donne une 404. On peut aussi l'écrire dans un fichier `public/_redirects` : `/*  /index.html  200`.

## 3. Les variables d'environnement

Elles se règlent dans *Site configuration*, puis *Environment variables*, par exemple `VITE_API_URL = https://api.mondomaine.sn`.

```ts
const api = import.meta.env.VITE_API_URL;      // Vite n'expose que les variables préfixées VITE_
```

> **Attention** : ce qui est compilé dans un front-end est **public**. Une variable `VITE_...` ou `NEXT_PUBLIC_...` est lisible par tous les visiteurs. **Aucun secret** : pas de clé privée ni de mot de passe de base de données. On retrouve la règle vue dans le cours sur la sécurité OWASP.

## 4. Les prévisualisations (*deploy previews*)

Chaque **pull request** reçoit sa propre adresse, comme `https://deploy-preview-12--mon-site.netlify.app`, et Netlify ajoute un commentaire avec le lien dans la PR. On peut ainsi tester et faire relire la modification **en ligne** avant de fusionner. C'est la revue de code du cours Git, appliquée au résultat visuel.

## 5. Les formulaires sans back-end

Netlify peut recevoir les envois d'un formulaire HTML sans que tu écrives d'API :

```html
<form name="contact" method="POST" data-netlify="true" netlify-honeypot="piege">
  <p hidden><label>Ne pas remplir : <input name="piege" /></label></p>
  <label>Nom <input name="nom" required /></label>
  <label>E-mail <input type="email" name="email" required /></label>
  <label>Message <textarea name="message" required></textarea></label>
  <button>Envoyer</button>
</form>
```

Les messages apparaissent dans *Forms*, et peuvent être transférés par e-mail. Le champ « piège » (*honeypot*) arrête une grande partie des robots. C'est parfait pour la page de contact d'un portfolio.

## 6. L'offre gratuite

Netlify propose une offre gratuite adaptée aux projets personnels et aux portfolios, avec des limites de bande passante, de minutes de build et de fonctions. **Les conditions évoluent** : consulte la page *Pricing* avant de lancer un projet à fort trafic, et surveille la consommation dans *Usage*.

## Démonstration

1. On glisse un `dist/` : le site est en ligne en 30 secondes.
2. On importe ensuite le dépôt de l'annuaire React, avec un `netlify.toml`.
3. Sans la redirection, on recharge `/membres/2` et on obtient une 404. On ajoute la redirection, on fait un push, et ça fonctionne.
4. On ajoute `VITE_API_URL`, on ouvre une PR qui change la couleur du titre, et on ouvre le lien de prévisualisation.
5. On ajoute un formulaire de contact, on envoie un message, et il apparaît dans *Forms*.

## Exercice guidé

1. Déploie par glisser-déposer le `dist/` d'un projet Vite.
2. Renomme le sous-domaine en `<ton-prenom>-portfolio.netlify.app`.
3. Republie après une modification, puis reviens à la version précédente grâce à l'historique des déploiements.

## Exercice autonome

1. Relie à Netlify une application React avec React Router, au moins 3 routes, et un `netlify.toml` versionné.
2. Ajoute une variable `VITE_TITRE_SITE` et affiche-la dans l'en-tête.
3. Ouvre une PR qui modifie l'accueil, et récupère le lien de prévisualisation.
4. Ajoute un formulaire de contact Netlify avec un champ piège.
5. Compare sur ta feuille GitHub Pages et Netlify sur 5 critères : simplicité, routes d'une SPA, variables, prévisualisations, formulaires.

## Correction

Exercice guidé :
- Pour renommer le site, ouvre *Site configuration*, puis *General* et *Change site name*.
- Pour revenir en arrière, ouvre *Deploys*, choisis l'ancien déploiement, puis *Publish deploy*. Le retour est instantané, car l'ancienne version n'a jamais été effacée.

Exercice autonome :

```toml
[build]
  command = "npm run build"
  publish = "dist"
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

`const titre = import.meta.env.VITE_TITRE_SITE ?? 'Mon site';`. Après avoir modifié une variable, il faut **redéployer** (*Deploys*, puis *Trigger deploy*), car elle est intégrée **au moment de la compilation**.

Question 5, un tableau attendu :

| Critère | GitHub Pages | Netlify |
|---|---|---|
| Simplicité | très simple pour du HTML | simple, avec détection du framework |
| Routes d'une SPA | astuce `404.html` ou `HashRouter` | une règle de redirection propre |
| Variables d'environnement | via les secrets du workflow | interface et `netlify.toml` |
| Prévisualisations par PR | non (sans configuration avancée) | oui, automatiques |
| Formulaires | non | oui, intégrés |

## Pour aller plus loin

- Les **Netlify Functions** : de petites fonctions serveur (Node) appelées en `/.netlify/functions/<nom>`, pour cacher une clé d'API qui ne doit pas être dans le front.
- La CLI : `npm i -g netlify-cli`, puis `netlify deploy --prod`, pour déployer depuis le terminal ou une CI.
- Cours suivant conseillé : « Déployer avec Vercel ».
