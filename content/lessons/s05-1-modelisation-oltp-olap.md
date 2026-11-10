---
slug: s05-1-modelisation-oltp-olap
titre: Modélisation des données, OLTP, OLAP et schéma en étoile
domaine: Data
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S5, ue: "Ingénierie des données", option: big-data-ia }
parcours:
  - { parcours: data, ordre: 7 }
ordre: 5
prerequis_cours: []
visibilite: public
objectifs:
  - Distinguer un système transactionnel (OLTP) d'un système analytique (OLAP)
  - Expliquer le rôle d'un entrepôt de données et de l'architecture médaillon
  - Concevoir un schéma en étoile (table de faits, dimensions, granularité)
  - Choisir les clés de substitution et gérer l'historique (dimensions à évolution lente)
  - Traduire un besoin métier en modèle dimensionnel et l'implémenter en SQL
prerequis:
  - Cours « SQL pour la data, jointures et agrégats » et « SQL avancé, CTE et fonctions de fenêtrage »
referentiels:
  - Ralph Kimball et Margy Ross, « The Data Warehouse Toolkit », 3e édition (méthode en 4 étapes)
  - Databricks Certified Data Engineer Associate, domaine « Data Modeling » (architecture médaillon)
  - Microsoft PL-300, domaine « Model the data »
quiz:
  - question: "Quelle est la principale différence entre OLTP et OLAP ?"
    choix: ["OLTP est plus récent", "OLTP gère de nombreuses petites transactions (écritures) ; OLAP sert des analyses sur de grands volumes (lectures)", "OLAP n'utilise pas SQL", "Il n'y en a pas"]
    reponse: 1
    explication: "La base de la boutique (OLTP) enregistre chaque commande ; l'entrepôt (OLAP) répond à « CA par mois et par région sur 3 ans »."
  - question: "Que contient une table de faits ?"
    choix: ["Des descriptions textuelles", "Des mesures numériques (montant, quantité) et des clés vers les dimensions", "Les mots de passe", "Uniquement des dates"]
    reponse: 1
    explication: "Les faits sont ce qu'on mesure ; les dimensions sont les axes d'analyse (qui, quoi, quand, où)."
  - question: "Qu'est-ce que la granularité d'une table de faits ?"
    choix: ["Sa taille en Go", "Le niveau de détail d'une ligne (par exemple une ligne de commande)", "Le nombre de colonnes", "La vitesse des requêtes"]
    reponse: 1
    explication: "C'est la première décision de Kimball : choisir le grain le plus fin utile, puis s'y tenir."
  - question: "Pourquoi le schéma en étoile est-il dénormalisé ?"
    choix: ["Par erreur", "Pour simplifier et accélérer les requêtes d'analyse (moins de jointures)", "Pour économiser de l'espace", "Parce que SQL l'impose"]
    reponse: 1
    explication: "La dimension produit contient directement catégorie et sous-catégorie : une seule jointure suffit."
  - question: "Une cliente déménage de Thiès à Dakar. Avec une dimension SCD de type 2, que se passe-t-il ?"
    choix: ["On écrase la ville", "On ajoute une nouvelle ligne avec des dates de validité, l'ancienne est conservée", "On supprime la cliente", "Rien"]
    reponse: 1
    explication: "Les ventes passées restent attribuées à Thiès, les nouvelles à Dakar : l'historique est juste."
---

## Deux usages, deux modèles

| | OLTP (transactionnel) | OLAP (analytique) |
|---|---|---|
| Exemple | la base de la boutique, de Wave, d'une banque | l'entrepôt de données de l'entreprise |
| Opérations | beaucoup de petites écritures (`INSERT`, `UPDATE`) | de grosses lectures et des agrégations |
| Question type | « enregistre la commande n° 1042 » | « CA par région et par mois sur 3 ans » |
| Modèle | **normalisé** (3FN), sans redondance | **dimensionnel** (étoile), dénormalisé |
| Utilisateurs | l'application | les analystes, Power BI, la data science |
| Outils | PostgreSQL, MySQL | BigQuery, Snowflake, Redshift, Databricks, ou PostgreSQL |

Lancer de grosses analyses directement sur la base de production la **ralentirait** pour les clients. Le modèle normalisé impose aussi de nombreuses jointures. On **copie** donc les données dans un **entrepôt** (*data warehouse*) organisé pour l'analyse. Le transport et la transformation, c'est l'**ETL**, sujet du cours « Construire un pipeline ETL en Python vers PostgreSQL ».

## L'architecture médaillon

C'est l'organisation la plus répandue aujourd'hui (Databricks, dbt) :

```
 Sources            Bronze (brut)          Silver (nettoyé)        Gold (métier)
 ─────────          ──────────────          ────────────────        ─────────────
 Base boutique ──▶  copie telle quelle ──▶  types, doublons,   ──▶  schéma en étoile,
 CSV, API          (historique complet)    jointures propres       indicateurs prêts
                                                                    pour Power BI
```

On garde le **brut** pour pouvoir tout recalculer en cas d'erreur, et on n'expose aux utilisateurs que la couche **gold**.

## Le schéma en étoile

```
                    ┌──────────────┐
                    │  dim_date    │
                    └──────┬───────┘
┌──────────────┐    ┌──────▼───────────┐    ┌──────────────┐
│ dim_client   ├────▶  fait_ventes     ◀────┤ dim_produit  │
└──────────────┘    │ (mesures + clés) │    └──────────────┘
                    └──────▲───────────┘
                    ┌──────┴───────┐
                    │ dim_magasin  │
                    └──────────────┘
```

| Élément | Contenu | Exemple |
|---|---|---|
| **Table de faits** | des **mesures** numériques et additives, plus les clés étrangères vers les dimensions | `quantite`, `montant`, `remise` |
| **Dimensions** | les **axes d'analyse**, avec des attributs descriptifs | client (nom, ville, région), produit (nom, catégorie), date (jour, mois, trimestre, jour férié) |

Les faits répondent à « **combien** ». Les dimensions répondent à « **qui, quoi, quand, où** ».

## La méthode de Kimball en 4 étapes

1. **Choisir le processus métier** : les ventes.
2. **Déclarer la granularité**, c'est-à-dire ce que représente **une ligne** de faits : « une ligne de commande », soit un produit dans une commande. On choisit le grain **le plus fin** utile, car on peut toujours agréger ensuite, mais jamais revenir au détail.
3. **Identifier les dimensions** : date, client, produit, canal de vente.
4. **Identifier les faits** : quantité, prix unitaire, montant, remise.

## Les clés et l'historique

- **La clé de substitution** (`client_sk`) est un entier généré **par l'entrepôt**, indépendant de l'identifiant de la source (`client_id`, appelé **clé naturelle** ou clé métier). Elle protège des changements de la source et permet de garder l'historique.
- **La dimension date** est générée une fois pour toutes, avec une ligne par jour : `date_sk = 20261208`, l'année, le mois, son nom, le trimestre, le jour de la semaine, et des indicateurs comme `est_weekend` ou `est_ferie` (Tabaski, Magal…).

**Les dimensions à évolution lente (SCD)** répondent à la question de la cliente qui déménage de Thiès à Dakar :

| Type | Méthode | Conséquence |
|---|---|---|
| **SCD 1** | on écrase l'ancienne valeur | tout l'historique bascule sur Dakar |
| **SCD 2** | on ajoute une **nouvelle ligne**, avec `valide_du`, `valide_au` et `est_actuelle` | les ventes passées restent à Thiès, les nouvelles vont à Dakar |

```
client_sk | client_id | nom        | ville  | valide_du  | valide_au  | est_actuelle
   12     |     2     | Moussa Fall| Thiès  | 2026-02-03 | 2026-12-07 | false
   31     |     2     | Moussa Fall| Dakar  | 2026-12-08 | 9999-12-31 | true
```

## L'implémentation SQL

```sql
CREATE SCHEMA gold;

CREATE TABLE gold.dim_date (
  date_sk int PRIMARY KEY,           -- 20261208
  jour date NOT NULL, annee int, trimestre int, mois int, nom_mois text, jour_semaine int, est_weekend boolean
);
INSERT INTO gold.dim_date
SELECT to_char(d,'YYYYMMDD')::int, d, extract(year from d), extract(quarter from d), extract(month from d),
       to_char(d,'TMMonth'), extract(isodow from d), extract(isodow from d) >= 6
FROM generate_series('2025-01-01'::date, '2027-12-31', '1 day') AS d;

CREATE TABLE gold.dim_produit (
  produit_sk serial PRIMARY KEY, produit_id int NOT NULL, nom text, categorie text, prix_catalogue int
);
CREATE TABLE gold.dim_client (
  client_sk serial PRIMARY KEY, client_id int NOT NULL, nom text, ville text, region text,
  valide_du date, valide_au date DEFAULT '9999-12-31', est_actuelle boolean DEFAULT true
);
CREATE TABLE gold.fait_ventes (
  date_sk int REFERENCES gold.dim_date, client_sk int REFERENCES gold.dim_client,
  produit_sk int REFERENCES gold.dim_produit, commande_id int,      -- dimension dégénérée
  quantite int, prix_unitaire int, montant int
);
```

Une requête d'analyse ne demande alors qu'**une jointure par axe** :

```sql
SELECT d.annee, d.nom_mois, p.categorie, SUM(f.montant) AS ca
FROM gold.fait_ventes f
JOIN gold.dim_date d    USING (date_sk)
JOIN gold.dim_produit p USING (produit_sk)
GROUP BY 1, 2, 3, d.mois ORDER BY d.mois;
```

## Normalisation ou étoile : le calcul

Dans la base OLTP, pour obtenir le chiffre d'affaires par catégorie et par région, il faut joindre `lignes`, `commandes`, `clients`, `villes`, `regions`, `produits` et `categories`, soit **7 tables**. Dans l'étoile : `fait_ventes`, `dim_client` et `dim_produit`, soit **3 tables**.

Le prix à payer est la redondance : « Vêtements » est répété sur chaque ligne de produit. Ce n'est pas un problème dans un entrepôt, où l'on lit beaucoup et écrit peu.

## Démonstration

À partir de la base de la boutique (voir le cours « SQL pour la data, jointures et agrégats ») :

1. On applique les 4 étapes de Kimball.
2. On dessine l'étoile.
3. On crée le schéma `gold` et la dimension date.
4. On remplit les dimensions et la table de faits à la main, avec des `INSERT … SELECT`.
5. On compare deux fois le chiffre d'affaires par catégorie, une fois depuis l'OLTP, une fois depuis l'étoile. On doit retrouver **141 000** pour les Vêtements.

## Exercice guidé

Une école de formation veut analyser ses **inscriptions** : quelle formation, quel apprenant, quelle date, quel canal (site, salon, recommandation), et pour quel montant payé, avec quelle remise.

1. Donne la granularité.
2. Liste les dimensions avec 3 attributs chacune.
3. Liste les faits.
4. Dessine l'étoile.

## Exercice autonome

1. Modélise en étoile l'activité d'un service de **paiement mobile** (transferts entre utilisateurs, paiements chez des marchands, frais). Précise la granularité, les dimensions, les faits, et le type de SCD pour la dimension « marchand », dont la catégorie peut changer.
2. Crée le schéma en SQL, avec la dimension date générée.
3. Remplis-le avec au moins 30 transactions fictives réparties sur 3 mois.
4. Écris 3 requêtes d'analyse : le volume par mois, le top 5 des marchands, et la part des frais dans le chiffre d'affaires par type de transaction.
5. Une seule table de faits suffit-elle pour les transferts et les paiements ? Argumente.

## Correction

Exercice guidé :

1. **La granularité** : une ligne correspond à une inscription d'un apprenant à une session de formation.
2. **Les dimensions** :
   - `dim_formation` : intitulé, domaine, durée ;
   - `dim_apprenant` : nom, ville, tranche d'âge ;
   - `dim_date` : jour, mois, trimestre ;
   - `dim_canal` : canal, campagne, partenaire.
3. **Les faits** : le montant catalogue, la remise, le montant payé, et éventuellement un indicateur `nb_inscription = 1` pour compter facilement.
4. **L'étoile** : `fait_inscriptions` au centre, reliée aux quatre dimensions.

Exercice autonome :

1. **La granularité** : une ligne par transaction.
2. **Les dimensions** : date (et heure si besoin), utilisateur émetteur, utilisateur ou marchand bénéficiaire, type de transaction, canal (application, USSD).
3. **Les faits** : le montant, les frais, et éventuellement la commission versée au marchand.
4. **Le SCD** : on choisit un **SCD 2** pour la catégorie du marchand, afin que les analyses passées restent justes.

Question 5 : **une seule** table de faits convient si les deux processus partagent le même grain et les mêmes mesures. On les distingue alors grâce à la dimension « type ». Si leurs mesures diffèrent beaucoup (un paiement porte une commission marchand, un transfert n'en a pas), on préfère **deux** tables de faits qui partagent des **dimensions conformes** (date, utilisateur). C'est l'architecture en *bus* de Kimball.

## Pour aller plus loin

- Le **schéma en flocon** normalise les dimensions (une table catégorie séparée). Il est rarement préférable à l'étoile.
- Le **Data Vault** est une méthode alternative pour les très grands entrepôts qui reçoivent de nombreuses sources.
- Cours suivant conseillé : « Construire un pipeline ETL en Python vers PostgreSQL » : construire le pipeline ETL qui alimente automatiquement cette étoile, de bronze à gold.
