---
slug: g03-2-github-actions-image
titre: GitHub Actions, tests, matrice, secrets et publication d'une image Docker
domaine: DevOps
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S6, ue: "Intégration et déploiement continus", option: reseaux-systemes-cloud }
  - { niveau: L3, semestre: S6, ue: "Livraison des applications", option: developpement-logiciel }
parcours:
  - { parcours: devops, ordre: 9 }
ordre: 1
prerequis_cours: [g03-1-github-actions-workflow, g02-4-docker-compose-hub]
visibilite: public
objectifs:
  - Tester sur plusieurs versions avec une matrice
  - Enchaîner des jobs avec needs et partager des fichiers avec les artefacts
  - Stocker et utiliser des secrets sans jamais les exposer
  - Construire une image Docker et la publier sur GitHub Container Registry ou Docker Hub
  - Lancer un service PostgreSQL pour les tests d'intégration
prerequis:
  - Cours « Intégration continue avec GitHub Actions, premier workflow »
  - Cours « Docker Compose et Docker Hub »
referentiels:
  - GitHub Actions (certification GitHub), domaines 1, 3 « Author and maintain actions » et 4 « Manage GitHub Actions in the enterprise » (secrets)
  - Documentation GitHub, « Publishing Docker images »
  - OWASP Top 10 CI/CD Security Risks (CICD-SEC-6 « Insufficient Credential Hygiene »)
quiz:
  - question: "Une matrice node-version: [20, 22] et os: [ubuntu-latest, windows-latest] crée combien de jobs ?"
    choix: ["2", "4", "1", "6"]
    reponse: 1
    explication: "La matrice fait le produit des valeurs : 2 versions × 2 systèmes = 4 combinaisons, exécutées en parallèle."
  - question: "Comment un job deploy attend-il la réussite du job tests ?"
    choix: ["Avec wait: tests", "Avec needs: tests", "En le plaçant après dans le fichier", "Avec depends_on: tests"]
    reponse: 1
    explication: "needs crée une dépendance : deploy ne démarre que si tests a réussi."
  - question: "Où stocker le jeton Docker Hub ?"
    choix: ["Dans le fichier YAML", "Dans les secrets du dépôt (Settings, Secrets and variables, Actions)", "Dans le README", "Dans une variable env en clair"]
    reponse: 1
    explication: "Les secrets sont chiffrés, masqués dans les journaux (***) et accessibles via ${{ secrets.NOM }}."
  - question: "Pourquoi utiliser GITHUB_TOKEN pour pousser sur ghcr.io ?"
    choix: ["Il est plus rapide", "Il est créé automatiquement pour chaque exécution, expire à la fin et n'a que les permissions déclarées", "Il est public", "Il remplace Docker"]
    reponse: 1
    explication: "Pas de secret à créer ni à renouveler ; on déclare permissions: packages: write pour l'autoriser à publier."
  - question: "Pourquoi ne publier l'image que sur push vers main et pas sur pull_request ?"
    choix: ["Pour économiser du disque", "Parce qu'une image ne doit être publiée qu'une fois le code relu et fusionné", "GitHub l'interdit", "Ça n'a pas d'importance"]
    reponse: 1
    explication: "Sur une PR, on construit pour vérifier que l'image se construit, mais on ne publie pas un code non validé."
---

## L'objectif du jour

Dans le cours « Intégration continue avec GitHub Actions, premier workflow », notre workflow testait le code. Ici, on construit un **vrai pipeline**, dont le schéma est le suivant :

```
push ou PR ──▶ [ tests ×3 versions ] ──▶ [ build image ] ──▶ [ push registre ]  (uniquement sur main)
```

## La matrice

Elle teste le même code sur plusieurs configurations :

```yaml
jobs:
  tests:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false             # continuer les autres combinaisons même si l'une échoue
      matrix:
        os: [ubuntu-latest, windows-latest]
        node-version: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm
      - run: npm ci
      - run: npm test
```

Exemple chiffré : 2 systèmes × 2 versions donnent **4 jobs en parallèle**. Si chacun prend 2 minutes, le total réel reste d'environ 2 minutes, mais 8 minutes de quota sont consommées.

## Enchaîner les jobs et partager des fichiers

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist/ }

  verifier-dist:
    needs: build                    # attend la réussite de build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { name: dist, path: dist/ }
      - run: ls -R dist
```

Chaque job tourne sur une machine **neuve**. Les **artefacts** sont la façon de transmettre des fichiers d'un job à l'autre, ou de les télécharger depuis l'interface.

## Une base de données pour les tests

```yaml
  tests-integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: boutique_test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready --health-interval 5s --health-retries 10
    env:
      DATABASE_URL: postgres://postgres:test@localhost:5432/boutique_test
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run test:integration
```

Les connaissances des cours Docker servent directement : image, variables d'environnement, ports et healthcheck.

## Les secrets

Dans *Settings*, puis *Secrets and variables* et *Actions*, on crée `DOCKERHUB_USERNAME` et `DOCKERHUB_TOKEN`. On les utilise ainsi :

```yaml
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
```

Les règles d'hygiène :

- utiliser un **jeton** à droits limités, jamais un mot de passe ;
- les secrets sont **masqués** (`***`) dans les journaux, mais ne les affiche pas pour autant ;
- les workflows déclenchés depuis un **fork** n'ont pas accès aux secrets ; c'est voulu ;
- **moindre privilège** : déclare `permissions:` au niveau du workflow.

```yaml
permissions:
  contents: read
  packages: write        # seulement si on publie sur ghcr.io
```

## Construire et publier l'image

Sur **GitHub Container Registry** (`ghcr.io`), avec le jeton automatique `GITHUB_TOKEN` :

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  packages: write

jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm test

  image:
    needs: tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        if: github.event_name == 'push'
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=sha,prefix=sha-
            type=raw,value=latest,enable={{is_default_branch}}

      - uses: docker/build-push-action@v6
        with:
          context: .
          push: ${{ github.event_name == 'push' }}     # sur une PR : on construit seulement
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

| Élément | Rôle |
|---|---|
| `needs: tests` | pas d'image si les tests échouent |
| `if: github.event_name == 'push'` | on ne se connecte au registre que sur `main` |
| `metadata-action` | génère des tags : `sha-a3f9c21`, et `latest` sur la branche principale |
| `cache-from/to: gha` | réutilise les couches Docker d'une exécution à l'autre, comme le cache vu dans le cours « Construire ses images avec un Dockerfile » |

L'image apparaît dans l'onglet **Packages** du dépôt. On la récupère avec `docker pull ghcr.io/<pseudo>/<depot>:sha-a3f9c21`.

Pour Docker Hub, on remplace `registry` et les identifiants par les secrets, et l'image s'appelle `<utilisateur>/boutique-api`.

## Démonstration

1. On applique ce workflow à l'API boutique, avec le Dockerfile (voir le cours « Construire ses images avec un Dockerfile »).
2. Une PR : les tests et la **construction** de l'image passent, mais rien n'est publié.
3. La fusion sur `main` : l'image est poussée sur ghcr.io avec deux tags.
4. Sur un autre poste, `docker pull` puis `docker run` : l'API tourne. On vient de faire de la **livraison continue**.

## Exercice guidé

1. Ajoute une matrice Node 20 et 22 au workflow du cours « Intégration continue avec GitHub Actions, premier workflow ».
2. Crée un secret `MESSAGE_SECRET` et affiche-le dans une étape. Que montre le journal ?
3. Ajoute un job `resume` qui dépend des tests et affiche « Tous les tests sont passés ».

## Exercice autonome

Construis le pipeline complet de ton API :

1. Un job `tests` avec un service PostgreSQL et un test qui insère puis relit un produit.
2. Un job `image` qui construit l'image à chaque PR et la publie sur ghcr.io **uniquement** sur `main`, avec les tags `sha-…` et `latest`.
3. Le cache des couches Docker activé. Compare la durée de la première exécution et de la deuxième.
4. Vérifie en local que l'image publiée fonctionne : `docker pull`, puis `docker run`.
5. Question : un collègue propose `run: echo ${{ secrets.DOCKERHUB_TOKEN }} > token.txt` pour « déboguer ». Pourquoi est-ce dangereux, même si le journal masque la valeur ?

## Correction

Exercice guidé :

- Question 2 : le journal affiche `***`. GitHub masque toute occurrence de la valeur d'un secret.
- Question 3 : `resume: { needs: tests, runs-on: ubuntu-latest, steps: [ { run: echo "Tous les tests sont passés" } ] }`. Avec la matrice, `needs: tests` attend **toutes** les combinaisons.

Exercice autonome :

- Question 3 : la première construction prend par exemple 1 min 30 ; la deuxième, si seul le code a changé, environ 25 s, car les couches `npm ci` sont reprises du cache.
- Question 5 : le fichier peut finir dans un **artefact** ou une image, et quiconque y accède lit le jeton en clair. Le masquage ne protège que l'affichage du journal, pas les fichiers. Un jeton exposé doit être **révoqué immédiatement**.

## Pour aller plus loin

- Les *environments* GitHub (*Settings*, puis *Environments*) ajoutent une approbation manuelle avant un déploiement en production.
- Les *reusable workflows* (`workflow_call`) évitent de copier le même pipeline dans dix dépôts.
- OIDC permet de se connecter à AWS sans stocker de clé d'accès. On le verra dans le parcours cloud.
