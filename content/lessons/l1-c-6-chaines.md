---
slug: l1-c-6-chaines
titre: "Langage C : les chaînes de caractères"
domaine: Programmation
duree: 120
difficulte: bases
licence:
  - { niveau: L1, semestre: S1, ue: "Algorithmique et programmation 1" }
ordre: 6
prerequis_cours: [l1-c-5-tableaux]
visibilite: public
objectifs:
  - Expliquer qu'une chaîne en C est un tableau de char terminé par '\0'
  - Lire une chaîne de façon sûre avec fgets
  - Utiliser les fonctions de string.h (strlen, strcpy, strcat, strcmp)
  - Parcourir une chaîne caractère par caractère
  - Éviter les débordements lors de la copie ou de la saisie
prerequis:
  - Manipuler des tableaux et les passer à des fonctions
referentiels:
  - ISO/IEC 9899 (C11), bibliothèques <string.h> et <ctype.h>
  - ACM/IEEE CS2023, domaine « Software Development Fundamentals » (chaînes)
  - SEI CERT C Coding Standard, règles STR (chaînes)
quiz:
  - question: "Combien de cases faut-il au minimum pour stocker la chaîne \"Dakar\" ?"
    choix: ["5", "6", "4", "10"]
    reponse: 1
    explication: "5 lettres plus le caractère de fin '\\0', qui marque la fin de la chaîne."
  - question: "Comment comparer deux chaînes nom1 et nom2 ?"
    choix: ["nom1 == nom2", "strcmp(nom1, nom2) == 0", "nom1 = nom2", "strlen(nom1) == strlen(nom2)"]
    reponse: 1
    explication: "== compare les adresses des deux tableaux, pas leur contenu. strcmp renvoie 0 si les chaînes sont identiques."
  - question: "Que renvoie strlen(\"Bonjour\") ?"
    choix: ["8", "7", "6", "Une adresse"]
    reponse: 1
    explication: "strlen compte les caractères avant '\\0', sans le compter."
  - question: "Pourquoi préférer fgets à scanf(\"%s\", ...) pour lire un nom ?"
    choix: ["fgets est plus rapide", "fgets limite le nombre de caractères lus et accepte les espaces ; scanf %s s'arrête au premier espace et peut déborder", "scanf ne lit pas les chaînes", "Il n'y a aucune différence"]
    reponse: 1
    explication: "fgets(nom, taille, stdin) ne lit jamais plus de taille - 1 caractères : il protège contre le débordement."
  - question: "Après fgets, pourquoi la chaîne contient-elle souvent un '\\n' à la fin ?"
    choix: ["C'est une erreur de fgets", "fgets garde le retour à la ligne tapé par l'utilisateur ; on le retire avec strcspn", "Le clavier l'ajoute deux fois", "Il n'y en a jamais"]
    reponse: 1
    explication: "On écrit nom[strcspn(nom, \"\\n\")] = '\\0'; pour le remplacer par la fin de chaîne."
---

## L'idée

Un nom, une adresse, un message : les programmes manipulent sans cesse du **texte**. En C, il n'existe pas de vrai type « chaîne ». Une **chaîne de caractères** est simplement un **tableau de `char`** dont la fin est marquée par un caractère spécial, le **caractère nul** `'\0'`.

Imagine un train de wagons, un caractère par wagon, avec un wagon de queue qui signale « fin du train ». Toutes les fonctions sur les chaînes avancent wagon par wagon jusqu'à le rencontrer.

## Déclarer une chaîne

```c
char ville[] = "Dakar";      /* taille 6 : D a k a r \0 */
char nom[50] = "Awa";        /* 50 cases, les 4 premières utilisées */
char lettre = 'A';           /* un caractère seul : apostrophes */
```

| Indice | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| `ville` | 'D' | 'a' | 'k' | 'a' | 'r' | '\0' |

- Les **guillemets** `"..."` créent une chaîne, et ajoutent `'\0'` automatiquement.
- Les **apostrophes** `'...'` désignent un seul caractère.
- Prévois toujours **une case de plus** que le nombre de lettres, pour `'\0'`.

Un `char` est en réalité un petit nombre : son **code ASCII**. `'A'` vaut 65, `'a'` vaut 97, `'0'` vaut 48. C'est pourquoi `'c' - 'a'` vaut 2, et `'7' - '0'` vaut 7.

## Afficher et lire

```c
printf("Ville : %s\n", ville);
```

Pour **lire**, `scanf("%s", nom)` s'arrête au premier espace (« Awa Diop » donne « Awa ») et ne vérifie pas la taille : un texte trop long déborde du tableau. Utilise plutôt `fgets` :

```c
char nom[50];
printf("Nom complet : ");
fgets(nom, sizeof nom, stdin);
nom[strcspn(nom, "\n")] = '\0';   /* retire le retour à la ligne */
```

- `fgets` lit **au plus** `sizeof nom - 1` caractères, espaces compris, et ajoute `'\0'`.
- Il garde le `'\n'` de la touche Entrée. La ligne suivante le remplace par `'\0'` : `strcspn` renvoie la position du premier `'\n'`.

Remarque : `nom` s'écrit sans `&`, car le nom d'un tableau représente déjà son adresse.

## Les fonctions de string.h

```c
#include <string.h>
```

| Fonction | Rôle | Exemple |
|---|---|---|
| `strlen(s)` | longueur, sans `'\0'` | `strlen("Thies")` vaut 5 |
| `strcpy(dest, src)` | copie src dans dest | `strcpy(copie, ville);` |
| `strcat(dest, src)` | ajoute src à la fin de dest | `strcat(nom, " Diop");` |
| `strcmp(a, b)` | compare : 0 si égales, négatif si a avant b, positif sinon | `strcmp("ami", "amie") < 0` |
| `strchr(s, c)` | cherche un caractère | `strchr(email, '@')` |

`strcpy` et `strcat` **ne vérifient pas** la place disponible dans `dest`. Avant de copier, vérifie que `strlen(src) < sizeof dest`, ou utilise `snprintf`, qui tronque proprement :

```c
char message[20];
snprintf(message, sizeof message, "Bonjour %s", nom);
```

## Comparer des chaînes

On **ne compare jamais** deux chaînes avec `==` : on comparerait leurs adresses en mémoire, pas leur contenu.

```c
if (strcmp(mot_de_passe, "teranga2026") == 0) {
    printf("Acces autorise\n");
}
```

`strcmp` compare les codes ASCII caractère par caractère : c'est l'**ordre lexicographique**, celui du dictionnaire, à ceci près que les majuscules (65 à 90) passent avant les minuscules (97 à 122).

## Parcourir une chaîne

On avance jusqu'au caractère `'\0'` :

```c
int compter_voyelles(const char s[]) {
    int n = 0;
    for (int i = 0; s[i] != '\0'; i++) {
        char c = tolower(s[i]);
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u' || c == 'y') {
            n++;
        }
    }
    return n;
}
```

La bibliothèque `<ctype.h>` fournit des fonctions pratiques sur les caractères :

| Fonction | Teste ou fait |
|---|---|
| `isdigit(c)` | est-ce un chiffre ? |
| `isalpha(c)` | est-ce une lettre ? |
| `isspace(c)` | est-ce un espace, une tabulation, un retour à la ligne ? |
| `toupper(c)`, `tolower(c)` | met en majuscule, en minuscule |

Attention : ces fonctions ne gèrent pas les lettres accentuées, codées sur plusieurs octets en UTF-8. Pour débuter, travaille sans accents.

## Démonstration

On vérifie qu'une adresse e-mail a une forme plausible : un seul `@`, au moins un caractère avant, et un `.` après.

```c
#include <stdio.h>
#include <string.h>

int email_plausible(const char s[]) {
    const char *arobase = strchr(s, '@');
    if (arobase == NULL || arobase == s) return 0;     /* pas de @, ou @ en premier */
    if (strchr(arobase + 1, '@') != NULL) return 0;    /* un deuxieme @ */
    if (strchr(arobase + 1, '.') == NULL) return 0;    /* pas de point apres */
    return 1;
}

int main(void) {
    char email[100];
    printf("E-mail : ");
    fgets(email, sizeof email, stdin);
    email[strcspn(email, "\n")] = '\0';
    printf(email_plausible(email) ? "Forme valide\n" : "Forme invalide\n");
    return 0;
}
```

`strchr` renvoie l'**adresse** du caractère trouvé, ou `NULL` s'il est absent. `arobase + 1` désigne le reste de la chaîne après le `@`. Tu comprendras pleinement cette écriture avec les pointeurs, au semestre 2.

## Exercice guidé

1. Lis un prénom avec `fgets` et affiche-le en majuscules, avec `toupper` dans une boucle.
2. Affiche sa longueur, calculée de deux façons : avec `strlen`, puis avec ta propre boucle.
3. Affiche le prénom à l'envers.

## Exercice autonome

1. Écris `int est_palindrome(const char s[])`, qui renvoie 1 si le mot se lit pareil dans les deux sens (« radar », « kayak »).
2. Écris `int compter_mots(const char s[])`, qui compte les mots d'une phrase séparés par des espaces. Attention aux espaces multiples.
3. Écris `int mot_de_passe_solide(const char s[])` : au moins 8 caractères, au moins un chiffre, une majuscule et une minuscule.

## Correction

Exercice guidé, question 3 :

```c
for (int i = (int) strlen(prenom) - 1; i >= 0; i--) {
    printf("%c", prenom[i]);
}
printf("\n");
```

Exercice autonome :

```c
int est_palindrome(const char s[]) {
    int i = 0, j = (int) strlen(s) - 1;
    while (i < j) {
        if (s[i] != s[j]) return 0;
        i++;
        j--;
    }
    return 1;
}

int compter_mots(const char s[]) {
    int mots = 0, dans_un_mot = 0;
    for (int i = 0; s[i] != '\0'; i++) {
        if (isspace((unsigned char) s[i])) {
            dans_un_mot = 0;
        } else if (!dans_un_mot) {
            dans_un_mot = 1;
            mots++;          /* debut d'un nouveau mot */
        }
    }
    return mots;
}

int mot_de_passe_solide(const char s[]) {
    int chiffre = 0, maj = 0, min = 0;
    for (int i = 0; s[i] != '\0'; i++) {
        if (isdigit((unsigned char) s[i])) chiffre = 1;
        else if (isupper((unsigned char) s[i])) maj = 1;
        else if (islower((unsigned char) s[i])) min = 1;
    }
    return strlen(s) >= 8 && chiffre && maj && min;
}
```

Pour compter les mots, on compte les **débuts** de mot : un caractère non blanc qui suit un blanc. Les espaces multiples ne posent donc pas de problème. Le cast `(unsigned char)` évite un comportement indéfini des fonctions de `<ctype.h>` avec des caractères accentués.

## Pour aller plus loin

- Lis la règle STR31-C du SEI CERT C Coding Standard : « garantir assez de place pour la chaîne et son caractère nul ».
- Découvre la table ASCII complète (`man ascii` sous Linux).
- Bilan du semestre : réalise un mini-projet « gestion d'une classe », qui combine tableaux, chaînes et fonctions.
- Suite au semestre 2 : « Langage C : pointeurs et mémoire ».
