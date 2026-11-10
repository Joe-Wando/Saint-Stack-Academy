---
slug: s04-3-python-pandas-matplotlib
titre: Python pour la data, pandas et Matplotlib
domaine: Data
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S5, ue: "Ingénierie des données", option: big-data-ia }
parcours:
  - { parcours: data, ordre: 6 }
ordre: 4
prerequis_cours: []
visibilite: public
objectifs:
  - Créer un environnement Python isolé et un notebook Jupyter
  - Charger des données (CSV, base PostgreSQL) dans un DataFrame et les explorer
  - Nettoyer (types, valeurs manquantes, doublons) et transformer des données
  - Filtrer, regrouper, joindre et pivoter avec pandas, en faisant le lien avec SQL
  - Produire des graphiques lisibles avec Matplotlib et les exporter
prerequis:
  - Bases de Python (variables, listes, dictionnaires, fonctions)
  - Cours « SQL pour la data, jointures et agrégats » et « SQL avancé, CTE et fonctions de fenêtrage »
referentiels:
  - Python Institute PCEP et PCAP (bases du langage)
  - Databricks Certified Data Engineer Associate (manipulation de données)
  - Documentation officielle pandas, « User Guide »
quiz:
  - question: "Qu'est-ce qu'un DataFrame ?"
    choix: ["Une image", "Un tableau à deux dimensions, avec des colonnes nommées et typées, et un index", "Une base de données", "Une liste Python"]
    reponse: 1
    explication: "C'est l'équivalent pandas d'une table SQL ou d'une feuille Excel ; chaque colonne est une Series."
  - question: "Quel est l'équivalent pandas de SELECT categorie, SUM(ca) FROM ventes GROUP BY categorie ?"
    choix: ["df.sum('categorie')", "df.groupby('categorie')['ca'].sum()", "df.sort_values('ca')", "df['categorie'].unique()"]
    reponse: 1
    explication: "groupby crée les groupes, puis on applique l'agrégat sur la colonne choisie."
  - question: "Pourquoi éviter une boucle for sur les lignes d'un DataFrame ?"
    choix: ["C'est interdit", "Les opérations vectorisées (sur des colonnes entières) sont des dizaines de fois plus rapides", "Les boucles ne marchent pas en Python", "Pour économiser la mémoire uniquement"]
    reponse: 1
    explication: "df['montant'] = df['prix'] * df['quantite'] calcule toute la colonne d'un coup, en code compilé."
  - question: "Que fait df.dropna(subset=['ville']) ?"
    choix: ["Supprime la colonne ville", "Supprime les lignes où ville est manquante", "Remplace les manquants par 0", "Trie par ville"]
    reponse: 1
    explication: "fillna remplace, dropna supprime ; toujours se demander si supprimer ne fausse pas l'analyse."
  - question: "Quel type de graphique pour montrer l'évolution du CA mois par mois ?"
    choix: ["Un camembert", "Une courbe (line)", "Un nuage de points", "Une carte"]
    reponse: 1
    explication: "Évolution dans le temps : courbe. Comparaison de catégories : barres. Le camembert est à éviter au-delà de 3 parts."
---

## Pourquoi pandas ?

SQL est excellent dans une base de données. Mais pour **explorer** un fichier CSV reçu par e-mail, **nettoyer** des données mal formées, enchaîner avec un **graphique** ou un modèle de machine learning, l'outil standard est **Python et pandas**. Ton devoir Streamlit (les 4 modèles) repose d'ailleurs sur pandas.

## L'environnement

```bash
python3 -m venv .venv
source .venv/bin/activate              # Windows : .venv\Scripts\activate
pip install pandas matplotlib jupyterlab sqlalchemy psycopg[binary]
jupyter lab
```

Un **environnement virtuel** isole les bibliothèques de chaque projet, comme un `node_modules` pour Python.

## Charger et explorer

```python
import pandas as pd

df = pd.read_csv("ventes.csv", parse_dates=["date_cmd"])
# ou depuis la base PostgreSQL de la semaine :
from sqlalchemy import create_engine
moteur = create_engine("postgresql+psycopg://postgres:data@localhost:5434/postgres")
df = pd.read_sql("""
    SELECT co.id AS commande_id, c.nom AS client, c.ville, co.date_cmd, co.statut,
           p.nom AS produit, p.categorie, p.prix, l.quantite
    FROM lignes l JOIN commandes co ON co.id=l.commande_id
    JOIN clients c ON c.id=co.client_id JOIN produits p ON p.id=l.produit_id
""", moteur, parse_dates=["date_cmd"])

df.shape          # (9, 9) : 9 lignes, 9 colonnes
df.head()         # les 5 premières lignes
df.info()         # types et nombre de valeurs non nulles par colonne
df.describe()     # statistiques des colonnes numériques
df["categorie"].value_counts()
```

## Sélectionner et filtrer

| SQL | pandas |
|---|---|
| `SELECT client, prix` | `df[["client", "prix"]]` |
| `WHERE statut = 'livrée'` | `df[df["statut"] == "livrée"]` |
| `WHERE prix > 10000 AND ville = 'Dakar'` | `df[(df["prix"] > 10000) & (df["ville"] == "Dakar")]` |
| `WHERE categorie IN (...)` | `df[df["categorie"].isin(["Vêtements", "Chaussures"])]` |
| `ORDER BY prix DESC LIMIT 3` | `df.sort_values("prix", ascending=False).head(3)` |

Avec plusieurs conditions, on utilise `&` (et) et `|` (ou), et chaque condition se met **entre parenthèses**.

## Nettoyer et transformer

```python
df["montant"] = df["prix"] * df["quantite"]           # calcul vectorisé : toute la colonne d'un coup
df["mois"] = df["date_cmd"].dt.to_period("M")
df["ville"] = df["ville"].fillna("Non renseignée")    # valeurs manquantes
df = df.drop_duplicates()                              # doublons
df["categorie"] = df["categorie"].str.strip().str.title()   # nettoyage du texte
df = df.rename(columns={"date_cmd": "date"})
df["prix"] = pd.to_numeric(df["prix"], errors="coerce")     # conversion ; les valeurs invalides deviennent NaN
```

> Évite les boucles `for` sur les lignes. Les opérations **vectorisées** sur des colonnes entières sont des dizaines de fois plus rapides.

## Regrouper, joindre, pivoter

```python
livrees = df[df["statut"] == "livrée"]

# GROUP BY
livrees.groupby("categorie")["montant"].sum().sort_values(ascending=False)
# Vêtements 141000 ; Accessoires 40000 ; Chaussures 30000

# Plusieurs agrégats
livrees.groupby("client").agg(total=("montant", "sum"), commandes=("commande_id", "nunique"))

# JOIN
objectifs = pd.DataFrame({"categorie": ["Vêtements", "Accessoires"], "objectif": [150000, 30000]})
bilan = livrees.groupby("categorie", as_index=False)["montant"].sum().merge(objectifs, on="categorie", how="left")
bilan["atteint_pct"] = (100 * bilan["montant"] / bilan["objectif"]).round(1)

# Tableau croisé : mois en lignes, catégories en colonnes
pivot = livrees.pivot_table(index="mois", columns="categorie", values="montant", aggfunc="sum", fill_value=0)

# Équivalents des fonctions de fenêtrage
livrees["cumul_client"] = livrees.groupby("client")["montant"].cumsum()
```

**La vérification chiffrée** : *Vêtements* donne 141 000, comme dans le cours « SQL pour la data, jointures et agrégats ». Pour *Accessoires* livrés : bracelets (3 × 5 000 = 15 000) et sac de la commande 4 (25 000), soit **40 000**. Par rapport à l'objectif de 30 000, cela fait **133,3 %**.

## Matplotlib

```python
import matplotlib.pyplot as plt

ca_cat = livrees.groupby("categorie")["montant"].sum().sort_values()

fig, ax = plt.subplots(figsize=(8, 4))
ax.barh(ca_cat.index, ca_cat.values, color="#2BB3A3")
ax.set_title("Chiffre d'affaires livré par catégorie")
ax.set_xlabel("FCFA")
for i, v in enumerate(ca_cat.values):
    ax.text(v, i, f" {v:,.0f}".replace(",", " "), va="center")   # étiquettes de valeur
ax.spines[["top", "right"]].set_visible(False)
fig.tight_layout()
fig.savefig("ca_categories.png", dpi=150)
```

| Question | Graphique |
|---|---|
| Évolution dans le temps | courbe (`ax.plot`) |
| Comparer des catégories | barres, horizontales si les noms sont longs (`ax.barh`) |
| Distribution d'une variable | histogramme (`ax.hist`) |
| Relation entre deux variables | nuage de points (`ax.scatter`) |

Les règles d'un graphique lisible : un titre qui dit **ce qu'on doit retenir**, des axes avec unités, des barres triées et peu de couleurs. Le camembert est à éviter au-delà de 3 parts.

## Démonstration

Dans un notebook, on charge la base des cours SQL, on reproduit leurs trois analyses (CA par catégorie, top client, évolution mensuelle), on vérifie que les résultats sont identiques, puis on produit deux graphiques exportés en PNG.

## Exercice guidé

Avec le DataFrame `df` de la démonstration :

1. Combien de lignes concernent la ville de Dakar ?
2. Quel est le montant moyen d'une ligne de commande livrée ?
3. Affiche le chiffre d'affaires livré par client, trié par ordre décroissant.
4. Trace ce chiffre d'affaires par client en barres horizontales.

## Exercice autonome

Télécharge un vrai jeu de données : le fichier « Superstore » (une recherche « superstore sales csv » sur Kaggle le donne), ou n'importe quel CSV de ventes.

1. Inspecte-le : dimensions, types, valeurs manquantes, doublons.
2. Nettoie-le : dates au bon type, catégories homogènes, montants numériques.
3. Réponds à trois questions métier : le top 5 des produits par chiffre d'affaires, le chiffre d'affaires mensuel avec son évolution en %, et la marge par catégorie si la colonne existe.
4. Produis deux graphiques (une courbe et des barres) avec des titres qui disent ce qu'il faut retenir.
5. Rédige trois phrases de conclusion, comme pour un responsable qui n'a que 30 secondes.

## Correction

Exercice guidé :

```python
(df["ville"] == "Dakar").sum()                         # 1. 7 lignes (3 pour Awa, 4 pour Fatou)
livrees["montant"].mean()                              # 2. 211 000 / 7 lignes livrées ≈ 30 142,9
par_client = livrees.groupby("client")["montant"].sum().sort_values(ascending=False)   # 3.
# Awa Diop 74 000 ; Ibrahima Ndiaye 70 000 ; Fatou Sall 67 000
par_client.sort_values().plot.barh(title="CA livré par client (FCFA)")                # 4.
```

Le calcul de la question 2, détaillé :
- 7 lignes livrées : 24 000, 15 000, 35 000, 12 000, 25 000, 30 000 et 70 000 ;
- leur somme vaut 211 000 ;
- 211 000 / 7 ≈ 30 143 FCFA.

Exercice autonome : la correction dépend du fichier choisi. Les points vérifiés :
- **les dates** : `parse_dates`, ou `pd.to_datetime` avec `format=` si le format est ambigu, comme 03/04 (le 3 avril ou le 4 mars ?) ;
- **les doublons** : `df.duplicated().sum()` avant de les supprimer ;
- **l'évolution mensuelle** : `mensuel = df.set_index("date").resample("MS")["ventes"].sum()`, puis `mensuel.pct_change() * 100` ;
- **la conclusion** : elle commence par **le chiffre clé**, par exemple « La catégorie Technologie porte 36 % du chiffre d'affaires mais seulement 14 % de la marge ».

## Pour aller plus loin

- Le cours « NumPy, le calcul numérique en Python » présente la bibliothèque de calcul qui sert de moteur à pandas.
- **Polars** est une alternative récente à pandas, beaucoup plus rapide sur de gros volumes.
- La semaine prochaine : modéliser les données (OLTP et OLAP) puis construire un ETL vers PostgreSQL.
