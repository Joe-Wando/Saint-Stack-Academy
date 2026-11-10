---
slug: g02-1-docker-images-conteneurs
titre: Docker, images et conteneurs
domaine: DevOps
duree: 120
difficulte: découverte
licence:
  - { niveau: L2, semestre: S4, ue: "Virtualisation et cloud" }
parcours:
  - { parcours: devops, ordre: 4 }
ordre: 1
prerequis_cours: []
visibilite: public
objectifs:
  - Expliquer le problème que résout Docker (« ça marche sur ma machine »)
  - Distinguer une image d'un conteneur, et un conteneur d'une machine virtuelle
  - Télécharger une image depuis Docker Hub et lancer un conteneur
  - Publier un port, passer des variables d'environnement et nommer un conteneur
  - Gérer le cycle de vie d'un conteneur (lister, arrêter, redémarrer, supprimer, logs, exec)
prerequis:
  - Séances « Le terminal Linux » et « Les réseaux pour développeurs »
  - Docker Desktop (Windows ou macOS) ou Docker Engine (Linux) installé
referentiels:
  - Chapitres DIT 4 « Introduction sur Docker » et 5 « Prise en main de Docker »
  - Docker Certified Associate (DCA), domaines « Image Creation, Management and Registry » et « Orchestration » (bases)
  - Linux Foundation, « Introduction to Kubernetes » (LFS158), chapitre sur les conteneurs
quiz:
  - question: "Quelle est la relation entre une image et un conteneur ?"
    choix: ["Ce sont deux noms pour la même chose", "L'image est un modèle en lecture seule ; le conteneur est une instance en cours d'exécution de cette image", "Le conteneur sert à construire l'image", "L'image tourne, le conteneur est stocké"]
    reponse: 1
    explication: "Comme une classe et ses objets : à partir d'une image nginx, on peut lancer dix conteneurs nginx indépendants."
  - question: "Que fait l'option -p 8080:80 ?"
    choix: ["Elle limite la mémoire à 80 Mo", "Elle relie le port 8080 de ta machine au port 80 du conteneur", "Elle relie le port 80 de ta machine au port 8080 du conteneur", "Elle lance 80 conteneurs"]
    reponse: 1
    explication: "Le format est port_machine:port_conteneur. On ouvre http://localhost:8080 et la requête arrive sur le port 80 du conteneur."
  - question: "Pourquoi un conteneur démarre-t-il plus vite qu'une machine virtuelle ?"
    choix: ["Il utilise moins de disque dur", "Il partage le noyau de la machine hôte au lieu d'embarquer un système complet", "Il n'a pas de réseau", "Il est écrit en Go"]
    reponse: 1
    explication: "Une VM démarre un système d'exploitation entier sur un hyperviseur ; un conteneur n'est qu'un processus isolé qui partage le noyau de l'hôte."
  - question: "Quelle commande ouvre un terminal dans un conteneur en cours d'exécution nommé web ?"
    choix: ["docker run -it web bash", "docker exec -it web sh", "docker attach bash web", "docker open web"]
    reponse: 1
    explication: "docker exec exécute une commande dans un conteneur qui tourne déjà ; -it rend la session interactive. docker run, lui, crée un nouveau conteneur."
  - question: "Que devient ce que tu as écrit dans un conteneur quand tu le supprimes avec docker rm ?"
    choix: ["C'est conservé dans l'image", "C'est perdu, sauf si c'était dans un volume", "C'est envoyé sur Docker Hub", "C'est sauvegardé dans /tmp"]
    reponse: 1
    explication: "La couche d'écriture d'un conteneur disparaît avec lui. Pour garder des données (une base, par exemple), on utilise un volume, vu jeudi."
---

## Le problème

« Chez moi ça marche ! » Ton API fonctionne sur ton ordinateur avec Node 22 et PostgreSQL 16. Sur le serveur, il y a Node 18 et PostgreSQL 14, et rien ne fonctionne. Ton collègue sous Windows n'arrive même pas à l'installer.

Docker règle ce problème en **emballant** l'application avec tout ce dont elle a besoin (système de fichiers, bibliothèques, runtime, configuration) dans une boîte standard qui se lance de la même façon partout.

> Analogie : le conteneur maritime. Peu importe ce qu'il contient (bananes, voitures, téléphones), il a la même forme et se charge sur n'importe quel bateau, train ou camion. Docker fait la même chose pour le logiciel.

## Conteneur ou machine virtuelle ?

```
   Machine virtuelle                     Conteneurs
┌──────┐ ┌──────┐ ┌──────┐         ┌──────┐ ┌──────┐ ┌──────┐
│ App A│ │ App B│ │ App C│         │ App A│ │ App B│ │ App C│
│ Libs │ │ Libs │ │ Libs │         │ Libs │ │ Libs │ │ Libs │
│ OS   │ │ OS   │ │ OS   │         └──────┘ └──────┘ └──────┘
└──────┘ └──────┘ └──────┘         ┌──────────────────────────┐
┌──────────────────────────┐       │   Moteur Docker          │
│   Hyperviseur            │       ├──────────────────────────┤
├──────────────────────────┤       │   OS hôte (noyau Linux)  │
│   Matériel               │       │   Matériel               │
└──────────────────────────┘       └──────────────────────────┘
```

| | Machine virtuelle | Conteneur |
|---|---|---|
| Contient | un système d'exploitation complet | l'application et ses dépendances |
| Taille | plusieurs Go | quelques dizaines de Mo |
| Démarrage | des minutes | une seconde ou moins |
| Isolation | forte (noyau séparé) | bonne (même noyau, espaces isolés) |

Techniquement, un conteneur est un **processus Linux isolé** grâce à deux mécanismes du noyau : les *namespaces* (il ne voit que ses propres processus, son réseau, ses fichiers) et les *cgroups* (on limite son processeur et sa mémoire). Sous Windows et macOS, Docker Desktop fait tourner une petite VM Linux pour cela.

## Le vocabulaire

| Terme | Définition |
|---|---|
| **Image** | un modèle **en lecture seule**, formé de couches empilées : par exemple `nginx:1.27` |
| **Conteneur** | une **instance** d'image qui tourne, avec une couche d'écriture propre |
| **Registre** | un serveur qui stocke des images : Docker Hub, GitHub Container Registry |
| **Tag** | la version d'une image, après les deux-points : `node:22-alpine`. Sans tag, Docker prend `latest` |
| **Docker Engine** | le démon qui construit et exécute les conteneurs ; la commande `docker` lui parle |

> Image et conteneur sont comme une classe et ses objets, ou comme une recette et les plats que l'on cuisine avec.

## Les commandes d'images

Le cours DIT utilise la forme longue `docker container …` et `docker image …`. La forme courte (`docker run`, `docker ps`) fait exactement la même chose.

```bash
docker pull nginx:1.27          # télécharger une image
docker image ls                 # lister les images locales (ou docker images)
docker image inspect nginx:1.27 # détails : couches, ports exposés, commande par défaut
docker image history nginx:1.27 # les couches qui composent l'image
docker rmi nginx:1.27           # supprimer une image
```

## Lancer un conteneur

```bash
docker container run --name serveur_nginx -d -p 8080:80 nginx:1.27
```

| Option | Rôle |
|---|---|
| `--name serveur_nginx` | donner un nom (sinon Docker en invente un) |
| `-d` | mode détaché : le conteneur tourne en arrière-plan |
| `-p 8080:80` | publier le port : **port_machine:port_conteneur** |
| `-e CLE=valeur` | passer une variable d'environnement |
| `--rm` | supprimer le conteneur dès qu'il s'arrête |
| `-it` | interactif avec un terminal (pour un shell) |

Ouvre `http://localhost:8080` : la page « Welcome to nginx! » s'affiche.

Exemple avec des variables d'environnement, tiré du cours DIT :

```bash
docker container run -d --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=rootpass -e MYSQL_DATABASE=devopsdb \
  -p 3306:3306 mysql:8.0
```

## Le cycle de vie

```
 docker run ──▶ [ en cours ] ──docker stop──▶ [ arrêté ] ──docker rm──▶ (supprimé)
                     ▲                             │
                     └────────docker start─────────┘
```

```bash
docker container ls            # conteneurs en cours (ou docker ps)
docker container ls -a         # tous, y compris arrêtés
docker stop mysql-db           # arrêt propre (SIGTERM, puis SIGKILL après 10 s)
docker start mysql-db
docker restart mysql-db
docker kill mysql-db           # arrêt immédiat (SIGKILL)
docker rm mysql-db             # supprimer (il doit être arrêté, ou -f)
docker logs -f serveur_nginx   # journaux en direct
docker exec -it serveur_nginx sh   # ouvrir un shell dedans
docker stats                   # processeur et mémoire de chaque conteneur
docker system prune            # faire le ménage (conteneurs arrêtés, images orphelines)
```

Tu retrouves les notions de la séance solo sur les processus : un conteneur a un processus principal, et `docker stop` lui envoie un signal.

## Démonstration

```bash
docker run --rm hello-world                 # le test classique
docker run -d --name web -p 8080:80 nginx:1.27
curl -I localhost:8080                      # 200 OK, Server: nginx
docker exec -it web sh
  cat /etc/os-release                       # Debian : le conteneur a son propre système de fichiers
  echo "<h1>Saint Stack</h1>" > /usr/share/nginx/html/index.html
  exit
curl localhost:8080                         # <h1>Saint Stack</h1>
docker logs web                             # on voit nos requêtes curl
docker rm -f web && docker run -d --name web -p 8080:80 nginx:1.27
curl localhost:8080                         # la page par défaut revient : la modification est perdue
docker run -it --rm python:3.12-slim python # un interpréteur Python sans rien installer
```

## Exercice guidé

1. Lance deux conteneurs nginx en même temps, `site1` sur le port 8081 et `site2` sur le port 8082. Vérifie les deux avec `curl`.
2. Essaie de lancer un troisième conteneur sur le port 8081. Lis le message d'erreur et explique-le.
3. Modifie la page d'accueil de `site2` uniquement, avec `docker exec`.
4. Affiche les 5 dernières lignes de journal de `site1`.
5. Arrête puis supprime les deux conteneurs en **une seule** commande.

## Exercice autonome

1. Lance un conteneur PostgreSQL 16 nommé `pg-test`, avec le mot de passe `secret`, publié sur le port 5433 de ta machine.
2. Ouvre `psql` **dans** le conteneur et crée une table `eleves (id serial, nom text)` avec deux lignes.
3. Arrête puis redémarre le conteneur (`stop` puis `start`). Les lignes sont-elles toujours là ?
4. Supprime le conteneur, recrée-le avec la même commande. Les lignes sont-elles toujours là ? Explique la différence avec la question 3.
5. Quelle est la taille des images `postgres:16` et `postgres:16-alpine` ? Pourquoi cette différence ?

## Correction

Exercice guidé :

```bash
docker run -d --name site1 -p 8081:80 nginx:1.27
docker run -d --name site2 -p 8082:80 nginx:1.27
curl -I localhost:8081 ; curl -I localhost:8082
docker run -d --name site3 -p 8081:80 nginx:1.27   # « port is already allocated »
docker exec site2 sh -c 'echo "<h1>Site 2</h1>" > /usr/share/nginx/html/index.html'
docker logs --tail 5 site1
docker rm -f site1 site2 site3
```

À la question 2, un port de ta machine ne peut être occupé que par un seul programme. Le conteneur `site3` est quand même créé, mais il ne démarre pas ; c'est pourquoi on le supprime aussi.

Exercice autonome :

```bash
docker run -d --name pg-test -e POSTGRES_PASSWORD=secret -p 5433:5432 postgres:16
docker exec -it pg-test psql -U postgres
  CREATE TABLE eleves (id serial, nom text);
  INSERT INTO eleves (nom) VALUES ('Awa'), ('Moussa');
  \q
docker stop pg-test && docker start pg-test
docker exec pg-test psql -U postgres -c "SELECT * FROM eleves"   # 3. les 2 lignes sont là
docker rm -f pg-test && docker run -d --name pg-test -e POSTGRES_PASSWORD=secret -p 5433:5432 postgres:16
docker exec pg-test psql -U postgres -c "SELECT * FROM eleves"   # 4. relation "eleves" does not exist
docker image ls postgres
```

Questions 3 et 4 : arrêter un conteneur garde sa couche d'écriture, mais le **supprimer** la détruit. Un nouveau conteneur repart de l'image vierge. Il faudra un volume pour garder les données (jeudi). En réalité, l'image postgres crée un volume anonyme automatiquement, mais il n'est pas réutilisé par le nouveau conteneur.

Question 5 : environ 430 Mo contre 270 Mo. Alpine est une distribution Linux minimale (environ 8 Mo de base), alors que l'image par défaut repose sur Debian.

## Pour aller plus loin

- *Play with Docker* (labs.play-with-docker.com) : un terrain de jeu Docker dans le navigateur, sans installation.
- `docker run --memory 256m --cpus 0.5` limite les ressources d'un conteneur grâce aux cgroups.
- Demain, on construit **nos propres** images avec un Dockerfile.
