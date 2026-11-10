---
slug: s06-1-dbt-tests-doc
titre: dbt, tests, documentation, snapshots et intégration continue
domaine: Data
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S6, ue: "Pipelines et big data", option: big-data-ia }
parcours:
  - { parcours: data, ordre: 10 }
ordre: 2
prerequis_cours: [s05-3-dbt]
visibilite: public
objectifs:
  - Déclarer les tests génériques (unique, not_null, accepted_values, relationships)
  - Écrire des tests singuliers et des tests unitaires de modèles
  - Documenter modèles et colonnes, et publier le site de documentation avec son DAG
  - Historiser une dimension avec un snapshot (SCD de type 2)
  - Exécuter dbt build en CI avec un environnement séparé
prerequis:
  - Séance « dbt, transformer les données en SQL comme du code »
referentiels:
  - dbt Analytics Engineering Certification, domaines « Testing », « Documentation » et « Deploying »
  - DAMA-DMBOK 2, chapitre « Data Quality »
  - Documentation dbt, « Data tests », « Unit tests » et « Snapshots »
quiz:
  - question: "Que vérifie le test relationships ?"
    choix: ["Que la colonne est unique", "Que chaque valeur de la clé étrangère existe dans la table référencée (intégrité référentielle)", "Que la table n'est pas vide", "Que les dates sont correctes"]
    reponse: 1
    explication: "Par exemple : chaque client_id de fct_ventes existe dans dim_clients ; sinon, des ventes « orphelines » disparaissent des analyses."
  - question: "Comment fonctionne un test singulier dans dbt ?"
    choix: ["Il renvoie true ou false", "C'est une requête SELECT qui renvoie les lignes en erreur ; le test échoue s'il renvoie au moins une ligne", "C'est un script Python", "Il compte les colonnes"]
    reponse: 1
    explication: "Exemple : SELECT * FROM fct_ventes WHERE montant < 0. Zéro ligne = test réussi."
  - question: "Que fait dbt build ?"
    choix: ["Il compile seulement", "Il exécute dans l'ordre du DAG les modèles, les tests, les snapshots et les seeds", "Il construit une image Docker", "Il génère la documentation"]
    reponse: 1
    explication: "Si un test échoue, les modèles qui en dépendent ne sont pas construits : on ne propage pas des données fausses."
  - question: "Quel est le rôle d'un snapshot dbt ?"
    choix: ["Faire une sauvegarde de la base", "Garder l'historique des changements d'une table source (SCD type 2) avec des dates de validité", "Prendre une capture d'écran", "Accélérer les requêtes"]
    reponse: 1
    explication: "dbt ajoute dbt_valid_from et dbt_valid_to : on sait quelle était la ville d'un client à n'importe quelle date."
  - question: "Pourquoi exécuter la CI dbt dans un schéma séparé ?"
    choix: ["Pour aller plus vite", "Pour tester les modifications d'une pull request sans toucher aux tables utilisées par les tableaux de bord", "Parce que dbt l'impose", "Pour économiser de l'espace"]
    reponse: 1
    explication: "La CI construit dans dbt_ci_pr_42 par exemple, valide, puis la fusion déclenche la production."
---

## Pourquoi tester des données ?

Le code des modèles peut être juste alors que les **données** sont fausses. Un doublon dans la source, un identifiant client inconnu, un statut nouveau qu'on n'attendait pas, et le chiffre d'affaires affiché à la direction devient faux, **sans que personne ne le remarque**. Les tests dbt détectent ces problèmes **avant** qu'ils n'atteignent Power BI.

## Les tests génériques

Ils se déclarent en YAML, à côté des modèles :

```yaml
# models/marts/_marts.yml
version: 2
models:
  - name: fct_ventes
    description: "Une ligne par produit vendu dans une commande livrée (grain : ligne de commande)."
    columns:
      - name: commande_id
        tests: [not_null]
      - name: client_id
        tests:
          - not_null
          - relationships:
              to: ref('dim_clients')
              field: client_id
      - name: montant
        description: "Montant en FCFA, prix unitaire × quantité, converti depuis l'euro si besoin."
        tests:
          - not_null
          - dbt_utils.accepted_range: { min_value: 0 }
    tests:
      - dbt_utils.unique_combination_of_columns:
          combination_of_columns: [commande_id, produit_id]

  - name: dim_clients
    columns:
      - name: client_id
        tests: [unique, not_null]
      - name: region
        tests:
          - accepted_values:
              values: ['Ouest', 'Nord', 'Centre', 'Sud', 'Est', 'Autre']
```

| Test | Vérifie | Dimension de qualité |
|---|---|---|
| `unique` | aucune valeur en double | unicité |
| `not_null` | aucune valeur manquante | complétude |
| `accepted_values` | valeurs autorisées | validité |
| `relationships` | la clé étrangère existe dans la table cible | cohérence |

```bash
dbt test                         # tous les tests
dbt test --select fct_ventes     # les tests d'un modèle
```

**La gravité** : `config: { severity: warn }` signale le problème sans bloquer le pipeline. On s'en sert pour un problème connu et toléré.

## Les tests singuliers

Un **test singulier** est un fichier SQL dans `tests/` qui renvoie **les lignes en erreur**. **Zéro ligne signifie que le test passe.**

```sql
-- tests/assert_ca_coherent_avec_silver.sql
-- Le CA total de fct_ventes doit égaler celui des lignes livrées de la couche silver
WITH mart AS (SELECT SUM(montant) AS ca FROM {{ ref('fct_ventes') }}),
     src  AS (SELECT SUM(montant_xof) AS ca FROM {{ source('boutique', 'lignes_commande') }} WHERE statut = 'livrée')
SELECT mart.ca, src.ca FROM mart, src WHERE mart.ca <> src.ca
```

C'est un **test de réconciliation** : il vérifie que la transformation n'a ni perdu ni dupliqué de chiffre d'affaires.

## Les tests unitaires de modèles

Depuis dbt 1.8, on peut tester la **logique** d'un modèle avec des données d'entrée fictives, sans dépendre des vraies données :

```yaml
unit_tests:
  - name: region_calculee_selon_la_ville
    model: dim_clients
    given:
      - input: ref('stg_boutique__clients')
        rows:
          - { client_id: 1, ville: 'Dakar' }
          - { client_id: 2, ville: 'Saint-Louis' }
          - { client_id: 3, ville: 'Ziguinchor' }
    expect:
      rows:
        - { client_id: 1, region: 'Ouest' }
        - { client_id: 2, region: 'Nord' }
        - { client_id: 3, region: 'Autre' }
```

On retrouve la logique des tests Jest du 11 décembre, appliquée au SQL : les **tests de données** vérifient les données réelles, les **tests unitaires** vérifient le code.

## La documentation

Chaque modèle et chaque colonne reçoivent une `description` dans les fichiers YAML. Pour les textes longs, on utilise des blocs `{% docs %}`.

```bash
dbt docs generate      # produit le catalogue (target/catalog.json)
dbt docs serve         # site local : descriptions, colonnes, types, tests, SQL compilé et DAG interactif
```

Le **lignage** (*lineage*) affiché permet de répondre en un clic à des questions comme : « Si je modifie `stg_boutique__clients`, quels tableaux de bord sont touchés ? »

## Les snapshots : l'historique SCD 2

```sql
-- snapshots/clients_snapshot.sql
{% snapshot clients_snapshot %}
{{ config(target_schema='snapshots', unique_key='client_id', strategy='check', check_cols=['ville', 'nom']) }}
SELECT * FROM {{ source('boutique', 'clients') }}
{% endsnapshot %}
```

À chaque `dbt snapshot`, dbt compare la source avec la dernière version enregistrée. Si la `ville` a changé, il **ferme** l'ancienne ligne (`dbt_valid_to` reçoit la date du jour) et **ajoute** une nouvelle ligne. C'est exactement le SCD de type 2 vu le 8 décembre.

| client_id | ville | dbt_valid_from | dbt_valid_to |
|---|---|---|---|
| 2 | Thiès | 2026-12-11 | 2026-12-15 |
| 2 | Dakar | 2026-12-15 | (null : version actuelle) |

## dbt build et la CI

```bash
dbt build     # seeds, puis snapshots, modèles et tests, dans l'ordre du DAG
```

**Si un test échoue, les modèles en aval ne sont pas construits.** On évite ainsi de propager des données fausses.

**La CI dans GitHub Actions** :

```yaml
on: pull_request
jobs:
  dbt:
    runs-on: ubuntu-latest
    services:
      postgres: { image: postgres:16-alpine, env: { POSTGRES_PASSWORD: ci }, ports: ['5432:5432'] }
    env:
      DBT_PASSWORD: ci
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install dbt-postgres
      - run: dbt deps && dbt seed && dbt build --target ci
        env: { DBT_PROFILES_DIR: ./ci }        # un profiles.yml pour la CI, sans secret en dur
```

En entreprise, on utilise `--select state:modified+` pour ne reconstruire que les modèles modifiés et leurs dépendances. On construit dans un schéma propre à chaque PR, sans jamais toucher à la production.

## Démonstration

1. On ajoute les tests YAML au projet de vendredi, puis `dbt test` : tout passe.
2. On insère dans la source une vente avec un `client_id` inexistant : le test `relationships` **échoue**, et dbt affiche la requête de diagnostic.
3. On écrit le test de réconciliation du chiffre d'affaires.
4. On crée un snapshot, on modifie la ville de Moussa, on relance `dbt snapshot` et on observe deux lignes.
5. On fait `dbt docs serve` pour parcourir le lignage.

## Exercice guidé

1. Ajoute à `dim_produits` les tests `unique` et `not_null` sur `produit_id`, et `accepted_values` sur `categorie`.
2. Écris un test singulier : aucune commande ne doit avoir une date dans le futur.
3. Lance `dbt build` et lis le résumé (`PASS`, `WARN`, `ERROR`).

## Exercice autonome

1. Atteins au moins un test par colonne clé de tous les marts, plus 2 tests singuliers métier.
2. Ajoute un test unitaire de modèle pour la macro `montant_ttc` ou la logique de région.
3. Décris en YAML tous les modèles marts et leurs colonnes, puis publie la documentation.
4. Mets en place le snapshot des clients et des produits (le prix peut changer).
5. Crée le workflow de CI dbt sur les pull requests.
6. Rédige le **contrat de données** de `fct_ventes` en 5 lignes : grain, fraîcheur, clés, règles et responsable.

## Correction

Exercice guidé :

```yaml
  - name: dim_produits
    columns:
      - name: produit_id
        tests: [unique, not_null]
      - name: categorie
        tests:
          - accepted_values: { values: ['Vêtements', 'Accessoires', 'Chaussures'] }
```

```sql
-- tests/assert_pas_de_commande_future.sql
SELECT * FROM {{ ref('stg_boutique__commandes') }} WHERE date_commande > current_date
```

Exercice autonome, question 6, un exemple de contrat :

- **grain** : une ligne par produit d'une commande livrée ;
- **fraîcheur** : moins de 24 h (test `source freshness`) ;
- **clés** : (`commande_id`, `produit_id`) est unique, et `client_id` et `produit_id` existent dans leurs dimensions ;
- **règles** : `montant` ≥ 0, et le total est égal à celui de la couche silver livrée ;
- **responsable** : l'équipe data (Olivier), contactée en cas d'échec.

## Pour aller plus loin

- `dbt-expectations` propose plus de 50 tests prêts à l'emploi : distributions, formats, volumes.
- Les **contrats de modèle** dbt (`contract: enforced: true`) imposent les types et les noms des colonnes.
- Demain : Airflow, pour orchestrer l'ETL Python et dbt chaque nuit.
