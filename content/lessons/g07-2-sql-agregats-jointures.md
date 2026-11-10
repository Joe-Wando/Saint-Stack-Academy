---
slug: g07-2-sql-agregats-jointures
titre: SQL, agrégats, GROUP BY et jointures
domaine: Bases de données
duree: 120
difficulte: bases
licence:
  - { niveau: L2, semestre: S3, ue: "Bases de données et versionnement" }
parcours:
  - { parcours: web, ordre: 11 }
  - { parcours: data, ordre: 2 }
ordre: 4
prerequis_cours: [g07-1-sql-select]
visibilite: public
objectifs:
  - Calculer des statistiques avec COUNT, SUM, AVG, MIN et MAX
  - Regrouper avec GROUP BY et filtrer les groupes avec HAVING
  - Relier des tables avec INNER JOIN et LEFT JOIN grâce aux clés
  - Enchaîner plusieurs jointures pour répondre à une question métier
  - Connaître l'ordre logique d'exécution d'une requête
prerequis:
  - Cours « SQL, interroger une base avec SELECT »
referentiels:
  - Oracle Database SQL Certified Associate (1Z0-071), domaines « Reporting Aggregated Data » et « Displaying Data from Multiple Tables »
  - ISO/IEC 9075 (norme SQL)
  - Documentation PostgreSQL 16, sections 2.6 « Joins Between Tables » et 2.7 « Aggregate Functions »
quiz:
  - question: "Que renvoie SELECT COUNT(*) FROM produits WHERE categorie = 'Vêtements' ?"
    choix: ["La liste des vêtements", "Le nombre de produits de la catégorie Vêtements", "Le prix total", "Une erreur"]
    reponse: 1
    explication: "COUNT(*) compte les lignes qui passent le filtre ; le résultat est une seule ligne avec un nombre."
  - question: "Pourquoi cette requête est-elle refusée : SELECT categorie, nom, AVG(prix) FROM produits GROUP BY categorie ?"
    choix: ["AVG n'existe pas", "nom n'est ni dans le GROUP BY ni dans un agrégat : SQL ne sait pas quel nom afficher pour le groupe", "Il manque un WHERE", "categorie est un mot réservé"]
    reponse: 1
    explication: "Un groupe contient plusieurs noms ; chaque colonne affichée doit être un critère de groupe ou un agrégat."
  - question: "Quelle jointure garde aussi les clients qui n'ont aucune commande ?"
    choix: ["INNER JOIN", "LEFT JOIN depuis clients", "CROSS JOIN", "Aucune"]
    reponse: 1
    explication: "LEFT JOIN garde toutes les lignes de la table de gauche ; les colonnes de commandes valent NULL pour eux."
  - question: "Où filtre-t-on « les catégories dont le prix moyen dépasse 15 000 » ?"
    choix: ["Dans WHERE", "Dans HAVING", "Dans ORDER BY", "Dans FROM"]
    reponse: 1
    explication: "La moyenne n'existe qu'après le regroupement : HAVING AVG(prix) > 15000."
  - question: "Sur quoi s'appuie une jointure entre commandes et clients ?"
    choix: ["Sur le nom des tables", "Sur l'égalité entre la clé étrangère commandes.client_id et la clé primaire clients.id", "Sur l'ordre des lignes", "Sur la date"]
    reponse: 1
    explication: "ON commandes.client_id = clients.id : chaque commande retrouve son client."
---

## L'idée

Dans le cours « SQL, interroger une base avec SELECT », chaque requête renvoyait des lignes **une par une**. Le gérant pose maintenant de **vraies** questions :

- « **Combien** de produits par catégorie ? » : ce sont les **agrégats**.
- « **Qui** a commandé **quoi** ? » : ce sont les **jointures**, car l'information est répartie dans plusieurs tables.

On ajoute au jeu de données du cours précédent les commandes et leurs lignes :

```sql
CREATE TABLE commandes (id serial PRIMARY KEY, client_id int REFERENCES clients(id), date_cmd date NOT NULL, statut text);
CREATE TABLE lignes (commande_id int REFERENCES commandes(id), produit_id int REFERENCES produits(id), quantite int NOT NULL);
INSERT INTO commandes (client_id, date_cmd, statut) VALUES
 (1,'2026-10-02','livrée'), (1,'2026-10-20','livrée'), (2,'2026-10-05','annulée'),
 (3,'2026-11-01','livrée'), (3,'2026-11-03','en cours'), (4,'2026-11-10','livrée');
INSERT INTO lignes VALUES (1,1,2),(1,4,3),(2,3,1),(3,2,1),(4,1,1),(4,2,1),(4,5,2),(5,4,1),(6,3,2);
```

`REFERENCES` déclare une **clé étrangère** : PostgreSQL refusera une commande pour un client qui n'existe pas. C'est l'**intégrité référentielle**.

## Les fonctions d'agrégation

Elles **résument** plusieurs lignes en une seule valeur :

| Fonction | Rôle | Exemple sur `produits` | Résultat |
|---|---|---|---|
| `COUNT(*)` | nombre de lignes | `SELECT COUNT(*) FROM produits` | 6 |
| `SUM(col)` | somme | `SELECT SUM(prix) FROM produits` | 100 000 |
| `AVG(col)` | moyenne | `SELECT AVG(prix) FROM produits` | 16 666,67 |
| `MIN(col)` / `MAX(col)` | plus petit, plus grand | `SELECT MIN(prix), MAX(prix) FROM produits` | 5 000 et 35 000 |

Le calcul : 12 000 + 25 000 + 35 000 + 5 000 + 15 000 + 8 000 = **100 000**, et 100 000 / 6 ≈ **16 666,67**.

Les agrégats **ignorent les NULL**. Ainsi, `COUNT(ville)` sur `clients` vaut 5, alors que `COUNT(*)` vaut 6.

## GROUP BY : un résultat par groupe

```sql
SELECT categorie, COUNT(*) AS nb, ROUND(AVG(prix)) AS prix_moyen, MAX(prix) AS plus_cher
FROM produits
GROUP BY categorie
ORDER BY nb DESC;
```

| categorie | nb | prix_moyen | plus_cher |
|---|---|---|---|
| Vêtements | 3 | 18 333 | 35 000 |
| Accessoires | 2 | 15 000 | 25 000 |
| Chaussures | 1 | 15 000 | 15 000 |

**La règle d'or** : chaque colonne du `SELECT` est **soit** dans le `GROUP BY`, **soit** dans un agrégat.

> Analogie : on range des copies dans des piles par classe (`GROUP BY classe`), puis on calcule la moyenne de chaque pile. Demander « le nom de l'élève » d'une pile n'a pas de sens : il y en a plusieurs.

## HAVING : filtrer les groupes

```sql
SELECT categorie, ROUND(AVG(prix)) AS prix_moyen
FROM produits
GROUP BY categorie
HAVING AVG(prix) >= 15000;
```

- `WHERE` filtre les **lignes avant** le regroupement.
- `HAVING` filtre les **groupes après** le regroupement.

**L'ordre logique d'exécution** :

| Étape | Clause |
|---|---|
| 1 | `FROM` et `JOIN` |
| 2 | `WHERE` |
| 3 | `GROUP BY` |
| 4 | `HAVING` |
| 5 | `SELECT` |
| 6 | `ORDER BY` |
| 7 | `LIMIT` |

## Les jointures

L'information est **répartie** : le nom du client est dans `clients`, la date dans `commandes`. On les **relie** par les clés.

```sql
SELECT co.id AS commande, c.nom, co.date_cmd, co.statut
FROM commandes co
INNER JOIN clients c ON c.id = co.client_id;
```

`co` et `c` sont des **alias** de tables : ils rendent la requête plus courte.

### INNER JOIN et LEFT JOIN

```
clients          commandes                  INNER JOIN                 LEFT JOIN (clients à gauche)
 1 Awa      ←──  cmd 1, cmd 2               Awa     1, 2               Awa     1, 2
 2 Moussa   ←──  cmd 3                      Moussa  3                  Moussa  3
 3 Fatou    ←──  cmd 4, cmd 5               Fatou   4, 5               Fatou   4, 5
 4 Ibrahima ←──  cmd 6                      Ibrahima 6                 Ibrahima 6
 5 Mariama       (aucune)                   (absente)                  Mariama NULL
 6 Aminata       (aucune)                   (absente)                  Aminata NULL
```

```sql
-- Nombre de commandes par client, y compris ceux qui n'en ont aucune
SELECT c.nom, COUNT(co.id) AS nb_commandes
FROM clients c
LEFT JOIN commandes co ON co.client_id = c.id
GROUP BY c.nom
ORDER BY nb_commandes DESC;
```

On compte `co.id` et non `*` : pour Mariama, la ligne existe, mais `co.id` vaut NULL. `COUNT(co.id)` donne donc **0**, alors que `COUNT(*)` aurait donné 1.

### Plusieurs jointures

« Combien chaque client a-t-il dépensé en commandes livrées ? »

```sql
SELECT c.nom, SUM(p.prix * l.quantite) AS total_depense
FROM clients c
JOIN commandes co ON co.client_id = c.id
JOIN lignes l     ON l.commande_id = co.id
JOIN produits p   ON p.id = l.produit_id
WHERE co.statut = 'livrée'
GROUP BY c.nom
ORDER BY total_depense DESC;
```

| nom | total_depense |
|---|---|
| Awa Diop | 74 000 |
| Ibrahima Ndiaye | 70 000 |
| Fatou Sall | 67 000 |

**La vérification à la main pour Awa** :
- commande 1 : 2 chemises × 12 000 + 3 bracelets × 5 000 = 24 000 + 15 000 = 39 000 ;
- commande 2 : 1 boubou = 35 000 ;
- total : **74 000**.

## Démonstration

En direct, on répond aux questions du gérant, en vérifiant à chaque fois un chiffre à la main :

1. Le nombre de commandes par statut.
2. Le chiffre d'affaires livré par catégorie.
3. Les clients qui n'ont jamais commandé (`LEFT JOIN` puis `WHERE co.id IS NULL`).
4. Le produit le plus vendu en quantité.

## Exercice guidé

1. Combien de clients par ville ? Que devient Mariama, dont la ville est NULL ?
2. Le prix moyen, minimum et maximum par catégorie.
3. La liste des commandes avec le nom du client et le nombre total d'articles.

## Exercice autonome

1. Les catégories qui ont au moins 2 produits.
2. Le chiffre d'affaires livré par mois (indice : `EXTRACT(MONTH FROM date_cmd)` ou `date_trunc`).
3. Les produits qui n'ont jamais été commandés. Ajoute d'abord un produit « Chapeau » pour avoir un résultat.
4. Pour chaque client : le nombre de commandes, le nombre de commandes livrées et le total dépensé, **y compris** ceux qui n'ont rien commandé (le total vaut alors 0).
5. Le panier moyen d'une commande livrée.

## Correction

Exercice guidé :

```sql
SELECT ville, COUNT(*) FROM clients GROUP BY ville;
-- Dakar 3 ; Thiès 1 ; Saint-Louis 1 ; NULL 1 (les NULL forment leur propre groupe)
SELECT categorie, ROUND(AVG(prix)), MIN(prix), MAX(prix) FROM produits GROUP BY categorie;
SELECT co.id, c.nom, SUM(l.quantite) AS articles
FROM commandes co JOIN clients c ON c.id = co.client_id JOIN lignes l ON l.commande_id = co.id
GROUP BY co.id, c.nom ORDER BY co.id;
-- 1 : Awa 5 ; 2 : Awa 1 ; 3 : Moussa 1 ; 4 : Fatou 4 ; 5 : Fatou 1 ; 6 : Ibrahima 2
```

Exercice autonome :

```sql
SELECT categorie FROM produits GROUP BY categorie HAVING COUNT(*) >= 2;   -- Vêtements, Accessoires

SELECT EXTRACT(MONTH FROM co.date_cmd) AS mois, SUM(p.prix * l.quantite) AS ca
FROM commandes co JOIN lignes l ON l.commande_id = co.id JOIN produits p ON p.id = l.produit_id
WHERE co.statut = 'livrée' GROUP BY 1 ORDER BY 1;                        -- octobre 74 000 ; novembre 137 000

INSERT INTO produits (nom, categorie, prix) VALUES ('Chapeau', 'Accessoires', 7000);
SELECT p.nom FROM produits p LEFT JOIN lignes l ON l.produit_id = p.id WHERE l.produit_id IS NULL;   -- Chapeau, Pagne tissé

SELECT c.nom,
       COUNT(DISTINCT co.id) AS commandes,
       COUNT(DISTINCT co.id) FILTER (WHERE co.statut = 'livrée') AS livrees,
       COALESCE(SUM(p.prix * l.quantite) FILTER (WHERE co.statut = 'livrée'), 0) AS total
FROM clients c
LEFT JOIN commandes co ON co.client_id = c.id
LEFT JOIN lignes l ON l.commande_id = co.id
LEFT JOIN produits p ON p.id = l.produit_id
GROUP BY c.nom ORDER BY total DESC;
```

Question 3 : le **Pagne tissé**, ajouté dans le cours précédent, n'a jamais été commandé lui non plus.

Question 5 : le chiffre d'affaires livré vaut 74 000 + 137 000 = 211 000, réparti sur 4 commandes livrées. Le panier moyen est donc 211 000 / 4 = **52 750 FCFA**.

## Pour aller plus loin

- `RIGHT JOIN` et `FULL JOIN` existent aussi ; en pratique, on réécrit presque toujours un `RIGHT JOIN` en `LEFT JOIN` en inversant les tables.
- `COUNT(DISTINCT ...)` compte les valeurs différentes.
- Cours suivant conseillé : « SQL, sous-requêtes, CTE, vues et fonctions de fenêtrage » : classer et cumuler.
