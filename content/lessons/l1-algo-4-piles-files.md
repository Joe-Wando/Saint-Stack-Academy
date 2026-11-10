---
slug: l1-algo-4-piles-files
titre: "Les piles et les files"
domaine: Programmation
duree: 120
difficulte: opérationnel
licence:
  - { niveau: L1, semestre: S2, ue: "Algorithmique et modélisation" }
ordre: 4
prerequis_cours: [l1-algo-3-listes-chainees]
visibilite: public
objectifs:
  - Définir une pile (LIFO) et une file (FIFO) par leurs opérations
  - Programmer une pile avec un tableau, puis avec une liste chaînée
  - Programmer une file avec un tableau circulaire
  - Reconnaître les situations qui demandent une pile ou une file
  - Résoudre le problème du parenthésage avec une pile
prerequis:
  - Structures, pointeurs et listes chaînées
referentiels:
  - ACM/IEEE CS2023, domaine « Algorithmic Foundations » (types abstraits de données)
  - T. H. Cormen et al., « Introduction to Algorithms », section 10.1
quiz:
  - question: "Dans une pile, quel élément retire-t-on en premier ?"
    choix: ["Le premier ajouté", "Le dernier ajouté", "Le plus petit", "Un élément au hasard"]
    reponse: 1
    explication: "LIFO : Last In, First Out, comme une pile d'assiettes."
  - question: "Quelle structure modélise une file d'attente au guichet ?"
    choix: ["Une pile", "Une file (FIFO)", "Un arbre", "Un tableau trié"]
    reponse: 1
    explication: "FIFO : First In, First Out. Le premier arrivé est le premier servi."
  - question: "Quelle fonctionnalité d'un éditeur de texte s'appuie naturellement sur une pile ?"
    choix: ["L'impression", "L'annulation (Ctrl + Z)", "La correction orthographique", "Le copier"]
    reponse: 1
    explication: "Chaque action est empilée ; annuler dépile la dernière action réalisée."
  - question: "Pourquoi utiliser un tableau circulaire pour une file ?"
    choix: ["Pour trier les éléments", "Pour réutiliser les cases libérées au début du tableau sans décaler les éléments", "Pour doubler la taille", "C'est obligatoire en C"]
    reponse: 1
    explication: "Les indices de début et de fin avancent modulo la capacité : chaque opération se fait en temps constant."
  - question: "Avec une pile, l'expression ( [ ) ] est-elle bien parenthésée ?"
    choix: ["Oui", "Non : quand on lit ), le sommet de la pile est [, qui ne correspond pas", "Cela dépend du langage", "Oui, car il y a autant d'ouvrantes que de fermantes"]
    reponse: 1
    explication: "Compter ne suffit pas : l'ordre de fermeture doit être l'inverse de l'ordre d'ouverture."
---

## L'idée

Certaines situations imposent un **ordre** de traitement :

- une **pile** d'assiettes : on pose et on reprend toujours celle du **dessus**. Le dernier arrivé est le premier sorti : **LIFO** (*Last In, First Out*) ;
- une **file** d'attente au guichet de la banque : le **premier arrivé** est le premier servi : **FIFO** (*First In, First Out*).

Ce sont des **types abstraits de données** : on les définit par leurs **opérations**, pas par leur implémentation. On peut les programmer avec un tableau ou avec une liste chaînée ; le code qui les utilise ne voit pas la différence.

## La pile : opérations

| Opération | Rôle |
|---|---|
| `empiler(p, x)` (*push*) | ajoute x au sommet |
| `depiler(p)` (*pop*) | retire et renvoie le sommet |
| `sommet(p)` (*peek*) | renvoie le sommet sans le retirer |
| `est_vide(p)` | indique si la pile est vide |

Toutes ces opérations se font en **temps constant**, O(1).

Les piles sont partout :

- la **pile d'appels** du processeur : chaque appel de fonction empile ses variables locales, et le `return` les dépile. C'est elle qui déborde en cas de récursion infinie ;
- l'**annulation** (Ctrl + Z) dans les éditeurs ;
- le bouton **Précédent** du navigateur ;
- l'évaluation des **expressions** et la vérification des **parenthèses** par les compilateurs.

## Une pile avec un tableau

```c
#define CAPACITE 100

typedef struct {
    int elements[CAPACITE];
    int taille;              /* nombre d'éléments ; le sommet est en taille - 1 */
} Pile;

void pile_init(Pile *p) {
    p->taille = 0;
}

int pile_vide(const Pile *p) {
    return p->taille == 0;
}

int empiler(Pile *p, int x) {
    if (p->taille == CAPACITE) {
        return 0;            /* pile pleine */
    }
    p->elements[p->taille] = x;
    p->taille++;
    return 1;
}

int depiler(Pile *p, int *x) {
    if (pile_vide(p)) {
        return 0;            /* pile vide : rien à dépiler */
    }
    p->taille--;
    *x = p->elements[p->taille];
    return 1;
}
```

`depiler` renvoie 1 ou 0 pour indiquer le succès, et transmet la valeur par adresse : c'est une convention fréquente en C.

## Une pile avec une liste chaînée

Avec une liste chaînée, la pile n'a plus de capacité maximale : **empiler** revient à insérer en tête, **dépiler** à supprimer la tête.

```c
typedef struct Maillon {
    int valeur;
    struct Maillon *suivant;
} Maillon;

int empiler_liste(Maillon **sommet, int x) {
    Maillon *m = malloc(sizeof(Maillon));
    if (m == NULL) {
        return 0;
    }
    m->valeur = x;
    m->suivant = *sommet;
    *sommet = m;
    return 1;
}

int depiler_liste(Maillon **sommet, int *x) {
    if (*sommet == NULL) {
        return 0;
    }
    Maillon *ancien = *sommet;
    *x = ancien->valeur;
    *sommet = ancien->suivant;
    free(ancien);
    return 1;
}
```

## La file : opérations

| Opération | Rôle |
|---|---|
| `enfiler(f, x)` (*enqueue*) | ajoute x à la fin |
| `defiler(f)` (*dequeue*) | retire et renvoie l'élément du début |
| `premier(f)` | renvoie le premier sans le retirer |
| `est_vide(f)` | indique si la file est vide |

Les files sont partout aussi :

- la **file d'impression** ;
- les **requêtes** reçues par un serveur web, traitées dans l'ordre d'arrivée ;
- les **messages** entre services (RabbitMQ, Kafka, que tu verras en L3) ;
- le **parcours en largeur** d'un graphe, par exemple pour trouver le plus court chemin dans un labyrinthe.

## Une file avec un tableau circulaire

Avec un tableau simple, défiler obligerait à décaler tous les éléments. On garde plutôt l'indice du **début**, et l'on fait « tourner » les indices **modulo la capacité** :

```c
typedef struct {
    int elements[CAPACITE];
    int debut;               /* indice du premier élément */
    int taille;
} File;

void file_init(File *f) {
    f->debut = 0;
    f->taille = 0;
}

int enfiler(File *f, int x) {
    if (f->taille == CAPACITE) {
        return 0;
    }
    int fin = (f->debut + f->taille) % CAPACITE;
    f->elements[fin] = x;
    f->taille++;
    return 1;
}

int defiler(File *f, int *x) {
    if (f->taille == 0) {
        return 0;
    }
    *x = f->elements[f->debut];
    f->debut = (f->debut + 1) % CAPACITE;
    f->taille--;
    return 1;
}
```

```text
capacité 5, après plusieurs opérations :
indices   0    1    2    3    4
        [ 40 | 50 |    | 20 | 30 ]
                       ^debut
ordre de sortie : 20, 30, 40, 50
```

Quand l'indice atteint la fin du tableau, le modulo le ramène à 0 : on réutilise les cases libérées. Tu retrouves ici l'arithmétique modulaire du cours de mathématiques.

## Application : vérifier les parenthèses

Un compilateur doit vérifier que `{ [ ( ) ] }` est correct, mais pas `( [ ) ]`. Algorithme :

1. On lit les caractères un par un.
2. Un symbole **ouvrant** `( [ {` : on l'**empile**.
3. Un symbole **fermant** : la pile ne doit pas être vide, et le sommet doit être l'ouvrant correspondant ; on le dépile.
4. À la fin, la pile doit être **vide**.

```c
int bien_parenthese(const char *s) {
    char pile[256];
    int taille = 0;
    for (int i = 0; s[i] != '\0'; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') {
            if (taille == 256) {
                return 0;
            }
            pile[taille++] = c;
        } else if (c == ')' || c == ']' || c == '}') {
            if (taille == 0) {
                return 0;
            }
            char ouvrant = pile[--taille];
            if ((c == ')' && ouvrant != '(') || (c == ']' && ouvrant != '[') || (c == '}' && ouvrant != '{')) {
                return 0;
            }
        }
    }
    return taille == 0;
}
```

## Démonstration

On simule le guichet d'une agence : des clients arrivent (on enfile leur numéro), le guichetier appelle le suivant (on défile). En parallèle, on empile les actions d'un mini-éditeur (« écrire A », « écrire B », « supprimer ») et on les annule une à une. On observe l'ordre de sortie dans les deux cas.

## Exercice guidé

1. Empile 1, 2, 3, 4, puis dépile tout en affichant les valeurs. Quel ordre obtiens-tu ?
2. Enfile 1, 2, 3, 4, puis défile tout. Quel ordre obtiens-tu ?
3. Utilise une pile pour afficher un mot à l'envers.

## Exercice autonome

1. Teste `bien_parenthese` sur : `"(a + b) * [c - d]"`, `"{ [ ( ) ] }"`, `"( [ ) ]"`, `"(("` et `")("`.
2. Programme l'évaluation d'une expression en **notation polonaise inverse** (les opérateurs après les nombres) : `3 4 + 2 *` vaut (3 + 4) × 2 = 14. Indice : un nombre est empilé ; un opérateur dépile deux nombres et empile le résultat.
3. Programme une file d'attente de patients : enfiler un nom, appeler le suivant, afficher la file.

## Correction

Exercice guidé : la pile rend **4, 3, 2, 1** (ordre inverse) ; la file rend **1, 2, 3, 4** (même ordre). Pour inverser un mot, on empile chaque lettre, puis on dépile tout.

Exercice autonome, question 1 : correct, correct, **incorrect** (le `)` rencontre `[` au sommet), **incorrect** (la pile n'est pas vide à la fin), **incorrect** (on rencontre `)` alors que la pile est vide).

Question 2, avec des nombres d'un seul chiffre séparés par des espaces :

```c
int evaluer_npi(const char *s, int *resultat) {
    Pile p;
    pile_init(&p);
    for (int i = 0; s[i] != '\0'; i++) {
        char c = s[i];
        if (c >= '0' && c <= '9') {
            empiler(&p, c - '0');
        } else if (c == '+' || c == '-' || c == '*' || c == '/') {
            int b, a;
            if (!depiler(&p, &b) || !depiler(&p, &a)) {
                return 0;                       /* expression mal formée */
            }
            int r = (c == '+') ? a + b : (c == '-') ? a - b : (c == '*') ? a * b : a / b;
            empiler(&p, r);
        }
    }
    return depiler(&p, resultat) && pile_vide(&p);
}
```

Attention à l'ordre : le premier nombre dépilé est l'opérande de **droite**. Pour `8 2 -`, on dépile 2 puis 8, et l'on calcule 8 − 2.

## Pour aller plus loin

- Visualise piles et files sur visualgo.net (rubrique *Stack/Queue*).
- Python fournit `list` pour les piles et `collections.deque` pour les files ; Java fournit `ArrayDeque`.
- Cours suivant : « Merise : modéliser les données ».
