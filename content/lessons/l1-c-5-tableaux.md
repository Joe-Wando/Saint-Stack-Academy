---
slug: l1-c-5-tableaux
titre: "Langage C : les tableaux"
domaine: Programmation
duree: 120
difficulte: bases
licence:
  - { niveau: L1, semestre: S1, ue: "Algorithmique et programmation 1" }
ordre: 5
prerequis_cours: [l1-c-4-fonctions]
visibilite: public
objectifs:
  - Déclarer, initialiser et parcourir un tableau à une dimension
  - Expliquer pourquoi les indices commencent à 0 et éviter le débordement
  - Passer un tableau à une fonction avec sa taille
  - Programmer la recherche d'un élément et le tri par sélection
  - Manipuler un tableau à deux dimensions
prerequis:
  - Écrire des boucles for et des fonctions
referentiels:
  - ISO/IEC 9899 (C11), tableaux
  - ACM/IEEE CS2023, domaines « Software Development Fundamentals » et « Algorithmic Foundations » (recherche, tri)
  - C++ Institute, « C Essentials 1 » (CLA), module « Arrays »
quiz:
  - question: "Après int notes[5];, quel est l'indice du dernier élément ?"
    choix: ["5", "4", "6", "0"]
    reponse: 1
    explication: "Les indices vont de 0 à taille - 1, donc de 0 à 4."
  - question: "Que se passe-t-il si on écrit notes[5] = 12; pour un tableau de 5 cases ?"
    choix: ["Le tableau s'agrandit", "Le compilateur refuse toujours", "On écrit hors du tableau : comportement indéfini, le programme peut planter ou corrompre d'autres données", "Rien"]
    reponse: 2
    explication: "Le C ne vérifie pas les indices. C'est une erreur grave, à la source de nombreuses failles de sécurité."
  - question: "Pourquoi passe-t-on la taille en paramètre : double moyenne(double t[], int taille) ?"
    choix: ["Par habitude", "Parce que la fonction ne peut pas connaître la taille du tableau reçu", "Pour aller plus vite", "C'est obligatoire pour printf"]
    reponse: 1
    explication: "Un tableau passé à une fonction devient l'adresse de son premier élément : sa taille est perdue."
  - question: "Une fonction modifie t[0] d'un tableau reçu en paramètre. La modification est-elle visible dans main ?"
    choix: ["Non, comme pour les int", "Oui : la fonction travaille directement sur le tableau d'origine, pas sur une copie", "Seulement si on fait return", "Seulement pour les tableaux de char"]
    reponse: 1
    explication: "Contrairement aux variables simples, un tableau n'est pas copié : la fonction reçoit son adresse."
  - question: "Combien de comparaisons fait, au pire, une recherche séquentielle dans un tableau de 1000 éléments ?"
    choix: ["10", "500", "1000", "1 000 000"]
    reponse: 2
    explication: "Au pire, l'élément est en dernier ou absent : on regarde toutes les cases. Le coût est proportionnel à n."
---

## L'idée

Pour stocker les notes de 30 étudiants, déclarer 30 variables `note1`, `note2`... serait absurde. Un **tableau** est une suite de cases **du même type**, rangées côte à côte en mémoire, sous un **seul nom**. On accède à chaque case par son **indice**, c'est-à-dire sa position.

Pense à une rangée de casiers numérotés dans un vestiaire : un seul nom pour la rangée, et un numéro pour chaque casier.

## Déclarer et initialiser

```c
int notes[5];                          /* 5 entiers, non initialisés */
int notes2[5] = {12, 15, 9, 18, 11};   /* initialisé */
double prix[] = {500.0, 1250.5, 300.0}; /* taille déduite : 3 */
int compteurs[10] = {0};               /* 10 cases, toutes à 0 */
```

La taille d'un tableau classique est **fixe** : on la choisit à la déclaration et elle ne change plus.

Bonne pratique : définir la taille une seule fois, avec une constante.

```c
#define NB_ETUDIANTS 30
double notes[NB_ETUDIANTS];
```

`#define` remplace le mot `NB_ETUDIANTS` par `30` avant la compilation. Si l'effectif change, on ne modifie qu'une ligne.

## Accéder aux cases : les indices commencent à 0

```c
int notes[5] = {12, 15, 9, 18, 11};
printf("%d\n", notes[0]);   /* 12 : la première case */
printf("%d\n", notes[4]);   /* 11 : la dernière case */
notes[2] = 10;              /* on remplace 9 par 10 */
```

| Indice | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| Valeur | 12 | 15 | 10 | 18 | 11 |

Les indices vont de **0 à taille − 1**. L'indice indique le **décalage** depuis le début : la première case est à 0 case du début.

Le C **ne vérifie pas** les indices. Écrire `notes[5]` ou `notes[-1]` lit ou écrit en dehors du tableau, dans une autre zone de la mémoire. Le comportement est **indéfini** : le programme peut sembler marcher, planter, ou modifier une autre variable. C'est l'origine des **débordements de tampon**, l'une des failles de sécurité les plus exploitées de l'histoire.

## Parcourir un tableau

On parcourt un tableau avec une boucle `for`, de 0 à taille − 1 :

```c
double somme = 0;
for (int i = 0; i < 5; i++) {
    somme += notes[i];
}
printf("Moyenne : %.2f\n", somme / 5);
```

Note la condition `i < 5` et non `i <= 5`.

## Tableaux et fonctions

Quand on passe un tableau à une fonction, elle reçoit l'**adresse** de sa première case, pas une copie. Deux conséquences :

1. La fonction **ne connaît pas la taille** : il faut la passer en paramètre.
2. La fonction peut **modifier** le tableau d'origine.

```c
double moyenne(const double t[], int taille) {
    double somme = 0;
    for (int i = 0; i < taille; i++) {
        somme += t[i];
    }
    return somme / taille;
}

void mettre_a_zero(int t[], int taille) {
    for (int i = 0; i < taille; i++) {
        t[i] = 0;          /* modifie le tableau de l'appelant */
    }
}
```

Le mot `const` indique que `moyenne` ne modifiera pas le tableau : le compilateur le vérifie.

## Rechercher un élément

La **recherche séquentielle** regarde les cases une par une :

```c
int rechercher(const int t[], int taille, int valeur) {
    for (int i = 0; i < taille; i++) {
        if (t[i] == valeur) {
            return i;      /* trouvé : on renvoie l'indice */
        }
    }
    return -1;             /* convention : -1 signifie absent */
}
```

Au pire, elle fait **n** comparaisons pour n cases. On dit que sa complexité est **linéaire**, notée O(n). Si le tableau est trié, la recherche par **dichotomie** fait beaucoup mieux : environ 10 comparaisons pour 1000 éléments.

## Trier : le tri par sélection

Idée : on cherche le plus petit élément et on le place en première position, puis le plus petit du reste en deuxième position, et ainsi de suite.

```c
void tri_selection(int t[], int taille) {
    for (int i = 0; i < taille - 1; i++) {
        int imin = i;
        for (int j = i + 1; j < taille; j++) {
            if (t[j] < t[imin]) {
                imin = j;
            }
        }
        int tmp = t[i];          /* échange de t[i] et t[imin] */
        t[i] = t[imin];
        t[imin] = tmp;
    }
}
```

Déroulé sur `{5, 2, 9, 1}` : on place 1 (`{1, 2, 9, 5}`), puis 2 (inchangé), puis 5 (`{1, 2, 5, 9}`). Ce tri fait environ n²/2 comparaisons : simple, mais lent pour de grands tableaux. Tu verras des tris plus rapides en L2.

L'échange utilise une variable **temporaire** : `t[i] = t[imin]; t[imin] = t[i];` perdrait l'une des deux valeurs.

## Les tableaux à deux dimensions

Une **matrice** est un tableau de lignes. On l'utilise pour une grille, un plan de salle, un emploi du temps.

```c
int grille[3][4] = {
    {1, 2, 3, 4},
    {5, 6, 7, 8},
    {9, 10, 11, 12}
};
printf("%d\n", grille[1][2]);   /* ligne 1, colonne 2 : 7 */

for (int l = 0; l < 3; l++) {
    for (int c = 0; c < 4; c++) {
        printf("%4d", grille[l][c]);
    }
    printf("\n");
}
```

Le premier indice est la **ligne**, le second la **colonne**.

## Démonstration

On gère les notes d'un groupe de 5 étudiants : saisie, moyenne, meilleure note, nombre d'admis, puis affichage trié.

```c
#include <stdio.h>
#define N 5

int main(void) {
    int notes[N];
    for (int i = 0; i < N; i++) {
        printf("Note de l'etudiant %d : ", i + 1);
        scanf("%d", &notes[i]);
    }
    int admis = 0, max = notes[0], somme = 0;
    for (int i = 0; i < N; i++) {
        somme += notes[i];
        if (notes[i] > max) {
            max = notes[i];
        }
        if (notes[i] >= 10) {
            admis++;
        }
    }
    printf("Moyenne %.2f, max %d, admis %d/%d\n", (double) somme / N, max, admis, N);
    return 0;
}
```

On remarque `&notes[i]` dans `scanf` : on donne l'adresse de la case.

## Exercice guidé

1. Déclare un tableau des températures maximales de la semaine à Dakar : `{29, 31, 30, 32, 28, 27, 30}`.
2. Écris une fonction qui renvoie l'indice du jour le plus chaud, puis affiche le jour (1 = lundi).
3. Affiche les températures dans l'ordre inverse.

## Exercice autonome

1. Écris `void inverser(int t[], int taille)` qui inverse le tableau **sur place**, sans tableau auxiliaire.
2. Écris `int est_trie(const int t[], int taille)` qui renvoie 1 si le tableau est trié par ordre croissant.
3. Écris une fonction qui compte les occurrences de chaque note de 0 à 20 dans un tableau de notes, à l'aide d'un tableau `compteurs[21]`.

## Correction

Exercice guidé, question 2 :

```c
int indice_max(const int t[], int taille) {
    int imax = 0;
    for (int i = 1; i < taille; i++) {
        if (t[i] > t[imax]) {
            imax = i;
        }
    }
    return imax;
}
```

Avec ces données, l'indice est 3, donc le jeudi (indice + 1 = 4).

Exercice autonome :

```c
void inverser(int t[], int taille) {
    for (int i = 0; i < taille / 2; i++) {
        int tmp = t[i];
        t[i] = t[taille - 1 - i];
        t[taille - 1 - i] = tmp;
    }
}

int est_trie(const int t[], int taille) {
    for (int i = 0; i < taille - 1; i++) {
        if (t[i] > t[i + 1]) {
            return 0;
        }
    }
    return 1;
}
```

Pour `inverser`, on s'arrête à la **moitié** : sinon, on échangerait deux fois chaque paire et le tableau reviendrait à l'état initial.

Question 3 : on parcourt les notes et on fait `compteurs[notes[i]]++`. La note sert directement d'indice, à condition de vérifier qu'elle est bien entre 0 et 20.

## Pour aller plus loin

- Visualise le tri par sélection sur visualgo.net (rubrique *Sorting*).
- Programme la recherche par dichotomie sur un tableau trié et compte les comparaisons.
- Cours suivant : « Langage C : les chaînes de caractères ».
