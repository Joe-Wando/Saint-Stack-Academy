---
slug: l1-algo-2-structures
titre: "Langage C : les structures"
domaine: Programmation
duree: 120
difficulte: bases
licence:
  - { niveau: L1, semestre: S2, ue: "Algorithmique et modélisation" }
ordre: 2
prerequis_cours: [l1-algo-1-pointeurs-memoire]
visibilite: public
objectifs:
  - Définir un type structuré avec struct et typedef
  - Accéder aux champs avec . et avec -> à travers un pointeur
  - Passer des structures aux fonctions, par valeur ou par adresse
  - Manipuler un tableau de structures (recherche, tri, statistiques)
  - Enregistrer et relire des structures dans un fichier texte
prerequis:
  - Pointeurs et passage par adresse
referentiels:
  - ISO/IEC 9899 (C11), structures et entrées-sorties sur fichiers
  - ACM/IEEE CS2023, domaine « Software Development Fundamentals » (types composés)
  - C++ Institute, « C Advanced » (CLP), module « Structures »
quiz:
  - question: "Comment accède-t-on au champ moyenne d'une variable etudiant e ?"
    choix: ["e->moyenne", "e.moyenne", "e[moyenne]", "moyenne(e)"]
    reponse: 1
    explication: "Le point accède au champ d'une structure. La flèche s'utilise avec un pointeur sur une structure."
  - question: "Si p est un pointeur sur une structure, à quoi équivaut p->nom ?"
    choix: ["*p.nom", "(*p).nom", "&p.nom", "p.nom"]
    reponse: 1
    explication: "La flèche est un raccourci de (*p).nom. Les parenthèses sont nécessaires, car le point est prioritaire sur l'étoile."
  - question: "Pourquoi passer une grande structure à une fonction par adresse (const Etudiant *e) ?"
    choix: ["Pour la rendre plus petite", "Pour éviter de copier toute la structure, et, sans const, pour pouvoir la modifier", "Parce que c'est obligatoire", "Pour la supprimer"]
    reponse: 1
    explication: "Le passage par valeur copie tous les champs. const indique qu'on ne la modifiera pas."
  - question: "À quoi sert typedef dans typedef struct { ... } Etudiant; ?"
    choix: ["À créer une variable", "À donner un nom court au type, pour écrire Etudiant e; au lieu de struct etudiant e;", "À allouer de la mémoire", "À trier"]
    reponse: 1
    explication: "typedef crée un alias de type, plus lisible."
  - question: "Que faut-il toujours vérifier après fopen ?"
    choix: ["La taille du fichier", "Que le pointeur renvoyé n'est pas NULL : le fichier a peut-être pu ne pas s'ouvrir", "La date", "Rien"]
    reponse: 1
    explication: "Fichier inexistant, dossier introuvable, droits insuffisants : fopen renvoie alors NULL."
---

## L'idée

Un étudiant a un nom, un matricule, un âge et une moyenne. Avec ce que l'on sait déjà, il faudrait quatre tableaux séparés : `noms`, `matricules`, `ages`, `moyennes`, que l'on doit garder synchronisés. Au moindre tri, c'est le désordre.

Une **structure** regroupe plusieurs informations de types différents sous un seul nom. C'est un **nouveau type**, créé par toi, adapté à ton problème. C'est l'ancêtre des **objets** que tu verras en Java, et l'équivalent d'une **ligne** dans une table de base de données.

## Définir une structure

```c
typedef struct {
    char matricule[12];
    char nom[50];
    int age;
    double moyenne;
} Etudiant;
```

- Chaque élément est un **champ** (ou membre), avec son type.
- `typedef` donne au type le nom court `Etudiant`. Par convention, on lui met une majuscule.
- La définition se place en haut du fichier, ou dans un fichier `.h`.

## Créer et utiliser une variable structurée

```c
Etudiant e = {"DIT-2026-01", "Awa Diop", 19, 14.5};

printf("%s a %d ans\n", e.nom, e.age);
e.moyenne = 15.25;                       /* modifier un champ */
strcpy(e.nom, "Awa Diop Ndiaye");        /* pour une chaîne : strcpy */
```

On accède à un champ avec le **point** : `variable.champ`.

On peut **copier** une structure entière avec `=` : `Etudiant copie = e;` copie tous les champs, y compris les tableaux de caractères. En revanche, on ne peut pas comparer deux structures avec `==` : il faut comparer champ par champ.

## Les structures imbriquées

Un champ peut lui-même être une structure :

```c
typedef struct {
    int jour, mois, annee;
} Date;

typedef struct {
    char nom[50];
    Date naissance;
} Personne;

Personne p = {"Moussa Sarr", {12, 4, 2006}};
printf("Ne en %d\n", p.naissance.annee);
```

## Pointeurs sur structure et opérateur ->

Quand on manipule une structure à travers un pointeur, on utilise la **flèche** :

```c
Etudiant *pe = &e;
printf("%s\n", pe->nom);      /* équivaut à (*pe).nom */
pe->moyenne += 1;
```

## Structures et fonctions

**Par valeur** : la fonction reçoit une copie. Simple, mais la copie coûte cher pour une grande structure, et les modifications sont perdues.

**Par adresse** : la fonction reçoit un pointeur. Pas de copie, et la fonction peut modifier la structure. Avec `const`, on garantit qu'elle ne la modifiera pas.

```c
void afficher(const Etudiant *e) {
    printf("%-12s %-20s %3d ans  %5.2f\n", e->matricule, e->nom, e->age, e->moyenne);
}

void ajouter_bonus(Etudiant *e, double bonus) {
    e->moyenne += bonus;
    if (e->moyenne > 20) {
        e->moyenne = 20;
    }
}
```

Dans `printf`, `%-20s` aligne le texte à gauche sur 20 caractères : pratique pour afficher un tableau propre.

## Les tableaux de structures

```c
#define MAX 100

Etudiant promo[MAX];
int nb = 0;

promo[nb] = (Etudiant) {"DIT-01", "Awa Diop", 19, 14.5};
nb++;

double somme = 0;
for (int i = 0; i < nb; i++) {
    somme += promo[i].moyenne;
}
```

Pour **trier** un tableau de structures, on compare un champ, mais on échange **les structures entières** :

```c
void trier_par_moyenne(Etudiant t[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int imax = i;
        for (int j = i + 1; j < n; j++) {
            if (t[j].moyenne > t[imax].moyenne) {
                imax = j;
            }
        }
        Etudiant tmp = t[i];
        t[i] = t[imax];
        t[imax] = tmp;
    }
}
```

Tous les champs suivent : on ne risque plus de mélanger les noms et les notes.

## Enregistrer dans un fichier

Les données d'un programme disparaissent quand il s'arrête. Pour les garder, on les écrit dans un **fichier** :

```c
int sauvegarder(const char *chemin, const Etudiant t[], int n) {
    FILE *f = fopen(chemin, "w");     /* "w" : écriture, écrase le fichier */
    if (f == NULL) {
        return 0;
    }
    for (int i = 0; i < n; i++) {
        fprintf(f, "%s;%s;%d;%.2f\n", t[i].matricule, t[i].nom, t[i].age, t[i].moyenne);
    }
    fclose(f);
    return 1;
}

int charger(const char *chemin, Etudiant t[], int max) {
    FILE *f = fopen(chemin, "r");     /* "r" : lecture */
    if (f == NULL) {
        return 0;
    }
    int n = 0;
    while (n < max && fscanf(f, " %11[^;];%49[^;];%d;%lf", t[n].matricule, t[n].nom, &t[n].age, &t[n].moyenne) == 4) {
        n++;
    }
    fclose(f);
    return n;
}
```

- Le fichier produit est au format **CSV** (valeurs séparées par `;`), lisible dans un tableur.
- `%49[^;]` lit jusqu'à 49 caractères qui ne sont pas un `;` : cela permet les espaces dans le nom, et protège contre le débordement.
- `fscanf` renvoie le nombre de champs lus : on s'arrête dès qu'il ne vaut plus 4.
- On ferme toujours le fichier avec `fclose`.

## Démonstration

On assemble un mini-programme de gestion de promotion : un menu (ajouter, afficher, trier, sauvegarder, quitter) avec `do while` et `switch`, un tableau de structures, et la sauvegarde dans `promo.csv`. On ouvre ensuite le fichier CSV dans un tableur : les données sont bien là.

## Exercice guidé

1. Définis une structure `Produit` : code (chaîne de 10), libellé (chaîne de 40), prix en FCFA (int), quantité en stock (int).
2. Crée un tableau de 4 produits initialisé dans le code.
3. Écris `void afficher_produit(const Produit *p)` et affiche le stock.
4. Écris `int valeur_stock(const Produit t[], int n)`, qui renvoie la somme de prix × quantité.

## Exercice autonome

1. Écris `int rechercher_code(const Produit t[], int n, const char *code)`, qui renvoie l'indice du produit ou −1.
2. Écris `void vendre(Produit *p, int quantite)`, qui diminue le stock, mais refuse une vente supérieure au stock disponible (affiche un message).
3. Ajoute la sauvegarde et le chargement du stock dans un fichier `stock.csv`.

## Correction

Exercice guidé :

```c
typedef struct {
    char code[10];
    char libelle[40];
    int prix;
    int quantite;
} Produit;

Produit stock[4] = {
    {"P01", "Cle USB 32 Go", 5000, 20},
    {"P02", "Souris sans fil", 7500, 12},
    {"P03", "Cable HDMI", 3000, 30},
    {"P04", "Casque audio", 15000, 5}
};

void afficher_produit(const Produit *p) {
    printf("%-5s %-20s %7d FCFA  stock : %d\n", p->code, p->libelle, p->prix, p->quantite);
}

int valeur_stock(const Produit t[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += t[i].prix * t[i].quantite;
    }
    return total;
}
```

Valeur du stock : 100 000 + 90 000 + 90 000 + 75 000 = **355 000 FCFA**.

Exercice autonome :

```c
int rechercher_code(const Produit t[], int n, const char *code) {
    for (int i = 0; i < n; i++) {
        if (strcmp(t[i].code, code) == 0) {
            return i;
        }
    }
    return -1;
}

void vendre(Produit *p, int quantite) {
    if (quantite <= 0 || quantite > p->quantite) {
        printf("Vente impossible : stock disponible %d\n", p->quantite);
        return;
    }
    p->quantite -= quantite;
}
```

`vendre` reçoit un pointeur : la modification du stock est bien conservée dans le tableau.

## Pour aller plus loin

- Les **unions** et les **énumérations** (`enum`) complètent les structures : `enum Niveau { L1, L2, L3 };`.
- Avec les structures et les pointeurs, on peut maintenant construire des structures de données qui grandissent à la demande.
- Cours suivant : « Les listes chaînées ».
