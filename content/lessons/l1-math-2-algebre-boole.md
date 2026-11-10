---
slug: l1-math-2-algebre-boole
titre: "Algèbre de Boole et circuits logiques"
domaine: Mathématiques
duree: 120
difficulte: bases
licence:
  - { niveau: L1, semestre: S1, ue: "Mathématiques pour l'informatique 1" }
  - { niveau: L1, semestre: S1, ue: "Architecture des ordinateurs et maintenance" }
ordre: 2
prerequis_cours: [l1-math-1-logique-ensembles]
visibilite: public
objectifs:
  - Écrire une fonction booléenne avec les notations +, · et le complément
  - Simplifier une expression avec les lois de l'algèbre de Boole
  - Construire une table de vérité et en déduire une expression (forme somme de produits)
  - Simplifier une fonction de 3 ou 4 variables avec un tableau de Karnaugh
  - Représenter une fonction par un circuit de portes logiques (ET, OU, NON, NAND, XOR)
prerequis:
  - Les connecteurs logiques et leurs tables de vérité
  - Le binaire
referentiels:
  - ACM/IEEE CS2023, domaine « Architecture and Organization » (logique numérique)
  - M. Morris Mano, « Digital Design », chapitres 2 et 3
quiz:
  - question: "Que vaut A + A·B en algèbre de Boole ?"
    choix: ["A·B", "A", "B", "1"]
    reponse: 1
    explication: "Loi d'absorption : A + A·B = A·(1 + B) = A·1 = A."
  - question: "Que vaut A + 1 ?"
    choix: ["A", "0", "1", "2"]
    reponse: 2
    explication: "Le OU avec 1 vaut toujours 1. En algèbre de Boole, + n'est pas l'addition ordinaire."
  - question: "Quelle porte donne 1 seulement si ses deux entrées sont différentes ?"
    choix: ["ET", "OU", "XOR (OU exclusif)", "NAND"]
    reponse: 2
    explication: "A ⊕ B = 1 si A ≠ B. C'est la base de l'addition binaire : 1 + 1 donne 0, avec une retenue."
  - question: "Pourquoi dit-on que la porte NAND est universelle ?"
    choix: ["Elle est la plus rapide", "On peut construire NON, ET et OU uniquement avec des NAND", "Elle a trois entrées", "Elle ne consomme pas de courant"]
    reponse: 1
    explication: "NON A = A NAND A ; A·B = NON(A NAND B) ; et A + B s'obtient avec De Morgan. Toute fonction logique est donc réalisable."
  - question: "Dans un tableau de Karnaugh, pourquoi les colonnes sont-elles ordonnées 00, 01, 11, 10 ?"
    choix: ["Par habitude", "Pour que deux cases voisines ne diffèrent que d'un seul bit (code de Gray), ce qui permet de regrouper les 1", "Pour aller plus vite", "C'est l'ordre décimal"]
    reponse: 1
    explication: "Deux cases adjacentes diffèrent d'une seule variable : en les regroupant, cette variable disparaît de l'expression."
---

## L'idée

En 1854, le mathématicien anglais George Boole invente un calcul où les variables ne valent que **0 ou 1**. Près d'un siècle plus tard, Claude Shannon montre que ce calcul décrit exactement les **circuits électriques** à interrupteurs. Depuis, chaque processeur est conçu avec l'algèbre de Boole : additionner deux nombres, comparer, stocker un bit, tout se réduit à des portes logiques.

Simplifier une expression booléenne, c'est aussi simplifier un circuit : moins de transistors, moins de chaleur, moins de coût. Et c'est simplifier tes conditions `if` en programmation.

## Les notations

| Opération | Logique | Algèbre de Boole | Porte |
|---|---|---|---|
| NON A | ¬A | Ā (A barre) ou A' | NOT |
| A ET B | A ∧ B | A · B, ou AB | AND |
| A OU B | A ∨ B | A + B | OR |
| A OU exclusif B | A ⊕ B | A ⊕ B | XOR |

Attention : **+ est un OU**, pas une addition. Ainsi 1 + 1 = 1.

## Les lois de l'algèbre de Boole

| Loi | Forme OU | Forme ET |
|---|---|---|
| Élément neutre | A + 0 = A | A · 1 = A |
| Élément absorbant | A + 1 = 1 | A · 0 = 0 |
| Idempotence | A + A = A | A · A = A |
| Complément | A + Ā = 1 | A · Ā = 0 |
| Commutativité | A + B = B + A | A · B = B · A |
| Distributivité | A · (B + C) = A·B + A·C | A + B·C = (A + B)·(A + C) |
| Absorption | A + A·B = A | A · (A + B) = A |
| De Morgan | complément de (A + B) = Ā · B̄ | complément de (A · B) = Ā + B̄ |

La seconde distributivité, A + B·C = (A + B)·(A + C), n'existe pas en algèbre ordinaire : c'est une particularité de Boole.

Une autre simplification très utile : **A + Ā·B = A + B**.

## Simplifier une expression

Exemple : F = A·B + A·B̄ + Ā·B

1. A·B + A·B̄ = A·(B + B̄) = A·1 = A, donc F = A + Ā·B.
2. A + Ā·B = A + B.

Résultat : **F = A + B**. On est passé de 3 termes et 6 littéraux à une seule porte OU.

## De la table de vérité à l'expression

Souvent, on connaît le comportement voulu (la table de vérité), et on cherche l'expression. On utilise la **somme de produits** : pour chaque ligne où F = 1, on écrit un produit (ET) des variables, avec une barre sur celles qui valent 0 ; puis on fait la somme (OU) de ces produits.

Exemple : une alarme F sonne quand **au moins deux** de trois capteurs A, B, C sont actifs (fonction **majorité**).

| A | B | C | F |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 0 |
| 0 | 1 | 0 | 0 |
| 0 | 1 | 1 | 1 |
| 1 | 0 | 0 | 0 |
| 1 | 0 | 1 | 1 |
| 1 | 1 | 0 | 1 |
| 1 | 1 | 1 | 1 |

F = Ā·B·C + A·B̄·C + A·B·C̄ + A·B·C

En simplifiant, on obtient **F = A·B + A·C + B·C**. Le tableau de Karnaugh permet de trouver ce résultat sans calcul.

## Les tableaux de Karnaugh

Un **tableau de Karnaugh** range la table de vérité dans une grille où deux cases voisines ne diffèrent que d'**un seul bit**. Pour cela, les colonnes suivent le **code de Gray** : 00, 01, 11, 10.

Fonction majorité, avec A en lignes et BC en colonnes :

| A \ BC | 00 | 01 | 11 | 10 |
|---|---|---|---|---|
| **0** | 0 | 0 | 1 | 0 |
| **1** | 0 | 1 | 1 | 1 |

Règles de regroupement :

1. On entoure les 1 par **groupes rectangulaires** de 1, 2, 4 ou 8 cases.
2. Les groupes doivent être **les plus grands possible**, et peuvent se chevaucher.
3. Les bords **se rejoignent** : la colonne 10 est voisine de la colonne 00.
4. Dans chaque groupe, on garde seulement les variables **qui ne changent pas**.

Groupes : la colonne 11 (A varie, B = 1 et C = 1) donne **B·C** ; les cases A = 1, BC = 01 et 11 donnent **A·C** ; les cases A = 1, BC = 11 et 10 donnent **A·B**. Résultat : F = A·B + A·C + B·C.

## Les portes logiques

Chaque opérateur est réalisé physiquement par une **porte**, construite avec quelques transistors.

| Porte | Fonction | Sortie à 1 quand... |
|---|---|---|
| NOT | Ā | A = 0 |
| AND | A·B | A = 1 et B = 1 |
| OR | A + B | au moins une entrée vaut 1 |
| NAND | complément de A·B | au moins une entrée vaut 0 |
| NOR | complément de A + B | les deux entrées valent 0 |
| XOR | A ⊕ B | les entrées sont différentes |

La porte **NAND** est **universelle** : on peut fabriquer toutes les autres avec elle seule. Les fabricants de puces l'apprécient, car elle est simple et peu coûteuse à réaliser.

## Application : l'additionneur

Pour additionner deux bits A et B, on obtient une **somme** S et une **retenue** R :

| A | B | S | R |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

On lit directement : **S = A ⊕ B** et **R = A · B**. Ce circuit s'appelle un **demi-additionneur**. En chaînant des **additionneurs complets**, qui tiennent compte de la retenue précédente, on additionne des nombres de 8, 32 ou 64 bits : c'est le cœur de l'UAL du processeur.

## Démonstration

On vérifie la simplification de la fonction majorité avec Python, en comparant les deux formes sur toutes les combinaisons :

```python
from itertools import product

for a, b, c in product([0, 1], repeat=3):
    longue = (not a and b and c) or (a and not b and c) or (a and b and not c) or (a and b and c)
    courte = (a and b) or (a and c) or (b and c)
    print(a, b, c, int(bool(longue)), int(bool(courte)))
```

Les deux colonnes sont identiques. Puis on construit le demi-additionneur dans un simulateur en ligne comme **Logisim Evolution** ou **CircuitVerse**.

## Exercice guidé

1. Simplifie : F = A·B + A·B·C.
2. Simplifie : G = (A + B)·(A + B̄).
3. Dresse la table de vérité de A ⊕ B, et vérifie que A ⊕ B = A·B̄ + Ā·B.

## Exercice autonome

1. Une porte de garage s'ouvre (F = 1) si l'on appuie sur la télécommande (T = 1), **ou** sur le bouton intérieur (B = 1), mais jamais si le capteur d'obstacle est actif (O = 1). Écris la table de vérité, puis l'expression simplifiée.
2. Simplifie avec un tableau de Karnaugh la fonction de trois variables qui vaut 1 pour les lignes ABC = 000, 010, 100 et 110.
3. Montre que NON A = A NAND A, et que A·B = (A NAND B) NAND (A NAND B).

## Correction

Exercice guidé :

1. F = A·B·(1 + C) = A·B.
2. G = A + B·B̄ (seconde distributivité) = A + 0 = **A**.
3. A ⊕ B vaut 0, 1, 1, 0 pour AB = 00, 01, 10, 11. A·B̄ + Ā·B donne bien les mêmes valeurs.

Exercice autonome :

1. F = (T + B)·Ō. La porte s'ouvre si (télécommande ou bouton) **et** pas d'obstacle.
2. Les 1 sont dans les colonnes BC = 00 et BC = 10, pour A = 0 et A = 1. Ces deux colonnes sont voisines par les bords : on forme un groupe de 4 cases où seul C reste constant (C = 0). Résultat : **F = C̄**.
3. A NAND A = complément de (A·A) = Ā. Et (A NAND B) NAND (A NAND B) = complément de (A NAND B) = A·B.

## Pour aller plus loin

- M. Morris Mano, « Digital Design » : le manuel de référence en logique numérique.
- Le jeu en ligne « nandgame.com » : construis un ordinateur entier à partir de portes NAND.
- Cours suivant : « Arithmétique pour l'informatique ».
