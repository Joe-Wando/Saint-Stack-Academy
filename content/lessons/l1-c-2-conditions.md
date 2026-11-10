---
slug: l1-c-2-conditions
titre: "Langage C : les conditions"
domaine: Programmation
duree: 120
difficulte: découverte
licence:
  - { niveau: L1, semestre: S1, ue: "Algorithmique et programmation 1" }
ordre: 2
prerequis_cours: [l1-c-1-premiers-programmes-variables]
visibilite: public
objectifs:
  - Écrire une condition avec les opérateurs de comparaison
  - Combiner plusieurs conditions avec les opérateurs logiques &&, || et !
  - Utiliser if, else if et else pour choisir entre plusieurs cas
  - Utiliser switch pour un choix parmi des valeurs fixes
  - Éviter les pièges classiques (= au lieu de ==, accolades oubliées)
prerequis:
  - Déclarer des variables, utiliser printf et scanf
referentiels:
  - ISO/IEC 9899 (C11), instructions de sélection
  - ACM/IEEE CS2023, domaine « Software Development Fundamentals » (structures de contrôle)
  - C++ Institute, « C Essentials 1 » (CLA), module « Flow control »
quiz:
  - question: "Que vaut l'expression (5 > 3) && (2 == 3) ?"
    choix: ["1 (vrai)", "0 (faux)", "5", "Une erreur"]
    reponse: 1
    explication: "&& exige que les deux conditions soient vraies. 2 == 3 est faux, donc l'ensemble est faux et vaut 0."
  - question: "Quel est le problème dans if (note = 10) ?"
    choix: ["Aucun", "= affecte la valeur 10 à note au lieu de la comparer ; la condition est donc toujours vraie", "Il manque un point-virgule", "note doit être un double"]
    reponse: 1
    explication: "La comparaison s'écrit ==. Avec =, note prend la valeur 10, et 10 est considéré comme vrai. -Wall signale souvent cette erreur."
  - question: "En C, quelle valeur est considérée comme fausse ?"
    choix: ["Toute valeur négative", "0", "1", "-1"]
    reponse: 1
    explication: "En C, 0 est faux et toute autre valeur est vraie. Le résultat d'une comparaison vaut 1 ou 0."
  - question: "À quoi sert break dans un switch ?"
    choix: ["À arrêter le programme", "À sortir du switch ; sans break, l'exécution continue dans le case suivant", "À passer au case suivant", "Il est interdit dans un switch"]
    reponse: 1
    explication: "Sans break, on « tombe » dans les case suivants : c'est le fall-through, source fréquente de bogues."
  - question: "Comment tester qu'une note n est comprise entre 10 et 12 inclus ?"
    choix: ["10 <= n <= 12", "n >= 10 && n <= 12", "n >= 10 || n <= 12", "n == 10..12"]
    reponse: 1
    explication: "En C, 10 <= n <= 12 ne fait pas ce qu'on croit : il compare d'abord 10 <= n (0 ou 1), puis ce résultat à 12. Il faut deux comparaisons reliées par &&."
---

## L'idée

Jusqu'ici, nos programmes exécutaient toutes les instructions, de haut en bas. Mais un vrai programme doit **décider** : afficher « Admis » si la moyenne atteint 10, refuser un retrait si le solde est insuffisant, appliquer une remise au-delà d'un certain montant. C'est le rôle des **conditions**.

En algorithmique, on écrit : **SI** condition **ALORS** action **SINON** autre action. En C, cela devient `if` et `else`.

## Les opérateurs de comparaison

Une **condition** est une expression qui vaut **vrai** ou **faux**. En C, faux vaut `0`, et vrai vaut toute autre valeur (une comparaison donne `1`).

| Opérateur | Signification | Exemple vrai |
|---|---|---|
| `==` | égal à | `3 == 3` |
| `!=` | différent de | `3 != 4` |
| `<` `>` | inférieur, supérieur | `2 < 5` |
| `<=` `>=` | inférieur ou égal, supérieur ou égal | `10 >= 10` |

Le piège numéro un : `=` **affecte** une valeur, `==` **compare**. `if (x = 5)` met 5 dans `x` et la condition est toujours vraie.

## if et else

```c
if (moyenne >= 10) {
    printf("Admis\n");
} else {
    printf("Ajourne\n");
}
```

- La condition est toujours **entre parenthèses**.
- Le bloc du `if` s'exécute si elle est vraie, celui du `else` sinon.
- Le `else` est facultatif.

Mets **toujours les accolades**, même pour une seule instruction. Sans elles, seule la première ligne dépend du `if`, et une ligne ajoutée plus tard s'exécutera toujours : c'est une erreur classique, difficile à repérer.

## Plusieurs cas : else if

Pour choisir entre plus de deux cas, on enchaîne des `else if`. Le programme teste les conditions **dans l'ordre** et s'arrête à la première vraie.

```c
if (moyenne >= 16) {
    printf("Mention Tres bien\n");
} else if (moyenne >= 14) {
    printf("Mention Bien\n");
} else if (moyenne >= 12) {
    printf("Mention Assez bien\n");
} else if (moyenne >= 10) {
    printf("Passable\n");
} else {
    printf("Ajourne\n");
}
```

L'ordre compte : si l'on testait `moyenne >= 10` en premier, un 17 afficherait « Passable ».

## Combiner des conditions

| Opérateur | Nom | Vrai si |
|---|---|---|
| `&&` | ET | les deux conditions sont vraies |
| `\|\|` | OU | au moins une condition est vraie |
| `!` | NON | la condition est fausse |

```c
if (age >= 18 && possede_carte == 1) {
    printf("Inscription possible\n");
}
if (jour == 6 || jour == 7) {
    printf("Week-end\n");
}
```

Le C évalue de gauche à droite et s'arrête dès que le résultat est connu. Dans `b != 0 && a / b > 2`, si `b` vaut 0, la division n'est jamais calculée : on évite ainsi une division par zéro. On appelle cela l'**évaluation paresseuse**.

### La table de vérité

| A | B | A && B | A \|\| B | !A |
|---|---|---|---|---|
| faux | faux | faux | faux | vrai |
| faux | vrai | faux | vrai | vrai |
| vrai | faux | faux | vrai | faux |
| vrai | vrai | vrai | vrai | faux |

Tu retrouveras ces tables dans le cours de mathématiques sur l'algèbre de Boole.

## switch : choisir parmi des valeurs fixes

Quand on compare **une même variable entière** (ou un caractère) à plusieurs valeurs précises, `switch` est plus lisible :

```c
switch (choix) {
    case 1:
        printf("Consulter le solde\n");
        break;
    case 2:
        printf("Faire un retrait\n");
        break;
    case 3:
        printf("Quitter\n");
        break;
    default:
        printf("Choix invalide\n");
}
```

- Chaque `case` est une valeur constante.
- `break` fait sortir du `switch`. Sans lui, l'exécution continue dans le `case` suivant.
- `default` traite toutes les autres valeurs.

`switch` ne fonctionne pas avec des intervalles (`case >= 10` est impossible) ni avec des `double`. Dans ces cas, on utilise `if`.

## L'opérateur ternaire

Pour choisir entre deux valeurs, on peut écrire en une ligne : `condition ? valeur_si_vrai : valeur_si_faux`.

```c
int max = (a > b) ? a : b;
```

Utilise-le seulement pour des choix simples : imbriqué, il devient vite illisible.

## Démonstration

On écrit le calcul d'un tarif de transport : le billet coûte 500 FCFA, il est gratuit pour les moins de 5 ans, et à moitié prix pour les étudiants et les plus de 60 ans.

```c
#include <stdio.h>

int main(void) {
    int age = 0, etudiant = 0;
    printf("Age : ");
    scanf("%d", &age);
    printf("Etudiant (1 = oui, 0 = non) : ");
    scanf("%d", &etudiant);

    int prix = 500;
    if (age < 0) {
        printf("Age invalide\n");
        return 1;
    } else if (age < 5) {
        prix = 0;
    } else if (etudiant == 1 || age > 60) {
        prix = 250;
    }
    printf("Prix du billet : %d FCFA\n", prix);
    return 0;
}
```

On teste les **cas limites** : 4, 5, 60 et 61 ans, étudiant ou non. Tester les valeurs à la frontière d'une condition est la meilleure façon de trouver les erreurs.

## Exercice guidé

Écris un programme qui lit un entier et affiche s'il est **pair ou impair**, puis s'il est **positif, négatif ou nul**.

1. Utilise l'opérateur `%`.
2. Teste avec 0, 7, -4.

## Exercice autonome

1. **Année bissextile** : une année est bissextile si elle est divisible par 4 mais pas par 100, ou si elle est divisible par 400. Écris le programme et vérifie : 2024 (oui), 1900 (non), 2000 (oui), 2026 (non).
2. **Calculatrice** : lis deux nombres réels et un caractère opérateur (`+`, `-`, `*`, `/`), puis affiche le résultat avec un `switch`. Refuse la division par zéro.

Pour lire un caractère après un nombre, écris `scanf(" %c", &op);` : l'espace avant `%c` ignore le retour à la ligne resté en mémoire.

## Correction

Exercice guidé :

```c
#include <stdio.h>

int main(void) {
    int n = 0;
    printf("Entier : ");
    scanf("%d", &n);

    if (n % 2 == 0) {
        printf("%d est pair\n", n);
    } else {
        printf("%d est impair\n", n);
    }

    if (n > 0) {
        printf("positif\n");
    } else if (n < 0) {
        printf("negatif\n");
    } else {
        printf("nul\n");
    }
    return 0;
}
```

Exercice autonome, question 1 : la condition s'écrit
`(annee % 4 == 0 && annee % 100 != 0) || annee % 400 == 0`.

Question 2 :

```c
#include <stdio.h>

int main(void) {
    double a = 0, b = 0;
    char op = ' ';
    printf("Calcul (ex : 12 / 4) : ");
    scanf("%lf %c %lf", &a, &op, &b);

    switch (op) {
        case '+': printf("= %.2f\n", a + b); break;
        case '-': printf("= %.2f\n", a - b); break;
        case '*': printf("= %.2f\n", a * b); break;
        case '/':
            if (b == 0) {
                printf("Division par zero impossible\n");
            } else {
                printf("= %.2f\n", a / b);
            }
            break;
        default: printf("Operateur inconnu\n");
    }
    return 0;
}
```

## Pour aller plus loin

- Compile avec `-Wall -Wextra` et provoque volontairement l'erreur `if (n = 0)` : lis l'avertissement du compilateur.
- Dessine l'**organigramme** (logigramme) de l'exercice sur l'année bissextile : losange pour chaque condition, rectangle pour chaque action.
- Cours suivant : « Langage C : les boucles ».
