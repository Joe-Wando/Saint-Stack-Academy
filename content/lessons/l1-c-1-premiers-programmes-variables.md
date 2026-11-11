---
slug: l1-c-1-premiers-programmes-variables
titre: "Langage C : premier programme, variables et types"
domaine: Programmation
duree: 120
difficulte: découverte
licence:
  - { niveau: L1, semestre: S1, ue: "Algorithmique et programmation 1" }
ordre: 1
prerequis_cours: []
visibilite: public
objectifs:
  - Expliquer ce que fait un compilateur et compiler un programme C avec gcc
  - Écrire la structure minimale d'un programme C (include, main, return)
  - Déclarer des variables de type int, double et char, et choisir le bon type
  - Afficher une valeur avec printf et lire une saisie avec scanf
  - Distinguer division entière et division réelle
prerequis:
  - Savoir utiliser un terminal (ouvrir un dossier, lancer une commande)
  - Aucune connaissance en programmation
referentiels:
  - ISO/IEC 9899 (norme du langage C), dans sa version C11
  - ACM/IEEE CS2023, domaine « Software Development Fundamentals » (variables, types, expressions)
  - Cisco Networking Academy et C++ Institute, « C Essentials 1 » (CLA)
quiz:
  - question: "Que produit la commande gcc bonjour.c -o bonjour ?"
    choix: ["Elle exécute le programme", "Elle traduit le code source en un fichier exécutable nommé bonjour", "Elle corrige les fautes du programme", "Elle crée un fichier texte"]
    reponse: 1
    explication: "gcc est un compilateur : il traduit le code C, lisible par un humain, en code machine. On lance ensuite l'exécutable avec ./bonjour."
  - question: "Quel type choisir pour stocker un prix comme 2499.50 ?"
    choix: ["int", "char", "double", "void"]
    reponse: 2
    explication: "double stocke des nombres à virgule. Un int ne garde que la partie entière."
  - question: "Que vaut 7 / 2 en C, si 7 et 2 sont des int ?"
    choix: ["3.5", "3", "4", "Une erreur"]
    reponse: 1
    explication: "Entre deux entiers, / fait une division entière : le résultat est tronqué. Pour obtenir 3.5, il faut qu'au moins un des deux nombres soit réel, par exemple 7.0 / 2."
  - question: "Pourquoi écrit-on &age dans scanf(\"%d\", &age) ?"
    choix: ["Pour multiplier age par 2", "Pour donner à scanf l'adresse de la variable, afin qu'il puisse y écrire la valeur saisie", "C'est une faute de frappe", "Pour afficher age"]
    reponse: 1
    explication: "scanf doit modifier la variable : on lui donne donc son adresse en mémoire avec l'opérateur &. On reverra les adresses dans le cours sur les pointeurs."
  - question: "Quel format printf utilise-t-on pour afficher un double ?"
    choix: ["%d", "%c", "%f", "%s"]
    reponse: 2
    explication: "%d pour un int, %f pour un double, %c pour un caractère, %s pour une chaîne. %.2f limite l'affichage à deux décimales."
---

## L'idée

Un ordinateur n'exécute que des instructions très simples, écrites en **langage machine** : des suites de 0 et de 1. Écrire directement dans ce langage serait interminable. On écrit donc le programme dans un **langage de programmation**, lisible par un humain, puis un **compilateur** le traduit en langage machine.

Le **C** est l'un des langages les plus importants de l'informatique. Créé en 1972 pour écrire le système Unix, il sert encore aujourd'hui à écrire Linux, Windows, les bases de données ou les logiciels des objets connectés. L'apprendre en premier oblige à comprendre comment la machine fonctionne vraiment. Les langages que tu verras ensuite (Java, Python, JavaScript) te paraîtront plus simples.

## Installer un compilateur

- **Linux** : `sudo apt install build-essential` installe `gcc`.
- **Windows** : installe **MSYS2** puis le paquet `mingw-w64-ucrt-x86_64-gcc`, ou utilise WSL (Ubuntu dans Windows).
- **macOS** : `xcode-select --install`.
- **Sans rien installer** : un compilateur en ligne comme OnlineGDB ou Compiler Explorer suffit pour débuter.

Vérifie l'installation avec `gcc --version`.

## Le premier programme

```c
#include <stdio.h>

int main(void) {
    printf("Bonjour, Dakar !\n");
    return 0;
}
```

Ligne par ligne :

| Ligne | Rôle |
|---|---|
| `#include <stdio.h>` | Donne accès aux fonctions d'entrée et de sortie, comme `printf` (*standard input output*). |
| `int main(void)` | Le point de départ du programme. Tout programme C a exactement une fonction `main`. |
| `{ ... }` | Les accolades délimitent un **bloc** d'instructions. |
| `printf("...\n");` | Affiche un texte. `\n` passe à la ligne. Chaque instruction se termine par `;`. |
| `return 0;` | Le programme se termine et signale au système que tout s'est bien passé. |

On compile, puis on exécute. Dans Code::Blocks : menu « Générer », « Générer et exécuter », touche F9. En ligne de commande :

```bash
gcc -Wall bonjour.c -o bonjour
./bonjour
```

L'option `-Wall` active les **avertissements** : le compilateur signale les erreurs probables. Garde-la toujours.

## Les variables

Une **variable** est une case de la mémoire qui porte un **nom** et contient une **valeur**. En C, on doit annoncer son **type** avant de l'utiliser : c'est la **déclaration**.

```c
int age = 19;            /* un entier */
double moyenne = 13.75;  /* un nombre à virgule */
char initiale = 'A';     /* un seul caractère, entre apostrophes */
```

| Type | Contient | Taille courante | Exemple |
|---|---|---|---|
| `int` | Entier | 4 octets | `-12`, `0`, `2026` |
| `double` | Nombre réel | 8 octets | `3.14`, `-0.5` |
| `char` | Un caractère | 1 octet | `'a'`, `'7'`, `'\n'` |

Règles de nommage : lettres, chiffres et `_`, sans commencer par un chiffre, sans accent ni espace. Le C distingue les majuscules : `Age` et `age` sont deux variables différentes. Choisis des noms clairs : `nb_etudiants` plutôt que `n`.

Une variable déclarée sans valeur contient **n'importe quoi** (ce qui traînait dans la mémoire). Initialise toujours tes variables.

## Afficher et lire des valeurs

`printf` remplace chaque **spécificateur de format** par la valeur correspondante :

```c
printf("J'ai %d ans et ma moyenne est %.2f\n", age, moyenne);
```

| Format | Type |
|---|---|
| `%d` | `int` |
| `%f` (ou `%.2f` pour 2 décimales) | `double` à l'affichage |
| `%c` | `char` |
| `%s` | chaîne de caractères |

`scanf` lit une saisie au clavier et la range dans une variable. On lui donne l'**adresse** de la variable avec `&` :

```c
int annee;
printf("Ton année de naissance : ");
scanf("%d", &annee);
```

Attention : pour lire un `double`, le format est `%lf` dans `scanf`, alors qu'on affiche avec `%f` dans `printf`.

## Les opérateurs et la division entière

Les opérateurs arithmétiques sont `+`, `-`, `*`, `/` et `%` (reste de la division entière, appelé **modulo**).

```c
int a = 17, b = 5;
printf("%d\n", a / b);   /* 3 : division entière */
printf("%d\n", a % b);   /* 2 : reste */
printf("%f\n", a / 2.0); /* 8.500000 : division réelle */
```

C'est l'erreur la plus fréquente des débutants : `17 / 5` vaut `3`, pas `3.4`, car les deux nombres sont des entiers. Pour forcer une division réelle, on **convertit** l'un des deux : `(double) a / b` vaut `3.4`. Cette écriture entre parenthèses s'appelle un **cast**.

Le modulo est très utile : `n % 2 == 0` teste si `n` est pair, et `n % 10` donne le dernier chiffre de `n`.

## Les constantes

Une valeur qui ne change jamais se déclare avec `const` :

```c
const double TVA = 0.18;   /* taux de TVA au Sénégal */
double prix_ttc = 10000 * (1 + TVA);
```

Le compilateur refusera toute modification de `TVA`. Par convention, on écrit les constantes en majuscules.

## Démonstration

On écrit un convertisseur de francs CFA en euros. Le taux est fixe : 1 euro = 655,957 FCFA.

```c
#include <stdio.h>

int main(void) {
    const double TAUX = 655.957;
    double montant_fcfa = 0;

    printf("Montant en FCFA : ");
    scanf("%lf", &montant_fcfa);

    double montant_euros = montant_fcfa / TAUX;
    printf("%.0f FCFA = %.2f euros\n", montant_fcfa, montant_euros);
    return 0;
}
```

Pour 10000, le programme affiche `10000 FCFA = 15.24 euros`. Puis on remplace `double` par `int` pour `montant_euros` : le compilateur, avec `-Wall`, ne proteste pas toujours, mais le résultat devient `15`. On voit concrètement l'effet du type.

## Exercice guidé

Écris un programme `rectangle.c` qui :

1. demande la longueur et la largeur d'un terrain, en mètres, sous forme de nombres réels ;
2. affiche son **périmètre** et son **aire**, avec deux décimales ;
3. affiche le prix du terrain, sachant que le mètre carré coûte 45 000 FCFA.

Compile avec `gcc -Wall rectangle.c -o rectangle` et teste avec 20 et 15.

## Exercice autonome

1. Écris un programme qui lit une durée en secondes (un `int`) et l'affiche en heures, minutes et secondes. Exemple : `3725` donne `1 h 2 min 5 s`. Indice : utilise `/` et `%`.
2. Sur ta feuille, prédis ce qu'affichent ces lignes, puis vérifie en les exécutant :
   - `printf("%d", 9 / 4);`
   - `printf("%d", 9 % 4);`
   - `printf("%.2f", 9 / 4.0);`
   - `printf("%.2f", (double) 9 / 4);`

## Correction

Exercice guidé :

```c
#include <stdio.h>

int main(void) {
    const double PRIX_M2 = 45000;
    double longueur = 0, largeur = 0;

    printf("Longueur (m) : ");
    scanf("%lf", &longueur);
    printf("Largeur (m) : ");
    scanf("%lf", &largeur);

    double perimetre = 2 * (longueur + largeur);
    double aire = longueur * largeur;

    printf("Perimetre : %.2f m\n", perimetre);
    printf("Aire : %.2f m2\n", aire);
    printf("Prix : %.0f FCFA\n", aire * PRIX_M2);
    return 0;
}
```

Avec 20 et 15 : périmètre 70.00 m, aire 300.00 m², prix 13 500 000 FCFA.

Exercice autonome, question 1 :

```c
#include <stdio.h>

int main(void) {
    int total = 0;
    printf("Duree en secondes : ");
    scanf("%d", &total);

    int heures = total / 3600;
    int minutes = (total % 3600) / 60;
    int secondes = total % 60;

    printf("%d h %d min %d s\n", heures, minutes, secondes);
    return 0;
}
```

Question 2 : `2`, puis `1`, puis `2.25`, puis `2.25`. Les deux dernières lignes sont des divisions réelles, car l'un des deux nombres est un `double`.

## Pour aller plus loin

- Teste les limites : affiche `sizeof(int)`, `sizeof(double)` et `sizeof(char)` avec `%zu` pour connaître leur taille sur ta machine.
- Lis la page « printf » de cppreference.com, la référence la plus fiable du C en ligne.
- Cours suivant : « Langage C : les conditions ».
