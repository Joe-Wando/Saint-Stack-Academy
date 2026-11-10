---
slug: s05-2-etl-postgresql
titre: Construire un pipeline ETL en Python vers PostgreSQL
piste: solo
semaine: 5
date: 2026-12-09
domaine: Data
duree: 150
niveau: bases
objectifs:
  - Distinguer ETL et ELT et choisir l'un ou l'autre
  - Extraire des données depuis un CSV, une API et une base PostgreSQL
  - Transformer et contrôler la qualité des données avec pandas
  - Charger de façon idempotente et incrémentale dans PostgreSQL (upsert, filigrane)
  - Structurer le pipeline en fonctions, journaliser, paramétrer et le dockeriser
prerequis:
  - Séances « Python pour la data » et « Modélisation des données »
referentiels:
  - Databricks Certified Data Engineer Associate, domaines « ELT with Spark SQL and Python » et « Incremental Data Processing »
  - Google Cloud Professional Data Engineer, domaine « Ingesting and processing the data »
  - DAMA-DMBOK 2, chapitre « Data Quality »
quiz:
  - question: "Quelle différence entre ETL et ELT ?"
    choix: ["Aucune", "ETL transforme avant de charger ; ELT charge le brut dans l'entrepôt puis transforme en SQL dans l'entrepôt", "ELT n'a pas d'extraction", "ETL est réservé au cloud"]
    reponse: 1
    explication: "Les entrepôts modernes (BigQuery, Snowflake) étant très puissants, l'ELT avec dbt est devenu dominant."
  - question: "Que signifie un pipeline idempotent ?"
    choix: ["Il est très rapide", "L'exécuter deux fois avec les mêmes données donne le même résultat, sans doublons", "Il ne s'exécute qu'une fois", "Il n'a pas de journal"]
    reponse: 1
    explication: "Indispensable : un pipeline relancé après une panne ne doit pas dupliquer les ventes."
  - question: "Que fait INSERT ... ON CONFLICT (id) DO UPDATE ?"
    choix: ["Il supprime les doublons", "Il insère la ligne, ou la met à jour si une ligne de même clé existe déjà (upsert)", "Il refuse l'insertion", "Il crée un index"]
    reponse: 1
    explication: "C'est la base d'un chargement idempotent dans PostgreSQL."
  - question: "Qu'est-ce qu'un chargement incrémental ?"
    choix: ["Recharger toute la table à chaque fois", "Ne traiter que les lignes nouvelles ou modifiées depuis la dernière exécution", "Charger une ligne à la fois", "Charger en plusieurs langues"]
    reponse: 1
    explication: "On mémorise un filigrane (watermark), par exemple la date de mise à jour maximale déjà traitée."
  - question: "Où mettre l'URL et le mot de passe de la base dans un pipeline ?"
    choix: ["En dur dans le script", "Dans des variables d'environnement", "Dans un commentaire", "Dans le nom du fichier"]
    reponse: 1
    explication: "Même règle que pour les applications (12 facteurs) : le code est versionné, les secrets non."
---

## ETL ou ELT

```
ETL :  Extraire ──▶ Transformer (Python) ──▶ Charger (entrepôt)
ELT :  Extraire ──▶ Charger (brut, dans l'entrepôt) ──▶ Transformer (SQL dans l'entrepôt, avec dbt)
```

| | ETL | ELT |
|---|---|---|
| Où transformer ? | dans un serveur de traitement (Python, Spark) | dans l'entrepôt (SQL) |
| Données brutes conservées ? | souvent non | oui (couche bronze) |
| Quand le choisir ? | transformations complexes, données sensibles à masquer avant le chargement | entrepôt puissant, équipe à l'aise en SQL |

Aujourd'hui, on écrit un pipeline **Python** qui extrait, contrôle et charge la couche **bronze et silver**. Vendredi, **dbt** construira la couche **gold** (l'étoile d'hier) en SQL. C'est l'architecture ELT moderne.

## Le projet

Une boutique en ligne nous confie trois sources :

1. `commandes.csv`, un export quotidien du site ;
2. une **API** de taux de change, car certains clients paient en euros ;
3. la base **PostgreSQL** de l'application, avec les tables `clients` et `produits`.

La cible : un schéma `silver` dans l'entrepôt PostgreSQL.

```
etl-boutique/
├── etl/
│   ├── config.py      (variables d'environnement)
│   ├── extraire.py
│   ├── transformer.py
│   ├── controler.py   (qualité)
│   └── charger.py
├── main.py
├── requirements.txt
└── Dockerfile
```

## Extraire

```python
# etl/extraire.py
import pandas as pd, requests
from sqlalchemy import create_engine, text

def extraire_csv(chemin: str) -> pd.DataFrame:
    return pd.read_csv(chemin, dtype={"commande_id": "Int64"}, parse_dates=["date_cmd"])

def extraire_taux_eur_xof() -> float:
    # Le franc CFA a une parité fixe avec l'euro (1 EUR = 655,957 XOF) ; l'appel illustre une source API
    r = requests.get("https://open.er-api.com/v6/latest/EUR", timeout=10)
    r.raise_for_status()
    return r.json()["rates"]["XOF"]

def extraire_table(url_source: str, requete: str, params: dict | None = None) -> pd.DataFrame:
    moteur = create_engine(url_source)
    with moteur.connect() as c:
        return pd.read_sql(text(requete), c, params=params)
```

Les bonnes pratiques : un `timeout` sur chaque appel réseau, `raise_for_status()` pour ne pas traiter silencieusement une erreur HTTP, et des **types explicites** à la lecture.

## Transformer

```python
# etl/transformer.py
import pandas as pd

def transformer_commandes(df: pd.DataFrame, taux_eur: float) -> pd.DataFrame:
    df = df.copy()
    df.columns = df.columns.str.strip().str.lower()
    df["statut"] = df["statut"].str.strip().str.lower().replace({"livree": "livrée", "annulee": "annulée"})
    df = df.drop_duplicates(subset=["commande_id", "produit_id"])
    df["montant_xof"] = df["prix_unitaire"] * df["quantite"]
    en_euros = df["devise"] == "EUR"
    df.loc[en_euros, "montant_xof"] = (df.loc[en_euros, "montant_xof"] * taux_eur).round(0)
    df["devise_origine"] = df["devise"]
    return df.drop(columns=["devise"])
```

Exemple chiffré : une ligne de 2 articles à 20 € donne 40 € × 655,957 = **26 238 FCFA**, après arrondi.

## Contrôler la qualité

Un pipeline qui charge des données fausses est **pire** qu'un pipeline qui s'arrête. On vérifie donc la qualité **avant** de charger :

```python
# etl/controler.py
class ErreurQualite(Exception):
    pass

def controler(df):
    problemes = []
    if df.empty: problemes.append("aucune ligne")
    if df["commande_id"].isna().any(): problemes.append("commande_id manquant")
    if (df["quantite"] <= 0).any(): problemes.append("quantité nulle ou négative")
    if not df["statut"].isin(["livrée", "annulée", "en cours"]).all(): problemes.append("statut inconnu")
    if df.duplicated(["commande_id", "produit_id"]).any(): problemes.append("doublons")
    if problemes:
        raise ErreurQualite(" ; ".join(problemes))
```

Les **dimensions de la qualité** (DAMA) : **complétude** (pas de manquants), **unicité** (pas de doublons), **validité** (valeurs autorisées), **exactitude**, **cohérence** et **fraîcheur**.

Une variante consiste à mettre les lignes invalides en **quarantaine** (une table `rejets`) et à charger les autres. Le choix dépend du métier.

## Charger, de façon idempotente et incrémentale

```python
# etl/charger.py
from sqlalchemy import create_engine, text

def charger_commandes(df, url_cible: str):
    moteur = create_engine(url_cible)
    with moteur.begin() as c:                                   # une transaction : tout ou rien
        c.execute(text("CREATE SCHEMA IF NOT EXISTS silver"))
        c.execute(text("""CREATE TABLE IF NOT EXISTS silver.lignes_commande (
            commande_id int, produit_id int, client_id int, date_cmd date, statut text,
            quantite int, prix_unitaire numeric, montant_xof numeric, devise_origine text,
            charge_le timestamptz DEFAULT now(),
            PRIMARY KEY (commande_id, produit_id))"""))
        df.to_sql("tmp_lignes", c, schema="silver", if_exists="replace", index=False)   # zone de transit
        c.execute(text("""
            INSERT INTO silver.lignes_commande (commande_id, produit_id, client_id, date_cmd, statut,
                   quantite, prix_unitaire, montant_xof, devise_origine)
            SELECT commande_id, produit_id, client_id, date_cmd, statut, quantite, prix_unitaire, montant_xof, devise_origine
            FROM silver.tmp_lignes
            ON CONFLICT (commande_id, produit_id) DO UPDATE SET
              statut = EXCLUDED.statut, quantite = EXCLUDED.quantite,
              montant_xof = EXCLUDED.montant_xof, charge_le = now()"""))
        c.execute(text("DROP TABLE silver.tmp_lignes"))
```

- **Idempotent** : relancer le pipeline sur le même fichier met à jour les lignes **sans doublon**, grâce à la clé primaire et à `ON CONFLICT`.
- **Transactionnel** : en cas d'erreur au milieu, rien n'est chargé. On en reparle en semaine 8.
- **Incrémental** : pour les tables sources volumineuses, on ne lit que ce qui a changé depuis la dernière exécution, grâce à un **filigrane** (*watermark*).

```python
dernier = extraire_table(URL_CIBLE, "SELECT COALESCE(MAX(maj_le), '1970-01-01') AS f FROM silver.clients")["f"][0]
nouveaux = extraire_table(URL_SOURCE, "SELECT * FROM clients WHERE maj_le > :f", {"f": dernier})
```

## L'orchestration du script

```python
# main.py
import logging, os, sys
from etl import extraire, transformer, controler, charger

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("etl")

def main(chemin_csv: str):
    url = os.environ["DATABASE_URL_CIBLE"]                  # erreur immédiate si la variable manque
    log.info("Extraction de %s", chemin_csv)
    df = extraire.extraire_csv(chemin_csv)
    taux = extraire.extraire_taux_eur_xof()
    log.info("%d lignes extraites, taux EUR→XOF %.3f", len(df), taux)
    df = transformer.transformer_commandes(df, taux)
    controler.controler(df)
    charger.charger_commandes(df, url)
    log.info("Chargement terminé : %d lignes", len(df))

if __name__ == "__main__":
    try:
        main(sys.argv[1])
    except Exception:
        log.exception("Échec du pipeline")
        sys.exit(1)                     # code non nul : cron, Airflow ou la CI savent que ça a échoué
```

**La dockerisation** : `FROM python:3.12-slim`, puis `pip install -r requirements.txt`, puis `CMD ["python", "main.py", "/donnees/commandes.csv"]`. On l'exécute avec `docker run --env-file .env -v $(pwd)/donnees:/donnees etl-boutique`.

## Démonstration

1. On génère un `commandes.csv` de 200 lignes, avec volontairement 5 doublons, 2 quantités négatives, des statuts sans accent et 20 lignes en euros.
2. Première exécution : le contrôle qualité **échoue** et le journal indique pourquoi.
3. On corrige la transformation (les doublons sont retirés, les lignes invalides partent en quarantaine).
4. On relance : 193 lignes sont chargées.
5. On relance une deuxième fois : il y a **toujours 193** lignes, ce qui prouve l'idempotence.

## Exercice guidé

1. Écris `controler()` pour un fichier `clients.csv` : `client_id` unique et non nul, e-mail valide (contient un @), et date d'inscription qui n'est pas dans le futur.
2. Écris un test pytest qui vérifie que `controler()` lève `ErreurQualite` quand il y a un doublon.

## Exercice autonome

Construis le pipeline complet du projet `etl-boutique` :

1. Extraction des trois sources (CSV, API, PostgreSQL).
2. Transformation : normalisation, conversion des devises, jointure avec `clients` pour ajouter la ville.
3. Contrôle qualité avec quarantaine des lignes invalides dans `silver.rejets`, avec une colonne `raison`.
4. Chargement idempotent, et chargement incrémental des clients avec un filigrane.
5. Dockerisation, puis planification quotidienne avec cron (semaine 2).
6. Une preuve d'idempotence : le même nombre de lignes après deux exécutions identiques.

## Correction

Exercice guidé :

```python
import pandas as pd

def controler_clients(df):
    problemes = []
    if df["client_id"].isna().any() or df["client_id"].duplicated().any():
        problemes.append("client_id manquant ou en double")
    if not df["email"].str.contains("@", na=False).all():
        problemes.append("e-mail invalide")
    if (pd.to_datetime(df["inscrit_le"]) > pd.Timestamp.today()).any():
        problemes.append("date d'inscription dans le futur")
    if problemes:
        raise ErreurQualite(" ; ".join(problemes))

# test_controler.py
import pandas as pd, pytest
def test_doublon_rejete():
    df = pd.DataFrame({"client_id": [1, 1], "email": ["a@x.sn", "b@x.sn"], "inscrit_le": ["2026-01-01"] * 2})
    with pytest.raises(ErreurQualite, match="double"):
        controler_clients(df)
```

Exercice autonome, la quarantaine :

```python
valides = df["quantite"].gt(0) & df["commande_id"].notna()
rejets = df[~valides].assign(raison="quantité ≤ 0 ou identifiant manquant")
rejets.to_sql("rejets", moteur, schema="silver", if_exists="append", index=False)
df = df[valides]
```

Le contrôle de l'idempotence : `SELECT COUNT(*) FROM silver.lignes_commande` doit renvoyer la même valeur après la 1re et la 2e exécution, et `charge_le` doit avoir été mis à jour.

## Pour aller plus loin

- **Great Expectations** et **Soda** sont des outils dédiés aux contrôles de qualité des données.
- **Airbyte** propose des centaines de connecteurs d'extraction prêts à l'emploi : c'est le « EL » de l'ELT.
- Vendredi : **dbt** transforme la couche silver en étoile gold, avec des tests et de la documentation.
