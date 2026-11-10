---
slug: g07-3-sql-sousrequetes-vues-fenetres
titre: SQL, sous-requêtes, CTE, vues et fonctions de fenêtrage
piste: groupe
semaine: 7
date: 2026-12-24
domaine: Bases de données
duree: 120
niveau: bases
objectifs:
  - Écrire des sous-requêtes dans WHERE, FROM et SELECT, avec IN et EXISTS
  - Structurer une requête longue avec WITH (CTE)
  - Créer une vue pour réutiliser une requête et simplifier l'accès aux données
  - Classer et numéroter avec ROW_NUMBER et RANK, éventuellement par groupe
  - Calculer un cumul et comparer à la ligne précédente avec SUM OVER et LAG
prerequis:
  - Séance « SQL, agrégats, GROUP BY et jointures » (même base)
referentiels:
  - Oracle Database SQL Certified Associate (1Z0-071), domaines « Using Subqueries » et « Managing Views »
  - ISO/IEC 9075 (SQL:2003, fonctions de fenêtrage)
  - Documentation PostgreSQL 16, sections 3.2 « Views » et 3.5 « Window Functions »
quiz:
  - question: "Que renvoie SELECT nom FROM produits WHERE prix > (SELECT AVG(prix) FROM produits) ?"
    choix: ["Tous les produits", "Les produits plus chers que la moyenne", "La moyenne des prix", "Une erreur"]
    reponse: 1
    explication: "La sous-requête calcule une valeur unique (la moyenne), utilisée ensuite dans la condition."
  - question: "Qu'est-ce qu'une vue ?"
    choix: ["Une copie des données", "Une requête enregistrée sous un nom, interrogeable comme une table", "Une capture d'écran", "Un index"]
    reponse: 1
    explication: "La vue ne stocke pas de données : la requête est exécutée à chaque lecture, donc toujours à jour."
  - question: "Quelle différence entre GROUP BY et une fonction de fenêtrage (OVER) ?"
    choix: ["Aucune", "GROUP BY réduit à une ligne par groupe ; OVER calcule pour chaque ligne en les gardant toutes", "OVER est plus ancien", "GROUP BY est plus rapide dans tous les cas"]
    reponse: 1
    explication: "Avec OVER, chaque produit garde sa ligne et reçoit en plus, par exemple, le prix moyen de sa catégorie."
  - question: "Prix 35 000, 25 000, 25 000, 12 000. Que donne RANK() OVER (ORDER BY prix DESC) ?"
    choix: ["1, 2, 3, 4", "1, 2, 2, 4", "1, 2, 2, 3", "4, 3, 2, 1"]
    reponse: 1
    explication: "RANK donne le même rang aux ex æquo puis saute ; DENSE_RANK donnerait 1, 2, 2, 3 ; ROW_NUMBER 1, 2, 3, 4."
  - question: "Quand préférer EXISTS à IN ?"
    choix: ["Jamais", "Pour tester l'existence d'au moins une ligne liée, surtout avec de grandes tables ou des NULL possibles", "Pour trier", "Pour additionner"]
    reponse: 1
    explication: "EXISTS s'arrête dès la première ligne trouvée ; NOT IN se comporte mal si la sous-requête contient un NULL."
---

## L'idée

Certaines questions demandent un calcul **en deux temps**. « Quels produits sont **plus chers que la moyenne** ? » demande d'abord de calculer la moyenne, puis de comparer chaque produit à cette moyenne. Ce sont les **sous-requêtes** et les **CTE**.

D'autres questions demandent de **classer** ou de **cumuler** sans perdre le détail des lignes : « le produit le plus cher **de chaque** catégorie », « le cumul du chiffre d'affaires mois après mois ». Ce sont les **fonctions de fenêtrage**.

On reprend la base de la boutique, la même que mardi.

## Les sous-requêtes

**Une sous-requête qui renvoie une seule valeur** (*scalaire*) :

```sql
SELECT nom, prix FROM produits
WHERE prix > (SELECT AVG(prix) FROM produits);
-- moyenne = 16 666,67 → Sac en cuir (25 000), Boubou brodé (35 000)
```

**Une sous-requête qui renvoie une liste**, avec `IN` :

```sql
-- Les clients qui ont au moins une commande livrée
SELECT nom FROM clients
WHERE id IN (SELECT client_id FROM commandes WHERE statut = 'livrée');
-- Awa, Fatou, Ibrahima
```

**EXISTS** : existe-t-il au moins une ligne liée ?

```sql
SELECT c.nom FROM clients c
WHERE NOT EXISTS (SELECT 1 FROM commandes co WHERE co.client_id = c.id);
-- Mariama, Aminata : aucun achat
```

La sous-requête fait référence à `c.id`, qui vient de la requête principale : on dit qu'elle est **corrélée**.

> Attention au piège de `NOT IN` : si la sous-requête contient un **NULL**, `NOT IN` ne renvoie **rien**. Dans ce cas, préfère `NOT EXISTS`.

**Une sous-requête dans FROM**, qui sert de table temporaire :

```sql
SELECT AVG(total) AS panier_moyen
FROM (SELECT l.commande_id, SUM(p.prix * l.quantite) AS total
      FROM lignes l JOIN produits p ON p.id = l.produit_id
      GROUP BY l.commande_id) AS paniers;
```

## Les CTE : WITH

Une **CTE** (*Common Table Expression*) **nomme** une sous-requête et la place **avant** la requête principale. La lecture se fait de haut en bas, comme une recette.

```sql
WITH paniers AS (
    SELECT l.commande_id, SUM(p.prix * l.quantite) AS total
    FROM lignes l JOIN produits p ON p.id = l.produit_id
    GROUP BY l.commande_id
)
SELECT ROUND(AVG(total)) AS panier_moyen, MAX(total) AS plus_gros_panier
FROM paniers;
```

Le calcul, sur toutes les commandes, y compris non livrées :

| Commande | Montant |
|---|---|
| 1 | 39 000 |
| 2 | 35 000 |
| 3 | 25 000 |
| 4 | 67 000 |
| 5 | 5 000 |
| 6 | 70 000 |

Le total vaut 241 000. Le panier moyen est 241 000 / 6 ≈ **40 167**, et le plus gros panier vaut **70 000**.

On peut enchaîner plusieurs CTE, séparées par des virgules : `WITH a AS (...), b AS (SELECT ... FROM a) SELECT ... FROM b`.

## Les vues

Une **vue** est une requête **enregistrée** sous un nom. On l'interroge comme une table.

```sql
CREATE VIEW ventes_detaillees AS
SELECT co.id AS commande_id, co.date_cmd, co.statut, c.nom AS client, c.ville,
       p.nom AS produit, p.categorie, l.quantite, p.prix * l.quantite AS montant
FROM lignes l
JOIN commandes co ON co.id = l.commande_id
JOIN clients c    ON c.id = co.client_id
JOIN produits p   ON p.id = l.produit_id;

SELECT categorie, SUM(montant) FROM ventes_detaillees WHERE statut = 'livrée' GROUP BY categorie;
```

L'usage d'une vue :

- **simplifier** : les analystes n'écrivent plus les quatre jointures à chaque fois ;
- **sécuriser** : on donne accès à la vue (sans les colonnes sensibles) plutôt qu'aux tables ;
- **elle est toujours à jour** : la vue ne stocke rien, la requête s'exécute à chaque lecture.

Une **vue matérialisée** (`CREATE MATERIALIZED VIEW`) **stocke** le résultat : sa lecture est plus rapide, mais il faut l'actualiser avec `REFRESH MATERIALIZED VIEW`.

## Les fonctions de fenêtrage

```
fonction() OVER (PARTITION BY groupe ORDER BY tri)
```

Contrairement à `GROUP BY`, **chaque ligne est conservée**, et elle reçoit en plus un calcul fait sur sa « fenêtre ».

```sql
SELECT nom, categorie, prix,
       ROUND(AVG(prix) OVER (PARTITION BY categorie)) AS moyenne_categorie,
       prix - ROUND(AVG(prix) OVER (PARTITION BY categorie)) AS ecart
FROM produits;
```

| nom | categorie | prix | moyenne_categorie | ecart |
|---|---|---|---|---|
| Chemise wax | Vêtements | 12 000 | 18 333 | −6 333 |
| Boubou brodé | Vêtements | 35 000 | 18 333 | 16 667 |
| Pagne tissé | Vêtements | 8 000 | 18 333 | −10 333 |
| … | | | | |

### Classer

```sql
SELECT nom, categorie, prix,
       ROW_NUMBER() OVER (ORDER BY prix DESC) AS num,
       RANK()       OVER (PARTITION BY categorie ORDER BY prix DESC) AS rang_dans_categorie
FROM produits;
```

| Fonction | Ex æquo à 25 000 | Rangs obtenus |
|---|---|---|
| `ROW_NUMBER` | numéros différents | 1, 2, 3, 4 |
| `RANK` | même rang, puis un saut | 1, 2, 2, 4 |
| `DENSE_RANK` | même rang, sans saut | 1, 2, 2, 3 |

**Le produit le plus cher de chaque catégorie** :

```sql
WITH classes AS (
  SELECT nom, categorie, prix, ROW_NUMBER() OVER (PARTITION BY categorie ORDER BY prix DESC) AS rang
  FROM produits
)
SELECT categorie, nom, prix FROM classes WHERE rang = 1;
-- Accessoires : Sac en cuir ; Chaussures : Sandales ; Vêtements : Boubou brodé
```

La CTE est nécessaire, car on ne peut pas écrire `WHERE ROW_NUMBER() ... = 1` : la fenêtre est calculée **après** le `WHERE`.

### Cumul et comparaison

```sql
WITH mensuel AS (
  SELECT date_trunc('month', date_cmd)::date AS mois, SUM(montant) AS ca
  FROM ventes_detaillees WHERE statut = 'livrée' GROUP BY 1
)
SELECT mois, ca,
       SUM(ca) OVER (ORDER BY mois) AS cumul,
       LAG(ca) OVER (ORDER BY mois) AS mois_precedent,
       ca - LAG(ca) OVER (ORDER BY mois) AS evolution
FROM mensuel;
```

| mois | ca | cumul | mois_precedent | evolution |
|---|---|---|---|---|
| 2026-10-01 | 74 000 | 74 000 | NULL | NULL |
| 2026-11-01 | 137 000 | 211 000 | 74 000 | 63 000 |

## Démonstration

1. Avec une sous-requête, on cherche les produits plus chers que la moyenne, et on vérifie la moyenne à la main.
2. On réécrit la même requête avec une CTE, et on compare la lisibilité.
3. On crée la vue `ventes_detaillees`, puis trois analyses en 3 lignes chacune.
4. On cherche le top 1 par catégorie, puis le cumul mensuel avec `LAG`.

## Exercice guidé

1. Les clients inscrits **après** le client « Fatou Sall » (sous-requête scalaire).
2. Les produits qui ont été commandés au moins une fois, avec `EXISTS`.
3. Numérote les clients par date d'inscription (`ROW_NUMBER`).

## Exercice autonome

1. Crée la vue `ca_par_client` (client, ville, nombre de commandes livrées, total dépensé).
2. À partir de cette vue, donne les clients dont le total dépasse la moyenne des totaux.
3. Pour chaque commande livrée, affiche son montant et la part (en %) qu'elle représente dans le total de son client.
4. Pour chaque client, affiche ses commandes par date, avec le montant cumulé et le nombre de jours depuis la commande précédente.
5. Réécris la question 2 de trois façons : sous-requête, CTE, fonction de fenêtrage. Laquelle préfères-tu, et pourquoi ?

## Correction

Exercice guidé :

```sql
SELECT nom FROM clients WHERE inscrit_le > (SELECT inscrit_le FROM clients WHERE nom = 'Fatou Sall');
-- Ibrahima, Mariama, Aminata
SELECT p.nom FROM produits p WHERE EXISTS (SELECT 1 FROM lignes l WHERE l.produit_id = p.id);
SELECT nom, inscrit_le, ROW_NUMBER() OVER (ORDER BY inscrit_le) AS ordre FROM clients;
```

Exercice autonome :

```sql
CREATE VIEW ca_par_client AS
SELECT client, ville, COUNT(DISTINCT commande_id) AS nb_commandes, SUM(montant) AS total
FROM ventes_detaillees WHERE statut = 'livrée' GROUP BY client, ville;

-- 2. moyenne des totaux = (74 000 + 67 000 + 70 000) / 3 = 70 333 → seule Awa (74 000) est au-dessus
SELECT * FROM ca_par_client WHERE total > (SELECT AVG(total) FROM ca_par_client);

-- 3.
WITH cmd AS (SELECT commande_id, client, SUM(montant) AS montant FROM ventes_detaillees
             WHERE statut = 'livrée' GROUP BY commande_id, client)
SELECT *, ROUND(100.0 * montant / SUM(montant) OVER (PARTITION BY client), 1) AS part_pct FROM cmd;
-- Awa : commande 1 = 52,7 % ; commande 2 = 47,3 %

-- 4.
WITH cmd AS (SELECT commande_id, client, date_cmd, SUM(montant) AS montant FROM ventes_detaillees
             GROUP BY commande_id, client, date_cmd)
SELECT *, SUM(montant) OVER (PARTITION BY client ORDER BY date_cmd) AS cumul,
       date_cmd - LAG(date_cmd) OVER (PARTITION BY client ORDER BY date_cmd) AS jours_depuis_precedente
FROM cmd ORDER BY client, date_cmd;
```

Question 3, le calcul : 39 000 / 74 000 = 52,7 % et 35 000 / 74 000 = 47,3 %. La somme fait bien 100 %.

Question 5, la version avec une fonction de fenêtrage :

```sql
SELECT * FROM (SELECT *, AVG(total) OVER () AS moy FROM ca_par_client) t WHERE total > moy;
```

`OVER ()` (une fenêtre vide) calcule la moyenne sur toutes les lignes. La CTE est souvent la plus lisible, et la fenêtre la plus souple.

## Pour aller plus loin

- `generate_series` crée un calendrier pour afficher aussi les mois sans vente.
- Les vues sont la base des couches de transformation dbt.
- La semaine prochaine : concevoir soi-même une base PostgreSQL (modélisation, normalisation), puis l'optimiser (index, transactions).
