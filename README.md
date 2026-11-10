# Saint Stack Academy

La plateforme de formation du groupe Saint Stack. Elle réunit le programme, les cours, les quiz corrigés par le serveur, le suivi de la progression de chacun et un espace formateur.

- **web/** : Next.js 15 et React 19 (interface)
- **api/** : NestJS 11 (API REST, authentification JWT, correction des quiz, suivi)
- **content/lessons/** : un cours = un fichier Markdown avec un en-tête YAML (objectifs, référentiels, quiz)
- **PostgreSQL 16** : comptes, progression, notes

## Lancer avec Docker (recommandé)

```bash
cp .env.example .env      # puis remplir les valeurs
docker compose up -d --build
```

- Interface : http://localhost:3000
- API : http://localhost:4000/api/sante

**Premier lancement** :
1. Crée ton compte avec l'adresse définie dans `FORMATEUR_EMAIL` : il reçoit automatiquement le rôle formateur.
2. Donne `INVITE_CODE` à tes amis pour qu'ils s'inscrivent comme apprenants.

## Rôles

| Rôle | Voit | Espace |
|---|---|---|
| Formateur | toutes les pistes : groupe, solo, compléments | Mon espace, Programme, Suivi du groupe |
| Apprenant | les séances de groupe | Tableau de bord, Programme |

## Ajouter ou modifier un cours

1. Crée `content/lessons/<slug>.md`, en copiant un cours existant pour respecter la structure. Le nom du fichier doit être identique au `slug`.
2. Le quiz est dans l'en-tête. `reponse` est l'indice (à partir de 0) du bon choix. Les réponses ne sont jamais envoyées au navigateur.
3. Une section `## Correction` est masquée jusqu'au clic de l'apprenant.
4. Redémarre l'API pour recharger les cours : `docker compose restart api`.
5. Régénère les diaporamas PowerPoint (`web/public/diaporamas/<slug>.pptx`, commités) : `npm install` puis `npm run diaporamas` à la racine. Pour un seul cours : `node tools/generer-diaporamas.mjs <slug>`.

Structure d'un cours :
- Objectifs
- Le cours (une notion à la fois, avec un exemple chiffré)
- Démonstration
- Exercice guidé
- Exercice autonome
- Correction
- Pour aller plus loin
- Quiz de 5 questions

## Déployer en ligne

Sur un serveur Linux (VPS) avec Docker :

1. Clone le dépôt, puis crée `.env` avec des secrets forts : `openssl rand -base64 48`.
2. Définis `WEB_URL` et `API_URL` avec tes domaines en **https**.
3. Ajoute un reverse proxy avec HTTPS automatique (Caddy ou Traefik) devant les ports 3000 et 4000.
4. Lance `docker compose up -d --build`.
5. Sauvegarde la base chaque nuit avec `pg_dump`, en suivant le cours « PostgreSQL, index, transactions et sauvegardes ».

En production, l'API refuse de démarrer si `JWT_SECRET` a gardé sa valeur par défaut.

## Développement local sans Docker

```bash
cd api && npm install && npm run build && DATABASE_URL=postgres://... CONTENT_DIR=../content npm start
cd web && npm install && npm run dev
```
"# Saint-Stack-Academy" 
