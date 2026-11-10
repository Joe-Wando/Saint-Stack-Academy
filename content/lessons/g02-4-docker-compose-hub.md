---
slug: g02-4-docker-compose-hub
titre: Docker Compose et Docker Hub
domaine: DevOps
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S6, ue: "Conteneurs, orchestration et automatisation", option: reseaux-systemes-cloud }
  - { niveau: L3, semestre: S6, ue: "Livraison des applications", option: developpement-logiciel }
parcours:
  - { parcours: devops, ordre: 7 }
ordre: 2
prerequis_cours: [g02-3-docker-volumes-reseaux]
visibilite: public
objectifs:
  - Décrire une application multi-conteneurs dans un fichier compose.yaml
  - Lancer, arrêter, reconstruire et observer la pile avec docker compose
  - Gérer l'ordre de démarrage avec depends_on et un healthcheck
  - Séparer la configuration dans un fichier .env
  - Taguer et publier une image sur Docker Hub, puis la récupérer ailleurs
prerequis:
  - Séance « Docker, volumes, réseaux et dockerisation d'une API »
  - Un compte Docker Hub
referentiels:
  - Document DIT « Architecture CI/CD avec Docker Compose, déploiement mono-repo et multi-repo »
  - Docker Certified Associate (DCA), domaines « Orchestration » et « Image Creation, Management and Registry »
  - Compose Specification (compose-spec.io)
quiz:
  - question: "Quelle commande démarre toute la pile en arrière-plan et reconstruit les images si besoin ?"
    choix: ["docker compose up -d --build", "docker run compose", "docker compose start --all", "docker build compose.yaml"]
    reponse: 0
    explication: "up crée le réseau, les volumes et les conteneurs ; -d détache ; --build reconstruit les images des services qui ont un build."
  - question: "Dans Compose, comment le service api joint-il le service db ?"
    choix: ["Par localhost", "Par le nom du service : db", "Il faut créer le réseau à la main", "Par l'IP fixe 172.17.0.2"]
    reponse: 1
    explication: "Compose crée automatiquement un réseau pour le projet ; chaque service y est joignable par son nom."
  - question: "Que garantit depends_on avec condition: service_healthy ?"
    choix: ["Que db est créé avant api", "Que api ne démarre qu'une fois le healthcheck de db réussi", "Que db redémarre si api plante", "Rien"]
    reponse: 1
    explication: "Sans condition, depends_on garantit seulement l'ordre de création ; PostgreSQL peut ne pas encore accepter de connexions."
  - question: "Que fait docker compose down -v ?"
    choix: ["Il arrête les conteneurs seulement", "Il supprime conteneurs et réseau, et aussi les volumes nommés", "Il affiche la version", "Il met à jour les images"]
    reponse: 1
    explication: "-v supprime les volumes : les données de la base sont perdues. Sans -v, les volumes sont conservés."
  - question: "Quel nom doit avoir une image pour être poussée sur ton compte Docker Hub « awa221 » ?"
    choix: ["boutique-api:1.0", "awa221/boutique-api:1.0", "hub/boutique-api", "docker.io:boutique-api"]
    reponse: 1
    explication: "Le format est utilisateur/depot:tag. On renomme avec docker tag boutique-api:1.0 awa221/boutique-api:1.0, puis docker push."
---

## L'idée

Hier, faire tourner l'API et sa base demandait cinq commandes longues : un réseau, un volume, et deux `docker run` avec de nombreuses options. Une seule faute de frappe et rien ne marche.

**Docker Compose** décrit toute l'application (services, réseaux, volumes, variables) dans **un fichier YAML**, et une seule commande la lance. C'est de l'**infrastructure décrite par du code** : le fichier est versionné dans Git, relu en pull request et identique pour toute l'équipe.

## Le YAML en 1 minute

```yaml
cle: valeur              # paire clé-valeur
liste:                   # liste
  - premier
  - second
objet:                   # imbrication par indentation (2 espaces, JAMAIS de tabulation)
  sous_cle: 42
texte: "entre guillemets si caractères spéciaux : # ou ':'"
```

## Le fichier compose.yaml

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: boutique
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d boutique"]
      interval: 5s
      retries: 10

  api:
    build: ./api                  # construit l'image depuis api/Dockerfile
    environment:
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@db:5432/boutique
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  web:
    image: nginx:1.27-alpine
    volumes:
      - ./web:/usr/share/nginx/html:ro    # bind mount en lecture seule
    ports:
      - "8080:80"

volumes:
  pgdata:
```

```
# .env, à côté de compose.yaml, à NE PAS commiter (mettre .env.example dans Git)
DB_USER=boutique
DB_PASSWORD=change-moi
```

Ce que Compose fait automatiquement :

- il crée un **réseau** `<projet>_default`, sur lequel chaque service est joignable **par son nom** (`db`, `api`) ;
- il préfixe les noms des conteneurs et des volumes par le nom du projet (celui du dossier) ;
- il remplace les `${VARIABLES}` par les valeurs du fichier `.env`.

| Clé | Rôle |
|---|---|
| `image` | image existante |
| `build` | construire depuis un Dockerfile |
| `ports` | publier : `"machine:conteneur"` |
| `environment` / `env_file` | variables d'environnement |
| `volumes` | volumes nommés ou bind mounts |
| `depends_on` | ordre de démarrage (avec `condition`, attendre l'état sain) |
| `restart` | `no`, `always`, `on-failure`, `unless-stopped` |
| `healthcheck` | test de bonne santé |

## Les commandes

```bash
docker compose up -d            # tout démarrer en arrière-plan
docker compose up -d --build    # en reconstruisant les images
docker compose ps               # état des services
docker compose logs -f api      # journaux d'un service
docker compose exec db psql -U boutique boutique   # entrer dans un service
docker compose restart api
docker compose stop             # arrêter sans supprimer
docker compose down             # supprimer conteneurs et réseau (les volumes restent)
docker compose down -v          # supprimer AUSSI les volumes : les données sont perdues
docker compose config           # afficher le fichier final, variables remplacées (pour déboguer)
```

## Docker Hub et les registres

Un **registre** stocke et distribue des images. **Docker Hub** est le registre public par défaut. Il en existe d'autres : GitHub Container Registry (`ghcr.io`), GitLab, AWS ECR.

Le nom complet d'une image : `registre/utilisateur/depot:tag`. Sur Docker Hub, le registre est implicite : `awa221/boutique-api:1.0`.

```bash
docker login                                  # utilise un jeton d'accès (Account Settings, Personal access tokens), pas ton mot de passe
docker tag boutique-api:1.0 awa221/boutique-api:1.0
docker tag boutique-api:1.0 awa221/boutique-api:latest
docker push awa221/boutique-api:1.0
docker push awa221/boutique-api:latest
# sur n'importe quelle autre machine :
docker pull awa221/boutique-api:1.0
```

**Les bonnes pratiques de tag** : utilise des versions sémantiques (`1.0.0`, `1.1.0`) ou l'empreinte du commit Git (`sha-a3f9c21`). Ne déploie **jamais** `latest` en production : tu ne saurais pas quelle version tourne réellement.

En production, le fichier Compose utilise alors `image: awa221/boutique-api:1.0` au lieu de `build:`. Le serveur **télécharge** l'image ; il ne la construit pas.

## Mono-repo et multi-repo

Le document DIT sur l'architecture CI/CD distingue deux organisations :

| | Mono-repo | Multi-repo |
|---|---|---|
| Organisation | `api/`, `web/` et `compose.yaml` dans un seul dépôt | un dépôt par service, plus un dépôt de déploiement |
| Avantage | simple, un seul pipeline, changements atomiques | équipes indépendantes, versions séparées |
| Inconvénient | le dépôt grossit | il faut coordonner les versions |

Le projet Saint Stack Academy est un mono-repo : `api/`, `web/` et `content/`.

## Démonstration

1. On transforme l'API boutique d'hier en projet Compose : `api/` (le code et le Dockerfile), `web/` (un `index.html` qui appelle l'API), puis `compose.yaml` et `.env`.
2. `docker compose up -d --build`, puis `docker compose ps` : `db` passe à `healthy`, et ensuite seulement `api` démarre.
3. On ajoute un produit, puis `docker compose down` et `up -d` : les données sont toujours là.
4. On fait `docker compose down -v` et `up -d` : la base est vide. On comprend le rôle de `-v`.
5. On tague l'image et on la pousse sur Docker Hub, puis on la tire depuis le poste d'un autre participant.

## Exercice guidé

Écris le `compose.yaml` d'un blog WordPress :

- un service `db` basé sur `mysql:8.0`, avec un volume `db_data` et les variables `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE=wordpress`, `MYSQL_USER=wp` et `MYSQL_PASSWORD` ;
- un service `wordpress` basé sur `wordpress:6`, sur le port 8000, avec `WORDPRESS_DB_HOST=db`, `WORDPRESS_DB_USER`, `WORDPRESS_DB_PASSWORD` et `WORDPRESS_DB_NAME`, qui dépend de `db` ;
- les mots de passe placés dans `.env`.

Lance la pile et installe WordPress sur `http://localhost:8000`.

## Exercice autonome

1. Ajoute un service `adminer` (image `adminer`, port 8081) au projet boutique, pour consulter la base dans le navigateur.
2. Ajoute un healthcheck à l'API qui interroge `/sante`.
3. Écris `.env.example` et vérifie que `.env` est bien dans `.gitignore`.
4. Publie ton image d'API sur Docker Hub sous deux tags : `1.0.0` et l'empreinte courte du commit Git (`git rev-parse --short HEAD`).
5. Écris un `compose.prod.yaml` qui utilise ton image publiée au lieu de `build:`, et ne publie aucun port pour la base.

## Correction

Exercice guidé :

```yaml
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wp
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
  wordpress:
    image: wordpress:6
    depends_on:
      - db
    ports:
      - "8000:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wp
      WORDPRESS_DB_PASSWORD: ${MYSQL_PASSWORD}
      WORDPRESS_DB_NAME: wordpress
volumes:
  db_data:
```

Si WordPress affiche « Error establishing a database connection » pendant quelques secondes, c'est que MySQL n'est pas encore prêt. Un `healthcheck` sur `db` (`mysqladmin ping -h localhost`) avec `condition: service_healthy` règle le problème.

Exercice autonome :

```yaml
  adminer:
    image: adminer
    ports:
      - "8081:8080"
  api:
    # …
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/sante"]
      interval: 10s
```

```bash
TAG=$(git rev-parse --short HEAD)
docker tag boutique-api:1.0 awa221/boutique-api:1.0.0
docker tag boutique-api:1.0 awa221/boutique-api:sha-$TAG
docker push awa221/boutique-api:1.0.0 && docker push awa221/boutique-api:sha-$TAG
```

Dans `compose.prod.yaml`, le service `api` utilise `image: awa221/boutique-api:1.0.0` et le service `db` n'a pas de clé `ports`. On le lance avec `docker compose -f compose.prod.yaml up -d`.

## Pour aller plus loin

- `docker compose watch` synchronise le code et reconstruit automatiquement pendant le développement.
- Les *profiles* activent des services optionnels (`adminer` seulement en développement).
- La semaine prochaine, GitHub Actions construira et poussera l'image **automatiquement** à chaque fusion sur `main`.
