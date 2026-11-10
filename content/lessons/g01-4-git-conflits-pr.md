---
slug: g01-4-git-conflits-pr
titre: Git, conflits, pull requests et revue de code
domaine: DevOps
duree: 120
difficulte: bases
licence:
  - { niveau: L2, semestre: S3, ue: "Bases de données et versionnement" }
parcours:
  - { parcours: devops, ordre: 3 }
  - { parcours: web, ordre: 3 }
ordre: 2
prerequis_cours: [g01-3-git-branches]
visibilite: public
objectifs:
  - Expliquer pourquoi un conflit survient et lire ses marqueurs
  - Résoudre un conflit à la main puis terminer la fusion
  - Ouvrir une pull request claire sur GitHub en suivant le GitHub Flow
  - Faire une revue de code constructive avec commentaires, suggestions et approbation
  - Protéger la branche main
prerequis:
  - Cours « Git, dépôts, commits, branches et fusion »
referentiels:
  - GitHub Foundations, domaine 3 « Collaboration Features »
  - Pro Git, chapitres 3.2 « Basic Merging » et 5 « Distributed Git »
  - Google Engineering Practices, « How to do a code review »
quiz:
  - question: "Quand Git déclare-t-il un conflit ?"
    choix: ["Quand deux branches modifient des fichiers différents", "Quand deux branches modifient les mêmes lignes d'un même fichier", "À chaque fusion", "Quand on oublie git add"]
    reponse: 1
    explication: "Des fichiers différents, ou des zones éloignées d'un même fichier, fusionnent automatiquement. Seules les mêmes lignes modifiées des deux côtés bloquent Git."
  - question: "Dans un conflit, que contient la zone entre <<<<<<< HEAD et ======= ?"
    choix: ["La version de la branche que l'on fusionne", "La version de la branche sur laquelle on se trouve", "L'ancêtre commun", "Les deux versions mélangées"]
    reponse: 1
    explication: "HEAD, c'est ta branche actuelle. La partie entre ======= et >>>>>>> vient de la branche que tu fusionnes."
  - question: "Après avoir corrigé le fichier en conflit, que fais-tu ?"
    choix: ["git push directement", "git add fichier puis git commit", "git merge --abort", "git reset --hard"]
    reponse: 1
    explication: "git add indique à Git que le conflit est résolu, et git commit finalise la fusion. git merge --abort, lui, annule toute la fusion."
  - question: "Dans le GitHub Flow, où développe-t-on une nouvelle fonctionnalité ?"
    choix: ["Directement sur main", "Sur une branche courte, intégrée par pull request", "Sur la branche develop uniquement", "Dans un fork obligatoirement"]
    reponse: 1
    explication: "Le GitHub Flow : main est toujours déployable ; chaque changement passe par une branche courte, puis une pull request, une revue et une fusion."
  - question: "Lequel de ces commentaires de revue est le plus constructif ?"
    choix: ["C'est nul.", "Pourquoi tu as fait ça ?", "Cette requête est exécutée dans la boucle (N+1) ; on pourrait charger les produits en une seule requête avec IN. Qu'en penses-tu ?", "LGTM"]
    reponse: 2
    explication: "Un bon commentaire vise le code et non la personne, explique le problème, propose une piste et invite au dialogue."
---

## Pourquoi des conflits ?

Dans le cours « Git, dépôts, commits, branches et fusion », Git fusionnait tout seul. Il le fait tant que les deux branches touchent des endroits **différents**. Si Awa et Moussa modifient **la même ligne** de `index.html`, chacun d'une façon différente, Git ne peut pas deviner laquelle garder. Il s'arrête et te demande de décider : c'est un **conflit**.

Un conflit n'est pas une erreur. C'est une **question** que Git te pose.

## Lire un conflit

```
$ git merge feature/titre
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

Git a écrit les deux versions dans le fichier, entourées de marqueurs :

```html
<<<<<<< HEAD
<h1>Bienvenue chez Saint Stack</h1>
=======
<h1>Saint Stack, apprendre ensemble</h1>
>>>>>>> feature/titre
```

| Marqueur | Signification |
|---|---|
| `<<<<<<< HEAD` | début de **ta** version, celle de la branche où tu te trouves |
| `=======` | séparation entre les deux versions |
| `>>>>>>> feature/titre` | fin de la version de la branche que tu fusionnes |

## Résoudre un conflit, en quatre étapes

1. `git status` liste les fichiers en conflit (« both modified »).
2. Ouvre le fichier et choisis : garder ta version, garder l'autre, ou écrire une combinaison des deux. **Supprime les trois marqueurs.**
3. `git add index.html` signale à Git que le conflit est résolu.
4. `git commit` termine la fusion ; le message est déjà proposé.

VS Code affiche des boutons au-dessus de chaque conflit : *Accept Current*, *Accept Incoming*, *Accept Both*. Ils sont pratiques, mais **relis toujours le résultat**.

Pour tout annuler et revenir à l'état d'avant la fusion : `git merge --abort`.

> Pour avoir moins de conflits : fais des branches courtes, tire `main` souvent (`git pull`), fais de petits commits et dis à ton équipe sur quoi tu travailles.

## Le GitHub Flow

C'est le flux de travail le plus répandu dans les équipes qui déploient souvent.

```
main ──●───────────────────────●──────▶   (toujours déployable)
        \                     /
         ●── ● ── ●  ──  PR ─┘
     feature/panier   revue + CI
```

1. Créer une branche depuis `main` : `feature/panier`, `fix/total-negatif`.
2. Faire des commits, puis pousser la branche.
3. Ouvrir une **pull request** (PR) vers `main`.
4. Les collègues relisent, et la CI lance les tests. Ce sera vu dans le cours « Intégration continue avec GitHub Actions, premier workflow ».
5. Fusionner, puis supprimer la branche.

## Une bonne pull request

- **Petite** : moins de 400 lignes, idéalement. Au-delà, la revue devient superficielle.
- **Un titre** au format conventionnel : `feat: ajouter le panier`.
- **Une description** structurée :

```markdown
## Quoi
Ajoute le panier (ajout, retrait, total).

## Pourquoi
Ticket #12 : les clients ne peuvent pas commander plusieurs articles.

## Comment tester
1. npm run dev
2. Ajouter deux produits, vérifier que le total vaut 24 000 FCFA.

## Captures
(capture d'écran)
```

Écrire `Closes #12` dans la description ferme automatiquement l'issue 12 au moment de la fusion.

## La revue de code

Le relecteur vérifie, dans l'ordre : est-ce que **ça marche** ? est-ce **lisible** ? y a-t-il des **tests** ? la **sécurité** est-elle respectée (aucun secret, entrées validées) ?

Sur GitHub, dans l'onglet *Files changed* :

- **Comment** : une remarque sur une ligne.
- **Suggestion** : un bloc ```` ```suggestion ```` propose le code exact ; l'auteur peut l'appliquer en un clic.
- À la fin de la revue, trois issues possibles : **Approve**, **Request changes** ou **Comment**.

Les règles d'une revue humaine :

- Commenter le **code**, jamais la personne.
- Expliquer **pourquoi**, et proposer une piste.
- Préfixer les remarques mineures par « nit: » (pinaillage) pour qu'elles ne bloquent pas la fusion.
- Souligner aussi ce qui est bien fait.

## Protéger main

Dans *Settings*, puis *Branches* (ou *Rules*), ajoute une règle sur `main` :

- exiger une pull request avant toute fusion ;
- exiger au moins une approbation ;
- exiger que les vérifications de la CI passent (voir le cours « Intégration continue avec GitHub Actions, premier workflow »).

Ainsi, plus personne, même pas toi, ne peut pousser directement sur `main`.

## Démonstration

```bash
mkdir conflit && cd conflit && git init
echo "<h1>Bienvenue</h1>" > index.html && git add . && git commit -m "feat: titre"
git switch -c feature/titre
echo "<h1>Saint Stack, apprendre ensemble</h1>" > index.html && git commit -am "feat: nouveau titre"
git switch main
echo "<h1>Bienvenue chez Saint Stack</h1>" > index.html && git commit -am "feat: titre complet"
git merge feature/titre      # CONFLICT
git status                   # both modified: index.html
cat index.html               # les marqueurs
# on édite : on garde « <h1>Saint Stack, bienvenue</h1> » et on retire les marqueurs
git add index.html && git commit
git log --oneline --graph
```

## Exercice guidé

Par deux, sur le dépôt du cours « Git, dépôts, commits, branches et fusion » :

1. A et B partent tous les deux de `main` à jour.
2. A crée `feature/titre-a` et change la ligne `<h1>` de `index.html`. B crée `feature/titre-b` et change **la même ligne** autrement.
3. Chacun pousse et ouvre une PR vers `main`.
4. B relit la PR de A : un commentaire, une suggestion, puis *Approve*. A fusionne.
5. La PR de B affiche maintenant « This branch has conflicts ». B résout le conflit en local :
   `git switch feature/titre-b`, `git pull origin main`, il corrige le fichier, puis `git add`, `git commit` et `git push`.
6. A relit et approuve, puis B fusionne.
7. A active la protection de `main`, et chacun tente un `git push` direct sur `main` pour constater le refus.

## Exercice autonome

1. Reproduis seul un conflit sur **deux** fichiers à la fois, puis résous-le.
2. Commence une fusion qui provoque un conflit, puis annule-la avec `git merge --abort`. Vérifie avec `git status` et `git log` que rien n'a changé.
3. Rédige sur ta feuille la description d'une PR imaginaire qui corrige un bug : le total du panier est négatif quand on retire un article absent. Suis le modèle Quoi, Pourquoi, Comment tester.
4. Réécris ces commentaires de revue de façon constructive : « c'est illisible », « pourquoi pas une boucle ? », « faux ».

## Correction

Exercice guidé, étape 5 : `git pull origin main` ramène la modification de A et déclenche le conflit dans la branche de B, en local. On le résout là, et non sur GitHub. Une fois la branche poussée, la PR se met à jour toute seule.

Exercice autonome :

1. `git status` liste les deux fichiers. Il faut nettoyer les marqueurs dans **chacun**, puis faire `git add` sur les deux avant le `git commit`. Si tu en oublies un, Git refuse le commit.
2. Après `git merge --abort`, `git status` affiche « nothing to commit » et `git log` ne contient pas de commit de fusion.
3. Un exemple de description :
   - **Quoi** : empêche un total négatif.
   - **Pourquoi** : retirer un article absent du panier décrémentait quand même le total (issue #21).
   - **Comment tester** : panier vide, cliquer sur « retirer » ; le total reste à 0.
   - Ajouter `Closes #21`.
4. Exemples de reformulation :
   - « Cette fonction fait 80 lignes ; et si on extrayait le calcul de la remise dans `calculerRemise()` pour la lire plus facilement ? »
   - « Une boucle `for` serait peut-être plus simple à suivre que la récursion ici, sauf si tu vois une raison de la garder ? »
   - « Avec un panier vide, `total` vaut `undefined` au lieu de 0. Tu peux ajouter une valeur par défaut et un test ? »

## Pour aller plus loin

- `git rebase main` rejoue tes commits par-dessus `main` et donne un historique linéaire. Ne l'utilise jamais sur une branche partagée.
- Le fichier `.github/pull_request_template.md` préremplit la description de chaque PR.
- Le fichier `CODEOWNERS` assigne automatiquement les relecteurs selon les dossiers modifiés.
