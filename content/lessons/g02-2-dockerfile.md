---
slug: g02-2-dockerfile
titre: Construire ses images avec un Dockerfile
domaine: DevOps
duree: 120
difficulte: bases
licence:
  - { niveau: L2, semestre: S4, ue: "Virtualisation et cloud" }
parcours:
  - { parcours: devops, ordre: 5 }
ordre: 2
prerequis_cours: [g02-1-docker-images-conteneurs]
visibilite: public
objectifs:
  - Écrire un Dockerfile avec FROM, WORKDIR, COPY, RUN, ENV, EXPOSE, CMD
  - Construire une image avec docker build et la taguer
  - Expliquer le cache des couches et ordonner les instructions pour en profiter
  - Réduire la taille d'une image avec une image de base légère, .dockerignore et le multi-stage
  - Appliquer les bonnes pratiques de sécurité (utilisateur non root, pas de secret dans l'image)
prerequis:
  - Séance « Docker, images et conteneurs »
referentiels:
  - Chapitre DIT 6 « Utilisation de Dockerfile »
  - Docker Certified Associate (DCA), domaine « Image Creation, Management and Registry »
  - Documentation Docker, « Building best practices »
  - CIS Docker Benchmark, section 4 « Container Images and Build File »
quiz:
  - question: "Quelle différence entre RUN et CMD ?"
    choix: ["Aucune", "RUN s'exécute pendant la construction de l'image ; CMD définit la commande lancée au démarrage du conteneur", "CMD s'exécute pendant la construction", "RUN ne fonctionne qu'avec Linux"]
    reponse: 1
    explication: "RUN npm ci installe les dépendances une fois, dans l'image. CMD [\"node\",\"dist/main.js\"] est lancé à chaque docker run."
  - question: "Pourquoi copier package.json et faire npm ci AVANT de copier le reste du code ?"
    choix: ["C'est obligatoire", "Pour profiter du cache : si seul le code change, l'installation des dépendances n'est pas refaite", "Pour que l'image soit plus petite", "Pour la sécurité"]
    reponse: 1
    explication: "Chaque instruction crée une couche mise en cache. Dès qu'une couche change, toutes les suivantes sont reconstruites. On met donc ce qui change rarement en haut."
  - question: "À quoi sert un fichier .dockerignore ?"
    choix: ["À ignorer des erreurs", "À exclure des fichiers du contexte de construction (node_modules, .env, .git)", "À cacher des conteneurs", "À ignorer des images"]
    reponse: 1
    explication: "Il accélère la construction, réduit l'image et évite d'y copier des secrets comme .env."
  - question: "Quel est l'intérêt d'un build multi-stage ?"
    choix: ["Construire plusieurs applications", "Compiler dans une première étape et ne copier que le résultat dans une image finale légère", "Lancer plusieurs conteneurs", "Construire plus lentement mais plus sûrement"]
    reponse: 1
    explication: "Les outils de compilation (TypeScript, devDependencies) restent dans l'étape de build ; l'image finale ne contient que dist/ et les dépendances de production."
  - question: "Pourquoi ajouter USER node dans un Dockerfile ?"
    choix: ["Pour accélérer le démarrage", "Pour que l'application ne tourne pas en root dans le conteneur", "Pour se connecter à Docker Hub", "Pour créer un compte GitHub"]
    reponse: 1
    explication: "Principe du moindre privilège : si l'application est compromise, l'attaquant n'a pas les droits root dans le conteneur."
---

## L'idée

Hier, on utilisait des images toutes faites (nginx, postgres). Aujourd'hui, on fabrique **l'image de notre propre application**. Un **Dockerfile** est un fichier texte qui contient la **recette** : les étapes pour construire l'image, de la même façon à chaque fois.

```
Dockerfile ──docker build──▶ Image ──docker run──▶ Conteneur
 (recette)                  (plat surgelé)        (plat servi)
```

## Les instructions

| Instruction | Rôle | Exemple |
|---|---|---|
| `FROM` | image de base, toujours en premier | `FROM node:22-alpine` |
| `WORKDIR` | dossier de travail (créé s'il n'existe pas) | `WORKDIR /app` |
| `COPY` | copier de ta machine vers l'image | `COPY package*.json ./` |
| `RUN` | exécuter une commande **pendant la construction** | `RUN npm ci` |
| `ENV` | variable d'environnement | `ENV NODE_ENV=production` |
| `ARG` | variable disponible seulement pendant la construction | `ARG VERSION=1.0` |
| `EXPOSE` | documenter le port écouté (ne publie rien) | `EXPOSE 3000` |
| `USER` | utilisateur qui exécutera la suite | `USER node` |
| `CMD` | commande lancée **au démarrage** du conteneur | `CMD ["node", "server.js"]` |
| `ENTRYPOINT` | programme principal fixe ; CMD lui fournit alors les arguments | `ENTRYPOINT ["python"]` |
| `HEALTHCHECK` | commande qui vérifie que l'application répond | `HEALTHCHECK CMD wget -qO- localhost:3000/sante` |

Écris `CMD` sous la **forme tableau** `["node", "server.js"]`. Ainsi, ton programme reçoit directement les signaux et `docker stop` l'arrête proprement.

## Un premier Dockerfile

Une application Express minimale :

```js
// server.js
const express = require('express');
const app = express();
app.get('/', (req, res) => res.json({ message: 'Bonjour depuis Docker', env: process.env.NODE_ENV }));
app.listen(3000, () => console.log('API sur le port 3000'));
```

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["node", "server.js"]
```

```bash
docker build -t mon-api:1.0 .        # le point désigne le contexte, c'est-à-dire le dossier envoyé à Docker
docker run -d -p 3000:3000 --name api mon-api:1.0
curl localhost:3000
```

## Le cache des couches

Chaque instruction crée une **couche**. Docker met en cache chaque couche. **Si une couche change, toutes les suivantes sont reconstruites.**

Mauvais ordre :

```dockerfile
COPY . .            # la moindre modification du code invalide cette couche…
RUN npm ci          # …et l'installation est refaite à chaque fois (une minute perdue)
```

Bon ordre :

```dockerfile
COPY package*.json ./   # change rarement
RUN npm ci              # restera en cache tant que les dépendances ne changent pas
COPY . .                # change souvent : on le met en dernier
```

Exemple chiffré : sans cache, la construction prend 60 secondes. Avec le bon ordre, quand seul `server.js` change, elle prend environ 2 secondes, car seules les couches `COPY . .` et suivantes sont refaites.

## Le fichier .dockerignore

Comme `.gitignore`, mais pour le contexte de construction :

```
node_modules
.git
.env
dist
*.log
Dockerfile
```

Sans lui, `COPY . .` envoie ton `node_modules` local (des centaines de Mo, compilés pour ton système) et ton `.env` (tes **secrets**) dans l'image.

## Réduire la taille de l'image

1. **Une image de base légère** :

| Image | Taille approximative |
|---|---|
| `node:22` | 1,1 Go |
| `node:22-slim` | 240 Mo |
| `node:22-alpine` | 160 Mo |

2. **Regrouper les commandes** et nettoyer dans le même `RUN` :

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
```

3. **Le multi-stage**, indispensable pour du TypeScript :

```dockerfile
# Étape 1 : compiler
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build                 # produit dist/

# Étape 2 : image finale, sans TypeScript ni devDependencies
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

## La sécurité

- **Ne lance pas l'application en root** : ajoute `USER node`, ou crée un utilisateur avec `adduser`.
- **Aucun secret dans l'image** (pas de `ENV MOT_DE_PASSE=...`, pas de `COPY .env`). Quiconque récupère l'image peut lire ses couches avec `docker history`. Les secrets se passent **au lancement** : `docker run -e` ou `--env-file`.
- **Fixe les versions** : `node:22.11-alpine` plutôt que `latest`, pour qu'une construction donne le même résultat aujourd'hui et dans six mois.
- **Analyse l'image** : `docker scout cves mon-api:1.0`, ou l'outil Trivy, liste les vulnérabilités connues.

## Démonstration

```bash
mkdir api-docker && cd api-docker
npm init -y && npm install express
# on crée server.js, le Dockerfile et le .dockerignore ci-dessus
docker build -t mon-api:1.0 .
docker image ls mon-api
docker run -d -p 3000:3000 --name api mon-api:1.0 && curl localhost:3000
# on modifie le message dans server.js
docker build -t mon-api:1.1 .        # on observe « CACHED » sur npm ci
docker history mon-api:1.1           # les couches et leur taille
docker exec api whoami               # node, et non root
```

## Exercice guidé

On conteneurise un site statique.

1. Crée `index.html` et `style.css` dans un dossier `vitrine`.
2. Écris un Dockerfile basé sur `nginx:1.27-alpine` qui copie ces fichiers dans `/usr/share/nginx/html/`.
3. Construis l'image `vitrine:1.0` et lance-la sur le port 8080.
4. Modifie `index.html`, reconstruis l'image en `vitrine:1.1` et vérifie le changement.

## Exercice autonome

Conteneurise une API Python FastAPI :

```python
# main.py
from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def accueil():
    return {"message": "API Python dans Docker"}
```

```
# requirements.txt
fastapi==0.115.0
uvicorn==0.30.6
```

1. Écris le Dockerfile : `python:3.12-slim`, installation des dépendances **avant** la copie du code, utilisateur non root, et la commande `uvicorn main:app --host 0.0.0.0 --port 8000`.
2. Ajoute un `.dockerignore`.
3. Construis l'image, lance-la et teste `http://localhost:8000/docs`.
4. Modifie seulement `main.py` et reconstruis. Quelles étapes sont marquées `CACHED` ?
5. Pourquoi faut-il `--host 0.0.0.0` et non `127.0.0.1` ?

## Correction

Exercice guidé :

```dockerfile
FROM nginx:1.27-alpine
COPY index.html style.css /usr/share/nginx/html/
EXPOSE 80
```

```bash
docker build -t vitrine:1.0 . && docker run -d -p 8080:80 --name vitrine vitrine:1.0
```

Exercice autonome :

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd --create-home appuser
USER appuser
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```
# .dockerignore
__pycache__
.venv
.env
.git
```

4. Les étapes `FROM`, `WORKDIR`, `COPY requirements.txt` et `RUN pip install` sont en cache. Seules `COPY . .` et les suivantes sont refaites.

5. Dans un conteneur, `127.0.0.1` désigne **le conteneur lui-même**. Les requêtes qui arrivent de ta machine par le port publié ne passent pas par cette interface. `0.0.0.0` signifie « écouter sur toutes les interfaces ».

## Pour aller plus loin

- `docker buildx build --platform linux/amd64,linux/arm64` construit une image pour plusieurs processeurs (serveurs Intel, Mac M1 à M4).
- Les images *distroless* de Google ne contiennent même pas de shell : leur surface d'attaque est minimale.
- Jeudi : volumes, réseaux et la dockerisation d'une API avec sa base de données.
