---
slug: l1-c-4-fonctions
titre: "Langage C : les fonctions"
domaine: Programmation
duree: 120
difficulte: bases
licence:
  - { niveau: L1, semestre: S1, ue: "Algorithmique et programmation 1" }
ordre: 4
prerequis_cours: [l1-c-3-boucles]
visibilite: public
objectifs:
  - Découper un programme en fonctions qui ont chacune un rôle précis
  - Écrire le prototype, la définition et l'appel d'une fonction
  - Distinguer paramètres, arguments et valeur de retour
  - Expliquer le passage par valeur et la portée des variables
  - Écrire une fonction récursive simple
prerequis:
  - Maîtriser les conditions et les boucles
referentiels:
  - ISO/IEC 9899 (C11), fonctions
  - ACM/IEEE CS2023, domaine « Software Development Fundamentals » (décomposition, abstraction)
  - C++ Institute, « C Essentials 1 » (CLA), module « Functions »
quiz:
  - question: "Que signifie le mot void dans void afficher_ligne(int n) ?"
    choix: ["La fonction ne prend aucun paramètre", "La fonction ne renvoie aucune valeur", "La fonction est vide", "La fonction est privée"]
    reponse: 1
    explication: "Le type écrit avant le nom est celui de la valeur renvoyée. void signifie qu'il n'y en a pas."
  - question: "Après l'appel doubler(x) avec void doubler(int n) { n = n * 2; }, que vaut x si x valait 5 ?"
    choix: ["10", "5", "0", "Une valeur aléatoire"]
    reponse: 1
    explication: "En C, les arguments sont passés par valeur : la fonction reçoit une copie. Modifier n ne change pas x."
  - question: "À quoi sert un prototype comme int carre(int n); placé avant main ?"
    choix: ["À exécuter la fonction", "À annoncer au compilateur le nom, le type de retour et les paramètres de la fonction, définie plus loin", "À créer une variable", "C'est un commentaire"]
    reponse: 1
    explication: "Le compilateur lit le fichier de haut en bas. Le prototype lui permet de vérifier les appels avant d'avoir vu la définition."
  - question: "Une variable déclarée à l'intérieur d'une fonction est-elle visible dans main ?"
    choix: ["Oui, toujours", "Non : c'est une variable locale, elle n'existe que dans sa fonction", "Seulement si elle est de type int", "Seulement après l'appel"]
    reponse: 1
    explication: "Sa portée est limitée au bloc où elle est déclarée, et elle disparaît à la fin de la fonction."
  - question: "Que manque-t-il à cette fonction récursive : int f(int n) { return n * f(n - 1); } ?"
    choix: ["Un paramètre", "Un cas de base qui arrête la récursion, par exemple if (n <= 1) return 1;", "Un printf", "Rien"]
    reponse: 1
    explication: "Sans cas de base, la fonction s'appelle à l'infini jusqu'à saturer la pile : le programme plante."
---

## L'idée

Quand un programme grandit, tout écrire dans `main` devient illisible. On le découpe en **fonctions** : des petits blocs nommés, qui font chacun **une seule chose**, comme `calculer_moyenne` ou `afficher_menu`.

Une fonction, c'est comme une recette : on lui donne des ingrédients (les **paramètres**), elle suit ses étapes et rend un plat (la **valeur de retour**). On l'écrit une fois, puis on l'utilise autant de fois que nécessaire. Tu en utilises déjà : `printf` et `scanf` sont des fonctions écrites par d'autres.

## Définir et appeler une fonction

```c
#include <stdio.h>

int carre(int n) {
    return n * n;
}

int main(void) {
    int resultat = carre(7);
    printf("%d\n", resultat);   /* 49 */
    printf("%d\n", carre(3) + carre(4));   /* 25 */
    return 0;
}
```

| Élément | Dans l'exemple | Rôle |
|---|---|---|
| Type de retour | `int` | Le type de la valeur renvoyée |
| Nom | `carre` | Un verbe ou un nom clair |
| Paramètres | `int n` | Les données reçues, avec leur type |
| `return` | `return n * n;` | Renvoie la valeur et **termine** la fonction |
| Appel | `carre(7)` | Exécute la fonction avec l'**argument** 7 |

Le **paramètre** est la variable dans la définition (`n`) ; l'**argument** est la valeur réelle donnée à l'appel (`7`).

## Les fonctions sans retour ou sans paramètre

```c
void afficher_ligne(int longueur) {
    for (int i = 0; i < longueur; i++) {
        printf("-");
    }
    printf("\n");
}

int lire_entier_positif(void) {
    int n;
    do {
        printf("Entier positif : ");
        scanf("%d", &n);
    } while (n < 0);
    return n;
}
```

- `void` comme type de retour : la fonction **agit** (elle affiche) mais ne renvoie rien.
- `void` entre les parenthèses : la fonction ne prend **aucun paramètre**.

## Le prototype

Le compilateur lit le fichier **de haut en bas**. Si `main` appelle une fonction définie plus bas, il faut l'annoncer avec un **prototype** :

```c
#include <stdio.h>

double moyenne(double a, double b);   /* prototype : se termine par ; */

int main(void) {
    printf("%.2f\n", moyenne(12, 15));
    return 0;
}

double moyenne(double a, double b) {  /* définition */
    return (a + b) / 2;
}
```

Dans les grands projets, les prototypes sont rangés dans des fichiers d'en-tête `.h`, comme `stdio.h`.

## Le passage par valeur

En C, une fonction reçoit une **copie** de ses arguments. Elle ne peut pas modifier les variables de l'appelant.

```c
void doubler(int n) {
    n = n * 2;          /* modifie la copie seulement */
}

int main(void) {
    int x = 5;
    doubler(x);
    printf("%d\n", x);  /* affiche 5 */
    return 0;
}
```

Pour obtenir le résultat, la fonction doit le **renvoyer** : `x = doubler(x);` avec `int doubler(int n) { return n * 2; }`. Pour modifier vraiment une variable, il faudra passer son adresse : c'est ce que fait `scanf` avec `&`, et c'est le sujet du cours sur les pointeurs.

## La portée des variables

Une variable déclarée dans une fonction est **locale** : elle n'existe que dans cette fonction, et elle est détruite à la fin de l'appel. Deux fonctions peuvent donc avoir chacune une variable `i` sans conflit.

Une variable déclarée en dehors de toute fonction est **globale** : visible partout. Évite-les : n'importe quelle fonction peut la modifier, et les erreurs deviennent très difficiles à retrouver. Préfère passer les données en paramètres.

## La récursivité

Une fonction **récursive** s'appelle elle-même, sur un problème plus petit. Elle a toujours deux parties :

1. un **cas de base**, qui s'arrête sans s'appeler ;
2. un **cas récursif**, qui se rapproche du cas de base.

```c
long long factorielle(int n) {
    if (n <= 1) {
        return 1;                        /* cas de base */
    }
    return n * factorielle(n - 1);       /* cas récursif */
}
```

Pour `factorielle(4)` : 4 × factorielle(3) = 4 × 3 × factorielle(2) = 4 × 3 × 2 × factorielle(1) = 4 × 3 × 2 × 1 = 24. Chaque appel attend le résultat du suivant, empilé dans une zone de la mémoire appelée la **pile**. Sans cas de base, la pile déborde et le programme plante : c'est le fameux *stack overflow*.

## Bien concevoir ses fonctions

- **Une fonction, une tâche.** Si son nom contient « et », découpe-la.
- **Courte** : une vingtaine de lignes au maximum, lisible sans défiler.
- **Un nom qui dit ce qu'elle fait** : `est_premier`, `calculer_tva`, `afficher_bulletin`.
- **Séparer le calcul de l'affichage** : une fonction qui calcule renvoie une valeur ; c'est `main` qui décide de l'afficher. On peut ainsi réutiliser le calcul ailleurs.

## Démonstration

On réécrit le test de nombre premier sous forme de fonction, puis on l'utilise pour afficher tous les nombres premiers inférieurs à 50.

```c
#include <stdio.h>

int est_premier(int n) {
    if (n < 2) {
        return 0;
    }
    for (int d = 2; d * d <= n; d++) {
        if (n % d == 0) {
            return 0;
        }
    }
    return 1;
}

int main(void) {
    for (int i = 1; i < 50; i++) {
        if (est_premier(i)) {
            printf("%d ", i);
        }
    }
    printf("\n");
    return 0;
}
```

La fonction renvoie 1 (vrai) ou 0 (faux) : on peut l'utiliser directement dans un `if`. Et `return 0` à l'intérieur de la boucle arrête la fonction dès qu'un diviseur est trouvé.

## Exercice guidé

1. Écris `double celsius_vers_fahrenheit(double c)`, sachant que F = C × 9 / 5 + 32. Teste avec 0 (32) et 37 (98,6).
2. Écris `int maximum(int a, int b)`, puis utilise-la pour trouver le maximum de **trois** nombres, sans écrire de nouvelle fonction.
3. Écris `void afficher_table(int n)` qui affiche la table de multiplication de n.

## Exercice autonome

1. Écris `int somme_chiffres(int n)` qui renvoie la somme des chiffres d'un entier positif : 2026 donne 10. Indice : `n % 10` et `n / 10`.
2. Écris une version **récursive** de la même fonction.
3. Écris `int pgcd(int a, int b)` avec l'algorithme d'Euclide : pgcd(a, 0) = a, et pgcd(a, b) = pgcd(b, a % b). Teste avec 48 et 18 (résultat 6).

## Correction

Exercice guidé, question 2 : `maximum(maximum(a, b), c)`. On imbrique les appels : le résultat du premier devient l'argument du second.

Exercice autonome :

```c
int somme_chiffres(int n) {
    int somme = 0;
    while (n > 0) {
        somme += n % 10;
        n /= 10;
    }
    return somme;
}

int somme_chiffres_rec(int n) {
    if (n < 10) {
        return n;
    }
    return n % 10 + somme_chiffres_rec(n / 10);
}

int pgcd(int a, int b) {
    if (b == 0) {
        return a;
    }
    return pgcd(b, a % b);
}
```

Pour pgcd(48, 18) : pgcd(18, 12), puis pgcd(12, 6), puis pgcd(6, 0), qui renvoie 6.

## Pour aller plus loin

- La bibliothèque `<math.h>` offre `sqrt`, `pow` ou `fabs`. Avec gcc, ajoute `-lm` à la fin de la commande de compilation.
- Essaie de séparer ton programme en trois fichiers : `calculs.h` (les prototypes), `calculs.c` (les définitions) et `main.c`, puis compile avec `gcc -Wall main.c calculs.c -o programme`.
- Cours suivant : « Langage C : les tableaux ».
