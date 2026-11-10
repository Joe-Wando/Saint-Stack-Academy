---
slug: g03-1-github-actions-workflow
titre: Intégration continue avec GitHub Actions, premier workflow
domaine: DevOps
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S5, ue: "Génie logiciel et qualité" }
parcours:
  - { parcours: devops, ordre: 8 }
ordre: 1
prerequis_cours: []
visibilite: public
objectifs:
  - Expliquer l'intégration continue (CI), la livraison continue et le déploiement continu (CD)
  - Décrire la structure d'un workflow GitHub Actions (événements, jobs, étapes, runners)
  - Écrire un workflow qui s'exécute à chaque push et à chaque pull request
  - Utiliser des actions du Marketplace (checkout, setup-node) et des commandes shell
  - Lire les journaux d'exécution et corriger un workflow en échec
prerequis:
  - Séances Git de la semaine 1
  - Un dépôt GitHub contenant un petit projet Node
referentiels:
  - GitHub Actions (certification GitHub), domaines 1 « Author and maintain workflows » et 2 « Consume workflows »
  - Chapitre DIT 1 « Introduction au DevOps »
  - Martin Fowler, « Continuous Integration » (2024)
quiz:
  - question: "Où place-t-on un fichier de workflow GitHub Actions ?"
    choix: ["À la racine du dépôt", "Dans .github/workflows/", "Dans .git/hooks/", "Dans les paramètres GitHub uniquement"]
    reponse: 1
    explication: "Tout fichier .yml de .github/workflows/ est un workflow ; il est versionné avec le code."
  - question: "Quelle différence entre un job et une étape (step) ?"
    choix: ["Aucune", "Un job tourne sur une machine (runner) et contient des étapes exécutées dans l'ordre", "Une étape contient plusieurs jobs", "Les jobs sont toujours séquentiels"]
    reponse: 1
    explication: "Les jobs d'un workflow tournent en parallèle par défaut, chacun sur sa machine ; leurs étapes s'exécutent l'une après l'autre."
  - question: "Pourquoi actions/checkout est-il presque toujours la première étape ?"
    choix: ["Pour se connecter à GitHub", "Parce que le runner est une machine vierge : il faut y récupérer le code du dépôt", "Pour créer une branche", "Pour lancer les tests"]
    reponse: 1
    explication: "Sans checkout, le runner n'a pas ton code."
  - question: "Que signifie on: pull_request: branches: [main] ?"
    choix: ["Le workflow s'exécute à chaque push sur n'importe quelle branche", "Le workflow s'exécute pour les pull requests qui visent main", "Le workflow fusionne automatiquement", "Le workflow bloque main"]
    reponse: 1
    explication: "On vérifie ainsi chaque proposition de changement avant qu'elle n'entre dans main."
  - question: "Quelle est la différence entre livraison continue et déploiement continu ?"
    choix: ["Aucune", "En livraison continue, la mise en production est déclenchée par un humain ; en déploiement continu, elle est automatique", "Le déploiement continu n'a pas de tests", "La livraison continue ne concerne que le mobile"]
    reponse: 1
    explication: "Dans les deux cas le code est toujours prêt à partir ; seul le dernier geste (production) diffère."
---

## L'idée

Sans automatisation, une équipe découvre les problèmes trop tard : « Qui a cassé `main` ? », « Les tests passaient chez moi ». L'**intégration continue** (CI) consiste à **vérifier automatiquement chaque changement** : à chaque push, une machine récupère le code, l'installe, le compile et lance les tests. Un problème est signalé en quelques minutes, à la personne qui vient de l'introduire.

| Pratique | Ce qui est automatisé |
|---|---|
| **Intégration continue (CI)** | construction et tests à chaque changement |
| **Livraison continue** (*Continuous Delivery*) | le code est toujours prêt à être mis en production ; un humain appuie sur le bouton |
| **Déploiement continu** (*Continuous Deployment*) | chaque changement validé part en production automatiquement |

> Analogie : un contrôle qualité sur une chaîne de production. Mieux vaut détecter une pièce défectueuse au poste où elle a été fabriquée qu'à la livraison chez le client.

C'est le cœur du cycle DevOps vu au chapitre 1 du DIT : planifier, coder, construire, tester, publier, déployer, exploiter, surveiller.

## Le vocabulaire de GitHub Actions

```
Workflow (.github/workflows/ci.yml)
 ├── déclenché par des événements (on: push, pull_request, schedule…)
 └── Jobs (en parallèle par défaut)
      └── job « tests » ── runs-on: ubuntu-latest (le runner)
           ├── step 1 : uses: actions/checkout@v4      (une action réutilisable)
           ├── step 2 : uses: actions/setup-node@v4
           └── step 3 : run: npm test                  (une commande shell)
```

| Terme | Définition |
|---|---|
| **Workflow** | un processus automatisé, décrit dans un fichier YAML |
| **Événement** | ce qui le déclenche : push, pull request, planification, déclenchement manuel |
| **Job** | un ensemble d'étapes exécutées sur **une** machine |
| **Step** | une étape : soit une **action** (`uses:`), soit une **commande** (`run:`) |
| **Runner** | la machine qui exécute le job ; GitHub en fournit (Ubuntu, Windows, macOS), et on peut aussi héberger la sienne |
| **Action** | un bloc réutilisable, publié sur le Marketplace |

Les dépôts publics bénéficient de minutes gratuites illimitées. Les dépôts privés disposent d'un quota mensuel de minutes gratuites.

## Le premier workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:          # bouton « Run workflow » pour un lancement manuel

jobs:
  verifier:
    runs-on: ubuntu-latest
    steps:
      - name: Récupérer le code
        uses: actions/checkout@v4

      - name: Installer Node 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm            # garde les dépendances en cache d'une exécution à l'autre

      - name: Installer les dépendances
        run: npm ci

      - name: Vérifier le style
        run: npm run lint

      - name: Lancer les tests
        run: npm test
```

- `npm ci` installe **exactement** les versions de `package-lock.json`. C'est la commande à utiliser en CI ; `npm install` est réservée au développement.
- Si une étape renvoie un code différent de 0, le job **échoue** et les étapes suivantes ne s'exécutent pas. C'est la même logique que `set -e` en Bash.

## Lire les résultats

- Onglet **Actions** du dépôt : la liste des exécutions, avec un point vert, rouge ou jaune.
- En cliquant sur une exécution puis sur un job, on voit le **journal de chaque étape**, que l'on déplie pour trouver l'erreur.
- Sur une pull request, les vérifications apparaissent en bas. Avec la protection de branche vue en semaine 1, on peut **exiger** qu'elles passent avant toute fusion.
- Un badge dans le README affiche l'état en permanence : `![CI](https://github.com/<pseudo>/<depot>/actions/workflows/ci.yml/badge.svg)`.

## Les déclencheurs utiles

```yaml
on:
  push:
    paths: ['api/**']              # seulement si des fichiers de api/ changent
  schedule:
    - cron: '0 6 * * 1'            # chaque lundi à 6 h UTC (syntaxe cron de la semaine 2)
  workflow_dispatch:
    inputs:
      environnement:
        type: choice
        options: [test, production]
```

## Variables et contextes

```yaml
    steps:
      - run: echo "Branche ${{ github.ref_name }}, commit ${{ github.sha }}, par ${{ github.actor }}"
      - run: echo "Node $(node -v)"
        env:
          NODE_ENV: test
```

`${{ ... }}` est évalué par GitHub **avant** l'exécution. `$(...)` est évalué par Bash **pendant** l'exécution.

## Démonstration

1. On reprend l'API Express de la semaine 2 et on ajoute un test minimal avec le module natif `node:test` :

```js
// somme.js
module.exports = (a, b) => a + b;
// somme.test.js
const test = require('node:test');
const assert = require('node:assert');
const somme = require('./somme');
test('additionne deux nombres', () => assert.strictEqual(somme(2, 3), 5));
```

`package.json` : `"scripts": { "test": "node --test" }`.

2. On pousse le workflow : le point devient vert.
3. On casse volontairement le test (`somme(2, 3) === 6`), on ouvre une PR : le point devient rouge, et on lit le journal.
4. On corrige, on pousse : le point redevient vert, et la PR peut être fusionnée.

## Exercice guidé

1. Dans ton dépôt d'entraînement, crée `.github/workflows/bonjour.yml`, déclenché par `workflow_dispatch`, qui affiche la date, la branche et la liste des fichiers du dépôt.
2. Lance-le à la main depuis l'onglet Actions.
3. Ajoute un second job `systeme` qui tourne sur `windows-latest` et affiche `$env:OS`. Observe que les deux jobs tournent en parallèle.

## Exercice autonome

1. Ajoute la CI au projet de ton choix (l'API boutique, par exemple) : installation, lint (ESLint) et tests.
2. Le workflow tourne sur les pull requests vers `main`, et sur push uniquement si le code change (filtre `paths`).
3. Active la protection de `main` pour **exiger** que la CI passe.
4. Ouvre une PR qui casse un test. Prends une capture du blocage de la fusion.
5. Ajoute le badge au README.

## Correction

Exercice guidé :

```yaml
name: Bonjour
on: workflow_dispatch
jobs:
  infos:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          date
          echo "Branche : ${{ github.ref_name }}"
          ls -la
  systeme:
    runs-on: windows-latest
    steps:
      - run: echo $env:OS          # PowerShell par défaut sous Windows : affiche Windows_NT
```

Le caractère `|` permet d'écrire plusieurs lignes de commandes dans une seule étape.

Exercice autonome :

```yaml
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
    paths: ['src/**', 'package*.json', '.github/workflows/**']
```

Dans *Settings*, puis *Branches* ou *Rules*, coche *Require status checks to pass* et choisis le job `verifier`. Le nom à sélectionner est celui du **job**, pas celui du workflow.

## Pour aller plus loin

- Le Marketplace (github.com/marketplace?type=actions) contient des milliers d'actions.
- `act` (nektos/act) exécute tes workflows en local dans Docker, pour tester sans pousser.
- Demain : la matrice de versions, les secrets, et la construction puis la publication d'une image Docker.
