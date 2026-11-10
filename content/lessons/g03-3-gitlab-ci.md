---
slug: g03-3-gitlab-ci
titre: GitLab CI/CD, stages, jobs, runners et registre
domaine: DevOps
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S6, ue: "Intégration et déploiement continus", option: reseaux-systemes-cloud }
parcours:
  - { parcours: devops, ordre: 10 }
ordre: 2
prerequis_cours: []
visibilite: public
objectifs:
  - Décrire l'organisation d'un pipeline GitLab (stages, jobs, runners)
  - Écrire un fichier .gitlab-ci.yml avec image, script, rules, cache et artifacts
  - Utiliser les variables CI/CD protégées et masquées
  - Construire et publier une image dans le registre de conteneurs de GitLab
  - Comparer GitLab CI et GitHub Actions
prerequis:
  - Séances GitHub Actions de la semaine 3
  - Un compte gitlab.com
referentiels:
  - GitLab Certified CI/CD Associate, domaines « Pipelines », « Jobs », « Variables » et « Runners »
  - Documentation GitLab, « CI/CD YAML syntax reference »
  - Document DIT « Architecture CI/CD avec Docker Compose »
quiz:
  - question: "Dans GitLab CI, comment s'exécutent les jobs d'un même stage ?"
    choix: ["Les uns après les autres", "En parallèle ; le stage suivant attend qu'ils aient tous réussi", "Au hasard", "Un seul job par stage"]
    reponse: 1
    explication: "Les stages sont séquentiels (test, puis build, puis deploy) ; les jobs d'un stage tournent en parallèle."
  - question: "À quoi sert le mot-clé image: dans un job ?"
    choix: ["À construire une image", "À choisir l'image Docker dans laquelle le job s'exécute", "À publier sur Docker Hub", "À afficher un logo"]
    reponse: 1
    explication: "Avec l'exécuteur Docker, chaque job tourne dans un conteneur : image: node:22 fournit Node sans setup supplémentaire."
  - question: "Quelle différence entre cache et artifacts ?"
    choix: ["Aucune", "Le cache accélère les exécutions (node_modules) ; les artifacts transmettent le résultat d'un job aux suivants ou au téléchargement", "Les artifacts sont plus rapides", "Le cache est public"]
    reponse: 1
    explication: "Cache : best effort, pour la vitesse. Artifacts : garantis, pour transmettre dist/ ou un rapport de tests."
  - question: "Que fait la règle if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH ?"
    choix: ["Exécute le job sur toutes les branches", "Exécute le job seulement sur la branche par défaut (main)", "Supprime la branche", "Crée une merge request"]
    reponse: 1
    explication: "rules permet de conditionner un job ; ici, le déploiement n'a lieu que sur main."
  - question: "Comment s'appelle l'équivalent GitLab d'une pull request ?"
    choix: ["Push request", "Merge request", "Change request", "Code request"]
    reponse: 1
    explication: "Même principe : branche, proposition, revue, pipeline, fusion."
---

## Pourquoi apprendre aussi GitLab ?

De nombreuses entreprises, banques et administrations, surtout en Europe et en Afrique francophone, utilisent **GitLab**, souvent hébergé sur leurs propres serveurs. GitLab réunit en un seul outil le code, les tickets, la CI/CD, le registre d'images et la sécurité. Les concepts restent ceux d'hier ; seule la syntaxe change.

## L'organisation d'un pipeline

```
Pipeline (déclenché par un push ou une merge request)
 ├── stage : test    ──▶ [lint]  [tests-unitaires]      (en parallèle)
 ├── stage : build   ──▶ [image-docker]                  (attend la fin de test)
 └── stage : deploy  ──▶ [deploiement-prod]              (seulement sur main)
```

| GitLab | GitHub Actions |
|---|---|
| `.gitlab-ci.yml` (un seul fichier à la racine) | `.github/workflows/*.yml` |
| stage | (ordre obtenu avec `needs`) |
| job | job |
| `script:` | `run:` |
| `image:` (le job tourne dans un conteneur) | `runs-on:` puis `setup-node`, etc. |
| runner | runner |
| merge request (MR) | pull request |
| variables CI/CD | secrets et variables |

## Un premier .gitlab-ci.yml

```yaml
stages:
  - test
  - build

default:
  image: node:22-alpine

variables:
  NODE_ENV: test

cache:
  key:
    files: [package-lock.json]     # le cache change seulement si les dépendances changent
  paths: [.npm/]

lint:
  stage: test
  script:
    - npm ci --cache .npm
    - npm run lint

tests:
  stage: test
  script:
    - npm ci --cache .npm
    - npm test

compiler:
  stage: build
  script:
    - npm ci --cache .npm
    - npm run build
  artifacts:
    paths: [dist/]
    expire_in: 1 week
```

Le pipeline apparaît dans *Build*, puis *Pipelines*. Chaque job a son journal. L'éditeur intégré (*Build*, puis *Pipeline editor*) **valide** la syntaxe avant l'enregistrement.

## Les conditions avec rules

```yaml
deploiement:
  stage: deploy
  script: ./deploy.sh
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH    # seulement sur main
      when: manual                                    # bouton « Play » : livraison continue
  environment:
    name: production
    url: https://boutique.exemple.sn
```

Les variables prédéfinies les plus utiles :

| Variable | Contenu |
|---|---|
| `$CI_COMMIT_BRANCH` | branche courante |
| `$CI_COMMIT_SHORT_SHA` | empreinte courte du commit |
| `$CI_PIPELINE_SOURCE` | origine : `push`, `merge_request_event`, `schedule`… |
| `$CI_REGISTRY_IMAGE` | adresse du registre d'images du projet |
| `$CI_DEFAULT_BRANCH` | branche par défaut (`main`) |

## Les services et les variables protégées

Une base pour les tests :

```yaml
tests-integration:
  stage: test
  services:
    - name: postgres:16-alpine
      alias: db
  variables:
    POSTGRES_PASSWORD: test
    POSTGRES_DB: boutique_test
    DATABASE_URL: postgres://postgres:test@db:5432/boutique_test
  script:
    - npm ci && npm run test:integration
```

Les secrets se rangent dans *Settings*, puis *CI/CD* et *Variables*. Deux options comptent :

- **Masked** : la valeur est cachée dans les journaux ;
- **Protected** : la variable n'est disponible que sur les branches protégées, comme `main`. Une branche de test ne peut donc pas lire le secret de production.

## Construire et publier une image

GitLab fournit un **registre** par projet. On construit l'image avec Docker-in-Docker :

```yaml
image-docker:
  stage: build
  image: docker:27
  services:
    - docker:27-dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  script:
    - echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin "$CI_REGISTRY"
    - docker build -t "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA" .
    - docker push "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA"
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

`CI_REGISTRY_USER` et `CI_REGISTRY_PASSWORD` sont fournis **automatiquement**, comme `GITHUB_TOKEN`. `--password-stdin` évite de faire apparaître le mot de passe dans la liste des processus.

## Les runners

- Les **runners partagés** de gitlab.com sont gratuits dans la limite d'un quota mensuel.
- Un **runner auto-hébergé** s'installe sur ton serveur avec `gitlab-runner register`. On l'utilise pour un GitLab interne ou pour des machines puissantes.
- L'**exécuteur** détermine comment les jobs s'exécutent : `docker` (le plus courant), `shell` ou `kubernetes`.

## Démonstration

1. On importe l'API boutique dans un projet gitlab.com (*New project*, puis *Import* depuis GitHub).
2. On ajoute le `.gitlab-ci.yml` avec trois stages : test, build et deploy (un déploiement simulé avec `echo`).
3. On ouvre une merge request : seuls les jobs de test s'exécutent.
4. On fusionne : l'image est publiée dans *Deploy*, puis *Container registry*, et le job de déploiement attend un clic.

## Exercice guidé

Traduis ce workflow GitHub Actions en `.gitlab-ci.yml` :

```yaml
on: [push]
jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm test
```

## Exercice autonome

1. Écris le pipeline complet de ton API sur GitLab : stage `test` (lint et tests en parallèle, avec PostgreSQL en service), stage `build` (image publiée dans le registre GitLab, uniquement sur `main`) et stage `deploy` (manuel, environnement `production`).
2. Ajoute une variable masquée et protégée `CLE_API`, et vérifie qu'elle est vide dans un job lancé depuis une autre branche.
3. Programme le pipeline chaque nuit (*Build*, puis *Pipeline schedules*) et fais en sorte que le job de déploiement ne s'exécute **pas** lors de ces exécutions programmées.

## Correction

Exercice guidé :

```yaml
tests:
  image: node:22
  script:
    - npm ci
    - npm test
```

Il n'y a pas d'équivalent de `checkout` : GitLab clone automatiquement le dépôt. Pas de `setup-node` non plus : l'image `node:22` fournit Node. Sans `stages:`, le job appartient au stage par défaut, `test`.

Exercice autonome, question 3 :

```yaml
deploiement:
  stage: deploy
  script: ./deploy.sh
  rules:
    - if: $CI_PIPELINE_SOURCE == "schedule"
      when: never
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      when: manual
```

Les règles sont évaluées dans l'ordre, et la première qui correspond l'emporte.

Question 2 : depuis une branche non protégée, `echo "${CLE_API:-vide}"` affiche `vide`.

## Pour aller plus loin

- `include:` réutilise des modèles, comme les gabarits *Auto DevOps* ou les analyses de sécurité SAST de GitLab.
- `needs:` permet, comme sur GitHub, de lancer un job sans attendre la fin du stage précédent : c'est le pipeline en graphe orienté (DAG).
- Demain : Jenkins, l'outil historique de la CI, encore très présent en entreprise.
