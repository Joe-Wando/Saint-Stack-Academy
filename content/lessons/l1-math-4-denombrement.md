---
slug: l1-math-4-denombrement
titre: "Dénombrement et combinatoire"
domaine: Mathématiques
duree: 120
difficulte: bases
licence:
  - { niveau: L1, semestre: S1, ue: "Mathématiques pour l'informatique 1" }
ordre: 4
prerequis_cours: [l1-math-1-logique-ensembles]
visibilite: public
objectifs:
  - Appliquer le principe additif et le principe multiplicatif
  - Distinguer arrangements, permutations et combinaisons, avec ou sans répétition
  - Calculer n!, A(n, k) et C(n, k), et utiliser le triangle de Pascal
  - Utiliser le principe des tiroirs
  - Estimer la taille d'un espace de recherche (mots de passe, adresses, tests)
prerequis:
  - Les ensembles, le cardinal et le produit cartésien
  - Les puissances
referentiels:
  - ACM/IEEE CS2023, domaine « Mathematical and Statistical Foundations » (dénombrement)
  - K. H. Rosen, « Discrete Mathematics and Its Applications », chapitre 6
quiz:
  - question: "Combien de codes PIN à 4 chiffres existe-t-il ?"
    choix: ["40", "24", "5040", "10 000"]
    reponse: 3
    explication: "4 positions, 10 choix chacune, répétitions autorisées : 10⁴ = 10 000."
  - question: "De combien de façons peut-on ranger 5 livres différents sur une étagère ?"
    choix: ["25", "120", "5", "3125"]
    reponse: 1
    explication: "C'est une permutation : 5! = 5 × 4 × 3 × 2 × 1 = 120."
  - question: "Combien de binômes différents peut-on former dans un groupe de 10 étudiants ?"
    choix: ["20", "45", "90", "100"]
    reponse: 1
    explication: "L'ordre ne compte pas : C(10, 2) = 10 × 9 / 2 = 45."
  - question: "Quelle situation correspond à un arrangement, et non à une combinaison ?"
    choix: ["Choisir 3 délégués sans rôle", "Attribuer les postes de président, trésorier et secrétaire à 3 personnes parmi 20", "Choisir 3 cours parmi 10", "Tirer 3 cartes ensemble"]
    reponse: 1
    explication: "Les rôles sont différents : l'ordre compte. A(20, 3) = 20 × 19 × 18 = 6840."
  - question: "Dans un groupe de 367 personnes, peut-on être certain que deux sont nées le même jour de l'année ?"
    choix: ["Non, jamais", "Oui, d'après le principe des tiroirs, car il n'y a que 366 jours possibles", "Seulement si l'année est bissextile", "Il faut au moins 1000 personnes"]
    reponse: 1
    explication: "367 personnes pour 366 « tiroirs » : au moins un tiroir contient deux personnes."
---

## L'idée

**Dénombrer**, c'est compter sans tout énumérer. Combien de mots de passe possibles ? Combien de tests faut-il pour couvrir toutes les combinaisons d'options ? Combien d'adresses IP dans un réseau ? Combien de temps un algorithme mettra-t-il à essayer toutes les possibilités ?

Ces questions ont une réponse précise, et quelques règles suffisent pour la trouver. C'est aussi la base des **probabilités** et de l'analyse de la **complexité** des algorithmes.

## Le principe additif

Si un choix se fait **soit** dans un ensemble A **soit** dans un ensemble B, sans élément commun, le nombre total de choix est **|A| + |B|**.

Exemple : un étudiant choisit un projet parmi 5 projets web **ou** 3 projets data. Il a 5 + 3 = **8** choix.

Si les ensembles ont des éléments communs, on retire l'intersection : |A ∪ B| = |A| + |B| − |A ∩ B|.

## Le principe multiplicatif

Si un choix se fait en **plusieurs étapes successives** (une étape **puis** une autre), avec n₁ possibilités pour la première, n₂ pour la deuxième, etc., le nombre total est **n₁ × n₂ × ...**

Exemple : un menu propose 3 entrées, 4 plats et 2 desserts. Il y a 3 × 4 × 2 = **24** menus différents.

Règle mnémotechnique : « **ou** » s'additionne, « **et puis** » se multiplie.

## Les listes avec répétition

Si l'on choisit **k** éléments parmi **n**, dans un **ordre** donné, et que les **répétitions** sont autorisées, le nombre de possibilités est :

**nᵏ**

- Codes PIN à 4 chiffres : 10⁴ = 10 000.
- Nombres binaires de 8 bits : 2⁸ = 256.
- Mots de passe de 8 caractères choisis parmi 62 (26 minuscules, 26 majuscules, 10 chiffres) : 62⁸ ≈ 2,18 × 10¹⁴.

## Les permutations et la factorielle

Une **permutation** est une façon d'**ordonner** n éléments distincts. Il y en a :

**n! = n × (n − 1) × ... × 2 × 1** (lire « factorielle n »)

Par convention, 0! = 1.

| n | 1 | 2 | 3 | 4 | 5 | 6 | 10 |
|---|---|---|---|---|---|---|---|
| n! | 1 | 2 | 6 | 24 | 120 | 720 | 3 628 800 |

La factorielle grandit **extrêmement vite**. Le problème du voyageur de commerce (trouver le plus court trajet passant par n villes) a (n − 1)!/2 trajets possibles : pour 20 villes, c'est environ 6 × 10¹⁶. Les tester tous est impossible en pratique.

## Les arrangements

Un **arrangement** est une liste **ordonnée** de k éléments distincts choisis parmi n, **sans répétition**. Leur nombre est :

**A(n, k) = n × (n − 1) × ... × (n − k + 1) = n! / (n − k)!**

Exemple : dans une course de 8 coureurs, combien de podiums (or, argent, bronze) différents ? A(8, 3) = 8 × 7 × 6 = **336**.

## Les combinaisons

Une **combinaison** est un **sous-ensemble** de k éléments choisis parmi n : l'**ordre ne compte pas**. Leur nombre se note C(n, k), ou (n k) en colonne, et se lit « k parmi n » :

**C(n, k) = n! / (k! × (n − k)!) = A(n, k) / k!**

On divise par k!, car chaque groupe de k éléments a été compté k! fois dans les arrangements, une fois pour chaque ordre.

Exemple : choisir 3 délégués parmi 8 étudiants : C(8, 3) = 336 / 6 = **56**.

Propriétés utiles :
- C(n, 0) = C(n, n) = 1 ;
- C(n, k) = C(n, n − k) : choisir les k qu'on garde revient à choisir les n − k qu'on écarte ;
- C(n, 2) = n(n − 1) / 2 : le nombre de paires, par exemple de poignées de main ou de liaisons entre n ordinateurs reliés deux à deux.

## Le triangle de Pascal

Les combinaisons vérifient la **formule de Pascal** : C(n, k) = C(n − 1, k − 1) + C(n − 1, k).

| n | |
|---|---|
| 0 | 1 |
| 1 | 1 1 |
| 2 | 1 2 1 |
| 3 | 1 3 3 1 |
| 4 | 1 4 6 4 1 |
| 5 | 1 5 10 10 5 1 |

Chaque nombre est la somme des deux nombres au-dessus de lui. La ligne n donne les C(n, k). La somme de la ligne n vaut 2ⁿ : c'est le nombre total de sous-ensembles d'un ensemble à n éléments.

## Bien choisir sa formule

| L'ordre compte ? | Répétitions ? | Formule | Exemple |
|---|---|---|---|
| Oui | Oui | nᵏ | Code PIN |
| Oui | Non | A(n, k) | Podium, postes différents |
| Oui, tous les éléments | Non | n! | Ranger n livres |
| Non | Non | C(n, k) | Groupe de délégués, main de cartes |

Pose-toi toujours deux questions : « si j'échange deux éléments, est-ce un résultat différent ? » et « peut-on reprendre le même élément ? ».

## Le principe des tiroirs

Si l'on range **n + 1 objets** dans **n tiroirs**, au moins un tiroir contient **deux objets**. Plus généralement, avec N objets dans n tiroirs, un tiroir en contient au moins ⌈N / n⌉ (N / n arrondi à l'entier supérieur).

Ce principe simple a des conséquences fortes : une fonction de hachage qui produit des empreintes de 256 bits sur des fichiers de taille quelconque a forcément des **collisions**, deux fichiers différents ayant la même empreinte. Toute la question est de les rendre impossibles à trouver en pratique.

## Démonstration

```python
from math import factorial, perm, comb

print(10 ** 4)            # codes PIN : 10000
print(factorial(5))       # 120
print(perm(8, 3))         # arrangements : 336
print(comb(8, 3))         # combinaisons : 56
print([comb(5, k) for k in range(6)])   # [1, 5, 10, 10, 5, 1]

# Temps pour essayer tous les mots de passe de 8 caractères
# à 10 milliards d'essais par seconde
essais = 62 ** 8
print(essais / 1e10 / 3600, "heures")   # environ 6 heures
```

Avec 12 caractères, on passe à plus de 10 000 ans : chaque caractère supplémentaire multiplie le temps par 62. C'est pourquoi la **longueur** d'un mot de passe compte plus que sa complexité.

## Exercice guidé

1. Combien de plaques d'immatriculation de la forme 2 lettres, 4 chiffres, 2 lettres (par exemple AA-1234-BC) peut-on former ?
2. Combien de matchs se jouent dans un championnat de 16 équipes où chaque équipe rencontre chaque autre une seule fois ? Et en matchs aller-retour ?
3. Combien de mots (même sans signification) peut-on écrire avec toutes les lettres du mot « DAKAR » ? Attention, le A apparaît deux fois.

## Exercice autonome

1. Un formulaire a 5 cases à cocher indépendantes. Combien de combinaisons de réponses faut-il tester pour les couvrir toutes ?
2. Un comité de 4 personnes est choisi parmi 6 femmes et 5 hommes. Combien de comités comptent exactement 2 femmes ? Combien comptent au moins une femme ?
3. Un réseau compte 10 ordinateurs. Combien de câbles faut-il pour relier chaque ordinateur directement à chacun des autres (topologie maillée) ?
4. Montre avec le principe des tiroirs que, parmi 13 personnes, deux au moins sont nées le même mois.

## Correction

Exercice guidé :

1. 26 × 26 × 10⁴ × 26 × 26 = 26⁴ × 10⁴ = 456 976 × 10 000 ≈ **4,57 milliards**.
2. C(16, 2) = 16 × 15 / 2 = **120 matchs** ; en aller-retour, l'ordre compte (domicile et extérieur) : A(16, 2) = **240**.
3. Si les 5 lettres étaient différentes, on aurait 5! = 120 mots. Les deux A sont identiques : échanger les deux A ne crée pas de nouveau mot, donc on divise par 2! : **60 mots**.

Exercice autonome :

1. Chaque case est cochée ou non : 2⁵ = **32** combinaisons.
2. Exactement 2 femmes : C(6, 2) × C(5, 2) = 15 × 10 = **150**. Au moins une femme : tous les comités moins ceux sans femme, soit C(11, 4) − C(5, 4) = 330 − 5 = **325**.
3. C(10, 2) = **45 câbles**. C'est pourquoi les grands réseaux utilisent plutôt un commutateur central (topologie en étoile).
4. 13 personnes (objets) et 12 mois (tiroirs) : au moins un mois contient deux personnes.

## Pour aller plus loin

- Ce cours prépare aux **probabilités** : une probabilité se calcule souvent comme nombre de cas favorables divisé par nombre de cas possibles.
- Le paradoxe des anniversaires : dans un groupe de 23 personnes seulement, la probabilité que deux aient le même anniversaire dépasse 50 %.
- Fin de l'UE « Mathématiques pour l'informatique 1 ». Refais le quiz de chaque cours avant l'examen.
