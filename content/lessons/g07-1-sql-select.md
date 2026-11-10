---
slug: g07-1-sql-select
titre: SQL, interroger une base avec SELECT
domaine: Bases de données
duree: 120
difficulte: découverte
licence:
  - { niveau: L2, semestre: S3, ue: "Bases de données et versionnement" }
parcours:
  - { parcours: web, ordre: 10 }
  - { parcours: data, ordre: 1 }
ordre: 3
prerequis_cours: []
visibilite: public
objectifs:
  - Expliquer ce qu'est une base de données relationnelle (tables, lignes, colonnes, clés)
  - Lancer PostgreSQL et s'y connecter avec psql ou un client graphique
  - Sélectionner des colonnes, filtrer avec WHERE et combiner des conditions
  - Trier, limiter et dédoublonner les résultats
  - Utiliser les opérateurs LIKE, IN, BETWEEN, IS NULL et les fonctions de texte et de date courantes
prerequis:
  - Séance « Le terminal Linux » ; Docker (semaine 2)
referentiels:
  - ISO/IEC 9075 (norme SQL)
  - Oracle Database SQL Certified Associate (1Z0-071), domaines « Restricting and Sorting Data » et « Single-Row Functions »
  - Documentation PostgreSQL 16, chapitre 2 « The SQL Language »
quiz:
  - question: "Dans une table, que représente une ligne ?"
    choix: ["Un type de donnée", "Un enregistrement (par exemple un client)", "Une colonne", "Une base"]
    reponse: 1
    explication: "Chaque ligne est un enregistrement ; chaque colonne est un attribut typé (nom, ville, date…)."
  - question: "Quelle requête renvoie les clients de Dakar ?"
    choix: ["SELECT * FROM clients IF ville = 'Dakar'", "SELECT * FROM clients WHERE ville = 'Dakar'", "SELECT clients WHERE Dakar", "GET clients FROM Dakar"]
    reponse: 1
    explication: "WHERE filtre les lignes ; les chaînes de caractères s'écrivent entre apostrophes simples."
  - question: "Que renvoie WHERE nom LIKE 'A%' ?"
    choix: ["Les noms égaux à A%", "Les noms qui commencent par A", "Les noms qui finissent par A", "Les noms qui contiennent %"]
    reponse: 1
    explication: "% remplace n'importe quelle suite de caractères ; _ remplace exactement un caractère. ILIKE ignore la casse."
  - question: "Comment trouver les clients dont la ville n'est pas renseignée ?"
    choix: ["WHERE ville = NULL", "WHERE ville IS NULL", "WHERE ville = ''", "WHERE NOT ville"]
    reponse: 1
    explication: "NULL signifie « inconnu » : on ne peut pas le comparer avec =, il faut IS NULL ou IS NOT NULL."
  - question: "Que fait ORDER BY prix DESC LIMIT 3 ?"
    choix: ["Les 3 produits les moins chers", "Les 3 produits les plus chers", "3 produits au hasard", "Les produits à partir du 3e"]
    reponse: 1
    explication: "DESC trie du plus grand au plus petit, LIMIT garde les 3 premières lignes."
---

## Pourquoi une base de données ?

Un fichier Excel convient pour 200 lignes et un seul utilisateur. Une application qui sert des milliers de personnes en même temps a besoin d'une **base de données** : les données y restent cohérentes, on peut les interroger rapidement, et plusieurs utilisateurs y accèdent sans conflit.

Une base **relationnelle** (PostgreSQL, MySQL, SQL Server, Oracle) range les données dans des **tables** reliées entre elles. On l'interroge avec le **SQL** (*Structured Query Language*), une langue normalisée depuis 1986, utilisée par les développeurs, les data analysts et les data engineers.

## Le vocabulaire

```
                       table « clients »
 colonnes →   id │ nom             │ ville       │ inscrit_le
            ─────┼─────────────────┼─────────────┼────────────
 ligne →      1  │ Awa Diop        │ Dakar       │ 2026-01-10
              2  │ Moussa Fall     │ Thiès       │ 2026-02-03
              5  │ Mariama Ba      │ NULL        │ 2026-05-20
```

| Terme | Définition |
|---|---|
| **Table** | un ensemble de données sur un même sujet |
| **Ligne** (enregistrement) | une occurrence, par exemple un client |
| **Colonne** (attribut) | une information typée : `text`, `int`, `date`, `boolean`… |
| **Clé primaire** | la colonne qui identifie chaque ligne de façon unique (`id`) |
| **Clé étrangère** | une colonne qui pointe vers la clé primaire d'une autre table (`commandes.client_id` vers `clients.id`) |
| **NULL** | une valeur absente ou inconnue |

## Lancer PostgreSQL

```bash
docker run -d --name pg-cours -e POSTGRES_PASSWORD=cours -p 5432:5432 postgres:16-alpine
docker exec -it pg-cours psql -U postgres
```

Les commandes **psql** utiles : `\l` (les bases), `\dt` (les tables), `\d clients` (la structure d'une table), `\q` (quitter). Pour une interface graphique : **DBeaver** (gratuit), pgAdmin, ou l'extension SQLTools de VS Code.

**Le jeu de données du cours** (la boutique) :

```sql
CREATE TABLE clients (id serial PRIMARY KEY, nom text NOT NULL, ville text, inscrit_le date);
CREATE TABLE produits (id serial PRIMARY KEY, nom text NOT NULL, categorie text, prix int NOT NULL);
INSERT INTO clients (nom, ville, inscrit_le) VALUES
 ('Awa Diop','Dakar','2026-01-10'), ('Moussa Fall','Thiès','2026-02-03'), ('Fatou Sall','Dakar','2026-03-15'),
 ('Ibrahima Ndiaye','Saint-Louis','2026-04-01'), ('Mariama Ba', NULL, '2026-05-20'), ('Aminata Sow','Dakar','2026-06-11');
INSERT INTO produits (nom, categorie, prix) VALUES
 ('Chemise wax','Vêtements',12000), ('Sac en cuir','Accessoires',25000), ('Boubou brodé','Vêtements',35000),
 ('Bracelet','Accessoires',5000), ('Sandales','Chaussures',15000), ('Pagne tissé','Vêtements',8000);
```

## SELECT et FROM

```sql
SELECT * FROM produits;                          -- toutes les colonnes (à éviter en production)
SELECT nom, prix FROM produits;                  -- seulement ces colonnes
SELECT nom, prix, prix * 1.18 AS prix_ttc FROM produits;   -- colonne calculée avec un alias
```

Les mots-clés SQL ne tiennent pas compte de la casse : `select` vaut `SELECT`. Par convention, on les écrit en majuscules pour la lisibilité. Une requête se termine par `;`.

## Filtrer avec WHERE

```sql
SELECT nom, prix FROM produits WHERE prix > 10000;
SELECT * FROM clients WHERE ville = 'Dakar';
SELECT * FROM produits WHERE categorie = 'Vêtements' AND prix < 20000;
SELECT * FROM clients WHERE ville = 'Dakar' OR ville = 'Thiès';
SELECT * FROM clients WHERE NOT ville = 'Dakar';
```

| Opérateur | Exemple | Sens |
|---|---|---|
| `=`, `<>` ou `!=` | `ville = 'Dakar'` | égal, différent |
| `<`, `<=`, `>`, `>=` | `prix >= 15000` | comparaisons |
| `BETWEEN a AND b` | `prix BETWEEN 5000 AND 15000` | entre, **bornes incluses** |
| `IN (...)` | `ville IN ('Dakar','Thiès')` | dans la liste |
| `LIKE` / `ILIKE` | `nom LIKE 'A%'` | motif (`%` : n'importe quelle suite de caractères ; `_` : un seul caractère) ; `ILIKE` ignore la casse |
| `IS NULL` / `IS NOT NULL` | `ville IS NULL` | valeur absente |

**La priorité** : `AND` est évalué avant `OR`. On met donc des **parenthèses** dès qu'on mélange les deux.

```sql
-- Les vêtements OU les accessoires, de moins de 20 000
SELECT * FROM produits WHERE (categorie = 'Vêtements' OR categorie = 'Accessoires') AND prix < 20000;
```

Le résultat compte 3 lignes : Chemise wax (12 000), Bracelet (5 000) et Pagne tissé (8 000). Sans les parenthèses, la requête renverrait **aussi** le Boubou (35 000), parce que `AND` lie d'abord `categorie = 'Accessoires' AND prix < 20000`.

## Trier, limiter, dédoublonner

```sql
SELECT nom, prix FROM produits ORDER BY prix DESC;            -- du plus cher au moins cher
SELECT nom, prix FROM produits ORDER BY categorie, prix;      -- tri sur plusieurs colonnes
SELECT nom, prix FROM produits ORDER BY prix DESC LIMIT 3;    -- les 3 plus chers
SELECT nom FROM produits ORDER BY nom LIMIT 2 OFFSET 2;       -- la « page 2 » de 2 éléments
SELECT DISTINCT ville FROM clients;                           -- villes sans doublon
```

## Les fonctions utiles

```sql
SELECT UPPER(nom), LENGTH(nom), LEFT(nom, 3) FROM clients;            -- texte
SELECT nom || ' (' || COALESCE(ville, 'ville inconnue') || ')' FROM clients;   -- concaténation, remplacement de NULL
SELECT ROUND(prix * 1.18) AS ttc FROM produits;                        -- arrondi
SELECT nom, inscrit_le, EXTRACT(MONTH FROM inscrit_le) AS mois FROM clients;   -- dates
SELECT * FROM clients WHERE inscrit_le >= '2026-03-01';
SELECT CURRENT_DATE - inscrit_le AS jours_anciennete FROM clients;
SELECT nom, CASE WHEN prix >= 20000 THEN 'Premium' ELSE 'Standard' END AS gamme FROM produits;
```

## Démonstration

On lance PostgreSQL, on crée les deux tables, puis on répond en direct aux questions du « gérant » de la boutique. Pour chaque question, on prédit le nombre de lignes **avant** d'exécuter la requête :

- Quels produits coûtent plus de 10 000 FCFA ?
- Quels clients habitent Dakar, triés par ordre alphabétique ?
- Quels sont les 2 produits les moins chers ?
- Qui n'a pas renseigné sa ville ?
- Quels sont les noms qui contiennent « a », sans tenir compte de la casse ?

## Exercice guidé

Écris les requêtes et donne le nombre de lignes attendu :

1. Les produits de la catégorie « Accessoires ».
2. Les produits dont le prix est entre 8 000 et 15 000 FCFA inclus.
3. Les clients inscrits au premier trimestre 2026, du 1er janvier au 31 mars.
4. Le nom et le prix TTC (TVA de 18 %) de chaque produit, arrondi, du plus cher au moins cher.

## Exercice autonome

1. Les clients dont le nom commence par « A » et qui habitent Dakar.
2. La liste des catégories, sans doublon, triée.
3. Le produit le plus cher de la catégorie Vêtements, en une seule requête.
4. Pour chaque client : son nom en majuscules, sa ville (ou « Inconnue ») et son ancienneté en jours.
5. Les produits « Premium » (≥ 20 000) ou de la catégorie Chaussures, en écrivant correctement les parenthèses.
6. Corrige cette requête : `SELECT * FROM clients WHERE ville = NULL OR ville = "Thiès"`.

## Correction

Exercice guidé :

```sql
SELECT * FROM produits WHERE categorie = 'Accessoires';                     -- 2 lignes : Sac, Bracelet
SELECT * FROM produits WHERE prix BETWEEN 8000 AND 15000;                   -- 3 lignes : Chemise 12 000, Sandales 15 000, Pagne 8 000
SELECT * FROM clients WHERE inscrit_le BETWEEN '2026-01-01' AND '2026-03-31'; -- 3 lignes : Awa, Moussa, Fatou
SELECT nom, ROUND(prix * 1.18) AS prix_ttc FROM produits ORDER BY prix_ttc DESC;
-- Boubou 41 300 ; Sac 29 500 ; Sandales 17 700 ; Chemise 14 160 ; Pagne 9 440 ; Bracelet 5 900
```

À la question 2, `BETWEEN` **inclut** les bornes : les produits à 8 000 et à 15 000 sont bien dans le résultat.

Exercice autonome :

```sql
SELECT * FROM clients WHERE nom LIKE 'A%' AND ville = 'Dakar';             -- Awa Diop, Aminata Sow
SELECT DISTINCT categorie FROM produits ORDER BY categorie;               -- Accessoires, Chaussures, Vêtements
SELECT nom, prix FROM produits WHERE categorie = 'Vêtements' ORDER BY prix DESC LIMIT 1;   -- Boubou brodé
SELECT UPPER(nom), COALESCE(ville, 'Inconnue'), CURRENT_DATE - inscrit_le AS anciennete FROM clients;
SELECT * FROM produits WHERE prix >= 20000 OR categorie = 'Chaussures';   -- Sac, Boubou, Sandales
SELECT * FROM clients WHERE ville IS NULL OR ville = 'Thiès';            -- 6. corrigé
```

Question 6, deux erreurs : `= NULL` est toujours faux, il faut `IS NULL`. Et les **guillemets doubles** désignent un nom de colonne en PostgreSQL ; une chaîne de caractères s'écrit avec des **apostrophes simples**.

## Pour aller plus loin

- Le site **pgexercises.com** propose des dizaines d'exercices SELECT corrigés, sur une base de club de sport.
- `EXPLAIN` montre comment PostgreSQL exécute une requête. On l'étudie avec les index le 29 décembre.
- Demain : compter, additionner et regrouper (agrégats), et relier plusieurs tables (jointures).
