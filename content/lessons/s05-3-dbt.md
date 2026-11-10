---
slug: s05-3-dbt
titre: dbt, transformer les données en SQL comme du code
piste: solo
semaine: 5
date: 2026-12-11
domaine: Data
duree: 150
niveau: bases
objectifs:
  - Expliquer la place de dbt dans une architecture ELT
  - Créer un projet dbt connecté à PostgreSQL et le configurer (profiles.yml, dbt_project.yml)
  - Déclarer des sources et écrire des modèles en couches (staging, intermediate, marts)
  - Relier les modèles avec ref() et source() et lire le graphe de dépendances (DAG)
  - Choisir la matérialisation adaptée (view, table, incremental)
prerequis:
  - Séances « SQL avancé, CTE et fonctions de fenêtrage », « Modélisation des données » et « Pipeline ETL »
referentiels:
  - dbt Analytics Engineering Certification (dbt Labs), domaines « Developing dbt models » et « Managing data pipelines »
  - "Documentation dbt, « Best practice guides : How we structure our dbt projects »"
  - Databricks Certified Data Engineer Associate (architecture médaillon)
quiz:
  - question: "Quelle étape de l'ELT dbt prend-il en charge ?"
    choix: ["L'extraction", "Le chargement", "La transformation (le T), dans l'entrepôt, en SQL", "La visualisation"]
    reponse: 2
    explication: "dbt n'extrait ni ne charge : il exécute des SELECT dans l'entrepôt et les matérialise en vues ou tables."
  - question: "Pourquoi écrire {{ ref('stg_commandes') }} plutôt que silver.stg_commandes ?"
    choix: ["C'est plus court", "dbt en déduit les dépendances (DAG), l'ordre d'exécution et le bon schéma selon l'environnement", "C'est obligatoire en SQL", "Pour la couleur dans l'éditeur"]
    reponse: 1
    explication: "ref() construit le graphe : dbt sait qu'il doit construire stg_commandes avant fct_ventes."
  - question: "Que fait la matérialisation view ?"
    choix: ["Elle copie les données dans une table", "Elle crée une vue SQL : rien n'est stocké, la requête s'exécute à chaque lecture", "Elle crée un fichier CSV", "Elle supprime le modèle"]
    reponse: 1
    explication: "Vue : toujours à jour et sans stockage, mais recalculée à chaque requête. Table : rapide à lire mais à reconstruire."
  - question: "Quel est le rôle de la couche staging ?"
    choix: ["Les calculs métier complexes", "Un modèle par table source : renommer, typer, nettoyer légèrement, sans jointure", "Les tableaux de bord", "Les sauvegardes"]
    reponse: 1
    explication: "La staging est l'interface propre vers les sources ; les jointures et la logique métier viennent dans les couches suivantes."
  - question: "Quand utiliser une matérialisation incremental ?"
    choix: ["Toujours", "Pour de grosses tables de faits où l'on n'ajoute que les nouvelles lignes à chaque exécution", "Pour les petites dimensions", "Jamais en production"]
    reponse: 1
    explication: "On évite de recalculer des années d'historique chaque nuit ; is_incremental() filtre les nouvelles lignes."
---

## Le problème que résout dbt

Dans beaucoup d'entreprises, les transformations SQL sont des scripts éparpillés, copiés-collés, sans tests, sans versions et sans documentation. Quand un chiffre est faux dans Power BI, personne ne sait d'où il vient.

**dbt** (*data build tool*) applique au SQL les pratiques du **génie logiciel** : Git, modularité, tests, documentation et CI. Le métier qui en est né s'appelle **analytics engineer**.

```
Sources (bronze, silver) ──▶  dbt : SELECT … modulaires ──▶  Entrepôt : vues et tables (gold)
                              tests, documentation, DAG
```

dbt **n'extrait pas** et **ne charge pas**. Il exécute des `SELECT` **dans** l'entrepôt et les transforme en vues ou en tables. Il fonctionne avec PostgreSQL, BigQuery, Snowflake, Databricks et Redshift.

## L'installation et le projet

```bash
python -m venv .venv && source .venv/bin/activate
pip install dbt-postgres
dbt init boutique_dbt
```

```yaml
# ~/.dbt/profiles.yml : les connexions, HORS du dépôt Git
boutique_dbt:
  target: dev
  outputs:
    dev:
      type: postgres
      host: localhost
      port: 5434
      user: postgres
      password: "{{ env_var('DBT_PASSWORD') }}"   # le secret vient de l'environnement
      dbname: postgres
      schema: dbt_dev
      threads: 4
```

```yaml
# dbt_project.yml
name: boutique_dbt
profile: boutique_dbt
models:
  boutique_dbt:
    staging:      { +materialized: view,  +schema: staging }
    intermediate: { +materialized: view,  +schema: intermediate }
    marts:        { +materialized: table, +schema: marts }
```

`dbt debug` vérifie la connexion.

## L'organisation recommandée

```
models/
├── staging/                 un modèle par table source : renommer, typer, nettoyer
│   ├── _sources.yml
│   ├── stg_boutique__commandes.sql
│   ├── stg_boutique__clients.sql
│   └── stg_boutique__produits.sql
├── intermediate/            assemblages et logique réutilisable
│   └── int_lignes_enrichies.sql
└── marts/                   ce que voient les utilisateurs : l'étoile
    ├── dim_clients.sql
    ├── dim_produits.sql
    └── fct_ventes.sql
```

## Les sources

```yaml
# models/staging/_sources.yml
version: 2
sources:
  - name: boutique
    schema: silver                 # la sortie du pipeline ETL de mercredi
    tables:
      - name: lignes_commande
        loaded_at_field: charge_le
        freshness:                 # alerte si les données sont trop anciennes
          warn_after: { count: 24, period: hour }
      - name: clients
      - name: produits
```

## Les modèles

Un **modèle** est un fichier `.sql` qui contient **un seul SELECT**. dbt l'enveloppe dans un `CREATE VIEW` ou un `CREATE TABLE`.

```sql
-- models/staging/stg_boutique__commandes.sql
SELECT
    commande_id,
    produit_id,
    client_id,
    date_cmd::date            AS date_commande,
    statut,
    quantite,
    prix_unitaire,
    montant_xof               AS montant
FROM {{ source('boutique', 'lignes_commande') }}
```

```sql
-- models/intermediate/int_lignes_enrichies.sql
WITH lignes AS (SELECT * FROM {{ ref('stg_boutique__commandes') }}),
     produits AS (SELECT * FROM {{ ref('stg_boutique__produits') }})
SELECT l.*, p.categorie, p.nom AS produit
FROM lignes l
JOIN produits p USING (produit_id)
WHERE l.statut = 'livrée'
```

```sql
-- models/marts/fct_ventes.sql
SELECT
    to_char(date_commande, 'YYYYMMDD')::int AS date_sk,
    client_id, produit_id, commande_id,
    quantite, montant
FROM {{ ref('int_lignes_enrichies') }}
```

| Fonction | Rôle |
|---|---|
| `{{ source('boutique', 'clients') }}` | désigne une table **chargée par un autre outil** |
| `{{ ref('nom_du_modele') }}` | désigne un **autre modèle dbt** ; dbt en déduit les dépendances |

La syntaxe `{{ }}` est du **Jinja**, un langage de gabarits. On peut y écrire des variables, des boucles et des **macros**, qui sont des fonctions SQL réutilisables.

## Le DAG

À partir des `ref()` et des `source()`, dbt construit un **graphe orienté sans cycle** (DAG) :

```
source.lignes_commande ──▶ stg_commandes ──┐
source.produits ─────────▶ stg_produits ───┼──▶ int_lignes_enrichies ──▶ fct_ventes
source.clients ──────────▶ stg_clients ─────────────────────────────────▶ dim_clients
```

dbt exécute les modèles **dans l'ordre**, et en parallèle quand c'est possible (`threads: 4`).

```bash
dbt run                                  # construire tous les modèles
dbt run --select fct_ventes              # un seul modèle
dbt run --select +fct_ventes             # le modèle et TOUT ce dont il dépend
dbt run --select stg_boutique__commandes+   # le modèle et tout ce qui en dépend
dbt source freshness                     # les données sources sont-elles récentes ?
```

## Les matérialisations

| Type | Ce qui est créé | Lecture | Construction | Usage |
|---|---|---|---|---|
| `view` | une vue | recalculée à chaque fois | instantanée | staging |
| `table` | une table | rapide | complète à chaque `run` | marts de taille moyenne |
| `incremental` | une table, complétée | rapide | seulement les nouvelles lignes | grosses tables de faits |
| `ephemeral` | rien (CTE injectée) | | | petits calculs intermédiaires |

```sql
-- fct_ventes en incrémental
{{ config(materialized='incremental', unique_key=['commande_id','produit_id']) }}
SELECT ... FROM {{ ref('int_lignes_enrichies') }}
{% if is_incremental() %}
  WHERE date_commande > (SELECT MAX(to_date(date_sk::text,'YYYYMMDD')) FROM {{ this }})
{% endif %}
```

Exemple chiffré : une table de 50 millions de lignes reçoit 100 000 nouvelles lignes par jour. En `table`, dbt réécrit 50 millions de lignes chaque nuit. En `incremental`, il n'en traite que **100 000**, soit **0,2 %**.

## Démonstration

1. On fait `dbt init`, on configure la connexion à la base de la semaine, puis `dbt debug`.
2. On déclare les sources et on écrit les 3 modèles staging, puis `dbt run`, et on observe les vues dans `dbt_dev_staging`.
3. On écrit le modèle intermédiaire, puis les marts `dim_produits` et `fct_ventes`.
4. Avec `dbt docs generate` puis `dbt docs serve`, on affiche le DAG dans le navigateur.
5. On vérifie que le chiffre d'affaires des Vêtements, calculé depuis `fct_ventes`, vaut toujours **141 000**.

## Exercice guidé

1. Écris `stg_boutique__clients.sql` : renomme `inscrit_le` en `date_inscription` et remplace les villes nulles par « Non renseignée ».
2. Écris `dim_clients.sql`, qui ajoute une colonne `region` : Dakar et Thiès donnent « Ouest », Saint-Louis donne « Nord », sinon « Autre ».
3. Lance `dbt run --select +dim_clients` et explique ce qui est construit.

## Exercice autonome

1. Branche dbt sur la sortie de ton pipeline ETL (schéma `silver`).
2. Construis toute l'étoile de la séance de mardi : `dim_date` (avec une macro ou le paquet `dbt_utils`), `dim_clients`, `dim_produits` et `fct_ventes` en incrémental.
3. Ajoute un mart `mart_ca_mensuel` : le chiffre d'affaires par mois et par catégorie, avec l'évolution en % calculée par `LAG` (semaine 4).
4. Écris une macro `montant_ttc(colonne, taux=18)` qui applique la TVA de 18 %, et utilise-la.
5. Versionne le projet dans Git, en vérifiant que `profiles.yml` n'est **pas** dans le dépôt.

## Correction

Exercice guidé :

```sql
-- stg_boutique__clients.sql
SELECT client_id, nom, COALESCE(ville, 'Non renseignée') AS ville, inscrit_le AS date_inscription
FROM {{ source('boutique', 'clients') }}

-- dim_clients.sql
SELECT *,
  CASE WHEN ville IN ('Dakar','Thiès') THEN 'Ouest'
       WHEN ville = 'Saint-Louis' THEN 'Nord'
       ELSE 'Autre' END AS region
FROM {{ ref('stg_boutique__clients') }}
```

Question 3 : `+dim_clients` construit d'abord `stg_boutique__clients` (sa dépendance), puis `dim_clients`. La source n'est pas « construite », car elle existe déjà.

Exercice autonome, la macro de la question 4 :

```sql
-- macros/montant_ttc.sql
{% macro montant_ttc(colonne, taux=18) %}
    round({{ colonne }} * (1 + {{ taux }} / 100.0))
{% endmacro %}
-- utilisation : SELECT {{ montant_ttc('montant') }} AS montant_ttc
```

La vérification : un montant de 10 000 donne 10 000 × 1,18 = **11 800**.

## Pour aller plus loin

- `dbt_utils` et `dbt_expectations` sont des paquets de macros et de tests prêts à l'emploi (`packages.yml`, puis `dbt deps`).
- Les *snapshots* dbt implémentent automatiquement les dimensions SCD de type 2 vues mardi.
- Mardi prochain : les tests et la documentation dbt, puis l'intégration en CI.
