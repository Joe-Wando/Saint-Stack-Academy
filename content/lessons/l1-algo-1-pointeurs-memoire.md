---
slug: l1-algo-1-pointeurs-memoire
titre: "Langage C : pointeurs et mémoire"
domaine: Programmation
duree: 150
difficulte: bases
licence:
  - { niveau: L1, semestre: S2, ue: "Algorithmique et modélisation" }
ordre: 1
prerequis_cours: [l1-c-6-chaines]
visibilite: public
objectifs:
  - Expliquer ce qu'est une adresse mémoire et un pointeur
  - Utiliser les opérateurs & (adresse de) et * (déréférencement)
  - Modifier les variables de l'appelant grâce au passage par adresse
  - Relier tableaux et pointeurs, et utiliser l'arithmétique des pointeurs
  - Allouer et libérer de la mémoire dynamiquement avec malloc et free
prerequis:
  - Fonctions, tableaux et chaînes en C
referentiels:
  - ISO/IEC 9899 (C11), pointeurs et gestion de la mémoire (<stdlib.h>)
  - ACM/IEEE CS2023, domaines « Software Development Fundamentals » et « Architecture and Organization » (mémoire)
  - C++ Institute, « C Advanced » (CLP), module « Pointers »
quiz:
  - question: "Si int x = 7; int *p = &x;, que vaut *p ?"
    choix: ["L'adresse de x", "7", "0", "p"]
    reponse: 1
    explication: "p contient l'adresse de x ; *p désigne la valeur située à cette adresse, donc 7."
  - question: "Pourquoi écrit-on void echanger(int *a, int *b) plutôt que void echanger(int a, int b) ?"
    choix: ["Pour aller plus vite", "Pour recevoir les adresses des variables et pouvoir modifier les originales, et non des copies", "Parce que les int sont interdits", "C'est une question de style"]
    reponse: 1
    explication: "Avec des int, la fonction échangerait des copies. Avec des pointeurs, elle agit sur les variables de l'appelant."
  - question: "Si t est un tableau d'int, que désigne *(t + 2) ?"
    choix: ["t[0] + 2", "t[2]", "L'adresse de t[2]", "Une erreur"]
    reponse: 1
    explication: "t + 2 est l'adresse de la case d'indice 2 ; l'étoile en donne la valeur. t[i] est exactement *(t + i)."
  - question: "Que faut-il faire après chaque malloc réussi, une fois la mémoire devenue inutile ?"
    choix: ["Rien", "Appeler free pour la libérer", "Appeler malloc à nouveau", "Redémarrer le programme"]
    reponse: 1
    explication: "Sinon la mémoire reste réservée jusqu'à la fin du programme : c'est une fuite de mémoire."
  - question: "Que se passe-t-il si l'on déréférence un pointeur NULL ?"
    choix: ["On obtient 0", "Le programme plante, souvent avec « Segmentation fault »", "Le pointeur est réparé", "Rien"]
    reponse: 1
    explication: "NULL ne pointe vers aucune zone valide. On teste toujours un pointeur avant de l'utiliser s'il peut être NULL."
---

## L'idée

La mémoire vive est une immense rangée de cases d'un octet, chacune repérée par un **numéro** : son **adresse**. Chaque variable occupe une ou plusieurs de ces cases.

Un **pointeur** est une variable qui contient **l'adresse d'une autre variable**. C'est comme connaître le numéro d'une chambre d'hôtel plutôt que la personne elle-même : avec ce numéro, on peut aller voir, ou modifier, ce qu'il y a dedans.

Les pointeurs sont la notion la plus redoutée du C, et la plus importante. Ils permettent de modifier des variables depuis une fonction, de manipuler des tableaux et des chaînes, et de créer des structures de données qui grandissent à la demande : listes, piles, files, arbres.

## Adresse et pointeur

```c
int x = 7;
int *p = &x;     /* p contient l'adresse de x */

printf("%d\n", x);           /* 7 */
printf("%p\n", (void *) &x); /* l'adresse de x, par exemple 0x7ffd4a1c */
printf("%p\n", (void *) p);  /* la même adresse */
printf("%d\n", *p);          /* 7 : la valeur pointée */

*p = 42;                     /* on modifie x à travers p */
printf("%d\n", x);           /* 42 */
```

| Écriture | Se lit | Signification |
|---|---|---|
| `int *p;` | « p est un pointeur sur int » | déclaration |
| `&x` | « adresse de x » | l'adresse où est rangé x |
| `*p` | « valeur pointée par p » | la case dont l'adresse est dans p |

Schéma de la mémoire :

```text
adresse     contenu      nom
0x1000      42           x
...
0x2000      0x1000       p   (p "pointe" vers x)
```

Le **type** du pointeur indique la taille de ce qu'on trouve à l'adresse : un `int *` désigne un `int`, un `char *` un `char`.

## Le pointeur NULL

Un pointeur qui ne pointe vers rien vaut `NULL`. Déréférencer `NULL`, ou un pointeur **non initialisé**, provoque en général un plantage : `Segmentation fault`.

Règles :

- initialise toujours un pointeur, à `NULL` si tu n'as pas encore d'adresse ;
- teste-le avant de l'utiliser s'il peut être `NULL`.

## Le passage par adresse

Au semestre 1, on a vu qu'une fonction reçoit une **copie** de ses arguments. Pour qu'elle modifie les variables de l'appelant, on lui passe leurs **adresses** :

```c
void echanger(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int main(void) {
    int x = 3, y = 8;
    echanger(&x, &y);
    printf("%d %d\n", x, y);   /* 8 3 */
    return 0;
}
```

C'est exactement ce que fait `scanf("%d", &n)` : il reçoit l'adresse de `n` pour y écrire la valeur saisie.

Autre usage : **renvoyer plusieurs résultats**. Une fonction ne fait qu'un seul `return`, mais elle peut remplir plusieurs variables par leurs adresses :

```c
void min_max(const int t[], int n, int *min, int *max) {
    *min = t[0];
    *max = t[0];
    for (int i = 1; i < n; i++) {
        if (t[i] < *min) {
            *min = t[i];
        }
        if (t[i] > *max) {
            *max = t[i];
        }
    }
}
```

## Tableaux et pointeurs

Le nom d'un tableau, utilisé dans une expression, est l'**adresse de sa première case**. Ainsi `t` équivaut à `&t[0]`.

L'**arithmétique des pointeurs** : ajouter 1 à un pointeur le fait avancer d'**un élément**, pas d'un octet. Si `p` pointe sur un `int` de 4 octets, `p + 1` avance de 4 octets.

| Écriture | Équivaut à |
|---|---|
| `t[i]` | `*(t + i)` |
| `&t[i]` | `t + i` |

```c
int t[4] = {10, 20, 30, 40};
int *p = t;
printf("%d\n", *(p + 2));   /* 30 */
p++;                        /* p pointe maintenant sur t[1] */
printf("%d\n", *p);         /* 20 */
```

C'est pourquoi une fonction qui reçoit un tableau peut s'écrire `void f(int *t, int n)` aussi bien que `void f(int t[], int n)`. Et une chaîne de caractères se manipule souvent par un `char *` qui avance jusqu'au caractère `'\0'`.

## L'allocation dynamique

Un tableau déclaré `int t[100];` a une taille **fixe**, décidée à l'écriture du programme, et il est rangé sur la **pile**, une zone de taille limitée. Quand la taille n'est connue qu'à l'exécution, on réserve la mémoire dans le **tas** avec `malloc` :

```c
#include <stdlib.h>

int n = 0;
printf("Combien de notes ? ");
scanf("%d", &n);

double *notes = malloc(n * sizeof(double));
if (notes == NULL) {
    printf("Memoire insuffisante\n");
    return 1;
}

for (int i = 0; i < n; i++) {
    notes[i] = 0;          /* on l'utilise comme un tableau */
}

free(notes);               /* on rend la mémoire */
notes = NULL;              /* on évite un pointeur "pendant" */
```

| Fonction | Rôle |
|---|---|
| `malloc(taille)` | réserve `taille` octets, renvoie leur adresse ou `NULL` |
| `calloc(n, taille)` | réserve et met tout à zéro |
| `realloc(p, nouvelle_taille)` | agrandit ou réduit une zone |
| `free(p)` | libère la zone |

Les trois erreurs classiques :

1. **Oublier `free`** : la mémoire n'est jamais rendue, c'est une **fuite de mémoire**. Sur un serveur qui tourne des mois, elle finit par saturer la RAM.
2. **Utiliser la mémoire après `free`** : comportement indéfini.
3. **Appeler `free` deux fois** sur la même zone.

## Démonstration

On écrit une fonction qui crée une copie d'une chaîne, de la bonne taille :

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *dupliquer(const char *source) {
    char *copie = malloc(strlen(source) + 1);   /* +1 pour '\0' */
    if (copie == NULL) {
        return NULL;
    }
    strcpy(copie, source);
    return copie;
}

int main(void) {
    char *nom = dupliquer("Saint-Louis");
    if (nom != NULL) {
        printf("%s\n", nom);
        free(nom);
    }
    return 0;
}
```

Puis on vérifie l'absence de fuite avec l'outil **Valgrind**, sous Linux : `valgrind --leak-check=full ./programme`. On retire le `free` et on observe le message « definitely lost ».

## Exercice guidé

1. Déclare `double prix = 2500;` et un pointeur `pp` sur `prix`. Augmente le prix de 10 % en passant uniquement par `pp`, puis affiche `prix`.
2. Écris `void tripler(int *n)`, qui triple la variable passée, et teste-la.
3. Affiche les éléments du tableau `{5, 10, 15, 20}` en utilisant uniquement un pointeur et `p++`, sans crochets.

## Exercice autonome

1. Écris `void division(int a, int b, int *quotient, int *reste)`.
2. Écris un programme qui demande n, alloue un tableau de n entiers avec `malloc`, le remplit avec les carrés 0, 1, 4, 9..., l'affiche, puis le libère.
3. Écris `int *concatener(const int *t1, int n1, const int *t2, int n2)`, qui renvoie un nouveau tableau alloué contenant t1 suivi de t2. Qui doit appeler `free`, et quand ?

## Correction

Exercice guidé :

```c
#include <stdio.h>

void tripler(int *n) {
    *n = *n * 3;
}

int main(void) {
    double prix = 2500;
    double *pp = &prix;
    *pp = *pp * 1.10;              /* question 1 : prix vaut 2750 */
    printf("%.0f\n", prix);

    int a = 5;
    tripler(&a);                   /* question 2 : a vaut 15 */
    printf("%d\n", a);

    int t[4] = {5, 10, 15, 20};
    for (int *p = t; p < t + 4; p++) {   /* question 3 */
        printf("%d ", *p);
    }
    printf("\n");
    return 0;
}
```

Exercice autonome :

```c
void division(int a, int b, int *quotient, int *reste) {
    *quotient = a / b;
    *reste = a % b;
}

int *concatener(const int *t1, int n1, const int *t2, int n2) {
    int *res = malloc((n1 + n2) * sizeof(int));
    if (res == NULL) {
        return NULL;
    }
    for (int i = 0; i < n1; i++) {
        res[i] = t1[i];
    }
    for (int i = 0; i < n2; i++) {
        res[n1 + i] = t2[i];
    }
    return res;
}
```

Pour `concatener`, c'est **l'appelant** qui doit libérer le tableau renvoyé, quand il n'en a plus besoin. On l'indique dans un commentaire au-dessus de la fonction : c'est une convention indispensable en C.

## Pour aller plus loin

- Dessine toujours la mémoire (cases, adresses, flèches) quand un programme à pointeurs ne marche pas : c'est la méthode la plus efficace.
- Python Tutor (pythontutor.com) affiche les pointeurs sous forme de flèches pour les programmes C.
- Les langages comme Java ou Python libèrent la mémoire automatiquement, grâce à un **ramasse-miettes** (*garbage collector*). Comprendre `malloc` et `free` t'aidera à comprendre ce qu'ils font pour toi.
- Cours suivant : « Langage C : les structures ».
