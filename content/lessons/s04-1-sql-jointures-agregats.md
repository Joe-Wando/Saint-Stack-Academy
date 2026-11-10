---
slug: s04-1-sql-jointures-agregats
titre: SQL pour la data, jointures et agrégats
domaine: Data
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S5, ue: "Ingénierie des données", option: big-data-ia }
parcours:
  - { parcours: data, ordre: 3 }
ordre: 1
prerequis_cours: []
visibilite: public
objectifs:
  - Créer une base d'exemple PostgreSQL et l'explorer
  - Combiner des tables avec INNER JOIN, LEFT JOIN et les jointures multiples
  - Résumer des données avec COUNT, SUM, AVG, MIN, MAX et GROUP BY
  - Filtrer des groupes avec HAVING et comprendre l'ordre logique d'exécution d'une requête
  - Traiter correctement les valeurs NULL dans les calculs
prerequis:
  - SQL de base (SELECT, WHERE, ORDER BY)
  - PostgreSQL ou Docker installé
referentiels:
  - ISO/IEC 9075 (norme SQL)
  - Databricks Certified Data Engineer Associate, domaine « ELT with Spark SQL and Python »
  - Microsoft PL-300, compétences de préparation de données
quiz:
  - question: "Quelle différence entre INNER JOIN et LEFT JOIN ?"
    choix: ["Aucune", "INNER ne garde que les lignes qui ont une correspondance des deux côtés ; LEFT garde toutes les lignes de la table de gauche", "LEFT est plus rapide", "INNER garde tout"]
    reponse: 1
    explication: "Pour lister aussi les clients qui n'ont jamais commandé, il faut LEFT JOIN : leurs colonnes de commande valent NULL."
  - question: "Quelle différence entre WHERE et HAVING ?"
    choix: ["Aucune", "WHERE filtre les lignes avant le regroupement ; HAVING filtre les groupes après", "HAVING est obsolète", "WHERE ne fonctionne qu'avec des nombres"]
    reponse: 1
    explication: "On ne peut pas écrire WHERE SUM(montant) > 100000 : la somme n'existe qu'après GROUP BY."
  - question: "Une colonne prime contient 100, NULL, 200. Que vaut AVG(prime) ?"
    choix: ["100", "150", "NULL", "300"]
    reponse: 1
    explication: "Les agrégats ignorent les NULL : (100 + 200) / 2 = 150. COUNT(prime) vaut 2, COUNT(*) vaut 3."
  - question: "Dans quel ordre logique PostgreSQL évalue-t-il une requête ?"
    choix: ["SELECT, FROM, WHERE, GROUP BY", "FROM et JOIN, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT", "ORDER BY en premier", "Dans l'ordre d'écriture"]
    reponse: 1
    explication: "C'est pourquoi un alias défini dans SELECT n'est pas utilisable dans WHERE, mais l'est dans ORDER BY."
  - question: "Que fait COUNT(DISTINCT client_id) ?"
    choix: ["Compte toutes les lignes", "Compte le nombre de clients différents", "Compte les NULL", "Supprime les doublons de la table"]
    reponse: 1
    explication: "Utile pour « combien de clients ont commandé ce mois-ci », un client qui commande 5 fois compte 1."
---

## Pourquoi le SQL en data ?

Le SQL est **la** langue commune de la donnée. Le data engineer s'en sert pour construire les tables, l'analyste pour répondre aux questions, et dbt, Spark SQL, BigQuery et Snowflake le parlent tous. Les sujets de ce cours et du suivant (jointures, agrégats, fenêtres) reviennent dans tous les entretiens techniques.

Tu étudies ici le SQL avec un angle **analyse de données**. Les cours « SQL, interroger une base avec SELECT » et suivants en donnent l'angle développeur.

## La base d'exemple

```bash
docker run -d --name pg-data -e POSTGRES_PASSWORD=data -p 5434:5432 postgres:16-alpine
docker exec -it pg-data psql -U postgres
```

```sql
CREATE TABLE clients (id serial PRIMARY KEY, nom text NOT NULL, ville text, inscrit_le date);
CREATE TABLE produits (id serial PRIMARY KEY, nom text NOT NULL, categorie text, prix int NOT NULL);
CREATE TABLE commandes (id serial PRIMARY KEY, client_id int REFERENCES clients(id), date_cmd date NOT NULL, statut text);
CREATE TABLE lignes (commande_id int REFERENCES commandes(id), produit_id int REFERENCES produits(id), quantite int NOT NULL);

INSERT INTO clients (nom, ville, inscrit_le) VALUES
 ('Awa Diop','Dakar','2026-01-10'), ('Moussa Fall','Thiès','2026-02-03'),
 ('Fatou Sall','Dakar','2026-03-15'), ('Ibrahima Ndiaye','Saint-Louis','2026-04-01'),
 ('Mariama Ba', NULL, '2026-05-20');
INSERT INTO produits (nom, categorie, prix) VALUES
 ('Chemise wax','Vêtements',12000), ('Sac en cuir','Accessoires',25000),
 ('Boubou brodé','Vêtements',35000), ('Bracelet','Accessoires',5000), ('Sandales','Chaussures',15000);
INSERT INTO commandes (client_id, date_cmd, statut) VALUES
 (1,'2026-10-02','livrée'), (1,'2026-10-20','livrée'), (2,'2026-10-05','annulée'),
 (3,'2026-11-01','livrée'), (3,'2026-11-03','en cours'), (4,'2026-11-10','livrée');
INSERT INTO lignes VALUES (1,1,2),(1,4,3),(2,3,1),(3,2,1),(4,1,1),(4,2,1),(4,5,2),(5,4,1),(6,3,2);
```

Le client 5 (Mariama) n'a **jamais commandé**, et le produit 5 (Sandales) n'a été vendu qu'une fois. Ces deux cas serviront à comprendre les jointures.

## Les jointures

On relie des tables grâce aux **clés** : la clé étrangère `commandes.client_id` pointe vers la clé primaire `clients.id`.

```sql
-- INNER JOIN : seulement les correspondances
SELECT c.nom, co.id AS commande, co.date_cmd
FROM clients c
JOIN commandes co ON co.client_id = c.id;
-- 6 lignes ; Mariama n'apparaît pas

-- LEFT JOIN : toutes les lignes de gauche, NULL si pas de correspondance
SELECT c.nom, co.id AS commande
FROM clients c
LEFT JOIN commandes co ON co.client_id = c.id;
-- 7 lignes ; Mariama avec commande = NULL

-- Anti-jointure : les clients qui n'ont jamais commandé
SELECT c.nom FROM clients c
LEFT JOIN commandes co ON co.client_id = c.id
WHERE co.id IS NULL;
```

```
INNER JOIN        LEFT JOIN          FULL JOIN
  ┌──┬──┐          ┌──┬──┐            ┌──┬──┐
  │  │██│  │       │██│██│  │         │██│██│██│
  └──┴──┘          └──┴──┘            └──┴──┘
   A ∩ B             A entier          A ∪ B
```

**Jointures multiples** : la question « qui a acheté quoi, et pour combien ? » demande les quatre tables.

```sql
SELECT c.nom, p.nom AS produit, l.quantite, p.prix * l.quantite AS montant
FROM lignes l
JOIN commandes co ON co.id = l.commande_id
JOIN clients   c  ON c.id  = co.client_id
JOIN produits  p  ON p.id  = l.produit_id
ORDER BY c.nom;
```

## Les agrégats et GROUP BY

| Fonction | Rôle |
|---|---|
| `COUNT(*)` | nombre de lignes |
| `COUNT(col)` | nombre de valeurs **non NULL** |
| `COUNT(DISTINCT col)` | nombre de valeurs différentes |
| `SUM`, `AVG`, `MIN`, `MAX` | somme, moyenne, minimum, maximum |

```sql
-- Chiffre d'affaires par catégorie, commandes livrées seulement
SELECT p.categorie,
       SUM(p.prix * l.quantite) AS ca,
       COUNT(DISTINCT l.commande_id) AS nb_commandes
FROM lignes l
JOIN produits p   ON p.id = l.produit_id
JOIN commandes co ON co.id = l.commande_id
WHERE co.statut = 'livrée'
GROUP BY p.categorie
ORDER BY ca DESC;
```

**La règle** : toute colonne du `SELECT` qui n'est pas dans un agrégat doit figurer dans le `GROUP BY`.

**Le calcul à la main**, pour vérifier : les lignes livrées de la catégorie *Vêtements* sont
- commande 1 : 2 chemises × 12 000 = 24 000 ;
- commande 2 : 1 boubou = 35 000 ;
- commande 4 : 1 chemise = 12 000 ;
- commande 6 : 2 boubous = 70 000.

Le total fait **141 000 FCFA**, sur **4** commandes.

## HAVING et l'ordre d'exécution

```sql
-- Clients dont le total livré dépasse 50 000 FCFA
SELECT c.nom, SUM(p.prix * l.quantite) AS total
FROM clients c
JOIN commandes co ON co.client_id = c.id AND co.statut = 'livrée'
JOIN lignes l     ON l.commande_id = co.id
JOIN produits p   ON p.id = l.produit_id
GROUP BY c.nom
HAVING SUM(p.prix * l.quantite) > 50000
ORDER BY total DESC;
```

**L'ordre logique d'évaluation** :

| Étape | Clause |
|---|---|
| 1 | `FROM` et `JOIN` |
| 2 | `WHERE` |
| 3 | `GROUP BY` |
| 4 | `HAVING` |
| 5 | `SELECT` |
| 6 | `ORDER BY` |
| 7 | `LIMIT` |

C'est pourquoi l'alias `total`, créé à l'étape 5, est utilisable dans `ORDER BY` (étape 6) mais pas dans `WHERE` ni dans `HAVING`.

## Les NULL

`NULL` signifie « valeur inconnue ». Il ne s'égale à rien, pas même à lui-même :

- `ville = NULL` est toujours faux ; il faut écrire `ville IS NULL` ;
- les agrégats **ignorent** les NULL ;
- `COALESCE(ville, 'Non renseignée')` remplace un NULL par une valeur.

```sql
SELECT COALESCE(ville, 'Non renseignée') AS ville, COUNT(*) FROM clients GROUP BY 1;
```

## Démonstration

On crée la base, puis on répond en direct à quatre questions métier :

1. Le chiffre d'affaires livré par mois.
2. Le panier moyen par commande livrée.
3. Le produit le plus vendu en quantité.
4. Les clients inscrits qui n'ont jamais commandé.

Pour chaque question, on vérifie un résultat à la main.

## Exercice guidé

1. Liste chaque commande avec le nom du client et le nombre d'articles (somme des quantités).
2. Calcule le chiffre d'affaires livré par ville. Que deviennent les clients sans ville ?
3. Trouve les produits qui n'ont **jamais** été commandés.

## Exercice autonome

1. Calcule le taux d'annulation : commandes annulées divisées par le total des commandes, en pourcentage avec 1 décimale.
2. Pour chaque catégorie, donne le prix moyen des produits et le nombre de produits ; ne garde que les catégories qui en ont au moins 2.
3. Trouve le client qui a dépensé le plus en octobre 2026, commandes livrées seulement.
4. Explique pourquoi `SELECT ville, COUNT(*) FROM clients WHERE COUNT(*) > 1 GROUP BY ville` échoue, puis corrige la requête.

## Correction

Exercice guidé :

```sql
SELECT co.id, c.nom, SUM(l.quantite) AS articles
FROM commandes co JOIN clients c ON c.id = co.client_id JOIN lignes l ON l.commande_id = co.id
GROUP BY co.id, c.nom ORDER BY co.id;

SELECT COALESCE(c.ville,'Non renseignée') AS ville, SUM(p.prix*l.quantite) AS ca
FROM clients c JOIN commandes co ON co.client_id=c.id AND co.statut='livrée'
JOIN lignes l ON l.commande_id=co.id JOIN produits p ON p.id=l.produit_id
GROUP BY 1 ORDER BY ca DESC;
-- Dakar : 24 000 + 15 000 + 35 000 + 12 000 + 25 000 + 30 000 = 141 000 ; Saint-Louis : 70 000

SELECT p.nom FROM produits p LEFT JOIN lignes l ON l.produit_id = p.id WHERE l.produit_id IS NULL;
-- aucun résultat : chaque produit a été commandé au moins une fois
```

À la question 2, Mariama n'a pas de commande et n'apparaît donc pas. Les clients sans ville seraient regroupés sous « Non renseignée ».

Exercice autonome :

```sql
SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE statut='annulée') / COUNT(*), 1) AS taux FROM commandes;   -- 16.7
SELECT categorie, ROUND(AVG(prix)) AS prix_moyen, COUNT(*) FROM produits GROUP BY categorie HAVING COUNT(*) >= 2;
SELECT c.nom, SUM(p.prix*l.quantite) AS total FROM clients c
JOIN commandes co ON co.client_id=c.id AND co.statut='livrée' AND co.date_cmd BETWEEN '2026-10-01' AND '2026-10-31'
JOIN lignes l ON l.commande_id=co.id JOIN produits p ON p.id=l.produit_id
GROUP BY c.nom ORDER BY total DESC LIMIT 1;    -- Awa Diop, 74 000
```

Question 1 : on écrit `100.0` et non `100` pour forcer un calcul décimal. Sinon, la division entière donne 0.

Question 4 : `WHERE` est évalué **avant** `GROUP BY`, donc `COUNT(*)` n'existe pas encore. La version correcte est `SELECT ville, COUNT(*) FROM clients GROUP BY ville HAVING COUNT(*) > 1`.

## Pour aller plus loin

- `GROUPING SETS` et `ROLLUP` calculent des sous-totaux et un total général en une seule requête.
- `EXPLAIN ANALYZE` montre comment PostgreSQL exécute une jointure. On le verra avec les index (voir le cours « PostgreSQL, index, transactions et sauvegardes »).
- Cours suivant conseillé : « SQL avancé, CTE et fonctions de fenêtrage » : les outils préférés des data engineers.
