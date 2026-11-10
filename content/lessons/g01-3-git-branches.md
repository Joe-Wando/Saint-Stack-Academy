---
slug: g01-3-git-branches
titre: Git, dépôts, commits, branches et fusion
piste: groupe
semaine: 1
date: 2026-11-12
domaine: DevOps
duree: 120
niveau: bases
objectifs:
  - Expliquer les trois zones de Git, à savoir le répertoire de travail, l'index et le dépôt
  - Créer des commits atomiques avec un message conventionnel
  - Créer une branche, passer de l'une à l'autre et les fusionner
  - Distinguer une fusion en avance rapide (fast-forward) d'une fusion à trois voies
  - Publier une branche sur GitHub avec push et récupérer celle des autres avec pull
prerequis:
  - Séance « Le terminal Linux »
  - Git installé et un compte GitHub
referentiels:
  - GitHub Foundations (certification GitHub), domaines 1 et 2
  - Pro Git (Chacon et Straub), chapitres 2 et 3
  - Conventional Commits 1.0.0
  - Chapitre DIT « Gestion de code source avec Git et GitHub »
quiz:
  - question: "Après « git add index.html », où se trouve la modification ?"
    choix: ["Dans le répertoire de travail seulement", "Dans l'index (staging area)", "Dans un commit", "Sur GitHub"]
    reponse: 1
    explication: "git add place la modification dans l'index ; elle n'entrera dans l'historique qu'au prochain git commit."
  - question: "Quelle commande crée une branche « login » et s'y place ?"
    choix: ["git branch login", "git switch -c login", "git merge login", "git checkout login"]
    reponse: 1
    explication: "git switch -c crée et bascule en une seule fois. git branch crée seulement la branche, sans s'y placer."
  - question: "Quand une fusion en avance rapide (fast-forward) est-elle possible ?"
    choix: ["Quand les deux branches ont des commits différents", "Quand main n'a reçu aucun nouveau commit depuis la création de la branche", "Toujours", "Jamais sur GitHub"]
    reponse: 1
    explication: "Si main n'a pas bougé, Git se contente d'avancer son pointeur jusqu'au dernier commit de la branche ; aucun commit de fusion n'est créé."
  - question: "Lequel de ces messages respecte Conventional Commits ?"
    choix: ["modifs", "feat: ajouter la page de connexion", "J'ai corrigé un bug", "UPDATE"]
    reponse: 1
    explication: "Le format est type: description, avec un type comme feat, fix, docs, refactor, test ou chore."
  - question: "Quelle est la différence entre git fetch et git pull ?"
    choix: ["Aucune", "fetch télécharge sans fusionner ; pull télécharge puis fusionne", "pull envoie tes commits sur GitHub", "fetch supprime les branches distantes"]
    reponse: 1
    explication: "git pull équivaut à git fetch suivi de git merge. C'est git push qui envoie tes commits."
---

## Pourquoi un gestionnaire de versions ?

Sans Git, on finit avec `rapport_final_v3_VRAIMENT_FINAL.docx`. Git apporte trois choses :

- un **historique** complet : qui a changé quoi, quand et pourquoi ;
- le **travail en parallèle** : chacun avance sur sa branche sans casser le travail des autres ;
- un **filet de sécurité** : on peut revenir à n'importe quel état passé du projet.

Git est **distribué** : chaque copie du dépôt contient tout l'historique. GitHub n'est qu'un hébergeur de dépôts Git, avec en plus les pull requests, les issues et GitHub Actions.

## Les trois zones

```
 Répertoire de travail  ──git add──▶  Index (staging)  ──git commit──▶  Dépôt (.git)
   (tes fichiers)                    (ce qui partira)                   (l'historique)
```

> Analogie : tu prépares un colis. Le répertoire de travail est ta chambre, l'index est le carton ouvert dans lequel tu choisis ce que tu envoies, et le commit est le carton fermé et étiqueté, puis expédié.

Un **commit** est une photo de tout le projet, accompagnée d'un auteur, d'une date, d'un message et d'un lien vers le commit parent. Il est identifié par une empreinte SHA-1 comme `a3f9c21…`.

## Les commandes de base

```bash
git config --global user.name "Prénom Nom"     # une seule fois par machine
git config --global user.email "toi@exemple.sn"
git config --global init.defaultBranch main

git init                 # transforme le dossier courant en dépôt
git status               # LA commande à taper tout le temps
git add fichier          # ajoute à l'index (git add . pour tout ajouter)
git commit -m "feat: page d'accueil"
git log --oneline --graph --all   # l'historique sous forme de graphe
git diff                 # ce qui a changé et n'est pas encore dans l'index
```

Le fichier `.gitignore` liste ce que Git doit ignorer : `node_modules/`, `.env`, `dist/`. Un secret comme un mot de passe ou un jeton ne doit **jamais** être commité.

### Un bon commit

- **Atomique** : un seul changement logique par commit.
- **Message conventionnel** (Conventional Commits) : `type: description à l'impératif`.

| Type | Usage |
|---|---|
| `feat` | nouvelle fonctionnalité |
| `fix` | correction de bug |
| `docs` | documentation |
| `refactor` | réécriture sans changer le comportement |
| `test` | ajout ou modification de tests |
| `chore` | maintenance (dépendances, configuration) |

## Les branches

Une branche est simplement une **étiquette mobile** qui pointe vers un commit. `HEAD` indique la branche sur laquelle tu te trouves.

```
          C4 ── C5   ← login
         /
C1 ── C2 ── C3       ← main, HEAD
```

```bash
git branch                 # lister les branches
git switch -c login        # créer la branche login et s'y placer
git switch main            # revenir sur main
git branch -d login        # supprimer une branche déjà fusionnée
```

## Fusionner (merge)

On se place sur la branche qui **reçoit** les changements, puis on fusionne l'autre :

```bash
git switch main
git merge login
```

Deux cas se présentent.

**1. Avance rapide (fast-forward).** `main` n'a pas bougé depuis la création de `login`. Git avance simplement l'étiquette `main` :

```
C1 ── C2 ── C3 ── C4 ── C5   ← main, login
```

**2. Fusion à trois voies.** `main` a reçu d'autres commits entre-temps. Git compare trois versions (l'ancêtre commun et les deux pointes de branche) et crée un **commit de fusion** M qui a deux parents :

```
          C4 ── C5
         /        \
C1 ── C2 ── C3 ── C6 ── M   ← main
```

Si les deux branches ont modifié **les mêmes lignes**, Git ne peut pas choisir : c'est un **conflit**. Ce sera le sujet de demain.

## Travailler avec GitHub

```bash
git remote add origin git@github.com:pseudo/projet.git
git push -u origin main      # le premier envoi crée le lien entre la branche locale et la distante
git push                     # les envois suivants
git clone <url>              # copier un dépôt existant
git fetch                    # télécharger les nouveautés sans fusionner
git pull                     # fetch puis merge
```

`origin` est le nom conventionnel du dépôt distant principal.

## Démonstration

```bash
mkdir demo-git && cd demo-git && git init
echo "# Démo" > README.md
git add README.md && git commit -m "docs: ajouter le README"
git switch -c feature/contact
echo "<form></form>" > contact.html
git add . && git commit -m "feat: ajouter la page contact"
git switch main
ls                          # contact.html a disparu : il n'existe que sur l'autre branche
git merge feature/contact   # « Fast-forward »
git log --oneline --graph
# Provoquer une fusion à trois voies :
git switch -c feature/footer
echo "<footer>2026</footer>" > footer.html && git add . && git commit -m "feat: ajouter le pied de page"
git switch main
echo "Licence MIT" >> README.md && git commit -am "docs: ajouter la licence"
git merge feature/footer    # un éditeur s'ouvre pour le message du commit de fusion
git log --oneline --graph --all
```

## Exercice guidé

Par deux, sur un dépôt GitHub créé par l'un d'entre vous, en ajoutant l'autre comme collaborateur :

1. A crée le dépôt avec un `README.md` et un `.gitignore` Node, puis le clone.
2. B le clone aussi.
3. A crée la branche `feature/accueil`, ajoute `index.html`, fait un commit et la pousse.
4. B crée la branche `feature/a-propos`, ajoute `about.html`, fait un commit et la pousse.
5. A fusionne `feature/accueil` dans `main`, puis pousse.
6. B fait `git pull` sur `main`, fusionne `feature/a-propos` et pousse.
7. Chacun affiche `git log --oneline --graph --all` et dessine le graphe sur sa feuille.

## Exercice autonome

1. Dans un nouveau dépôt, crée 3 commits sur `main`.
2. Crée la branche `exp` et ajoutes-y 2 commits.
3. Sans fusionner `exp`, fais 1 commit sur `main`.
4. Avant de lancer `git merge exp` depuis `main`, prédis s'il y aura une avance rapide ou un commit de fusion, et combien de commits `main` contiendra ensuite. Vérifie.
5. Réécris ces trois messages au format conventionnel : « corrigé bug panier », « ajout tests », « maj deps ».

## Correction

Exercice guidé : le graphe final montre deux branches. `feature/accueil` a été intégrée en avance rapide, car `main` n'avait pas bougé. Pour `feature/a-propos`, l'intégration s'est faite par un commit de fusion, parce que `main` avait reçu le travail de A entre-temps. Si B oublie le `git pull` à l'étape 6, son `git push` est refusé avec le message `rejected ... fetch first`. C'est normal : Git refuse d'écraser l'historique distant.

Exercice autonome :

4. C'est un **commit de fusion**, car `main` a reçu un commit après la création de `exp`. On compte : 3 commits initiaux, plus 2 de `exp`, plus 1 sur `main`, plus le commit de fusion, soit **7 commits** accessibles depuis `main`.
5. `fix: corriger le calcul du total du panier`, `test: ajouter les tests du panier`, `chore: mettre à jour les dépendances`.

## Pour aller plus loin

- *Learn Git Branching* (learngitbranching.js.org) : un excellent exercice visuel, à faire jusqu'au niveau « Ramping Up ».
- `git stash` permet de mettre de côté un travail en cours pour changer de branche.
- `git restore fichier` annule une modification non commitée, et `git revert <sha>` annule un commit déjà publié.
