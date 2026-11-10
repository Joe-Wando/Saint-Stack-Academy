---
slug: g02-3-docker-volumes-reseaux
titre: Docker, volumes, réseaux et dockerisation d'une API
piste: groupe
semaine: 2
date: 2026-11-19
domaine: DevOps
duree: 120
niveau: bases
objectifs:
  - Rendre des données persistantes avec un volume nommé
  - Utiliser un bind mount pour développer sans reconstruire l'image
  - Créer un réseau Docker et faire communiquer deux conteneurs par leur nom
  - Dockeriser une API Node qui se connecte à PostgreSQL
  - Configurer une application par variables d'environnement (méthode « 12 facteurs »)
prerequis:
  - Séance « Construire ses images avec un Dockerfile »
referentiels:
  - Chapitre DIT 5 « Prise en main de Docker » (option -v)
  - Docker Certified Associate (DCA), domaines « Storage and Volumes » et « Networking »
  - The Twelve-Factor App, facteurs III « Config » et IV « Backing services »
quiz:
  - question: "Quelle différence entre un volume nommé et un bind mount ?"
    choix: ["Aucune", "Le volume est géré par Docker ; le bind mount relie un dossier précis de ta machine", "Le bind mount est plus sûr pour une base de données en production", "Le volume ne survit pas à docker rm"]
    reponse: 1
    explication: "Volume nommé (-v pgdata:/var/lib/postgresql/data) pour les données ; bind mount (-v $(pwd):/app) pour voir ton code en direct pendant le développement."
  - question: "Dans un réseau Docker personnalisé, comment l'API joint-elle le conteneur PostgreSQL nommé db ?"
    choix: ["Par localhost:5432", "Par db:5432", "Par l'IP de ta machine", "C'est impossible"]
    reponse: 1
    explication: "Docker fournit un DNS interne sur les réseaux personnalisés : le nom du conteneur devient un nom de machine. localhost désignerait le conteneur de l'API lui-même."
  - question: "Pour que la base reste joignable par l'API mais pas depuis Internet, que fais-tu ?"
    choix: ["Tu publies -p 5432:5432", "Tu ne publies pas de port pour la base ; l'API la joint par le réseau Docker", "Tu supprimes le réseau", "Tu utilises --rm"]
    reponse: 1
    explication: "Les conteneurs d'un même réseau se parlent sans -p. Publier le port n'est utile que pour accéder à la base depuis ta machine."
  - question: "Selon les 12 facteurs, où mettre l'URL de la base de données ?"
    choix: ["En dur dans le code", "Dans une variable d'environnement", "Dans le Dockerfile avec ENV", "Dans le README"]
    reponse: 1
    explication: "La même image doit tourner en développement, en test et en production ; seule la configuration change, par variables d'environnement."
  - question: "Que fait docker volume prune ?"
    choix: ["Il sauvegarde les volumes", "Il supprime les volumes qui ne sont utilisés par aucun conteneur", "Il compresse les volumes", "Il liste les volumes"]
    reponse: 1
    explication: "À manier avec précaution : un volume de base de données dont le conteneur a été supprimé serait effacé définitivement."
---

## Deux problèmes à résoudre

Lundi, tu as constaté que les données de PostgreSQL **disparaissaient** avec le conteneur. Et une API seule ne sert à rien : elle doit **parler** à sa base de données. Aujourd'hui on règle ces deux problèmes : la **persistance**, avec les volumes, et la **communication**, avec les réseaux.

## Les volumes

Un conteneur a une couche d'écriture **éphémère**. Pour garder des données, on monte un espace de stockage **extérieur** au conteneur.

```
  Conteneur postgres                Machine hôte
 ┌──────────────────────┐
 │ /var/lib/postgresql/ ├──────────▶  volume « pgdata »  (géré par Docker)
 │        data          │
 └──────────────────────┘
```

| Type | Syntaxe | Usage |
|---|---|---|
| **Volume nommé** | `-v pgdata:/var/lib/postgresql/data` | données des bases, en développement et en production |
| **Bind mount** | `-v $(pwd)/src:/app/src` | code source en développement, pour le voir en direct |
| **tmpfs** | `--tmpfs /tmp` | fichiers temporaires en mémoire |

```bash
docker volume create pgdata
docker volume ls
docker volume inspect pgdata      # « Mountpoint » : où il se trouve vraiment
docker run -d --name db -e POSTGRES_PASSWORD=secret -v pgdata:/var/lib/postgresql/data postgres:16
docker rm -f db                   # on supprime le conteneur…
docker run -d --name db -e POSTGRES_PASSWORD=secret -v pgdata:/var/lib/postgresql/data postgres:16
                                  # …les données sont toujours là
docker volume rm pgdata           # supprime le volume, et donc les données
```

**Sauvegarder un volume** : on lance un conteneur temporaire qui l'archive.

```bash
docker run --rm -v pgdata:/donnees -v $(pwd):/sauvegarde alpine tar czf /sauvegarde/pgdata.tgz -C /donnees .
```

Pour une base de données, `pg_dump` reste la méthode propre (semaine 8).

## Les réseaux

Chaque conteneur a sa propre adresse IP sur un réseau virtuel. Docker propose plusieurs pilotes :

| Pilote | Usage |
|---|---|
| `bridge` (défaut) | réseau privé sur une machine |
| `host` | le conteneur utilise directement le réseau de l'hôte, sans isolation |
| `none` | aucun réseau |
| `overlay` | réseau qui couvre plusieurs machines (Swarm) |

**Règle d'or : crée ton propre réseau `bridge`.** Sur un réseau personnalisé, Docker fournit un **DNS interne** : un conteneur en joint un autre **par son nom**.

```bash
docker network create boutique-net
docker run -d --name db --network boutique-net -e POSTGRES_PASSWORD=secret postgres:16
docker run --rm --network boutique-net alpine ping -c 2 db    # « db » est résolu
docker network inspect boutique-net
```

> Piège classique : dans le conteneur de l'API, `localhost` désigne **le conteneur de l'API**, pas ta machine ni la base. Il faut utiliser le nom du conteneur, `db`.

## La configuration par l'environnement

Selon la méthode des **12 facteurs**, la configuration (URL de base, clés, ports) vit dans des **variables d'environnement**, jamais dans le code ni dans l'image. La **même image** tourne ainsi partout.

```js
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const port = process.env.PORT ?? 3000;
```

```bash
docker run --env-file .env mon-api     # .env : DATABASE_URL=postgres://...
```

## Dockeriser une API et sa base

Une API Express qui lit et écrit dans PostgreSQL :

```js
// server.js
const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query('CREATE TABLE IF NOT EXISTS produits (id serial PRIMARY KEY, nom text NOT NULL, prix int NOT NULL)');

app.get('/produits', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM produits ORDER BY id');
  res.json(rows);
});
app.post('/produits', async (req, res) => {
  const { nom, prix } = req.body;
  const { rows } = await pool.query('INSERT INTO produits (nom, prix) VALUES ($1, $2) RETURNING *', [nom, prix]);
  res.status(201).json(rows[0]);
});
app.get('/sante', (req, res) => res.send('ok'));
app.listen(process.env.PORT ?? 3000);
```

La requête utilise des **paramètres** `$1, $2` et non une concaténation de chaînes : c'est la protection contre l'injection SQL, qu'on approfondira en semaine 5.

```bash
docker network create boutique-net
docker volume create boutique-pg
docker run -d --name db --network boutique-net \
  -e POSTGRES_USER=boutique -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=boutique \
  -v boutique-pg:/var/lib/postgresql/data postgres:16-alpine
docker build -t boutique-api:1.0 .
docker run -d --name api --network boutique-net -p 3000:3000 \
  -e DATABASE_URL=postgres://boutique:secret@db:5432/boutique boutique-api:1.0
curl -X POST localhost:3000/produits -H "Content-Type: application/json" -d '{"nom":"Chemise wax","prix":12000}'
curl localhost:3000/produits
```

Remarque : la base **n'a pas** de `-p`. Elle n'est accessible que depuis le réseau `boutique-net`.

## Développer avec un bind mount

Pour ne pas reconstruire l'image à chaque modification du code :

```bash
docker run -d --name api-dev --network boutique-net -p 3000:3000 \
  -v $(pwd):/app -v /app/node_modules \
  -e DATABASE_URL=postgres://boutique:secret@db:5432/boutique \
  node:22-alpine sh -c "cd /app && npm install && node --watch server.js"
```

Le second `-v /app/node_modules` protège les dépendances du conteneur : sans lui, le bind mount les remplacerait par le dossier de ta machine.

## Démonstration

On enchaîne toute la section précédente, puis on prouve que tout tient :

1. On ajoute 3 produits.
2. On supprime les deux conteneurs avec `docker rm -f api db`.
3. On les recrée avec les mêmes commandes.
4. `curl localhost:3000/produits` renvoie toujours les 3 produits, grâce au volume.

## Exercice guidé

1. Crée le réseau `atelier-net` et lance un conteneur `redis:7-alpine` nommé `cache` sur ce réseau, sans publier de port.
2. Depuis un conteneur temporaire `redis:7-alpine` sur le même réseau, exécute `redis-cli -h cache SET visite 1`, puis `GET visite`.
3. Essaie la même commande depuis un conteneur **hors** du réseau. Que se passe-t-il ?

## Exercice autonome

1. Dockerise l'API « boutique » ci-dessus. Écris le Dockerfile et le `.dockerignore`, et la variable `DATABASE_URL` doit être obligatoire.
2. Lance la base avec un volume nommé, puis l'API, sur un réseau commun. La base ne doit pas être publiée.
3. Ajoute `GET /produits/:id`, qui renvoie 404 si le produit n'existe pas. Reconstruis l'image en `1.1` et redéploie **uniquement** l'API, sans perdre de données.
4. Sauvegarde le volume dans une archive `.tgz`.
5. Dessine sur ta feuille le schéma : machine hôte, réseau, deux conteneurs, volume et port publié.

## Correction

Exercice guidé :

```bash
docker network create atelier-net
docker run -d --name cache --network atelier-net redis:7-alpine
docker run --rm --network atelier-net redis:7-alpine redis-cli -h cache SET visite 1   # OK
docker run --rm --network atelier-net redis:7-alpine redis-cli -h cache GET visite    # "1"
docker run --rm redis:7-alpine redis-cli -h cache GET visite
# « Could not connect to Redis at cache:6379: Name or service not known »
```

Sans le réseau, le nom `cache` n'est pas résolu : le DNS interne n'existe que sur les réseaux personnalisés.

Exercice autonome :

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

```js
// au début de server.js : refuser de démarrer sans configuration
if (!process.env.DATABASE_URL) { console.error('DATABASE_URL manquante'); process.exit(1); }

app.get('/produits/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM produits WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ erreur: 'Produit introuvable' });
  res.json(rows[0]);
});
```

```bash
docker build -t boutique-api:1.1 .
docker rm -f api
docker run -d --name api --network boutique-net -p 3000:3000 \
  -e DATABASE_URL=postgres://boutique:secret@db:5432/boutique boutique-api:1.1
docker run --rm -v boutique-pg:/d -v $(pwd):/s alpine tar czf /s/boutique-pg.tgz -C /d .
```

Seul le conteneur `api` est remplacé : `db` et son volume restent intacts.

## Pour aller plus loin

- Ces commandes `docker run` deviennent longues et fragiles. Demain, **Docker Compose** décrit tout cela dans un seul fichier.
- Les *secrets* Docker (Swarm) et Kubernetes (semaine 4) gèrent les mots de passe plus proprement que des variables d'environnement.
