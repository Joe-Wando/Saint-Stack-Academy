---
slug: l1-c-3-boucles
titre: "Langage C : les boucles"
domaine: Programmation
duree: 120
difficulte: découverte
licence:
  - { niveau: L1, semestre: S1, ue: "Algorithmique et programmation 1" }
ordre: 3
prerequis_cours: [l1-c-2-conditions]
visibilite: public
objectifs:
  - Répéter des instructions avec while, do while et for
  - Choisir la boucle adaptée selon que le nombre de tours est connu ou non
  - Calculer une somme, une moyenne, un maximum avec un accumulateur
  - Contrôler une saisie avec une boucle de validation
  - Repérer et corriger une boucle infinie
prerequis:
  - Écrire des conditions avec if et les opérateurs logiques
referentiels:
  - ISO/IEC 9899 (C11), instructions d'itération
  - ACM/IEEE CS2023, domaine « Software Development Fundamentals » (itération)
  - C++ Institute, « C Essentials 1 » (CLA), module « Loops »
quiz:
  - question: "Combien de fois s'exécute for (int i = 0; i < 5; i++) ?"
    choix: ["4", "5", "6", "Indéfiniment"]
    reponse: 1
    explication: "i prend les valeurs 0, 1, 2, 3 et 4 : cinq tours. Quand i vaut 5, la condition i < 5 est fausse et la boucle s'arrête."
  - question: "Quelle boucle s'exécute au moins une fois, même si la condition est fausse au départ ?"
    choix: ["while", "for", "do while", "Aucune"]
    reponse: 2
    explication: "do while teste la condition à la fin du tour. Elle est idéale pour un menu ou une saisie à valider."
  - question: "Pourquoi cette boucle ne s'arrête-t-elle jamais : int i = 0; while (i < 10) { printf(\"%d\", i); } ?"
    choix: ["i n'est jamais modifié, donc i < 10 reste toujours vrai", "printf est mal écrit", "while n'accepte pas <", "i devrait être un double"]
    reponse: 0
    explication: "Il manque i++ dans le corps de la boucle. Chaque boucle doit faire évoluer la variable testée vers la sortie."
  - question: "Pour calculer une somme, à quelle valeur initialise-t-on l'accumulateur ?"
    choix: ["1", "0", "La première valeur saisie", "N'importe laquelle"]
    reponse: 1
    explication: "0 est l'élément neutre de l'addition. Pour un produit, on partirait de 1."
  - question: "Que fait continue dans une boucle ?"
    choix: ["Il arrête la boucle", "Il passe directement au tour suivant, sans exécuter la fin du tour en cours", "Il redémarre le programme", "Il ne fait rien"]
    reponse: 1
    explication: "break sort de la boucle ; continue saute à l'itération suivante."
---

## L'idée

Afficher la table de multiplication de 7, calculer la moyenne de 30 notes, redemander un mot de passe tant qu'il est faux : toutes ces tâches **répètent** les mêmes instructions. Plutôt que de copier-coller le code, on écrit une **boucle**.

Chaque passage dans la boucle s'appelle une **itération**, ou un tour. Une boucle bien écrite a trois éléments : une **initialisation**, une **condition** de continuation, et une **progression** qui la rapproche de la sortie.

## La boucle while

`while` répète un bloc **tant que** la condition est vraie. La condition est testée **avant** chaque tour.

```c
int i = 1;              /* initialisation */
while (i <= 5) {        /* condition */
    printf("%d\n", i);
    i++;                /* progression : i = i + 1 */
}
```

Ce code affiche 1, 2, 3, 4, 5. Si la condition est fausse dès le départ, le corps n'est jamais exécuté.

On utilise `while` quand on **ne connaît pas à l'avance** le nombre de tours : lire des valeurs jusqu'à ce que l'utilisateur tape 0, attendre une bonne réponse, etc.

## La boucle for

Quand le nombre de tours est **connu**, `for` regroupe les trois éléments sur une seule ligne :

```c
for (int i = 1; i <= 10; i++) {
    printf("7 x %d = %d\n", i, 7 * i);
}
```

| Partie | Rôle | Moment |
|---|---|---|
| `int i = 1` | initialisation | une seule fois, au début |
| `i <= 10` | condition | avant chaque tour |
| `i++` | progression | à la fin de chaque tour |

La variable `i` déclarée dans le `for` n'existe qu'à l'intérieur de la boucle. On peut aussi compter à rebours (`i--`) ou de deux en deux (`i += 2`).

## La boucle do while

`do while` teste la condition **après** le tour : le corps s'exécute donc **au moins une fois**. C'est la boucle idéale pour **valider une saisie**.

```c
int note;
do {
    printf("Note sur 20 : ");
    scanf("%d", &note);
} while (note < 0 || note > 20);
```

Tant que la note est hors de l'intervalle, on la redemande. N'oublie pas le `;` après le `while` final.

## Choisir sa boucle

| Situation | Boucle |
|---|---|
| Nombre de tours connu (parcourir 1 à n, un tableau) | `for` |
| Nombre de tours inconnu, peut-être zéro | `while` |
| Au moins un tour (menu, saisie à valider) | `do while` |

Les trois peuvent toujours se réécrire l'une dans l'autre. Le bon choix rend simplement le code plus lisible.

## Les accumulateurs : somme, moyenne, maximum

Un **accumulateur** est une variable qui se met à jour à chaque tour.

```c
int n = 0;
double note = 0, somme = 0, max = 0;

printf("Nombre de notes : ");
scanf("%d", &n);

for (int i = 1; i <= n; i++) {
    printf("Note %d : ", i);
    scanf("%lf", &note);
    somme += note;                    /* somme = somme + note */
    if (i == 1 || note > max) {
        max = note;
    }
}
if (n > 0) {
    printf("Moyenne : %.2f, meilleure note : %.2f\n", somme / n, max);
}
```

- La somme démarre à **0**, un produit à **1**.
- Le maximum démarre avec la **première valeur**, pas avec 0 : sinon, avec des valeurs toutes négatives, on obtiendrait un faux résultat.
- On vérifie `n > 0` avant de diviser.

## break et continue

- `break` **sort** immédiatement de la boucle.
- `continue` **passe au tour suivant**.

```c
for (int i = 1; i <= 20; i++) {
    if (i % 3 == 0) {
        continue;        /* on saute les multiples de 3 */
    }
    if (i > 10) {
        break;           /* on s'arrête après 10 */
    }
    printf("%d ", i);    /* 1 2 4 5 7 8 10 */
}
```

Utilise-les avec modération : une boucle avec trop de `break` devient difficile à suivre.

## Les boucles imbriquées

Une boucle peut en contenir une autre. La boucle intérieure fait tous ses tours **à chaque tour** de la boucle extérieure.

```c
for (int ligne = 1; ligne <= 3; ligne++) {
    for (int col = 1; col <= ligne; col++) {
        printf("*");
    }
    printf("\n");
}
```

Ce code dessine un triangle de 3 lignes : `*`, `**`, `***`.

## Démonstration

On simule un distributeur de billets. Le solde est de 50 000 FCFA, on peut retirer des multiples de 5 000 FCFA, jusqu'à ce que l'utilisateur tape 0.

```c
#include <stdio.h>

int main(void) {
    int solde = 50000, retrait = -1;
    while (retrait != 0) {
        printf("Solde : %d FCFA. Retrait (0 pour quitter) : ", solde);
        scanf("%d", &retrait);
        if (retrait == 0) {
            break;
        }
        if (retrait < 0 || retrait % 5000 != 0) {
            printf("Montant invalide\n");
        } else if (retrait > solde) {
            printf("Solde insuffisant\n");
        } else {
            solde -= retrait;
        }
    }
    printf("Au revoir. Solde final : %d FCFA\n", solde);
    return 0;
}
```

On suit l'exécution pas à pas sur une feuille, dans un **tableau de suivi** avec une colonne par variable : c'est la technique de base pour comprendre une boucle.

## Exercice guidé

1. Affiche les nombres pairs de 2 à 30 avec une boucle `for`.
2. Calcule et affiche la somme 1 + 2 + ... + 100. Vérifie avec la formule n(n + 1) / 2, qui donne 5050.
3. Calcule la **factorielle** d'un entier n saisi : n! = 1 × 2 × ... × n. Teste avec 5 (120).

## Exercice autonome

1. **Jeu du nombre mystère** : le programme choisit un nombre entre 1 et 100, et l'utilisateur propose des nombres. Le programme répond « plus grand » ou « plus petit », puis annonce le nombre d'essais à la fin. Pour un nombre aléatoire : `#include <stdlib.h>` et `#include <time.h>`, puis `srand(time(NULL));` et `int secret = rand() % 100 + 1;`.
2. **Nombre premier** : lis un entier n ≥ 2 et indique s'il est premier, c'est-à-dire divisible seulement par 1 et par lui-même.

## Correction

Exercice guidé, question 3 :

```c
#include <stdio.h>

int main(void) {
    int n = 0;
    long long fact = 1;
    printf("n : ");
    scanf("%d", &n);
    for (int i = 2; i <= n; i++) {
        fact *= i;
    }
    printf("%d! = %lld\n", n, fact);
    return 0;
}
```

On utilise `long long`, car la factorielle dépasse vite la capacité d'un `int` (13! est déjà trop grand).

Exercice autonome, question 1 :

```c
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(void) {
    srand(time(NULL));
    int secret = rand() % 100 + 1, essai = 0, nb_essais = 0;
    do {
        printf("Ton nombre : ");
        scanf("%d", &essai);
        nb_essais++;
        if (essai < secret) {
            printf("Plus grand\n");
        } else if (essai > secret) {
            printf("Plus petit\n");
        }
    } while (essai != secret);
    printf("Trouve en %d essais\n", nb_essais);
    return 0;
}
```

Question 2 : on cherche un diviseur `d` de 2 jusqu'à `d * d <= n`. Si l'on en trouve un (`n % d == 0`), n n'est pas premier et on fait `break`. Il suffit d'aller jusqu'à la racine carrée de n : si n = a × b, l'un des deux facteurs est forcément inférieur ou égal à cette racine.

## Pour aller plus loin

- Avec la stratégie de la dichotomie (proposer toujours le milieu de l'intervalle restant), le nombre mystère se trouve en 7 essais au maximum. Pourquoi 7 ? Parce que 2⁷ = 128 est la première puissance de 2 supérieure à 100.
- Pour visualiser l'exécution pas à pas, utilise Python Tutor (pythontutor.com), qui accepte aussi le C.
- Cours suivant : « Langage C : les fonctions ».
