---
slug: c07-scikit-learn
titre: "Complément : apprentissage supervisé avec scikit-learn"
piste: complement
semaine: 7
date: 2026-12-21
domaine: Data
duree: 150
niveau: bases
objectifs:
  - Distinguer régression et classification, et formuler un problème d'apprentissage supervisé
  - Séparer les données en apprentissage et test, et éviter la fuite de données
  - Construire un pipeline de prétraitement et de modèle avec scikit-learn
  - Évaluer un classifieur (matrice de confusion, accuracy, précision, rappel, F1) et un régresseur (MAE, RMSE, R²)
  - Comparer plusieurs modèles par validation croisée et choisir des hyperparamètres
prerequis:
  - Compléments NumPy ; séance « Python pour la data, pandas et Matplotlib »
  - Cours DIT « Introduction ML, Classification » (Abdoul Wahab Diallo)
referentiels:
  - "Cours DIT « Introduction ML, Classification » et « Intro ML » (L2) : notations TP, TN, FP, FN"
  - Google Cloud Professional Machine Learning Engineer, domaine « Developing ML models » (bases)
  - Documentation scikit-learn, « User Guide »
quiz:
  - question: "Prédire si un client va résilier son abonnement (oui ou non) est un problème de :"
    choix: ["Régression", "Classification", "Clustering", "Réduction de dimension"]
    reponse: 1
    explication: "La sortie est une catégorie (deux classes) ; prédire un montant serait une régression."
  - question: "Pourquoi garder un jeu de test que le modèle ne voit jamais pendant l'apprentissage ?"
    choix: ["Pour aller plus vite", "Pour estimer honnêtement la performance sur des données nouvelles", "Parce que scikit-learn l'exige", "Pour économiser de la mémoire"]
    reponse: 1
    explication: "Un modèle évalué sur ses données d'apprentissage paraît excellent même s'il a seulement mémorisé (surapprentissage)."
  - question: "TP = 40, FP = 10, FN = 20, TN = 130. Que vaut la précision ?"
    choix: ["0,67", "0,80", "0,85", "0,93"]
    reponse: 1
    explication: "Précision = TP / (TP + FP) = 40 / 50 = 0,80. Le rappel vaudrait TP / (TP + FN) = 40 / 60 ≈ 0,67."
  - question: "Pour détecter la fraude (rare et coûteuse à manquer), quelle métrique surveiller en priorité ?"
    choix: ["L'accuracy", "Le rappel", "Le R²", "Le nombre de lignes"]
    reponse: 1
    explication: "Avec 1 % de fraudes, un modèle qui dit toujours « pas de fraude » a 99 % d'accuracy mais un rappel nul."
  - question: "Pourquoi placer le StandardScaler dans un Pipeline plutôt que de l'appliquer avant le découpage ?"
    choix: ["Pour la lisibilité seulement", "Pour éviter la fuite de données : la moyenne et l'écart-type ne doivent être calculés que sur l'apprentissage", "C'est plus rapide", "Ce n'est pas nécessaire"]
    reponse: 1
    explication: "Sinon, des informations du jeu de test influencent l'apprentissage et la performance est surestimée."
---

> Ce complément s'appuie sur ton cours DIT « Introduction ML, Classification » et reprend ses notations (TP, TN, FP, FN, accuracy, précision, rappel). Il te prépare aussi à ton devoir Streamlit, qui compare 4 modèles.

## L'idée

En **apprentissage supervisé**, on dispose d'exemples **étiquetés** : des entrées X (les caractéristiques) et la sortie connue y (l'étiquette). On entraîne un modèle qui apprend la relation, pour **prédire y sur de nouvelles entrées**.

| Type | Sortie y | Exemples | Modèles courants |
|---|---|---|---|
| **Régression** | un nombre | prix d'un appartement, CA du mois prochain | régression linéaire, forêt aléatoire |
| **Classification** | une catégorie | résiliation oui ou non, spam, type de client | régression logistique, k plus proches voisins, arbre, forêt aléatoire |

## La démarche

```
Données → Exploration → Découpage train/test → Prétraitement → Entraînement → Évaluation → Choix du modèle
                             ↑ le jeu de test reste « sous scellé » jusqu'à la fin
```

## Le découpage et la fuite de données

```python
import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv("clients_telecom.csv")          # par exemple un jeu « churn » de Kaggle
X = df.drop(columns=["resilie"])
y = df["resilie"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)   # 80 / 20, même proportion de classes dans les deux jeux
```

**La fuite de données** (*data leakage*) : si une information du jeu de test influence l'apprentissage, la performance est **surestimée**, et le modèle déçoit en production. Les cas typiques :
- normaliser avant de découper ;
- garder une colonne qui « contient » la réponse, comme `date_resiliation`.

## Le pipeline scikit-learn

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression

num = ["anciennete_mois", "facture_mensuelle", "nb_appels_support"]
cat = ["type_contrat", "moyen_paiement", "region"]

pretraitement = ColumnTransformer([
    ("num", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), num),
    ("cat", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore"))]), cat),
])

modele = Pipeline([("prep", pretraitement), ("clf", LogisticRegression(max_iter=1000))])
modele.fit(X_train, y_train)          # apprend la moyenne et l'écart-type SUR l'apprentissage seulement
y_pred = modele.predict(X_test)
```

| Étape | Rôle |
|---|---|
| `SimpleImputer` | remplace les valeurs manquantes (médiane, valeur la plus fréquente) |
| `StandardScaler` | centre et réduit : z = (x − μ) / σ, comme dans le complément NumPy |
| `OneHotEncoder` | transforme une catégorie en colonnes 0/1 (`type_contrat_mensuel`, `type_contrat_annuel`…) |

L'API est **toujours la même** : `fit` (apprendre), `predict` (prédire), `score`. Changer de modèle tient en une ligne.

## Évaluer un classifieur

La **matrice de confusion** (avec les notations du cours DIT) :

|  | Prédit 1 | Prédit 0 |
|---|---|---|
| **Réel 1** | TP (vrais positifs) | FN (faux négatifs) |
| **Réel 0** | FP (faux positifs) | TN (vrais négatifs) |

| Métrique | Formule | Question |
|---|---|---|
| **Accuracy** | (TP + TN) / (TP + TN + FP + FN) | quelle part de prédictions justes ? |
| **Précision** | TP / (TP + FP) | quand je prédis « résilie », ai-je raison ? |
| **Rappel** | TP / (TP + FN) | parmi ceux qui résilient vraiment, combien en ai-je trouvé ? |
| **F1** | 2 × P × R / (P + R) | l'équilibre entre précision et rappel |

**L'exemple chiffré**, sur 200 clients de test : TP = 40, FN = 20, FP = 10, TN = 130.

| Métrique | Calcul | Valeur |
|---|---|---|
| Accuracy | (40 + 130) / 200 = 170 / 200 | **0,85** |
| Précision | 40 / (40 + 10) = 40 / 50 | **0,80** |
| Rappel | 40 / (40 + 20) = 40 / 60 | **≈ 0,67** |
| F1 | 2 × 0,80 × 0,667 / (0,80 + 0,667) = 1,067 / 1,467 | **≈ 0,73** |

L'interprétation : le modèle se trompe rarement quand il prédit une résiliation, mais il **rate un tiers** des clients qui partent.

```python
from sklearn.metrics import confusion_matrix, classification_report, ConfusionMatrixDisplay
print(confusion_matrix(y_test, y_pred))
print(classification_report(y_test, y_pred))
ConfusionMatrixDisplay.from_predictions(y_test, y_pred)
```

> **L'accuracy est trompeuse quand les classes sont déséquilibrées.** Avec 1 % de fraudes, prédire « jamais de fraude » donne 99 % d'accuracy… et un rappel de **0**. On regarde alors la précision, le rappel et le F1. On peut aussi utiliser `class_weight="balanced"`.

## Évaluer un régresseur

| Métrique | Formule | Lecture |
|---|---|---|
| **MAE** | moyenne de \|y − ŷ\| | l'erreur moyenne, dans l'unité de y (FCFA) |
| **RMSE** | √(moyenne de (y − ŷ)²) | pénalise davantage les grosses erreurs |
| **R²** | 1 − SCR / SCT | la part de variance expliquée (1 = parfait, 0 = pas mieux que la moyenne) |

Exemple : les vraies valeurs sont [100, 200, 300] et les prédictions [110, 190, 330]. Les erreurs valent 10, 10 et 30. La MAE vaut (10 + 10 + 30) / 3 ≈ **16,7**. La RMSE vaut √((100 + 100 + 900) / 3) = √366,7 ≈ **19,1**.

## Comparer les modèles : la validation croisée

Un seul découpage peut être chanceux. La **validation croisée à k plis** découpe l'apprentissage en k parties : on entraîne sur k − 1 parties, on évalue sur la dernière, k fois, puis on fait la moyenne.

```python
from sklearn.model_selection import cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier

candidats = {
    "Régression logistique": LogisticRegression(max_iter=1000, class_weight="balanced"),
    "k plus proches voisins": KNeighborsClassifier(n_neighbors=15),
    "Arbre de décision": DecisionTreeClassifier(max_depth=5, random_state=42),
    "Forêt aléatoire": RandomForestClassifier(n_estimators=300, random_state=42, class_weight="balanced"),
}
for nom, clf in candidats.items():
    pipe = Pipeline([("prep", pretraitement), ("clf", clf)])
    scores = cross_val_score(pipe, X_train, y_train, cv=5, scoring="f1")
    print(f"{nom:25s} F1 = {scores.mean():.3f} ± {scores.std():.3f}")

grille = GridSearchCV(Pipeline([("prep", pretraitement), ("clf", RandomForestClassifier(random_state=42))]),
                      {"clf__n_estimators": [100, 300], "clf__max_depth": [None, 8, 16]}, cv=5, scoring="f1")
grille.fit(X_train, y_train)
print(grille.best_params_, grille.best_score_)
# seulement à la fin : une évaluation unique sur le jeu de test
print(classification_report(y_test, grille.predict(X_test)))
```

**Le surapprentissage** : un très bon score en apprentissage et un mauvais score en test signifient que le modèle a **mémorisé** au lieu de généraliser. Les remèdes : un modèle plus simple (`max_depth`), plus de données, de la régularisation.

## Démonstration

Sur un jeu de données de résiliation (*churn*) :

1. On explore les données et on regarde la proportion de résiliations.
2. On découpe avec stratification.
3. On construit le pipeline.
4. On compare 4 modèles en validation croisée, sur le F1.
5. On optimise la forêt aléatoire avec `GridSearchCV`.
6. On fait l'évaluation finale sur le test, on affiche la matrice de confusion et l'importance des variables.
7. On sauvegarde le modèle avec `joblib.dump(grille.best_estimator_, "modele.joblib")`, pour l'application Streamlit.

## Exercice guidé

Avec le jeu de données intégré `load_breast_cancer` de scikit-learn :

1. Découpe en 80/20, avec stratification et `random_state=0`.
2. Entraîne une régression logistique dans un pipeline avec `StandardScaler`.
3. Affiche la matrice de confusion, puis calcule **à la main** l'accuracy, la précision et le rappel à partir de ses 4 nombres. Vérifie avec `classification_report`.

## Exercice autonome

Pour ton devoir (application Streamlit avec 4 modèles) :

1. Choisis le jeu de données et formule le problème : régression ou classification, quelle cible, quelle métrique principale, et **pourquoi**.
2. Construis un pipeline de prétraitement unique, réutilisé par les 4 modèles.
3. Compare les 4 modèles en validation croisée à 5 plis, en notant la moyenne et l'écart-type.
4. Optimise le meilleur avec `GridSearchCV`, puis fais une évaluation **unique** sur le test.
5. Sauvegarde le modèle et charge-le dans Streamlit, avec un formulaire de saisie et une prédiction (et sa probabilité pour une classification).
6. Rédige 5 lignes d'interprétation : quel modèle, quelles performances, quelles limites, quelles variables importantes.

## Correction

Exercice guidé :

```python
from sklearn.datasets import load_breast_cancer
X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)
pipe = Pipeline([("sc", StandardScaler()), ("lr", LogisticRegression(max_iter=1000))]).fit(X_tr, y_tr)
cm = confusion_matrix(y_te, pipe.predict(X_te))
tn, fp, fn, tp = cm.ravel()          # attention : scikit-learn ordonne [[TN, FP], [FN, TP]] pour les étiquettes 0 et 1
acc = (tp + tn) / cm.sum(); prec = tp / (tp + fp); rap = tp / (tp + fn)
```

On obtient typiquement une accuracy d'environ 0,97 à 0,98. Le point important est l'**ordre** de la matrice dans scikit-learn : les lignes sont les classes réelles **0 puis 1**. C'est l'inverse de la présentation du cours, où la classe 1 vient en premier. D'où `ravel()` dans l'ordre TN, FP, FN, TP.

Exercice autonome, le squelette Streamlit :

```python
import joblib, pandas as pd, streamlit as st
modele = joblib.load("modele.joblib")
st.title("Prédiction de résiliation")
anciennete = st.number_input("Ancienneté (mois)", 0, 120, 12)
contrat = st.selectbox("Type de contrat", ["mensuel", "annuel"])
# … autres champs …
if st.button("Prédire"):
    x = pd.DataFrame([{"anciennete_mois": anciennete, "type_contrat": contrat}])   # mêmes colonnes qu'à l'entraînement
    proba = modele.predict_proba(x)[0, 1]
    st.metric("Probabilité de résiliation", f"{proba:.0%}")
```

Le pipeline sauvegardé contient le prétraitement : on lui donne des données **brutes**, exactement comme à l'entraînement.

## Pour aller plus loin

- La **courbe ROC** et l'**AUC**, ainsi que le choix du seuil de décision selon le coût des erreurs.
- Le **non supervisé** : k-means pour segmenter des clients, l'ACP pour réduire les dimensions (le lien avec ton cours d'analyse multivariée).
- **MLflow** suit les expériences et les versions de modèles. C'est le lien entre machine learning et DevOps : le MLOps.
