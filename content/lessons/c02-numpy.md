---
slug: c02-numpy
titre: "NumPy, le calcul numérique en Python"
domaine: Data
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S5, ue: "Ingénierie des données", option: big-data-ia }
parcours:
  - { parcours: data, ordre: 5 }
ordre: 3
prerequis_cours: [s04-3-python-pandas-matplotlib]
visibilite: public
objectifs:
  - Créer des tableaux NumPy et connaître leurs attributs (shape, dtype, ndim)
  - Indexer, découper et filtrer avec des masques booléens
  - Calculer de façon vectorisée et comprendre le broadcasting
  - Utiliser les agrégations par axe et les statistiques de base
  - Faire les opérations d'algèbre linéaire utiles en data (produit matriciel, transposée)
prerequis:
  - Bases de Python ; séance « Python pour la data, pandas et Matplotlib »
referentiels:
  - Documentation officielle NumPy, « NumPy user guide »
  - Python Institute PCAP (bases du langage)
  - Cours DIT « Algèbre pour Data Science » (vecteurs, matrices)
quiz:
  - question: "Pourquoi NumPy est-il beaucoup plus rapide qu'une liste Python pour le calcul ?"
    choix: ["Il utilise le GPU", "Ses tableaux sont typés, contigus en mémoire, et les opérations sont exécutées en code compilé", "Il ignore les nombres décimaux", "Il est écrit en JavaScript"]
    reponse: 1
    explication: "Une boucle Python traite un objet à la fois ; NumPy applique l'opération à tout le bloc mémoire d'un coup."
  - question: "a = np.array([[1, 2, 3], [4, 5, 6]]). Que vaut a.shape ?"
    choix: ["(3, 2)", "(2, 3)", "6", "(2,)"]
    reponse: 1
    explication: "2 lignes et 3 colonnes ; shape donne les dimensions dans l'ordre (lignes, colonnes)."
  - question: "Que renvoie a.sum(axis=0) pour la matrice précédente ?"
    choix: ["21", "[5, 7, 9]", "[6, 15]", "[1, 4]"]
    reponse: 1
    explication: "axis=0 réduit les lignes : on additionne colonne par colonne. axis=1 donnerait [6, 15]."
  - question: "Que fait a[a > 3] ?"
    choix: ["Une erreur", "Renvoie les éléments supérieurs à 3 : [4, 5, 6]", "Remplace par 3", "Trie le tableau"]
    reponse: 1
    explication: "a > 3 produit un masque booléen ; indexer par ce masque garde les éléments où il vaut True."
  - question: "Pourquoi np.array([1, 2, 3]) + 10 fonctionne-t-il ?"
    choix: ["Par hasard", "Grâce au broadcasting : le scalaire est étendu à la forme du tableau", "NumPy convertit en liste", "Ce n'est pas valide"]
    reponse: 1
    explication: "Résultat [11, 12, 13]. Le broadcasting étend aussi un vecteur ligne sur toutes les lignes d'une matrice."
---

## L'idée

**NumPy** (*Numerical Python*) fournit le **tableau multidimensionnel** (`ndarray`) et les opérations rapides dessus. C'est la fondation de presque tout l'écosystème data : pandas, scikit-learn, Matplotlib et les bibliothèques d'apprentissage profond s'appuient sur lui.

Ce complément fait le lien avec ton cours DIT d'**algèbre pour la data science** : un vecteur devient un tableau à 1 dimension, et une matrice un tableau à 2 dimensions.

```python
import numpy as np
import time

liste = list(range(1_000_000))
t = time.time(); [x * 2 for x in liste]; print("liste :", time.time() - t)
tab = np.arange(1_000_000)
t = time.time(); tab * 2; print("numpy :", time.time() - t)
# numpy est typiquement 20 à 50 fois plus rapide
```

## Créer des tableaux

```python
v = np.array([12000, 5000, 35000])          # vecteur : shape (3,)
M = np.array([[1, 2, 3], [4, 5, 6]])         # matrice : shape (2, 3)
np.zeros((2, 3)); np.ones(4); np.eye(3)      # zéros, uns, identité
np.arange(0, 10, 2)                          # [0 2 4 6 8]
np.linspace(0, 1, 5)                         # [0. 0.25 0.5 0.75 1.]
rng = np.random.default_rng(42)              # générateur reproductible (graine 42)
rng.normal(loc=100, scale=15, size=1000)     # 1 000 tirages d'une loi normale N(100, 15²)
```

| Attribut | Sens | Pour `M` |
|---|---|---|
| `shape` | les dimensions | `(2, 3)` |
| `ndim` | le nombre d'axes | `2` |
| `size` | le nombre total d'éléments | `6` |
| `dtype` | le type des éléments | `int64` |

Tous les éléments d'un tableau ont le **même type**. `M.reshape(3, 2)` change la forme sans changer les données, à condition que 2 × 3 = 3 × 2.

## Indexer, découper, filtrer

```python
M[0, 2]        # ligne 0, colonne 2 → 3
M[1]           # toute la ligne 1 → [4 5 6]
M[:, 1]        # toute la colonne 1 → [2 5]
M[0, 1:]       # ligne 0, colonnes 1 et suivantes → [2 3]

prix = np.array([12000, 25000, 35000, 5000, 15000, 8000])
masque = prix > 10000              # [ True  True  True False  True False]
prix[masque]                       # [12000 25000 35000 15000]
prix[(prix > 5000) & (prix < 20000)]   # [12000 15000 8000] : & et | avec des parenthèses
np.where(prix >= 20000, "Premium", "Standard")
```

Attention, un découpage (`M[0, 1:]`) est une **vue** : le modifier modifie le tableau d'origine. Pour une copie indépendante, on écrit `.copy()`.

## Les calculs vectorisés et le broadcasting

```python
quantites = np.array([2, 1, 1, 3, 2, 0])
montants = prix * quantites        # élément par élément : [24000 25000 35000 15000 30000 0]
montants.sum()                     # 129 000
prix * 1.18                        # TVA appliquée à tous les prix
np.round(prix / 655.957, 2)        # conversion en euros
```

Le **broadcasting** permet de combiner des tableaux de formes compatibles :

```python
notes = np.array([[12, 15, 9],     # 3 élèves × 3 matières
                  [8, 11, 14],
                  [16, 13, 10]])
coef = np.array([2, 1, 3])         # shape (3,) : étendu à chaque ligne
ponderees = notes * coef
moyennes = ponderees.sum(axis=1) / coef.sum()
# élève 1 : (12×2 + 15×1 + 9×3) / 6 = (24 + 15 + 27) / 6 = 66 / 6 = 11.0
```

## Les agrégations par axe

```
           axis=1 →
        ┌──────────────┐
axis=0  │ 12   15    9 │
  ↓     │  8   11   14 │
        │ 16   13   10 │
        └──────────────┘
```

```python
notes.mean()          # moyenne générale : 108 / 9 = 12.0
notes.mean(axis=0)    # moyenne par matière (on réduit les lignes) : [12. 13. 11.]
notes.mean(axis=1)    # moyenne par élève (on réduit les colonnes) : [12. 11. 13.]
notes.max(axis=0); notes.argmax(axis=0)   # la meilleure note par matière, et l'élève qui l'a eue
notes.std(); np.median(notes); np.percentile(notes, 90)
```

## Un peu d'algèbre linéaire

```python
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])
A @ B                 # produit matriciel : [[19 22] [43 50]]
A * B                 # produit élément par élément : [[ 5 12] [21 32]]  ← à ne pas confondre
A.T                   # transposée
np.linalg.inv(A)      # inverse
np.linalg.solve(A, np.array([5, 11]))   # résout A·x = b → x = [1, 2]
```

Le calcul du premier coefficient de `A @ B` : 1 × 5 + 2 × 7 = 5 + 14 = **19**.

Pour la vérification de `solve` : 1 × 1 + 2 × 2 = 5 et 3 × 1 + 4 × 2 = 11. ✓

## Démonstration

1. On compare la vitesse d'une liste et d'un tableau NumPy.
2. On simule 10 000 paniers : des prix et des quantités aléatoires, puis on calcule les montants par vectorisation.
3. On calcule les moyennes pondérées d'une classe avec le broadcasting.
4. On montre que `df.to_numpy()` donne le tableau sous-jacent d'un DataFrame pandas.

## Exercice guidé

Avec `notes` (3 élèves × 3 matières) ci-dessus :

1. Quelle est la note maximale de chaque élève ?
2. Combien de notes sont strictement inférieures à 10 ?
3. Ajoute 1 point à toutes les notes de la 2e matière, sans dépasser 20 (indice : `np.minimum`).

## Exercice autonome

1. Génère les notes de 30 élèves dans 5 matières, avec `rng.integers(0, 21, size=(30, 5))` et la graine 7.
2. Calcule la moyenne pondérée de chaque élève, avec les coefficients `[3, 2, 2, 1, 1]`.
3. Donne le nombre d'élèves admis (moyenne ≥ 10), et le rang du meilleur élève.
4. Centre et réduis chaque matière : z = (x − moyenne) / écart-type, par colonne, avec le broadcasting.
5. Vérifie que chaque colonne centrée-réduite a une moyenne d'environ 0 et un écart-type d'environ 1.

## Correction

Exercice guidé :

```python
notes.max(axis=1)                    # [15 14 16]
(notes < 10).sum()                   # 2 : les notes 9 et 8
notes[:, 1] = np.minimum(notes[:, 1] + 1, 20)   # [16 12 14]
```

`True` vaut 1 en somme, donc `(notes < 10).sum()` **compte** les valeurs vraies.

Exercice autonome :

```python
rng = np.random.default_rng(7)
N = rng.integers(0, 21, size=(30, 5))
coef = np.array([3, 2, 2, 1, 1])
moy = (N * coef).sum(axis=1) / coef.sum()
admis = (moy >= 10).sum()
meilleur = moy.argmax()
Z = (N - N.mean(axis=0)) / N.std(axis=0)     # broadcasting : (30, 5) − (5,)
Z.mean(axis=0).round(10), Z.std(axis=0)      # ≈ [0 0 0 0 0] et [1 1 1 1 1]
```

Le centrage-réduction est exactement ce que fait `StandardScaler` dans scikit-learn (complément du 21 décembre).

## Pour aller plus loin

- `np.save` et `np.load` sauvegardent un tableau dans un format binaire rapide.
- La **loi normale** de ton cours DIT se simule avec `rng.normal`. Trace l'histogramme de 10 000 tirages avec Matplotlib et retrouve la courbe en cloche.
