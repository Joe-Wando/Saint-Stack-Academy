---
slug: l1-math-1-logique-ensembles
titre: "Logique et ensembles"
domaine: Mathématiques
duree: 120
difficulte: découverte
licence:
  - { niveau: L1, semestre: S1, ue: "Mathématiques pour l'informatique 1" }
ordre: 1
prerequis_cours: []
visibilite: public
objectifs:
  - Reconnaître une proposition et calculer sa valeur de vérité
  - Utiliser les connecteurs non, et, ou, implique, équivaut, avec leurs tables de vérité
  - Nier correctement une proposition, y compris avec les quantificateurs
  - Manipuler les ensembles (appartenance, inclusion, union, intersection, complémentaire, produit cartésien)
  - Faire le lien entre logique, ensembles, conditions en programmation et requêtes SQL
prerequis:
  - Aucun
referentiels:
  - ACM/IEEE CS2023, domaine « Mathematical and Statistical Foundations » (logique, ensembles)
  - K. H. Rosen, « Discrete Mathematics and Its Applications », chapitres 1 et 2
quiz:
  - question: "Quelle est la négation de « il pleut et il fait froid » ?"
    choix: ["Il ne pleut pas et il ne fait pas froid", "Il ne pleut pas ou il ne fait pas froid", "Il pleut ou il fait froid", "Il fait chaud"]
    reponse: 1
    explication: "Loi de De Morgan : non (P et Q) = (non P) ou (non Q)."
  - question: "L'implication P ⇒ Q est fausse dans un seul cas. Lequel ?"
    choix: ["P faux et Q faux", "P faux et Q vrai", "P vrai et Q faux", "P vrai et Q vrai"]
    reponse: 2
    explication: "Une promesse « si P alors Q » n'est trahie que si P se réalise sans que Q suive."
  - question: "Quelle est la négation de « tous les étudiants ont un ordinateur » ?"
    choix: ["Aucun étudiant n'a d'ordinateur", "Il existe au moins un étudiant qui n'a pas d'ordinateur", "Tous les étudiants n'ont pas d'ordinateur", "Certains étudiants ont un ordinateur"]
    reponse: 1
    explication: "La négation de ∀x P(x) est ∃x non P(x). Un seul contre-exemple suffit à rendre l'affirmation fausse."
  - question: "Si A = {1, 2, 3} et B = {2, 3, 4}, que vaut A ∩ B ?"
    choix: ["{1, 2, 3, 4}", "{2, 3}", "{1}", "{1, 4}"]
    reponse: 1
    explication: "L'intersection contient les éléments communs aux deux ensembles."
  - question: "Combien d'éléments contient A × B si A a 3 éléments et B en a 4 ?"
    choix: ["7", "12", "64", "81"]
    reponse: 1
    explication: "Le produit cartésien contient tous les couples (a, b) : 3 × 4 = 12. C'est ce que produit une jointure SQL sans condition."
---

## L'idée

Un programme passe son temps à **décider** : `if (age >= 18 && inscrit)`. Une base de données passe son temps à **filtrer** des ensembles d'enregistrements : `WHERE ville = 'Dakar' OR ville = 'Thiès'`. Derrière ces deux gestes, il y a deux outils mathématiques : la **logique** et les **ensembles**.

Ce cours te donne le vocabulaire précis pour raisonner sans erreur, écrire des conditions justes, et comprendre plus tard SQL, les réseaux et les preuves d'algorithmes.

## Les propositions

Une **proposition** est un énoncé qui est soit **vrai** (V, ou 1), soit **faux** (F, ou 0).

- « 7 est un nombre premier » est une proposition vraie.
- « Dakar est la capitale du Mali » est une proposition fausse.
- « Ferme la porte » n'est pas une proposition : ce n'est ni vrai ni faux.
- « x > 3 » n'est pas une proposition tant qu'on ne connaît pas x : c'est un **prédicat**, noté P(x).

## Les connecteurs logiques

On combine des propositions P et Q avec des **connecteurs** :

| P | Q | non P (¬P) | P et Q (P ∧ Q) | P ou Q (P ∨ Q) | P ⇒ Q | P ⇔ Q |
|---|---|---|---|---|---|---|
| V | V | F | V | V | V | V |
| V | F | F | F | V | F | F |
| F | V | V | F | V | V | F |
| F | F | V | F | F | V | V |

- **Le « ou » logique est inclusif** : P ∨ Q est vrai si l'un des deux, **ou les deux**, sont vrais. Le « ou » exclusif (l'un ou l'autre, pas les deux) se note ⊕, ou XOR.
- **L'implication** P ⇒ Q (« si P, alors Q ») n'est fausse que si P est vrai et Q faux. Exemple : « si tu as 10 de moyenne, alors tu es admis ». La promesse n'est trahie que si tu as 10 sans être admis. Si tu as 8, la promesse ne dit rien : elle reste vraie, quel que soit le résultat.
- **L'équivalence** P ⇔ Q est vraie quand P et Q ont la même valeur.

En C, Java ou JavaScript : `!` pour non, `&&` pour et, `||` pour ou.

## Les lois utiles

Deux propositions sont **équivalentes** si elles ont la même table de vérité. Les plus utiles :

- **Double négation** : non (non P) = P.
- **Lois de De Morgan** :
  - non (P et Q) = (non P) ou (non Q) ;
  - non (P ou Q) = (non P) et (non Q).
- **Contraposée** : (P ⇒ Q) est équivalent à (non Q ⇒ non P).
- **Implication** : (P ⇒ Q) est équivalent à (non P ou Q).

De Morgan sert tous les jours en programmation. La boucle « continuer **tant que** la note n'est pas valide » s'écrit `while (!(note >= 0 && note <= 20))`, c'est-à-dire, d'après De Morgan, `while (note < 0 || note > 20)`.

Attention à la confusion classique entre une implication et sa **réciproque** : « s'il pleut, le sol est mouillé » est vrai, mais « si le sol est mouillé, il pleut » est faux (on a peut-être arrosé). En revanche, la **contraposée** est toujours vraie en même temps : « si le sol n'est pas mouillé, il ne pleut pas ».

## Les quantificateurs

- **∀** : « pour tout ». ∀x ∈ ℕ, x ≥ 0 signifie « tout entier naturel est positif ou nul ».
- **∃** : « il existe au moins un ». ∃x ∈ ℕ, x > 100.

Pour **nier** une phrase quantifiée, on échange ∀ et ∃, puis on nie la propriété :

| Proposition | Négation |
|---|---|
| ∀x, P(x) : « tous les serveurs répondent » | ∃x, non P(x) : « au moins un serveur ne répond pas » |
| ∃x, P(x) : « un étudiant a 20 » | ∀x, non P(x) : « aucun étudiant n'a 20 » |

Pour montrer qu'une affirmation « pour tout » est **fausse**, un seul **contre-exemple** suffit. En programmation, c'est exactement le rôle d'un **test** qui échoue.

## Les ensembles

Un **ensemble** est une collection d'objets distincts, appelés **éléments**, sans ordre.

- En extension : A = {1, 2, 3}.
- En compréhension : B = {x ∈ ℕ | x est pair et x < 10} = {0, 2, 4, 6, 8}.
- L'ensemble vide se note ∅. Le **cardinal** |A| est le nombre d'éléments : |A| = 3.

| Notation | Signification |
|---|---|
| x ∈ A | x appartient à A |
| A ⊂ B | A est inclus dans B : tout élément de A est dans B |
| A ∪ B | union : les éléments de A **ou** de B |
| A ∩ B | intersection : les éléments de A **et** de B |
| A \ B | différence : les éléments de A qui ne sont **pas** dans B |
| Ā | complémentaire de A dans l'ensemble de référence E |

Avec A = {1, 2, 3} et B = {2, 3, 4} : A ∪ B = {1, 2, 3, 4} ; A ∩ B = {2, 3} ; A \ B = {1}.

On représente ces opérations par des **diagrammes de Venn** : deux cercles qui se chevauchent, la zone commune étant l'intersection.

## Le lien entre logique et ensembles

Chaque opération sur les ensembles correspond à un connecteur logique :

| Ensembles | Logique | SQL |
|---|---|---|
| A ∩ B | x ∈ A **et** x ∈ B | `WHERE ... AND ...`, `INTERSECT` |
| A ∪ B | x ∈ A **ou** x ∈ B | `WHERE ... OR ...`, `UNION` |
| A \ B | x ∈ A **et non** x ∈ B | `EXCEPT` |
| Ā | **non** x ∈ A | `WHERE NOT ...` |

Les lois de De Morgan existent donc aussi pour les ensembles : le complémentaire de (A ∪ B) est Ā ∩ B̄.

Formule du cardinal d'une union : |A ∪ B| = |A| + |B| − |A ∩ B|. On retire l'intersection, sinon on la compterait deux fois.

## Le produit cartésien

Le **produit cartésien** A × B est l'ensemble de tous les **couples** (a, b), avec a ∈ A et b ∈ B. Ici, l'ordre compte : (1, 2) ≠ (2, 1).

Avec A = {L1, L2} et B = {S1, S2} : A × B = {(L1, S1), (L1, S2), (L2, S1), (L2, S2)}, et |A × B| = |A| × |B| = 4.

Une table de base de données est un sous-ensemble d'un produit cartésien, et une jointure SQL sans condition produit exactement A × B.

## Démonstration

On vérifie une loi de De Morgan avec Python, en testant toutes les combinaisons :

```python
from itertools import product

for p, q in product([True, False], repeat=2):
    gauche = not (p and q)
    droite = (not p) or (not q)
    print(p, q, gauche, droite, gauche == droite)
```

Les quatre lignes affichent `True` en dernière colonne : les deux expressions sont équivalentes. Puis on manipule les ensembles :

```python
A = {1, 2, 3}
B = {2, 3, 4}
print(A | B, A & B, A - B)              # union, intersection, différence
print(len(A | B) == len(A) + len(B) - len(A & B))   # True
```

## Exercice guidé

1. Dresse la table de vérité de (P ⇒ Q) et de (non P ou Q), et vérifie qu'elles sont identiques.
2. Écris la négation de : « tous les étudiants de L1 ont validé le module de C ».
3. Simplifie avec De Morgan la condition `!(x > 0 && y > 0)`.

## Exercice autonome

1. E = {1, ..., 10}, A = {nombres pairs de E}, B = {multiples de 3 de E}. Écris A ∪ B, A ∩ B, A \ B et le complémentaire de A ∪ B.
2. Dans une promotion de 60 étudiants, 35 suivent l'option anglais, 25 l'option espagnol, et 10 suivent les deux. Combien ne suivent aucune option ?
3. Écris la négation de : « il existe un serveur qui répond en moins de 100 ms ».
4. Un mot de passe doit contenir au moins 8 caractères **et** (un chiffre **ou** un symbole). Écris la condition de **refus**, sans opérateur `!` devant les parenthèses.

## Correction

Exercice guidé :

1. Les deux tables donnent V, F, V, V, dans l'ordre des lignes (V,V), (V,F), (F,V), (F,F).
2. « Il existe au moins un étudiant de L1 qui n'a pas validé le module de C. »
3. `x <= 0 || y <= 0`.

Exercice autonome :

1. A = {2, 4, 6, 8, 10}, B = {3, 6, 9}. A ∪ B = {2, 3, 4, 6, 8, 9, 10} ; A ∩ B = {6} ; A \ B = {2, 4, 8, 10} ; complémentaire de A ∪ B = {1, 5, 7}.
2. |A ∪ B| = 35 + 25 − 10 = 50, donc 60 − 50 = **10 étudiants** sans option.
3. « Tous les serveurs répondent en 100 ms ou plus. »
4. Accepter : `longueur >= 8 && (chiffre || symbole)`. Refuser, d'après De Morgan : `longueur < 8 || (!chiffre && !symbole)`.

## Pour aller plus loin

- K. H. Rosen, « Discrete Mathematics and Its Applications », chapitre 1 : la référence internationale des mathématiques discrètes pour l'informatique.
- Les jointures et les opérateurs ensemblistes du cours « SQL, agrégats, GROUP BY et jointures ».
- Cours suivant : « Algèbre de Boole et circuits logiques ».
